<template>
	<view class="detail">
		<view class="payment">
			<icon type="error" color="#ec544f" size="50" v-if="params.realFee"></icon>
			<icon type="success" color="#19be6b" size="50" v-else></icon>
			<view class="text">
				<view class="big">
					实付款{{priceFormat(params.totalFee)}}
				<text :style="{fontSize: '26rpx', paddingLeft: '10rpx', color: '#ec544f'}" v-if="params.realFee">应付款 ￥{{priceFormat(params.realFee)}}</text>
				</view>
				<view class="small">请等待商家配送</view>
			</view>
			<view class="complete" v-if="params.complete">已完成</view>
		</view>
		
		<view class="info">
			<view class="delivery" v-if="params.orderType!='payment'">
				<view class="btn">
					<u-icon name="bag" color="#fff" size="26"></u-icon>
						<text>商家外送</text>
				</view>				
			</view>	
			<view class="viewOut">
				<view class="title">订单信息</view>
				<view class="body">
					<view class="row">订单编号： {{params.order_no}}</view>
					<view class="row">下单时间： {{timeFormat(params.createTime)}}</view>
					<view class="row">支付方式： {{params.payType=='alipay'?'支付宝支付':'微信支付'}}</view>
					<view class="row" v-if="params.orderType=='payment'">支付类型： 向商家转账</view>
				</view>
			</view>				
			<view class="viewOut" v-if="params.orderType!='payment'">
				<view class="title">收货地址</view>
				<view class="body">
					<view class="row">{{params.deliveryInfo.address}}</view>
					<view class="row">{{params.deliveryInfo.name}}-{{params.deliveryInfo.phone}}</view>
				</view>
			</view>	
			<view class="goodsList" v-if="params.orderType!='payment'">
				<goods-list :goodsList="params.cartList" :totalPrice="params.totalFee" :prePrice="prePrice"></goods-list>
			</view>
		</view>		
	</view>
</template>

<script>
	import {priceFormat, timeFormat} from "@/utils/tools.js"
	const orderCloudObj = uniCloud.importObject("xxm-order")
	export default {
		data() {
			return {
				params: null
			};
		},
		async onLoad(option) {
			let res = await orderCloudObj.getByNo(option.order_no)
			this.params = res.data[0]
		},
		computed:{
			prePrice(){
				let current = this.params.cartList.reduce((prev,next)=>{
					return prev+=next.current_price * next.count
				}, 0)
				let origin = this.params.cartList.reduce((prev,next)=>{
					return prev+=(next.origin_price?next.origin_price:next.current_price) * next.count
				}, 0)
				return origin - current
			}
		},
		methods:{
			priceFormat,
			timeFormat
		}
	}
</script>

<style lang="scss" scoped>
page{
	background: $page-bg-color;
}
.detail{
	.payment{
		@include flex-box-set(start);
		padding: 50rpx 30rpx;
		position: relative;
		.text{
			padding-left: 20rpx;
			color: $text-font-color-1;
			.big{
				font-size: 44rpx;
				font-weight: bold;
			}
			.small{
				font-size: 28rpx;
				color: $text-font-color-3;
			}
		}
		.complete{
			@include flex-box-set();
			font-size: 32rpx;
			color: $text-font-color-3;
			font-weight: bold;
			border: 6rpx solid $text-font-color-3;
			width: 150rpx;
			height: 150rpx;
			border-radius: 50%;
			transform: rotate(-20deg);
			position: absolute;
			right: 100rpx;
			top: 80rpx;
			&::after{
				width: 100%;
				height: 100%;
				display: block;
				box-sizing: border-box;
				content: "";
				border: 2rpx solid $text-font-color-3;
				border-radius: 50%;
				position: absolute;
				left: 0;
				top: 0;
				transform: scale(0.89);
			}
		}
	}
	.info{
		background: #fff;
		padding:30rpx;
		border-radius: 30rpx 30rpx 0 0;
		.delivery{			
			@include flex-box();			
			.btn{
				@include flex-box-set();				
				width: 250rpx;
				height: 60rpx;
				border-radius: 80rpx;
				background:#19BE6B;
				color:#fff;
				text{
					font-size: 34rpx;
				}
			}			
			&.other{
				.btn{
					background: #FF9100;
				}	
				.time{
					font-size: 32rpx;
					color:$xxm-theme-color-aux;
				}
			}
		}
		.viewOut{
			padding:30rpx 0;
			.title{
				font-size: 40rpx;
				padding-bottom:15rpx;
			}
			.row{
				@include flex-box();
				font-size: 30rpx;
				padding:15rpx 0;
				color:$text-font-color-2;
			}
		}
	}
	.goodsList{
		margin-top:30rpx;
	}
}
</style>
