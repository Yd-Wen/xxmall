<template>
<view class="type">
		<view class="row add" @click="onAdd">
			<view class="left">
				<u-icon name="plus" size="22" color="576b95"></u-icon>
				<text class="text">新增推荐类型</text>
			</view>
		</view>
		<view class="row" v-for="item in typeList" :key="item._id">
			<view class="left">
				<view class="name">{{item.name}}</view>
			</view>
			<view class="right">
				<u-icon name="edit-pen" size="26" color="576b95" @click="onEdit(item._id, item.name)"></u-icon>
				<u-icon name="trash" size="26" color="#ec544f" @click="onDelete(item._id)"></u-icon>
			</view>
		</view>
		<uni-popup ref="inputPopup">
			<uni-popup-dialog mode="input" :value="inputValue" title="推荐类型名称" placeholder="请输入推荐类型名称" @confirm="onConfirm"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
const typeCloudObj = uniCloud.importObject("xxm-type")
	export default {
		data() {
			return {
				typeList: [],
				inputValue: '',
				editId: null
			};
		},
		onLoad() {
			this.isManage()
			this.getType()
		},
		methods: {
			// 获取商品分类
			async getType(){
				let res = await typeCloudObj.get()
				this.typeList = res.data
			},
			// 添加类型
			onAdd() {
				this.inputValue = ''
				this.editId = null
				this.$refs.inputPopup.open();
			},
			// 确认添加
			async onConfirm(e) {
				if(this.editId){
					// 修改
					await typeCloudObj.update(this.editId, e)
					uni.showToast({
						title: '更新类型成功',
						mask: true
					})
				}else{
					await typeCloudObj.add({name: e})
					uni.showToast({
						title: '新增类型成功',
						mask: true
					})
				}
				// 同步添加/修改后刷新
				this.getType()
			},
			// 修改类型
			onEdit(id, name){
				this.editId=id
				this.inputValue=name
				this.$refs.inputPopup.open()
			},
			// 删除类型
			async onDelete(id){
				uni.showModal({
					content: '是否删除该类型?',
					success: async res=>{
						if(res.confirm){
							await typeCloudObj.delete(id)
							uni.showToast({
								title: '删除类型成功',
								mask: true
							})
							this.getType()
						} 
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.type {
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
