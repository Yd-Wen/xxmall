<template>
    <view class="share-panel">
        <u-popup :show="sharePopState" closeable round="10" @close="onClose">
            <view class="wrapper" v-if="shareData">
                <view class="header">
                    <view class="title">{{shareData.title}}</view>
                </view>
                <view class="body">
                    <view class="inviteCode" v-if="shareData.content.inviteCode">
                        <view class="code">邀请码：{{ shareData.content.inviteCode }}</view>
                        <view class="copyBtn" @click="copyInviteCode">复制邀请码</view>
                    </view>
                </view>
                <view class="footer">
                    <!-- #ifdef H5 -->
                    <u-button v-if="shareData.url" color="#ec544f" icon="checkmark-circle-fill" iconColor="#fff" @click="copyShareLink">复制分享链接</u-button>
                    <!-- #endif -->
                    <!-- #ifdef MP-WEIXIN -->
                    <view class="shareMP">
                        <u-icon name="share" size="24" color="#ec544f"></u-icon>
                        <button open-type="share">分享给好友</button>
                    </view>
                    <!-- #endif -->
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script>
export default {
    props: {
        sharePopState: {
            type: Boolean,
            default: false
        },
        shareData: {
            type: Object,
            default: () => {
                return {
                    title: '分享',
                    msgTitle: '小闲小店邀请您选购',
                    content: {},
                    url: '',
                    path: '',
                    params: {},
                    imageUrl: '/static/images/logo.png'
                }
            }
        }
    },
    computed: {
        shareParams() {
            let params = []
            if (this.shareData && this.shareData.params) {
                for (let key in this.shareData.params) {
                    if (this.shareData.params.hasOwnProperty(key)) {
                        params.push(`${encodeURIComponent(key)}=${encodeURIComponent(this.shareData.params[key])}`) 
                    }
                }
            }
            return params.join('&')
        }
    },
    methods: {
        onClose() {
            this.$emit('close')
        },
        copyInviteCode() {
            uni.setClipboardData({
                data: this.shareData.content.inviteCode,
                success: () => {
                    uni.showToast({ title: '邀请码已复制', icon: 'success' })
                }
            })
        },
        copyShareLink() {
            // 使用计算属性生成 URL 参数
            const url = `${this.shareData.url}${this.shareData.path}?${this.shareParams}`
            console.log(url)
            uni.setClipboardData({
                data: url,
                success: () => {
                    uni.showToast({ title: '链接已复制', icon: 'success' })
                }
            })
        },
        onShareAppMessage(res) {
            if (res.from === 'button') {
                // 来自页面内分享按钮
                console.log(res.target)
            }
            
            // 使用计算属性生成分享路径参数
            let path = this.shareData.shareAppMsg.path || '/pages/index/index'
            
            if (this.shareParams) {
                // 检查路径是否已有参数
                if (path.includes('?')) {
                    path += '&' + this.shareParams
                } else {
                    path += '?' + this.shareParams
                }
            }
            
            return {
                title: this.shareData.msgTitle,
                path: `${this.shareData.path}?${this.shareParams}`,
                imageUrl: this.shareData.imageUrl
            }
        }
    }
}
</script>

<style scoped lang="scss">
    .wrapper {
        height: 50vh;
        width: 100%;
        .header{
            height: 80rpx;
            width: 100%;	
            margin-top: 10rpx;
            .title{
                line-height: 80rpx;
                @include flex-box-set();
                font-size: 40rpx;
                font-weight: bold;
            }
        }
    }
</style>