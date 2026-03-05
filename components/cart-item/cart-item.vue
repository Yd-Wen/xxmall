<template>
	<view class="cartItem">
		<view class="left">
			<view class="image">
				<image class="img" :src="item.thumb[0].url" mode="aspectFill"></image>
			</view>
			<view class="text">
				<view class="title">{{item.name}}</view>
				<view class="sku" v-if="item.skuArr">{{item.skuArr.join("/")}}</view>
				<view class="price">
					<view class="currentPrice">￥{{priceFormat(item.current_price)}}</view>
					<view class="originPrice" v-if="item.origin_price">￥{{priceFormat(item.origin_price)}}</view>
				</view>
			</view>
		</view>
		<view class="right">
			<xxm-numberbox :item="item"></xxm-numberbox>
		</view>
	</view>
</template>

<script>
	import {priceFormat} from "@/utils/tools.js"
	export default {
		name:"cart-item",
		data() {
			return {
				
			};
		},
		props:{
			item:{
				type: Object,
				default: () => {return {}}
			}
		},
		methods:{
			priceFormat
		}
	}
</script>

<style lang="scss" scoped>
.cartItem{
	padding: 20rpx 0;
	border-bottom: 1px solid $border-color-light;
	position: relative;
	.left{
		@include flex-box-set(start, stretch);
		width: 500rpx;
		.image{
			width: 110rpx;
			height: 110rpx;
			.img{
				width: 100%;
				height: 100%;
			}
		}
		.text{
			flex: 1;
			padding-left: 20rpx;
			.title{
				font-size: 28rpx;
				@include ellipse(2);
			}
			.sku{
				font-size: 22rpx;
				color: #999;
				padding: 5rpx 0;
			}
			.price{
				@include flex-box-set(start);
				.currentPrice{
					font-size: 28rpx;
					font-weight: bold;
					color: $xxm-theme-color;
				}
				.originPrice{
					font-size: 26rpx;
					color: $text-font-color-3;
					text-decoration: line-through;
				}
			}
		}
	}
	.right{
		position: absolute;
		right: 0;
		bottom: 20rpx;		
	}
}

</style>