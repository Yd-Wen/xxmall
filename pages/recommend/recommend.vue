<template>
	<view class="recommendView">
		<view class="header" v-if="currentBanner && currentBanner.name">
			<view class="title">{{currentBanner.name}}</view>
		</view>
		<view class="img" v-if="currentBanner">
			<image :src="currentBanner.thumb_src=='0'?'../../static/images/banner/banner_default_'+ (currentIndex%3+1) +'.png':currentBanner.thumb[0].url" mode="aspectFill"></image>
		</view>
		<view class="desc" v-if="currentBanner && currentBanner.desc">
			{{currentBanner.desc}}
		</view>
	</view>
</template>

<script>
	import { mapGetters, mapMutations, mapActions } from 'vuex'
	export default {
		data() {
			return {
				index: 0
			};
		},
		computed: {
			...mapGetters(['currentBanner', 'currentIndex'])
		},
		async onLoad(options) {
			this.index = options.idx ? Number(options.idx) : 0
			await this.loadBannerData()
		},
		async onShow() {
			await this.loadBannerData()
		},
		methods: {
			...mapMutations(['SET_CURRENT_BANNER']),
			...mapActions(['getBannerData']),
			async loadBannerData() {
				await this.getBannerData()
				this.SET_CURRENT_BANNER(this.index)
			}
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