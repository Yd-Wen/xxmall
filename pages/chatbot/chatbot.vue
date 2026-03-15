<template>
	<view class="chatbot">
        <scroll-view class="scrollView" scroll-y="true" :scroll-top="scrollTop"  scroll-with-animation>
            <view class="messageWrapper">
                <view v-for="(msg, index) in messages" :key="index" class="message">
                    <view class="time" v-if="msg.time">
                        {{ timeFormat(msg.time) }}
                    </view>
                    <view class="messageContent" :class="msg.role">
                        <view class="avatar">
                            <image :src="avatar[msg.role]" mode="aspectFill" />
                        </view>
                        <view class="content" :class="msg.role+'Content'">
                            <rich-text :nodes="msg.role === 'ai' ? markdownToHtml(msg.content) : msg.content"></rich-text>
                        </view>
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
    import { getLocalDatetimeString, timeFormat, post } from "@/utils/tools.js"
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
                    time: "10:00",
                    content: "你好"
                },{
                    role: "ai",
                    time: "10:01",
                    content: "你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。"
                },{
                    role: "human",
                    time: "10:02",
                    content: "你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题"
                },{
                    role: "ai",
                    time: "10:03",
                    content: "你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。"
                },{
                    role: "human",
                    time: "10:04",
                    content: "你好"
                },{
                    role: "ai",
                    time: "10:06",
                    content: "你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。\n你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。\n你好，我是小闲商城的智能客服，我可以回答你关于小闲商城的问题。"
                }],
                inputMessage: "",
                timestamp: new Date().toISOString(),  // 时间戳
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
            getLocalDatetimeString,
            timeFormat,
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

                this.timestamp = getLocalDatetimeString()
                
                // 添加用户消息
                this.messages.push({
                    role: "human",
                    time: this.timestamp,
                    content: this.inputMessage
                },{
                    role: "ai",
                    // time: this.timestamp,
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
				let isStream = false
				// #ifdef MP-WEIXIN
				isStream = true
				// #endif	
                
                // 请求智能客服URL
                const {session_id, url} = await chatbotCloudObj.getUrl("chat", isStream)
                const prompt = this.messages[this.messages.length - 2].content
                const res = await post(url, {
                    session_id: session_id,
                    timestamp: this.timestamp,
                    prompt: prompt,
                })

                // 核心：监听 onData，直接拿到纯文本片段
                res.onData((chunk) => {
                    // 分类处理
                    switch (chunk.type) {
                        case 'content': // 文本内容
                            // 首次触发清空「思考中...」
                            if (this.messages[this.messages.length - 1].content === "思考中...") {
                                this.messages[this.messages.length - 1].content = "";
                            }
                            // 追加文本片段
                            if (!isStream) {
                                // 非流式：直接覆盖（避免追加空字符串）
                                this.messages[this.messages.length - 1].content = chunk.data;
                            } else {
                                // 流式：追加
                                this.messages[this.messages.length - 1].content += chunk.data;
                            }
                            // 强制刷新 UI 并滚动到底部
                            this.$forceUpdate();
                            this.scrollToBottom();
                            break;

                        case 'timestamp': // 时间戳
                            this.messages[this.messages.length - 1].time = chunk.data;
                            this.$forceUpdate();
                            this.scrollToBottom();
                            break;

                        case 'done': // 结束标记
                            this.isSending = false;
                            this.$forceUpdate();
                            this.scrollToBottom();
                            break;
                    }
                }, { speed: isStream ? 100 : 0 }); // 可选：控制逐字输出速率（ms）
            },
            // Markdown 转 HTML
            markdownToHtml(text) {
                if (!text) return '';
                return text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体 **text**
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // 斜体 *text*
                    .replace(/^\s*### (.*$)/gim, '<h4>$1</h4>')        // 三级标题（支持空格）
                    .replace(/^\s*## (.*$)/gim, '<h3>$1</h3>')         // 二级标题（支持空格）
                    .replace(/^\s*# (.*$)/gim, '<h2>$1</h2>')          // 一级标题（支持空格）
                    .replace(/^\s*\- (.*$)/gim, '<li>$1</li>')        // 一级和二级列表项（支持缩进）
                    .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>')       // 列表（非贪婪匹配）
                    .replace(/^>\s*(.*$)/gim, '$1')                   // 去掉引用符号 >
                    .replace(/\n/g, '<br>');                           // 换行
            },
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
            .message {
                width: 100%; 
                margin: 20rpx 0;
                display: flex;
                flex-direction: column;
                .time {
                    font-size: 24rpx;
                    color: #999;
                    margin: 0 20rpx;
                    text-align: center;
                    line-height: 24rpx;
                }
                .messageContent {
                    display: flex;
                    align-items: flex-start;
                    margin-top: 20rpx;
                    max-width: 85%;
                    &.human {
                        flex-direction: row-reverse;
                        align-self: flex-end;
                    }
                    &.ai {
                        flex-direction: row;
                        align-self: flex-start;
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