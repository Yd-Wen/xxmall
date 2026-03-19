<template>
    <view class="progress-panel">
        <u-popup :show="progressPopState" round="10" mode="center">
            <view class="wrapper" v-if="localProgressData">
                <view class="header">
                    <view class="title">{{localProgressData.title}}</view>
                </view>
                <view class="body">
                    <view class="progress">
                        <u-line-progress :showText="false" :percentage="localProgressData.percentage" activeColor="#436cc5"></u-line-progress>
                    </view>
                    <scroll-view class="scroll-view" scroll-y :scroll-top="localProgressData.scrollTop">
                        <view class="data" v-for="(item, index) in localProgressData.data" :key="index">
                            <view class="name">{{item.name}}</view>
                            <view class="status">{{item.status}}</view>
                        </view>
                    </scroll-view>
                </view>
                <view class="footer">
                    <u-button color="#436cc5" icon="checkmark-circle-fill" iconColor="#fff" :disabled="localProgressData.percentage < 100" @click="onConfirm">确 定</u-button>
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
                    data: [
                        {
                            name: '文件1',
                            status: '上传中'
                        },
                        {
                            name: '文件1',
                            status: '同步中'
                        },
                        {
                            name: '文件2',
                            status: '上传中'
                        },
                    ],
                    percentage: 0,
                    scrollTop: 0
                }
            }
        }
    },
    data() {
        return {
            localProgressData: {
                title: '上传文件中',
                data: [],
                percentage: 0,
                scrollTop: 0
            }
        }
    },
    watch: {
        progressData: {
            handler(newVal) {
                this.localProgressData = { ...newVal }
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        onConfirm(){
            this.$emit('confirm')
        },
        // 初始化进度条
        initProgress(title, items) {
            this.localProgressData.title = title
            this.localProgressData.data = items
            this.localProgressData.percentage = 0
            this.localProgressData.scrollTop = 0
        },
        // 更新进度条状态
        updateProgressStatus(index, status, scrollBottom=false) {
            if (this.localProgressData.data[index]) {
                this.localProgressData.data[index].status = status
            }
            // 确保进度计算正确，当处理完所有项时进度为100%
            const progress = Math.round((index + 1) / this.localProgressData.data.length * 100)
            this.localProgressData.percentage = Math.min(progress, 100)
            // 当处理到最后一项时，强制设置为100%
            if (index === this.localProgressData.data.length - 1) {
                this.localProgressData.percentage = 100
            }
            if (scrollBottom){
                this.localProgressData.scrollTop = (index + 1) * 30 - 150 > 0 ? (index + 1) * 30 - 150: this.localProgressData.scrollTop
            }
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
                    margin: 0 30rpx;
                    .name{
                        width: 250rpx;
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