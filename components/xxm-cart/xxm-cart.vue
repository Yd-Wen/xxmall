<template>
	<view>
		<view class="cartLayout">
			<view class="goods" v-if="cartShow">
				<view class="header">
					<view class="text">已选商品</view>
					<view class="clear" @click="onClear">清空</view>
				</view>
				<scroll-view scroll-y class="body">
					<view class="scrollContent">
						<view class="goodsItem" v-for="item in cartList" :key="cartItemKey(item)">
							<cart-item :item="item"></cart-item>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="content">
				<view class="left">
					<view v-if="!type" class="icon" hover-class="iconHover" hover-stay-time="50" @click="onClickCart">
						<u-icon name="shopping-cart" size="34" color="#ec544f"></u-icon>
						<view class="badge">{{goodsCount}}</view>
					</view>
					<view class="price">
						合计
						<text class="text">￥{{priceFormat(totalPrice)}}</text>
					</view>
				</view>
				<view class="right">
					<view v-if="!type" class="btn" @click="onConfirmOrder">结算</view>
					<view v-else class="btn" :class="payBtnState?'':'disable'" @click="onConfirmPay">支付</view>
				</view>
			</view>
			<view class="safeArea"></view>
		</view>
		<u-overlay :show="cartShow" z-index="9" duration="100" @click="cartShow=false"></u-overlay>
	</view>
</template>

<script>
	import {priceFormat} from "@/utils/tools.js"
	import {mapGetters, mapMutations} from "vuex"
	export default {
		name:"xxm-cart",
		data() {
			return {
				cartShow: false
			};
		},
		props:{
			type:{
				type: String,
				default: ""
			},
			payBtnState:{
				type: Boolean,
				default: false
			}
		},
		computed:{
			...mapGetters(['cartList', 'totalPrice', 'goodsCount'])
		},	
		methods: {
			priceFormat,
			...mapMutations(['SET_CARTLIST']),
			// 获取购物车商品项ID
			cartItemKey(item){
				return item._id + JSON.stringify(item.skuArr)
			},
			// 点击购物车
			onClickCart(){
				this.cartShow = !this.cartShow;
			},
			// 清空购物车
			onClear(){
				this.SET_CARTLIST()
			},
			// 点击确认订单
			onConfirmOrder(){
				uni.navigateTo({
					url:"/pages/pay/pay"
				})
			},
			// 确认支付
			onConfirmPay(){
				if(!this.payBtnState) return
				this.$emit("confirmPay")
			}
		}
	}
</script>

<style lang="scss">
.cartLayout{
	position: relative;
	z-index: 10;
	.goods{
		border-bottom: 1px solid $border-color-light;
		padding: 30rpx 30rpx 0;
		border-radius: 20rpx 20rpx 0 0;
		background: #fff;
		.header{
			@include flex-box();
			color: $text-font-color-3;
			padding: 25rpx 0;
			.clear{
				color: $xxm-theme-color-aux;
			}
		}
		.body{
			height: 550rpx;
			
		}
	}
	
	.content{
		@include flex-box();
		padding: 0 30rpx;
		height: 140rpx;
		background: #fff;
		.left{
			@include flex-box();
			.icon{
				@include flex-box-set();
				width: 80rpx;
				height: 80rpx;
				background: #eeefee;
				border-radius: 10rpx;
				position: relative;
				margin-right: 30rpx;
				.badge{
					@include flex-box-set();
					width: 36rpx;
					height: 36rpx;
					background: $xxm-theme-color;
					border-radius: 50%;
					color: #fff;
					position: absolute;
					right: -18rpx;
					top: -18rpx;
					font-size: 22rpx;
				}
			}
			.iconHover{
				transform: scale(0.9);
			}
			.price{
				font-size: 28rpx;
				.text{
					font-size: 32rpx;
					font-weight: bold;
				}
			}
		}
		.right{
			.btn{
				@include flex-box-set();
				width: 210rpx;
				height: 75rpx;
				background: $xxm-theme-color;
				color: #fff;
				border-radius: 10rpx;
				&.disable{
					opacity: 0.6;
				}
			}
		}
	}
}	

</style>