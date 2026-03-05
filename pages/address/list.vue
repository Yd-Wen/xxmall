<template>
	<view class="addressList">
		<view class="header">
			<view class="title">地址簿</view>
			<navigator class="button" url="/pages/address/edit"> + 添加地址</navigator>
		</view>
		<view class="body" v-if="addressList.length">
			<view class="item" v-for="item in addressList" :key="item._id" @click="onSelectAddress(item)">
				<view class="top">
					<view class="name">{{item.name}} {{item.phone}}</view>
					<view class="select">
						<view v-if="item.default" class="default">
							<u-button plain color="#ec544f" size="mini" text="默认地址"></u-button>
						</view>
						<view v-else class="set" @click.stop="setDefault(item._id)">
							<u-button plain color="#666" size="mini" text="设为默认"></u-button>
						</view>
					</view>
				</view>
				<view class="bottom">
					<view class="text">
						{{item.area_name+item.address}}
					</view>
					<view class="option">
						<view class="icon" @click.stop="onEdit(item._id)">
							<u-icon name="edit-pen" size="22" color="576b95"></u-icon>
						</view>
						<view class="icon" @click.stop="onDelete(item._id)">
							<u-icon name="trash" size="22" color="#ec544f"></u-icon>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="empty" v-else>
			<u-empty mode="data" icon="/static/images/no_address.png"></u-empty>
		</view>
	</view>
</template>

<script>
	const addressCloudObj = uniCloud.importObject("xxm-address")
	export default {
		data() {
			return {
				addressList: []
			};
		},
		onShow() {
			this.getAddress()
		},
		methods:{
			// 获取地址列表
			async getAddress(){
				let res = await addressCloudObj.get()
				this.addressList = res.data
			},
			// 设置默认地址
			async setDefault(id){
				await addressCloudObj.setDefault(id)
				await this.getAddress()
			},
			// 跳转编辑地址页面
			onEdit(id){
				uni.navigateTo({
					url:`./edit?id=${id}`
				})
			},
			// 删除地址
			onDelete(id){
				uni.showModal({
					content: '是否删除该地址?',
					success: res=>{
						if(res.confirm){
							this.removeAddress(id)
						} 
					}
				})
			},
			// 删除操作
			async removeAddress(id){
				let res = await addressCloudObj.remove(id)
				if (res) {
					uni.showToast({
						title:"删除成功",
						mask:true
					})
					this.getAddress()
				}
			},
			onSelectAddress(data){
				let {address, area_name, name, phone} = data
				let deliveryInfo = {
					address: area_name + address,
					name,
					phone,
				}
				uni.$emit("selectAddressEvent", deliveryInfo)  // 触发全局的自定义事件
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss" scoped>
page{
	background: $page-bg-color;
}
.addressList{
	padding: 30rpx;
	.header{
		@include flex-box();
		font-size: 30rpx;
		font-weight: bold;
		.button{
			border: 1px solid #000;
			border-radius: 50rpx;
			padding: 6rpx 15rpx;
		}	
	}
	.body{
		padding-top: 30rpx;
		.item{
			background: #fff;
			padding: 40rpx 20rpx;
			margin-bottom: 30rpx;
			border-radius: 15rpx;
			.top{
				@include flex-box();
				font-weight: bold;
			}
			.bottom{
				@include flex-box();
				font-size: 28rpx;
				color: $text-font-color-3;
				padding-top: 30rpx;
				.option{
					@include flex-box();
					.icon{
						margin-left: 20rpx;
					}
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
}

</style>
