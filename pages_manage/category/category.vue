<template>
	<view class="category">
		<view class="row add" @click="onAdd">
			<view class="left">
				<u-icon name="plus" size="22" color="576b95"></u-icon>
				<text class="text">新增分类</text>
			</view>
		</view>
		<view class="row" v-for="item in categoryList" :key="item._id">
			<view class="left">
				<view class="name">{{item.name}}</view>
			</view>
			<view class="right">
				<u-icon name="edit-pen" size="26" color="576b95" @click="onEdit(item._id, item.name)"></u-icon>
				<u-icon name="trash" size="26" color="#ec544f" @click="onDelete(item._id)"></u-icon>
			</view>
		</view>
		<uni-popup ref="inputPopup">
			<uni-popup-dialog mode="input" :value="inputValue" title="分类名称" placeholder="请输入分类名称" @confirm="onConfirm"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	const categoryCloudObj = uniCloud.importObject("xxm-category")
	export default {
		data() {
			return {
				categoryList: [],
				inputValue: '',
				editId: null
			};
		},
		onLoad() {
			this.isManage()
			this.getCategory()
		},
		methods: {
			// 获取商品分类
			async getCategory(){
				let res = await categoryCloudObj.get()
				this.categoryList = res.data
			},
			// 添加分类
			onAdd() {
				this.inputValue = ''
				this.editId = null
				this.$refs.inputPopup.open();
			},
			// 确认添加
			async onConfirm(e) {
				if(this.editId){
					// 修改
					await categoryCloudObj.update(this.editId, e)
					uni.showToast({
						title: '更新分类成功',
						mask: true
					})
				}else{
					// 添加
					await categoryCloudObj.add({name: e})
					uni.showToast({
						title: '新增分类成功',
						mask: true
					})
				}
				// 同步添加/修改后刷新
				this.getCategory()
			},
			// 修改分类
			onEdit(id, name){
				this.editId=id
				this.inputValue=name
				this.$refs.inputPopup.open()
			},
			// 删除分类
			async onDelete(id){
				uni.showModal({
					content: '是否删除该分类?',
					success: async res=>{
						if(res.confirm){
							await categoryCloudObj.delete(id)
							uni.showToast({
								title: '删除分类成功',
								mask: true
							})
							this.getCategory()
						} 
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.category {
		padding: 30rpx;

		.row {
			@include flex-box();
			border-bottom: 1px solid $border-color-light;
			padding: 26rpx 0;

			.left {
				font-size: 34rpx;
			}

			.right {
				@include flex-box();

				// u-icon自动添加类名u-icon
				.u-icon {
					margin-left: 30rpx;
				}
			}
		}

		.row.add {
			.left {
				@include flex-box();
				color: $xxm-theme-color-aux;

				.text {
					font-size: 36rpx;
					padding-left: 10rpx;
				}
			}
		}
	}
</style>