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
            // 滚动到最新消息
            scrollToBottom() {
                this.$nextTick(() => {
                    uni.createSelectorQuery().in(this).select('.messageWrapper').boundingClientRect((res) => {
                        this.scrollTop = res.height-this.scrollViewHeight > 0 ? res.height-this.scrollViewHeight : 0;
                    }).exec();
                });
            },
            // 获取历史消息
            async getHistoryMessages() {
                // TODO 获取历史消息

                // 滚动到最新消息
                this.scrollToBottom()
            },
            // 发送消息
            sendMessage() {
                // 如果传入了content，使用传入的内容，否则使用输入框的内容
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

                // 发送消息中
                this.isSending = true
                
                // 调用智能客服
                this.chatWithBot()
            },
            // 智能客服
            async chatWithBot() {
                const {session_id, url} = await chatbotCloudObj.getUrl("chat")
                const prompt = this.messages[this.messages.length - 2].content
                const res = await post(url, {
                    prompt: prompt,
                    session_id: session_id,
                    stream: true
                })
                // 处理流式数据
                res.onChunkReceived((chunks) => {
                    this.parseData(chunks)
                })
            },
            parseData(chunks) {
                try {
                    // 处理ArrayBuffer数据
                    let chunkStr;
                    if (chunks instanceof ArrayBuffer) {
                        // 将ArrayBuffer转换为字符串
                        chunkStr = new TextDecoder('utf-8').decode(chunks);
                    } else {
                        // 处理字符串数据
                        chunkStr = chunks;
                    }
                    
                    // 按行分割处理
                    const lines = chunkStr.split('\n');
                    let lineIndex = 0

                    const interval = setInterval(() => {
                        if (lineIndex == 0) {
                            // 第一行，清空提示内容（思考中...）
                            this.messages[this.messages.length - 1].content = ""
                        }
                        if (lineIndex >= lines.length || lines[lineIndex].trim() == 'data: [DONE]') {
                            clearInterval(interval)
                            this.isSending = false
                            this.scrollToBottom()
                            return
                        }
                        const line = lines[lineIndex].replace('data: ', '').trim()
                        // 尝试解析JSON
                        try {
                            const jsonData = JSON.parse(line);
                            if (jsonData.chunk) {
                                this.messages[this.messages.length - 1].content += jsonData.chunk;
                            }
                        } catch (jsonError) {
                            // 如果不是JSON，直接添加
                            this.messages[this.messages.length - 1].content += line;
                        } finally {
                            this.$forceUpdate()
                            this.scrollToBottom()
                        }
                        lineIndex += 1
                    }, 100)
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
    background: $page-bg-color;
    .scrollView {
        height: calc(100vh - 140rpx);
        width: 100%;
		/* #ifdef H5 */
        height: calc(100vh - 180rpx);
		/* #endif */
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
                align-items: flex-start;
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