<template>
    <view class="progress-panel">
        <u-popup :show="progressPopState" round="10" mode="center">
            <view class="wrapper" v-if="progressData">
                <view class="header">
                    <view class="title">{{progressData.title}}</view>
                </view>
                <view class="body">
                    <view class="progress">
                        <u-line-progress :showText="false" :percentage="progressData.percentage" activeColor="#436cc5"></u-line-progress>
                    </view>
                    <scroll-view class="scroll-view" scroll-y :scroll-top="progressData.scrollTop">
                        <view class="data" v-for="(item, index) in progressData.data" :key="index">
                            <view class="name">{{item.name}}</view>
                            <view class="status">{{item.status}}</view>
                        </view>
                    </scroll-view>
                </view>
                <view class="footer">
                    <u-button color="#436cc5" icon="checkmark-circle-fill" iconColor="#fff" :disabled="progressData.percentage < 100" @click="onConfirm">确 定</u-button>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script>
export default {
    props: {
        progressPopState: {
            type: Boolean,
            default: false
        },
        progressData: { 
            type: Object,
            default: () => {
                return {
                    title: '上传文件中',
                    text: '上传进度',
                    percentage: 0,
                    scrollTop: 0
                }
            }
        }
    },
    methods: {
        onConfirm(){
            this.$emit('confirm')
        }
    }
}
</script>

<style scoped lang="scss">
    .wrapper {
        height: 50vh;
        width: 600rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        padding: 20rpx;
        .header{
            height: 80rpx;
            width: 100%;	
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
            justify-content: flex-start;
            align-items: center;
            padding-top: 50rpx;
            border-top: 1px solid $border-color-light;
            border-bottom: 1px solid $border-color-light;
            .progress{
                width: 80%;
                margin-bottom: 50rpx;
            }
            .scroll-view{
                height: 300rpx;
                width: 100%;
                .data{
                    height: 60rpx;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    .name{
                        width: 300rpx;
                        font-size: 28rpx;
                        line-height: 28rpx;
                        color: $text-font-color-1;
                        @include ellipse();
                    }
                    .status{
                        flex: 1;
                        font-size: 24rpx;
                        line-height: 24rpx;
                        text-align: right;
                        color: $text-font-color-2;
                    }
                }
            }
        }
        .footer{
            @include flex-box-set();
            margin-top: 20rpx;
            height: 100rpx;
            width: 50%;
        }
    }

</style>