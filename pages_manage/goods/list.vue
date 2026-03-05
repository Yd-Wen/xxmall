<template>
	<view class="goodsList">
		<navigator url="./add" class="row add">
			<view class="left">
				<u-icon name="plus" color="#576b95" size="22"></u-icon>
				<text class="text">新增商品</text>
			</view>
		</navigator>
		<view class="row" v-for="item in goodsData" :key="item._id">
			<view class="category">
				<uni-section :title="item.name" type="line"></uni-section>
			</view>
			<view class="goodsRow" v-for="row in item.goodsGroup" :key="row._id">
				<view class="goods">
					<view class="left">
						<image class="img" :src="row.thumb[0].url" mode="aspectFill"></image>
					</view>
					<view class="right">
						<view class="title">{{row.name}}</view>
						<view class="desc">{{row.desc}}</view>
						<view class="option">
							<view class="icon" @click="onUpdate(row._id)">
								<u-icon name="edit-pen" size="25" color="576b95"></u-icon>
							</view>
							<view class="icon" @click="onDelete(row._id)">
								<u-icon name="trash" size="25" color="#ec544f"></u-icon>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	const goodsCloudObj = uniCloud.importObject("xxm-goods")
	export default {
		data() {
			return {
				goodsData: []
			};
		},
		onLoad() {
			this.isManage()
		},
		onShow() {
			this.getGoods()
		},
		methods:{
			// 获取商品
			async getGoods(){
				let res = await goodsCloudObj.get()
				this.goodsData = res
			},
			// 跳转到商品修改页
			onUpdate(id){
				uni.navigateTo({
					url:`./add?id=${id}`
				})
			},
			// 删除
			onDelete(id){
				uni.showModal({
					title:"是否确认删除",
					success:res=>{
						if(res.confirm){
							this.removeGoods(id)
						}
					}
				})
			},
			// 删除商品
			async removeGoods(id){
				let res = await goodsCloudObj.remove(id)
				if (res) {
					uni.showToast({
						title:"删除成功"
					})
					setTimeout(()=>{
						this.getGoods()
					}, 1000)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.goodsList{
	padding: 30rpx;
	.row{
		border-bottom: 1px solid #ededed;
		padding: 25rpx 0;
		.left{
			@include flex-box-set(start);
			.text{
				padding-left: 10rpx;
				font-size: 34rpx;
			}
		}
		.category{
			
		}
		.goodsRow{
			padding: 0 30rpx;
			.goods{
				@include flex-box();
				padding-bottom: 30rpx;
				.left{
					width: 170rpx;
					height: 170rpx;
					border-radius: 20rpx;
					overflow: hidden;
					.img{
						width: 100%;
						height: 100%;
					}
				}
				.right{
					flex: 1;
					flex-direction: column;
					@include flex-box-set(start, start);
					padding: 0rpx 100rpx 0rpx 30rpx;
					position: relative;
					.title{
						font-size: 34rpx;
						font-weight: bold;
						@include ellipse();
					}
					.desc{
						font-size: 26rpx;
						margin-top: 20rpx;
						@include ellipse(2);
						min-height: 74rpx;
					}
					.option{
						@include flex-box();
						position: absolute;
						right: -10rpx;
						bottom: -10rpx;
						.icon{
							padding-left: 10rpx;
						}
					}
				}
			}
		}
	}
	.add{
		border-bottom: none;
	}
}
</style>
