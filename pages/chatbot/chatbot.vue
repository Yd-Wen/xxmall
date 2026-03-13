<template>
	<view class="chatbot">
		<view class="messages">
			<view v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
				<view class="content">{{ msg.content }}</view>
			</view>
            <view v-if="currentBotMessage" class="messagebot">
                <view class="content">{{ currentBotMessage }}</view>
            </view>
		</view>
		<view class="input-area">
			<input v-model="inputMessage" type="text" placeholder="请输入消息" class="input" />
			<button @click="sendMessage" class="send-btn">发送</button>
		</view>
	</view>
</template>

<script>
    import { post } from "@/utils/tools.js"
	const chatbotCloudObj = uniCloud.importObject("xxm-chatbot", {"customUI":true})
	export default {
		data() {
			return {
                messages: [],
                inputMessage: "",
                userInfo: {
                    uid: "test-user-id-001" // 实际应用中应从登录信息中获取
                },
                currentBotMessage: ""
            }
        },
        onLoad() {
            // 初始消息
            this.sendMessage("你好，你的知识库有哪些内容？")
        },
        methods: {
            sendMessage(content) {
                // 如果传入了content，使用传入的内容，否则使用输入框的内容
                const messageContent = content || this.inputMessage
                if (!messageContent) return
                
                // 添加用户消息
                const userMessage = {
                    role: "user",
                    content: messageContent
                }
                this.messages.push(userMessage)
                
                // 清空输入框
                this.inputMessage = ""
                
                // 初始化机器人消息
                this.currentBotMessage = ""        
                
                this.chatWithBot(messageContent)
            },
            async chatWithBot(messageContent) {
                const url = await chatbotCloudObj.getUrl("chat")
                console.log(url)
                const res = await post(url, {
                    prompt: messageContent,
                    session_id: this.userInfo.uid,
                    stream: true
                })
                res.onChunkReceived((chunk) => {
                    console.log("Received chunk:", chunk);
                    // 解析 JSON 数据
                    this.parseData(chunk)
                })
            },
            parseData(chunk) {
                try {
                    // 清理chunk，去除首尾空白字符
                    const cleanedChunk = chunk.trim();
                    
                    // 跳过空chunk
                    if (!cleanedChunk) return;
                    
                    // 处理SSE格式数据，移除"data: "前缀
                    let dataStr = cleanedChunk;
                    if (dataStr.startsWith('data: ')) {
                        dataStr = dataStr.substring(6); // 移除"data: "前缀
                    }
                    
                    // 检查是否是结束标志
                    if (dataStr === '[DONE]') {
                        // 完成接收，添加完整消息到列表
                        // 使用Vue的响应式更新方式
                        this.$set(this.messages, this.messages.length, {
                            role: "assistant",
                            content: this.currentBotMessage
                        });
                        this.currentBotMessage = "";
                        // 强制UI更新
                        this.$nextTick();
                        
                        return;
                    }
                    
                    // 解析 JSON 数据
                    const jsonData = JSON.parse(dataStr);
                    console.log("Parsed JSON:", jsonData);
                    
                    // 确保chunk字段存在
                    if (jsonData.chunk) {
                        // 累积消息内容
                        this.currentBotMessage += jsonData.chunk;
                    }
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    console.log("Raw chunk:", chunk);
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
.chatbot {
    height: 100%;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
}

.messages {
    flex: 1;
    padding: 20rpx;
    overflow-y: auto;
}

.message {
    margin-bottom: 20rpx;
    max-width: 80%;
    padding: 15rpx;
    border-radius: 20rpx;
}

.message.user {
    align-self: flex-end;
    background-color: #007aff;
    color: white;
    border-bottom-right-radius: 5rpx;
}

.message.assistant {
    align-self: flex-start;
    background-color: white;
    color: #333;
    border-bottom-left-radius: 5rpx;
}

.input-area {
    display: flex;
    padding: 20rpx;
    background-color: white;
    border-top: 1rpx solid #e5e5e5;
}

.input {
    flex: 1;
    height: 80rpx;
    border: 1rpx solid #e5e5e5;
    border-radius: 40rpx;
    padding: 0 20rpx;
    font-size: 32rpx;
}

.send-btn {
    width: 120rpx;
    height: 80rpx;
    background-color: #007aff;
    color: white;
    border: none;
    border-radius: 40rpx;
    margin-left: 20rpx;
    font-size: 32rpx;
}
</style>