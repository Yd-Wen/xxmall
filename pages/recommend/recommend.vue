<template>
	<view class="recommendView">
		<view class="header" v-if="currentBanner && currentBanner.name">
			<view class="icon">
				<u-icon v-if="type.name=='低价特惠'" name="coupon-fill" size="25" color="#ec544f"></u-icon>
				<u-icon v-else-if="type.name=='知识百科'" name="bookmark-fill" size="25" color="#576b95"></u-icon>
				<u-icon v-else name="bag-fill" size="25" color="#333"></u-icon>
			</view>
			<view class="title">{{type.name}}</view>
		</view>
		<view class="body">
			<view class="name">{{currentBanner.name}}</view>
			<view class="img" v-if="currentBanner">
				<image 
				:src="currentBanner.thumb_src=='0'?'../../static/images/banner/banner_default_'+ (currentIndex%3+1) +'.png':
					currentBanner.thumb[0].url" 
				mode="aspectFill">
				</image>
			</view>
			<view class="desc" v-if="currentBanner && currentBanner.desc">
				<rich-text :nodes="currentBanner.desc"></rich-text>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapGetters, mapMutations, mapActions } from 'vuex'
	const typeCloudObj = uniCloud.importObject('xxm-type')
	export default {
		data() {
			return {
				index: 0,
				type: {}
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
				await this.loadTypeData()
			},
			async loadTypeData() {
				let res = await typeCloudObj.getById(this.currentBanner.type_id)
				this.type = res.data[0]
			}
		}	
	}
</script>

<style lang="scss">
	.recommendView{
		margin: 30rpx 30rpx 0;
		.header{
			margin-bottom: 30rpx;
			padding: 10rpx 0;
			display: flex;
			align-items: center;
			border-bottom: 1px solid $border-color;
			.icon{
				margin-right: 20rpx;
			}
			.title{
				font-size: 34rpx;
				font-weight: bold;
				color: $text-font-color-1;
				vertical-align: middle;
			}
		}
		.body{
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;
			.name{
				font-size: 34rpx;
				color: $text-font-color-1;
				margin-bottom: 20rpx;
			}
			.img{
				width: 100%;
				height: 400rpx;
				border-radius: 20rpx;
				overflow: hidden;
				margin: 0 auto 30rpx;
				image{
					width: 100%;
					height: 100%;
				}
			}
			.desc{
				font-size: 28rpx;
				color: $text-font-color-2;
			}
		}
	}
</style>