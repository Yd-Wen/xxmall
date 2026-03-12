<template>
    <view class="share-panel">
        <u-popup :show="sharePopState" closeable round="10" @close="onClose">
            <view class="wrapper" v-if="shareData">
                <view class="header">
                    <view class="title">{{shareData.title}}</view>
                </view>
                <view class="body">
                    <view  class="Image" :src="shareData.imageUrl">
                        <image :src="shareData.imageUrl" class="img"></image>
                    </view>
                    <view class="inviteCode" v-if="shareData.content.inviteCode">
                        邀请码：{{ shareData.content.inviteCode }}
                        <view class="copyBtn" @click="copyInviteCode">
                            <view class="copyImage">
                                <image src="/static/images/copy.png" class="img"></image>
                            </view>
                            复制
                        </view>
                    </view>
                </view>
                <view class="footer">
                    <view class="shareImage">
                        <image src="/static/images/share.png" class="img"></image>
                    </view>
                    <!-- #ifdef H5 -->
                    <view class="shareLinkBtn" v-if="shareData.url" @click="copyShareLink">
                        复制分享链接
                    </view>
                    <!-- #endif -->
                    <!-- #ifdef MP-WEIXIN -->
                    <view class="shareMPBtn" v-if="shareData.path">
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
                title: `${this.shareData.params.inviterName} ${this.shareData.msgTitle}`,
                path: `${this.shareData.path}?${this.shareParams}`,
                imageUrl: this.shareData.imageUrl
            }
        }
    }
}
</script>

<style scoped lang="scss">
    .wrapper {
        height: 60vh;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
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
        .body{
            flex: 1;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
            border-bottom: 1px solid $border-color-light;
            .Image{
                height: 200rpx;
                width: 200rpx;
                .img{
                    height: 100%;
                    width: 100%;
                }
            }
            .inviteCode{
                height: 80rpx;
                width: 100%;	
                align-items: center;
                font-size: 32rpx;
                display: flex;
                justify-content: center;
                align-items: center;
                .copyBtn{
                    height: 80rpx;
                    line-height: 80rpx;
                    text-align: center;
                    margin: 0 20rpx;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    .copyImage{
                        height: 50rpx;
                        width: 50rpx;
                        border-radius: 50%;
                        overflow: hidden;
                        .img{
                            height: 100%;
                            width: 100%;
                        }
                    }   
                }   
            }
        }
        .footer{
            height: 80rpx;	
            margin: 30rpx 50rpx;
            padding: 0 50rpx;
            border-radius: 40rpx;
            font-size: 28rpx;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            background: $xxm-theme-color;
            .shareImage{
                height: 50rpx;
                width: 50rpx;
                border-radius: 50%;
                overflow: hidden;
                margin-right: 20rpx;
                .img{
                    height: 100%;
                    width: 100%;
                }
            }
            .shareLinkBtn{
                height: 60rpx;
                line-height: 60rpx;
                text-align: center;
            }
            .shareMPBtn{
                height: 80rpx;
                background: $xxm-theme-color;
                line-height: 80rpx;
                text-align: center;
                button{
                    background: transparent;
                    color: #fff;
                    font-size: 28rpx;
                    height: 100%;
                    width: 100%;
                    border: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    &::after{
                        border: none;
                    }
                }
            }
        }
    }
</style>