<template>
	<view class="bannerList">
		<navigator url="./add" class="row add">
			<view class="left">
				<u-icon name="plus" color="#576b95" size="22"></u-icon>
				<text class="text">新增推荐</text>
			</view>
		</navigator>
		<view class="row" v-for="item in bannerData" :key="item._id">
			<view class="type">
				<uni-section :title="item.name" type="line"></uni-section>
			</view>
			<view class="bannerRow" v-for="(row,index) in item.bannerGroup" :key="row._id">
				<view class="banner">
					<view class="left">
						<image class="img" 
                        :src="row.thumb_src=='0'?'../../static/images/banner/banner_default_'+ (index%3+1) +'.png':row.thumb[0].url" 
                        mode="aspectFill">
                        </image>
					</view>
					<view class="right">
						<view class="title">{{row.name}}</view>
						<view class="desc">{{row.desc}}</view>
						<view class="option">
							<view class="icon" @click="onUpdate(row._id)">
								<u-icon name="edit-pen" size="25" color="#576b95"></u-icon>
							</view>
							<view class="icon" @click="onDelete(row._id, row.name)">
								<u-icon name="trash" size="25" color="#ec544f"></u-icon>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<xxm-progress ref="progress" :progressPopState="isSync" :progressData="progressData" @confirm="onConfirmSync"></xxm-progress>
	</view>
</template>

<script>
	import { mapMutations } from 'vuex'
	const bannerCloudObj = uniCloud.importObject("xxm-banner", {'customUI': true})
	const ragCloudObj = uniCloud.importObject("xxm-rag", {'customUI': true})
	export default {
		data() {
			return {
				bannerData: [],
				isSync: false,
				progressData: {
					title: '删除推荐中',
					data: [],
					percentage: 0,
					scrollTop: 0
				},
			};
		},
		onLoad() {
			this.isManage()
		},
		onShow() {
			this.getBanner()
		},
		methods:{
			...mapMutations(['REMOVE_BANNER']),
			// 初始化上传进度
			initProgress(name){
				this.isSync = true
				this.$refs.progress.initProgress('删除推荐中', [
					{
						name: name,
						status: '【等待】删除推荐'
					},
					{
						name: '',
						status: '【等待】同步到知识库'
					}
				])
			},
			// 获取商品
			async getBanner(){
				let res = await bannerCloudObj.getByGroup()
				this.bannerData = res
			},
			// 跳转到banner修改页
			onUpdate(id){
				uni.navigateTo({
					url:`./add?id=${id}`
				})
			},
			// 删除
			onDelete(id, name){
				uni.showModal({
					title:"是否确认删除",
					success:res=>{
						if(res.confirm){
							this.initProgress(name)
							this.removeBanner(id)
						}
					}
				})
			},
			// 删除banner
			async removeBanner(id){
				let res = await bannerCloudObj.remove(id)
				this.$refs.progress.updateProgressStatus(0, res.deleted ? '【成功】删除推荐成功' : '【失败】删除推荐失败')
				if (res.deleted) {
					res = await ragCloudObj.deleteKnowledge({id: id})
					this.$refs.progress.updateProgressStatus(1, res.data.message)
				}
				else{
					this.$refs.progress.updateProgressStatus(1, '【失败】必先删除推荐')
				}
				// 删除成功后，从vuex中删除banner数据
				await this.REMOVE_BANNER(id)
			},
			// 上传结束
			onConfirmSync(){
				this.isSync = false
				setTimeout(()=>{
					this.getBanner()
				}, 500)
			},
		}
	}
</script>

<style lang="scss" scoped>
.bannerList{
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
		.bannerRow{
			padding: 0 30rpx;
			.banner{
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
