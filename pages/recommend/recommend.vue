<template>
	<view class="recommendView">
		<view class="header">
			<view class="title">{{goods.name}}</view>
		</view>
		<view class="img">
			<image :src="banner.thumb_src=='0'?'../../static/images/banner/banner_default_'+ (index%3+1) +'.png':banner.thumb[0].url" mode="aspectFill"></image>
		</view>
		<view class="desc">{{banner.desc}}</view>
	</view>
</template>

<script>
	const bannerCloudObj = uniCloud.importObject('xxm-banner')
	export default {
		data() {
			return {
				banner: {}
			};
		},
		async onLoad(){
			let id = this.$route.query.id
			let res = await bannerCloudObj.get({_id:id})
			this.banner = res.data[0]
		}
	}
</script>

<style lang="scss">
	.recommendView{
		padding: 20rpx;
		.header{
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 20rpx;
		}
		.img{
			width: 100%;
			height: 400rpx;
			border-radius: 20rpx;
			overflow: hidden;
			margin-bottom: 20rpx;
		}
		.desc{
			font-size: 28rpx;
			color: #666;
		}
	}
</style>