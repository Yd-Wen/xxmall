<template>
	<view class="pay">
		<xxm-delivery :deliveryInfo="deliveryInfo"></xxm-delivery>
		<view class="goodsList" scroll-y>
			<goods-list :goodsList="cartList" :totalPrice="totalPrice" :prePrice="preferentialPrice"></goods-list>
		</view>
		<!-- #ifndef MP-WEIXIN -->
		<view class="payType">
			<view class="box" :class="item.value==payDefaultValue?'active':''" v-for="item in payType" @click="onPayWay(item.value)">
				<u-icon :name="item.icon" :color="item.color" size="26"></u-icon>
				<text class="text">{{item.name}}</text>
			</view>
		</view>
		<!-- #endif -->
		<view class="payBar">
			<xxm-cart type="pay" :payBtnState="payBtnState" @confirmPay="onConfirmPay"></xxm-cart>
		</view>
		<uni-pay ref="uniPay" returnUrl="pages/order/order" @create="onPayCreate" @success="onPaySuccess" @cancel="onPayCancel"></uni-pay>
	</view>
</template>

<script>
	import {mapGetters, mapMutations} from "vuex"
	const addressCloudObj = uniCloud.importObject("xxm-address", {customUI:true})
	const orderCloudObj = uniCloud.importObject("xxm-order", {customUI:true})
	export default {
		data() {
			return {
				deliveryInfo: {
					address: "",
					name: "",
					phone: ""
				},
				// #ifdef APP-PLUS || H5
				payDefaultValue: "alipay",
				// #endif
				// #ifdef MP-WEIXIN
				payDefaultValue: "wxpay",
				// #endif
				payType:[{
					name: "支付宝",
					value: "alipay",
					icon: "zhifubao",
					color: "#1578ff"
				},{
					name: "微信",
					value: "wxpay",
					icon: "weixin-fill",
					color: "#04c15f"
				}],
				payLoading:true
			};
		},
		computed:{
			...mapGetters(['cartList', 'totalPrice', 'preferentialPrice']),
			payBtnState() {
				let bool = Object.keys(this.deliveryInfo).every(item=>{
					return this.deliveryInfo[item]!=''
				})
				return this.cartList.length > 0 && this.totalPrice > 0 && bool && this.payLoading
			}
		},
		onLoad(){
			this.getDefaultAddress()
			uni.$on("selectAddressEvent", (e)=>{
				this.deliveryInfo = e
			})
		},
		onUnload() {
			uni.$off("selectAddressEvent")
		},
		methods:{
			...mapMutations(['SET_CARTLIST']),
			// 选择支付类型
			onPayWay(value){
				this.payDefaultValue = value
			},
			// 获取默认地址
			async getDefaultAddress(){
				let res = await addressCloudObj.getDefault()
				if (!res.data.length) return  // 无默认地址
				let {address, area_name, name, phone} = res.data[0]
				this.deliveryInfo = {
					address: area_name + address,
					name,
					phone,
				}
			},
			async onConfirmPay(){
				this.payLoading = false
				let obj = {
					deliveryInfo: this.deliveryInfo,
					cartList: this.cartList,
					createTime: Date.now(),
					payType: this.payDefaultValue,
					status: 0,
					totalFee: this.totalPrice,
					complete: false
				}
				
				let order_no = await orderCloudObj.createOrder(obj)
				let out_trade_no = order_no+"_"+String(Math.random()).substring(3, 9)
				
				this.$refs.uniPay.createOrder({
					provider: this.payDefaultValue,
					total_fee: this.totalPrice,
					type: "goods",
					order_no,
					out_trade_no,
					description: "商品购买"
				})
			},
			onPayCreate(){
				
			},
			onPaySuccess(){
				this.payLoading = true  // 支付加载中		
				this.SET_CARTLIST()     // 清空购物车
			},
			onPayCancel(){
				
			}
		}
	}
</script>

<style lang="scss" scoped>
page{
	background: $page-bg-color;
}
.pay{
	padding: 30rpx;
	.goodsList{
		margin-top: 30rpx;
	}
	.payType{
		@include flex-box();
		height: 100rpx;
		margin-bottom: 150rpx;
		.box{
			@include flex-box-set();
			width: 49%;
			height: 75rpx;
			background: #fff;
			border: 1px solid #fff;
			border-radius: 10rpx;
			filter: grayscale(100%); //添加灰度
			.text{
				padding-left: 10rpx;
			}
		}
		.box:first-child.active{
			border-color: #1578ff;
			color: #1578ff;
			filter: grayscale(0); //添加灰度
		}
		.box:last-child.active{
			border-color: #04c15f;
			color: #04c15f;
			filter: grayscale(0); //添加灰度
		}
	}
	.payBar{
		height: 150rpx;
		position: fixed;
		width: 100%;
		bottom: 0;
		left: 0;
	}
}

</style>
