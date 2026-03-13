<template>
	<view class="chatbot">
		<view class="messageList" ref="messageList">
			<view v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
                <view class="avatar" v-if="msg.role === 'ai'">
                    <image :src="avatar[msg.role]" mode="aspectFill" />
                </view>
				<view class="content" :class="msg.role+'Content'"> {{ msg.content }}</view>
                <view class="avatar" v-if="msg.role === 'human'">
                    <image :src="avatar[msg.role]" mode="aspectFill" />
                </view>
			</view>
		</view>
		<view class="input-area">
			<input v-model="inputMessage" type="text" placeholder="请输入..." class="input" />
			<view @click="sendMessage" class="send-btn">发送</view>
		</view>
	</view>
</template>

<script>
    import { post } from "@/utils/tools.js"
	const chatbotCloudObj = uniCloud.importObject("xxm-chatbot", {"customUI":true})
	export default {
		data() {
			return {
                avatar:{
                    // TODO 头像
                    human: "/static/images/avatar.png",
                    ai: "/static/images/logo.png"
                },
                messages: [{
                    role: "human",
                    content: "你好"
                },{
                    role: "ai",
                    content: "你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。"
                },{
                    role: "human",
                    content: "你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题"
                },{
                    role: "ai",
                    content: "你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。"
                },{
                    role: "human",
                    content: "你好"
                },{
                    role: "ai",
                    content: "你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。"
                },{
                    role: "human",
                    content: "你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题"
                },{
                    role: "ai",
                    content: "你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。"
                }],
                inputMessage: ""
            }
        },
        async onLoad() {
            // 获取历史消息
            await this.getHistoryMessages()
            // 滚动到最新消息
            this.$nextTick(() => {
                this.scrollToBottom();
            });
        },
        methods: {
            // 获取历史消息
            async getHistoryMessages() {
                
            },
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
                
                // 滚动到最新消息
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
                
                // 初始化机器人消息
                this.currentBotMessage = ""        
                
                this.chatWithBot(messageContent)
            },
            // 滚动到最新消息
            scrollToBottom() {
                const messageList = this.$refs.messageList;
                if (messageList) {
                    messageList.scrollTop = messageList.scrollHeight;
                }
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
                    // 处理ArrayBuffer数据
                    let chunkStr;
                    if (chunk instanceof ArrayBuffer) {
                        // 将ArrayBuffer转换为字符串
                        const decoder = new TextDecoder('utf-8');
                        chunkStr = decoder.decode(chunk);
                    } else {
                        // 处理字符串数据
                        chunkStr = chunk;
                    }
                    
                    // 按行分割处理
                    const lines = chunkStr.split('\n');
                    
                    for (const line of lines) {
                        // 清理每行，去除首尾空白字符
                        const cleanedLine = line.trim();
                        
                        // 跳过空行
                        if (!cleanedLine) continue;
                        
                        // 处理SSE格式数据，移除"data: "前缀
                        let dataStr = cleanedLine;
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
                            // 强制UI更新并滚动到最新消息
                            this.$nextTick(() => {
                                this.scrollToBottom();
                            });
                            
                            return;
                        }
                        
                        // 尝试解析 JSON 数据
                        try {
                            console.log("Data to parse:", dataStr);
                            const jsonData = JSON.parse(dataStr);
                            console.log("Parsed JSON:", jsonData);
                            
                            // 确保chunk字段存在
                            if (jsonData.chunk) {
                                // 累积消息内容
                                this.currentBotMessage += jsonData.chunk;
                            }
                        } catch (jsonError) {
                            console.warn("Error parsing line:", jsonError);
                            console.log("Problematic line:", dataStr);
                            // 继续处理下一行
                            continue;
                        }
                    }
                } catch (error) {
                    console.error("Error in parseData:", error);
                    console.log("Raw chunk:", chunk);
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
page {
    background-color: $page-bg-color;
}
.chatbot {
    height: 100%;
    .messageList {
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        padding: 20rpx 20rpx 140rpx;
        .message {
            margin-bottom: 20rpx;
            max-width: 85%;
            padding: 20rpx 0;
            border-radius: 20rpx;
            display: flex;
            align-items: center;
            &.human {
                align-self: flex-end;
                justify-content: flex-end;
            }
            &.ai {
                align-self: flex-start;
                justify-content: flex-start;
            }
            .avatar {
                width: 100rpx;
                height: 100rpx;
                border-radius: 50%;
                margin: 0 20rpx;
                overflow: hidden;
                border: 1rpx solid $border-color;
                image {
                    width: 100%;
                    height: 100%;
                }
            }
            .content{
                flex: 1;
                padding: 20rpx;
                &.humanContent {
                    background: $xxm-theme-color-aux;
                    color: white;
                    border-radius: 20rpx 20rpx 0;
                }
                &.aiContent {
                    background: white;
                    color: #333;
                    border-radius: 20rpx 20rpx 20rpx 0;
                }
            }
        }
    }
    .input-area {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 140rpx;
        display: flex;
        padding: 20rpx;
        background-color: white;
        border-top: 1rpx solid #e5e5e5;
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
            background-color: $xxm-theme-color-aux;
            color: white;
            border-radius: 40rpx;
            margin-left: 20rpx;
            font-size: 32rpx;
            text-align: center;
            line-height: 75rpx;
        }
    }
}
</style>