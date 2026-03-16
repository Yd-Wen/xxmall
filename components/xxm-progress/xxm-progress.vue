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
                    percentage: 0
                }
            }
        }
    }
}
</script>

<style scoped lang="scss">
    .wrapper {
        height: 20vh;
        width: 600rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        padding: 20rpx 50rpx 0;
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
            justify-content: center;
            align-items: center;
            border-top: 1px solid $border-color-light;
            .progress{
                width: 80%;
            }
        }
    }

</style>