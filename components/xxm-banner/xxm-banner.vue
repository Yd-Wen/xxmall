<template>
	<view class="banner">
		<swiper class="swiper" circular indicator-dots indicator-color="rgba(255, 255, 255, 0.5)" 
		indicator-active-color="rgba(255, 255, 255, 1)" autoplay interval="3000" duration="1000">
			<swiper-item class="item" v-for="(item, index) in items" :key="index" @click="item.onClick">
				<image :src="item.imageUrl" mode="aspectFill"></image>
                <view class="title">{{item.title}}</view>
                <view class="desc">{{item.desc}}</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
    export default {
        props: {
            items: {
                type: Array,
                default: () => []
            }
        }
    }
</script>

<style lang="scss" scoped>
	.banner{
		padding: 0 0 10rpx;
		swiper{
			// width: 740rpx;
			height: 350rpx;
			margin: 0 auto;
			border-radius: 10rpx 10rpx 0 0;
			overflow: hidden;
			&-item{
				width: 100%;
				height: 100%;
                position: relative;
				image{
					width: 100%;
					height: 350rpx;
                    opacity: 0.9;
				}
                .title{
                    width: 40%;
                    position: absolute;
                    top: 50rpx;
                    left: 50rpx;
                    font-size: 34rpx;
                    color: #fff;
                    font-weight: bold;
                    @include ellipse();
                }
                .desc{
                    width: 60%;
                    position: absolute;
                    top: 150rpx;
                    left: 50rpx;
                    font-size: 26rpx;
                    color: #fff;
                    @include ellipse(2);
                }
			}
		}
	}
</style>
