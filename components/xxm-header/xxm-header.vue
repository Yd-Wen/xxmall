<template>
	<view>
		<view class="header" :style="{height:totalHeadHeight+'px'}" v-if="brandData.name">
			<view class="bg">
				<image class="img" :src="brandData.thumb[0].url" mode="aspectFill"></image>
			</view>
			<view class="containner">
				<view class="statusBar" :style="{height: statusBarHeight+'px'}"></view>
				<view v-if="!foldState" class="service" :style="{height: titleBarHeight+'px'}">
					<navigator class="customer" url="/pages/chatbot/chatbot">
						<u-icon name="server-fill" size="22" color="#fff"></u-icon>
						联系客服
					</navigator>
					<navigator class="manage" url="/pages_manage/index/index" v-if="isManage">
						<u-icon name="bag-fill" size="22" color="#fff"></u-icon>
						后台管理
					</navigator>
				</view>
				<view class="body" :class="foldState?'fold':''" :style="{height:bodyBarHeight+'px'}">
					<view class="brand" @click="onBrand">
						<view class="image">
							<image class="img" :src="brandData.thumb[0].url" mode="aspectFill"></image>
						</view>
						<view class="text">
							<view class="title">
								<text class="font">{{brandData.name}}</text>
								<u-icon class="icon" name="more-circle" size="22" color="#fff"></u-icon>
							</view>
							<view class="desc">{{brandData.desc}}</view>
						</view>
					</view>
					<view class="code" @click="onPay">
						<view class="image">
							<image class="img" src="../../static/images/code.png" mode="aspectFill"></image>
						</view>
						<view class="pay">付款</view>
					</view>
				</view>
			</view>
		</view>
		<view v-if="brandData.name">
			<uni-popup ref="brandPopup" type="bottom">
				<view class="brandWrapper">
					<view class="close" @click="onClose">
						<u-icon name="arrow-down" color="#666"></u-icon>
					</view>
					<view class="brand">
						<view class="image">
							<image class="img" :src="brandData.thumb[0].url" mode="aspectFill"></image>
						</view>
						<view class="title">{{brandData.name}}</view>
						<view class="desc">{{brandData.desc}}</view>
					</view>
					<view class="cell">
						<u-cell-group>
							<u-cell icon="phone" :title="brandData.phone" isLink @click="onPhone(brandData.phone)"></u-cell>
							<u-cell icon="map" :title="brandData.address" isLink @click="onAddress(brandData.address)"></u-cell>
						</u-cell-group>
					</view>
				</view>
			</uni-popup>  <!-- <uni-popup> 内置安全区域 -->
			<u-modal :show="payPopState" showCancelButton title="向商家转账" @confirm="onPayConfirm" @cancel="onPayCancel">
				<u--input placeholder="请输入转账金额" border="surround" clearable type="number" v-model="totalFee" focus autoBlur></u--input>
			</u-modal>
			<uni-pay ref="uniPay" return-url="/pgaes/order/order" @success="onPaySuccess" @cancel="onPayCancel"></uni-pay>
		</view>
	</view>
</template>

<script>
	import {mapState, mapGetters, mapMutations, mapActions} from "vuex"
	const orderCloudObj = uniCloud.importObject("xxm-order", {customUI:true})
	export default {
		name:"xxm-header",
		data() {
			return {
				// statusBarHeight: 0,
				// titleBarHeight: 0
				payPopState: false,
				totalFee: 0
			};
		},
		props:{
			// foldState:{
			// 	type: Boolean,
			// 	defaultValue: false
			// 
		},
		computed:{
			// totalHeadHeight(){
			// 	if (this.foldState) return this.statusBarHeight + this.titleBarHeight + 10;
			// 	return this.statusBarHeight + this.titleBarHeight + 100 + 10;
			// },
			// bodyBarHeight(){
			// 	return this.foldState?this.titleBarHeight:100;
			// },
			...mapGetters(['statusBarHeight', 'titleBarHeight', 'bodyBarHeight', 'totalHeadHeight', 'foldState', 'brandData']),
			isManage(){
				return uniCloud.getCurrentUserInfo().role.includes('manage')
			}
		},
		// 组件加载完毕
		async mounted() {
			// let systemInfo = uni.getSystemInfoSync();
			// this.statusBarHeight = systemInfo.statusBarHeight || 20;
			
			// // #ifdef MP-WEIXIN
			// let menuBtnInfo = uni.getMenuButtonBoundingClientRect();
			// this.titleBarHeight =menuBtnInfo.height + ( menuBtnInfo.top - this.statusBarHeight) * 2
			// // #endif
			
			// // #ifndef MP-WEIXIN
			// this.titleBarHeight = 40
			// // #endif
			
			// 网络请求
			// let res = await brandCloudObj.get()
			// console.log(res.data[0])
			// this.SET_BRAND(res.data[0])
			this.getBrandData()
		},
		methods:{
			...mapMutations(['SET_BRAND']),
			...mapActions(['getBrandData']),
			// 点击付款
			onPay(){
				this.payPopState = true
			},
			// 确认付款
			onPayConfirm(){
				this.payPopState = false
				this.createOrder()
			},
			// 取消付款
			onPayCancel(){
				this.payPopState = false
			},
			// 付款成功
			onPaySuccess(){
				
			},
			async createOrder(){
				let obj = {
					createTime: Date.now(),
					status: 0,
					totalFee: Number(this.totalFee)*100,
					complete: false,
					orderType: "payment"  //转账（非购买）类订单
				}
				let order_no = await orderCloudObj.createOrder(obj)
				let out_trade_no = order_no+"_"+String(Math.random()).substring(3, 9)
				
				this.$refs.uniPay.open({
					total_fee: Number(this.totalFee)*100,
					type: "recharge",  // 充值类型
					order_no,
					out_trade_no,
					description: "向商家转账"
				})
			},
			// 点击品牌信息
			onBrand(){
				this.$refs.brandPopup.open()
			},
			// 关闭品牌信息
			onClose(){
				this.$refs.brandPopup.close()
			},
			// 拨打电话
			onPhone(value){
				uni.makePhoneCall({
					phoneNumber:value
				})
			},
			// 打开地图进行地图规划
			onAddress(value){
				uni.request({
					url:"https://restapi.amap.com/v3/geocode/geo",
					data:{
						key:"5a461acffaa58995804ec3d62723727e",
						address:value
					},
					success:res=> {
						let location = res.data.geocodes[0].location
						let arr = location.split(",").map(item=>Number(item))
						uni.openLocation({
							latitude:arr[1],
							longitude:arr[0]
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
.header{
	height: 400rpx;
	overflow: hidden;
	position: relative;
	.bg{
		width: 100%;
		height: 100%;
		background: #000;
		.img{
			width: 100%;
			height: 100%;
			filter: blur(30rpx);
			transform: scale(2);
		}
	}
	.containner{
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		.service{
			@include flex-box-set(start);
			padding-left: 30rpx;	
			.customer{
				@include flex-box-set(start);
				color: #fff;
			}
			.manage{
				@include flex-box-set(start);
				margin-left: 20rpx;
				color: #fff;
			}
		}
		.body{
			@include flex-box();
			padding: 0 45rpx;
			height: 100px;
			transition: 0.3s;
			.brand{
				@include flex-box-set(start);
				width: 580rpx;
				.image{
					width: 110rpx;
					height: 110rpx;
					border-radius: 50%;
					overflow: hidden;
					transition: 0.3s;
					.img{
						width: 100%;
						height: 100%;
					}
				}
				.text{
					flex: 1;
					padding: 0 30rpx;
					color: #fff;
					.title{
						font-size: 36rpx;
						font-weight: 800;
						display: flex;
						align-items: center;
						.font{
							margin-right: 10rpx;
						}
					}
					.desc{
						font-size: 26rpx;
						width: 100%;
						opacity: 0.8;
						padding-top: 5rpx;
						@include ellipse(2);
					}
				}
			}
			.code{
				flex-direction: column;
				@include flex-box-set(between);
				width: 80rpx;
				height: 80rpx;
				border-left: 1px solid rbga(255,255,255,0.6);
				.image{
					width: 40rpx;
					height: 40rpx;
					.img{
						width: 100%;
						height: 100%;
					}
				}
				.pay{
					font-size: 22rpx;
					color: #fff;
					text-align: center;
					
				}
			}
			&.fold{
				padding: 0 30rpx;
				.brand{
					.image{
						width: 60rpx;
						height: 60rpx;
					}
					.text{
						padding-left: 15rpx;
						.title{
							font-size: 28rpx;
							.icon{
								transform: scale(0.9);
							}
						}
						.desc{
							display: none;
						}
					}
				}
				.code{
					display: none;
				}
			}
		}
	}
}
.brandWrapper{
	padding: 30rpx;
	border-radius: 20rpx 20rpx 0 0;
	background: #fff;
	flex-direction: column;
	@include flex-box();
	.close{
		background: $page-bg-color;
		padding: 5rpx 20rpx;
		border-radius: 30rpx;
	}
	.brand{
		@include flex-box();
		flex-direction: column;
		padding: 30rpx 0;
		.image{
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			overflow: hidden;
			.img{
				width: 100%;
				height: 100%;
			}
		}
		.title{
			font-size: 34rpx;
			color: $text-font-color-1;
			padding: 10rpx 0;
		}
		.desc{
			font-size: 28rpx;
			color: $text-font-color-2;
		}
	}
	.cell{
		 width: 100%;
		 padding: 30rpx 0 100rpx;
	}
}
</style>