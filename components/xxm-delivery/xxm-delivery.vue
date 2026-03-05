<template>
	<view class="delivery">
		<view class="header">配送</view>
		<view class="body">
			<view class="box" @click="onAddress">
				<view class="left">收货地址</view>
				<view class="center">
					<view v-if="deliveryInfo.address">
						<view class="addressText">{{deliveryInfo.address}}</view>
						<view class="userInfo">{{deliveryInfo.name}}-{{deliveryInfo.phone}}</view>
					</view>
					<view v-else class="addressHint">请添加收货地址</view>
				</view>
				<view class="right">
					<u-icon name="arrow-right" size="18" color="#999"></u-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"delivery",
		data() {
			return {

			};
		},
		props:{
			deliveryInfo:{
				type: Object,
				default(){
					return {
						address: "",
						name: "",
						phone: ""
					}
				}
			}
		},
		methods:{
			// 跳转地址列表页面
			onAddress(){
				uni.navigateTo({
					url: '/pages/address/list'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.delivery{
	.header{
		@include flex-box-set();
		width: 100%;
		height: 78rpx;
		background: #fff;
		color: $xxm-theme-color;
		border-radius: 15rpx 15rpx 0 0;
	}
	.body{
		background: #fff;
		padding: 25rpx;
		.box{
			@include flex-box();
			border-radius: 10rpx;
			padding: 40rpx 20rpx;
			background: $page-bg-color;
			font-size: 30rpx;
			.center{
				flex: 1;
				padding: 0 30rpx;
				font-size: 30rpx;
				.userInfo{
					padding-top: 10rpx;
				}
			}
		}
	}
}

</style>