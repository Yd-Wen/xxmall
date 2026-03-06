<template>
	<view class="banner">
        <view class="left" v-if="foldState">
            <uni-icons type="sound-filled" size="20" color="#28C76F"/>
            <text>推荐</text>
        </view>
		<swiper :class="foldState?'fold':''" class="swiper" circular :indicator-dots="!foldState" indicator-color="rgba(255, 255, 255, 0.5)" 
		indicator-active-color="rgba(255, 255, 255, 1)" autoplay interval="3000" duration="1000" :vertical="foldState" @change="onSwiperChange">
			<swiper-item 
            class="item" 
            v-for="(item, index) in items" 
            :key="index" 
            @click="item.onClick">
				<image :src="item.imageUrl" mode="aspectFill"></image>
                <view class="title">{{item.title}}</view>
                <view class="desc">{{item.desc}}</view>
			</swiper-item>
		</swiper>
        <view class="right" v-if="foldState" @click="onRightClick">
            <uni-icons type="right" size="20" color="#bbbbbb"/>
        </view>
	</view>
</template>

<script>
	import {mapGetters} from "vuex"
    export default {
        props: {
            items: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                currentIndex: 0
            };
        },
        computed:{
            ...mapGetters(['foldState'])
        },
        methods: {
            onSwiperChange(e) {
                this.currentIndex = e.detail.current;
            },
            onRightClick() {
                if (this.items && this.items.length > 0) {
                    const currentItem = this.items[this.currentIndex];
                    if (currentItem && currentItem.onClick) {
                        currentItem.onClick();
                    }
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
	.banner{
        display: flex;
		padding: 0 0 10rpx;
        align-items: center;
        background: $page-bg-color;
        .left{
            width: 140rpx;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            margin-left: 30rpx;
            text{
                line-height: 30rpx;
                margin-left: 5rpx;
                color: $xxm-theme-color;
                font-size: 30rpx;
                font-weight: 500; //粗体
            }
        }
        .right{
            margin-right: 30rpx;
        }
		swiper{
			flex: 1;
			height: 350rpx;
			margin: 0 auto;
			border-radius: 10rpx 10rpx 0 0;
			overflow: hidden;
            transition: 0.4s;
            &.fold{
                height: 80rpx;
                margin: 20rpx 0;
                image{
                    display: none;
                }
                .title{
                    width: 80%;
                    vertical-align: middle;
                    top: 15rpx;
                    left: 0;
                }
                .desc{
                    display: none;
                }
            }
			&-item{
				width: 100%;
				height: 100%;
                position: relative;
				image{
					width: 100%;
					height: 350rpx;
                    opacity: 0.8;
				}
                .title{
                    width: 40%;
                    position: absolute;
                    top: 50rpx;
                    left: 50rpx;
                    font-size: 34rpx;
                    font-weight: bold;
                    @include ellipse();
                }
                .desc{
                    width: 60%;
                    position: absolute;
                    top: 150rpx;
                    left: 50rpx;
                    font-size: 26rpx;
                    @include ellipse(2);
                }
			}
		}
	}
</style>
