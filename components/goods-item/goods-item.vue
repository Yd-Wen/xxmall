<template>
	<view class="goodsItem" @click="onGoodsDetail">
		<view class="goodsImg">
			<image class="img" :src="item.thumb[0].url" mode="aspectFill"></image>
		</view>
		<view class="goodsText">
			<view class="goodsTitle">{{item.name}}</view>
			<view class="goodsPrice">
				<view class="currentPrice">￥{{priceFormat(item.current_price)}}</view>
				<view class="originPrice" v-if="item.origin_price">￥{{priceFormat(item.origin_price)}}</view>
			</view>
			<view class="discount" v-if="item.origin_price && discount(item.current_price, item.origin_price)">
				{{discount(item.current_price, item.origin_price)}}
			</view>
			<view class="skuBox" v-if="btnState">
				<view class="skuSelect" v-if="item.sku.length" @click.stop="onGoodsSelection">选规格</view>
				<view v-else>
					<xxm-numberbox :item="item"></xxm-numberbox>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {mapMutations} from 'vuex'
	import { priceFormat, discount } from '@/utils/tools.js';
	export default {
		name:"goods-item",
		data() {
			return {
				value:0
			};
		},
		props:{
			item: {
				type: Object,
				default: () => {return {}}
			},
			btnState:{
				type: Boolean,
				default: true
			}
		},
		methods: {
			priceFormat,
			discount,
			...mapMutations(['SET_DETAILPOPSTATE', 'SET_DETAILDATA', 'SET_SELECTIONPOPSTATE']),
			// 查看商品详情
			onGoodsDetail(){
				if(!this.btnState) return;  // 选规格弹窗点击item后不再弹出详情弹窗
				this.SET_DETAILPOPSTATE(true)
				this.SET_DETAILDATA(this.item)
			},
			// 选择商品规格
			onGoodsSelection(){
				this.SET_SELECTIONPOPSTATE(true)
				this.SET_DETAILDATA(this.item)
			}
		}
	}
</script>

<style lang="scss">
.goodsItem{
	width: 100%;
	display: flex;
	padding: 25rpx 0;
	.goodsImg{
		width: 170rpx;
		height: 170rpx;
		border-radius: 20rpx;
		overflow: hidden;
		.img{
			width: 100%;
			height: 100%;
		}
	}
	.goodsText{
		flex: 1;
		padding-left: 20rpx;
		position: relative;
		.goodsTitle{
			font-size: 34rpx;
			font-weight: bold;
			@include ellipse();
		}
		.goodsPrice{
			@include flex-box-set(start, end);
			font-weight: bold;
			padding: 10rpx 0;
			.currentPrice{
				font-size: 34rpx;
				color: $xxm-theme-color;
			}
			.originPrice{
				font-size: 26rpx;
				opacity: 0.4;     //透明度
				text-decoration: line-through;
				padding-left: 10rpx;
			}
		}
		.discount{
			font-size: 22rpx;
			color: $xxm-theme-color;
			padding: 0 4rpx;	
			border: 1rpx solid $xxm-theme-color;
			display: inline-block;
			border-radius: 6rpx;
		}
		.skuBox{
			position: absolute;
			right: 0;
			bottom: 0;
			.skuSelect{
				height: 40rpx;
				padding: 0 4rpx;	
				background: $xxm-theme-color;
				font-size: 28rpx;
				color: #fff;
				border-radius: 10rpx;
			}
			
		}
	}
}
</style>