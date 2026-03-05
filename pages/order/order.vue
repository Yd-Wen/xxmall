<template>
	<view>
		<uni-nav-bar title="我的订单" style="{font-size: 32px; font-weight: bold;}" 
		:border="false" backgroundColor="#fff" color="#000" leftIcon="left" @clickLeft="onBack" statusBar></uni-nav-bar>
		<view class="order" v-if="orderList.length">
			<view class="row" @click="onDetail(item.order_no)" v-for="(item,index) in orderList" :key="item._id">
				<view class="header">
					<view class="number">订单号{{item.order_no}}</view>
					<view class="state">
						<u-icon name="weixin-fill" size="22" color="#04c15f" v-if="item.payType=='wxpay'"></u-icon>
						<u-icon name="zhifubao" size="22" color="#1578ff" v-if="item.payType=='alipay'"></u-icon>
						<text :class="item.status==-2?'err':''">{{getOrderStatus(item.status)}}</text>
					</view>
				</view>
				<view class="body" v-if="item.orderType!='payment'">{{getCartListName(item.cartList)}}</view>
				<view class="body" v-else>向商家转账</view>
				<view class="footer">
					<view class="time">{{timeFormat(item.createTime, fmt="yyyy-MM-dd hh:mm")}}</view>
					<view class="price" v-if="item.orderType!='payment'">
						共{{item.cartList.length}}件商品，实付
						<text class="text">￥{{priceFormat(item.totalFee)}}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="empty" v-else>
			<u-empty mode="order" icon="/static/images/no_order.png"></u-empty>
		</view>
	</view>
</template>

<script>
	import {priceFormat, timeFormat} from "@/utils/tools.js"
	const orderCloudObj = uniCloud.importObject("xxm-order")
	export default {
		data() {
			return {
				orderList:[]
			};
		},
		onLoad() {
			this.getOrderList()
		},
		methods:{
			priceFormat,
			timeFormat,
			onBack(){
				uni.reLaunch({
					url:"/pages/index/index"
				})
			},
			// 获取订单列表
			async getOrderList(){
				let res = await orderCloudObj.getList()
				this.orderList = res.data
			},
			// 获取商品名称
			getCartListName(arr){
				let name = arr.map(item=>{
					return item.name
				})
				return name.join(" / ")
			},
			// 获取支付状态
			getOrderStatus(value){
				let obj =  {
					"-2": "支付异常",
					"-1": "已关闭",
					"0": "未支付",
					"1": "已支付",
					"2": "已部分退款",
					"3": "已全额退款",
				}
				return obj[value]
			},			
			// 跳转订单详情页
			onDetail(value){
				// let params = encodeURI(JSON.stringify(value))
				uni.navigateTo({
					url:"/pages/order/detail?order_no="+value
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
page{
	background: $page-bg-color;
}
.order{
	padding: 30rpx;
	.row{
		background: #fff;
		padding: 40rpx 20rpx;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
		.header{
			@include flex-box();
			font-size: 32rpx;
			.number{
				@include flex-box-set(start);
				.way{
					background: #19be6b;
					color: #fff;
					font-size: 22rpx;
					padding: 6rpx 20rpx;
					border-radius: 30rpx;
					margin-left: 10rpx;
				}
			}
			.state{
				color: $xxm-theme-color-aux;
				@include flex-box-set(start);
				.err{
					color: #f56c6c;
				}
			}	
		}
		.body{
			border: 1px solid $border-color;
			padding: 60rpx 20rpx;
			border-radius: 10rpx;
			background: #f9f9f9;
			font-size: 34rpx;
			margin: 30rpx 0;
		}
		.footer{
			@include flex-box();
			font-size: 26rpx;
			color: #a5a5a5;
			.text{
				font-weight: bold;
				color: #000;
			}
		}
	}
}
.empty{
	position: absolute;
	top: 50%;    // 垂直方向居中基准
	left: 50%;   // 水平方向居中基准
	// 向左、向上平移自身50%，实现完美居中
	transform: translate(-50%, -50%);
	// 可选：增加z-index，确保empty在其他元素上方（避免被遮挡）
	z-index: 10;
}
</style>
