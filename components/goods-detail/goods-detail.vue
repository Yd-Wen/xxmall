<template>
	<view class="goodsDetail">
		<u-popup :show="detailPopState" closeable round="10" @close="onClose">
			<view class="wrapper" v-if="detailData.name">
				<view class="header"></view>
				<view class="body">
					<scroll-view class="scroll" scroll-y>
						<view class="thumb">
							<image class="img" :src="detailData.thumb[0].url" mode="aspectFill"></image>
						</view>
						<view class="info">
							<view class="title">{{detailData.name}}</view>
							<view class="price">
								<view class="big">￥{{priceFormat(detailData.current_price)}}</view>
								<view class="small" v-if="detailData.origin_price">￥{{priceFormat(detailData.origin_price)}}</view>
								<view class="discount" v-if="detailData.origin_price && discount(detailData.current_price, detailData.origin_price)">
									{{discount(detailData.current_price, detailData.origin_price)}}
								</view>
							</view>
						</view>
						<view class="detail">
							<view class="text">
								<view class="title">商品描述</view>
								<view class="content">
									<rich-text :nodes="detailData.desc"></rich-text>
								</view>
							</view>
							<view class="priceList">
								<view class="image" v-for="(item,index) in detailData.thumb" :key="item.url">
									<image class="img" :src="item.url" mode="widthFix" v-if="index!=0"></image>
								</view>
							</view>
							<view class="intro">以上是全部介绍，欢迎选购！</view>
						</view>
					</scroll-view>
				</view>
				<view class="footer">
					<u-button color="#ec544f" icon="shopping-cart" iconColor="#fff" @click="onCart">加入购物车</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import {priceFormat, discount} from "@/utils/tools.js"
	import {mapGetters, mapMutations} from "vuex"
	export default {
		name:"goods-detail",
		data() {
			return {
				
			};
		},
		computed:{
			...mapGetters(['detailPopState', 'detailData'])
		},
		methods:{
			priceFormat,
			discount,
			...mapMutations(['SET_DETAILPOPSTATE', 'SET_SELECTIONPOPSTATE']),
			// 点击遮罩层关闭弹窗
			onClose(){
				this.SET_DETAILPOPSTATE(false)
			},
			// 点击加入购物车
			onCart(){
				this.SET_SELECTIONPOPSTATE(true)
			}
		}
	}
</script>

<style lang="scss">
.wrapper{
	height: 80vh;
	.header{
		height: 80rpx;
		width: 100%;
	}
	.body{
		height: calc(100% - 220rpx); //CSS的calc()函数要求运算符前后必须有空格
		.scroll{
			height: 100%;
			padding: 0 30rpx;
			.thumb{
				width: 690rpx;
				height: 690rpx;
				.img{
					width: 100%;
					height: 100%;
				}
			}
			.info{
				padding: 20rpx 0;
				border-bottom: 1px solid $border-color-light;
				.title{
					font-size: 40rpx;
					font-weight: bold;
				}
				.price{
					display: flex;
					align-items: center;
					padding-top: 20rpx;
					.big{
						font-size: 46rpx;
						font-weight: bold;
						color: $xxm-theme-color;
					}
					.small{
						font-size: 28rpx;
						color: $text-font-color-3;
						font-weight: bold;
						text-decoration: line-through;
						margin-left: 10rpx;
					}
					.discount{
						border: 1px solid $xxm-theme-color;
						color: $xxm-theme-color;
						font-size: 22rpx;
						padding: 2rpx 20rpx;
						margin-left: 10rpx;
						border-radius: 8rpx;
					}
				}
			}
			.detail{
				padding: 20rpx 0;
				border-bottom: 1px solid $border-color-light;
				.text{
					padding: 20rpx 0;
					.title{
						font-size: 32rpx;
						font-weight: bold;
					}
					.desc{
						padding: 20rpx 0;
						line-height: 1.7em;
					}
				}
				.priceList{
					.img{
						width: 100%;
						margin-bottom: 30rpx;
					}
				}
				.intro{
					padding: 40rpx 0;
					font-size: 30rpx;
					text-align: center;
					color: $text-font-color-3;
				}
			}
		}
	}
	.footer{
		@include flex-box-set();
		height: 140rpx;
		border-top: 1px solid $border-color-light;
		padding: 0 200rpx;
	}
}
</style>