<template>
	<view class="chatbot">
        <scroll-view class="scrollView" scroll-y="true" :scroll-top="scrollTop"  scroll-with-animation>
            <view class="messageWrapper">
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
        </scroll-view>
		<view class="input-area">
			<input v-model="inputMessage" type="text" placeholder="请输入..." class="input" ref="input" />
			<button @click="sendMessage" class="send-btn" :class="isSending?'disabled':''" :disabled="isSending">发送</button>
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
                inputMessage: "",
                scrollTop: 0,           // 滚动条位置
                scrollViewHeight: 300,  // 滚动视图高度
                isSending: false,       // 是否正在发送
            }
        },
        async onLoad() {
            // 获取历史消息
            // await this.getHistoryMessages()
        },
        onShow() {
            // 滚动到最新消息
            this.scrollToBottom()
        },
        methods: {
            // 获取历史消息
            async getHistoryMessages() {
                // TODO 获取历史消息

                // 滚动到最新消息
                // this.$nextTick(() => {
                //     this.scrollToBottom();
                // });
            },
            // 滚动到最新消息
            scrollToBottom() {
                this.$nextTick(() => {
                    uni.createSelectorQuery().in(this).select('.messageWrapper').boundingClientRect((res) => {
                        this.scrollTop = res.height-this.scrollViewHeight > 0 ? res.height-this.scrollViewHeight : 0;
                    }).exec();
                });
            },
            // 发送消息
            sendMessage() {
                // 如果传入了content，使用传入的内容，否则使用输入框的内容
                console.log(this.inputMessage)
                if (!this.inputMessage) return
                
                // 添加用户消息
                this.messages.push({
                    role: "human",
                    content: this.inputMessage
                },{
                    role: "ai",
                    content: "思考中..."
                })
                
                // 清空输入框
                this.inputMessage = ""
                
                // 滚动到最新消息
                this.scrollToBottom()

                // 不可输入
                this.isSending = true
                
                // this.chatWithBot()
            },
            async chatWithBot() {
                const url = await chatbotCloudObj.getUrl("chat")
                const prompt = this.messages[this.messages.length - 2][0].content
                const session_id = uni.getStorageSync("userInfo")._id

                console.log(url)
                console.log(prompt)
                console.log(session_id)

                const res = await post(url, {
                    prompt: prompt,
                    session_id: session_id,
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
    .scrollView {
        height: calc(100vh - 140rpx);
        width: 100%;
        padding-bottom: 140rpx;
        .messageWrapper {
            display: flex;
            flex-direction: column;
            padding: 20rpx;
            padding-bottom: 20rpx;
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
            border: none;
            border-radius: 40rpx;
            margin-left: 20rpx;
            font-size: 32rpx;
            text-align: center;
            line-height: 75rpx;
            &.disabled {
                opacity: 0.5;
            }
        }
    }
}
</style>