<template>
	<view class="banner" :class="foldState?'fold':''">
        <view class="left">
            <uni-icons type="sound-filled" size="20" color="#28C76F"/>
            <text>推荐</text>
        </view>
		<view class="swiper-container">
			<swiper class="swiper" circular :indicator-dots="!foldState" indicator-color="rgba(255, 255, 255, 0.5)" 
			indicator-active-color="rgba(255, 255, 255, 1)" autoplay interval="3000" duration="1000" :vertical="foldState" @change="onSwiperChange">
				<swiper-item 
                class="item" 
                v-for="(item, index) in items" 
                :key="index" 
                @click="onClickBannerItem(index)">
					<image :src="item.thumb_src=='0'?'../../static/images/banner/banner_default_'+ (index%3+1) +'.png':item.thumb[0].url" mode="aspectFill"></image>
                    <view class="title">{{item.name}}</view>
                    <view class="desc">{{item.desc}}</view>
				</swiper-item>
			</swiper>
		</view>
        <view class="right" @click="onRightClick">
            <uni-icons type="right" size="20" color="#bbbbbb"/>
        </view>
	</view>
</template>

<script>
	import {mapGetters, mapMutations} from "vuex"
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
            // 点击轮播图跳转
            onClickBannerItem(index) {
                uni.navigateTo({
                    url: "/pages/recommend/recommend?idx=" + index
                })
            },
            onRightClick() {
                if (this.items && this.items.length > 0) {
                    const currentItem = this.items[this.currentIndex];
                    if (currentItem && currentItem.onClickBannerItem) {
                        this.onClickBannerItem(this.currentIndex);
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
        transition: all 0.5s ease;
        .left{
            width: 0;
            opacity: 0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            margin-left: 0;
            transition: all 0.5s ease;
            text{
                line-height: 30rpx;
                margin-left: 5rpx;
                color: $xxm-theme-color;
                font-size: 30rpx;
                font-weight: 500; //粗体
            }
        }
        .right{
            width: 0;
            opacity: 0;
            overflow: hidden;
            margin-right: 0;
            transition: all 0.5s ease;
        }
        .swiper-container{
            flex: 1;
            height: 350rpx;
            margin: 0 auto;
            border-radius: 10rpx 10rpx 0 0;
            overflow: hidden;
            transition: all 0.5s ease;
        }
		swiper{
			width: 100%;
			height: 100%;
			&-item{
				width: 100%;
				height: 100%;
                position: relative;
				image{
					width: 100%;
					height: 100%;
                    opacity: 0.8;
                    transition: opacity 0.5s ease;
				}
                .title{
                    width: 40%;
                    position: absolute;
                    top: 50rpx;
                    left: 50rpx;
                    font-size: 34rpx;
                    font-weight: bold;
                    @include ellipse();
                    transition: all 0.5s ease;
                }
                .desc{
                    width: 60%;
                    position: absolute;
                    top: 150rpx;
                    left: 50rpx;
                    font-size: 26rpx;
                    @include ellipse(2);
                    transition: all 0.5s ease;
                }
			}
		}
        &.fold{
            .left{
                width: 140rpx;
                opacity: 1;
                margin-left: 30rpx;
            }
            .right{
                width: auto;
                opacity: 1;
                margin-right: 30rpx;
            }
            .swiper-container{
                height: 80rpx;
                margin: 20rpx 0;
            }
            image{
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            .title{
                width: 80%;
                vertical-align: middle;
                top: 15rpx;
                left: 0;
                transition: all 0.5s ease;
            }
            .desc{
                opacity: 0;
                transition: opacity 0.5s ease;
            }
        }
	}
</style>
