<template>
	<view class="home">
		<xxm-header :foldState="foldState" id="header" :key="freshKey"></xxm-header>
		<xxm-banner class="banner" :items="swiperItems"/>
		<view class="wrapper">
			<view class="info">
				<view class="left">免费配送</view>
				<navigator class="right" url="/pages/order/order">
					<u-icon name="order" color="#576b95" size="22"></u-icon>
					我的订单
				</navigator>
			</view>
			<view class="scrollLayout">
				<view class="leftScroll">
					<scroll-view scroll-y :scroll-top="leftScrollValue" class="scrollContent">
						<view class="navItem" :class="index==navIdx?'active':''" v-for="(item,index) in dataList" :key="item.id"
							@click="onClickNav(index)">{{item.name}}</view>
					</scroll-view>
				</view>
				<view class="rightScroll">
					<navigator class="searchView" url="/pages/search/search">
						<u-icon name="search" size="22" color="#576b95" />
						搜索
					</navigator>
					<scroll-view scroll-y :scroll-top="rightScrollValue" @scroll="onRightScroll" scroll-with-animation
						class="scrollContent">
						<view class="goodsView" v-for="(item, index) in dataList" :key="item.id">
							<u-sticky :customNavHeight="0" zIndex="2">
								<view class="goodsTitle">{{item.name}}</view>
							</u-sticky>
							<view class="goodsContent">
								<view class="goodsItem" v-for="goods in item.goodsGroup">
									<goods-item :item="goods"></goods-item>
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>
		<xxm-cart v-if="goodsCount>0"></xxm-cart>
		<goods-detail></goods-detail>
		<goods-selection></goods-selection>
	</view>
</template>

<script>
	import {mapGetters, mapMutations} from "vuex"
	const goodsCloudObj = uniCloud.importObject("xxm-goods",{"customUI":true})
	export default {
		data() {
			return {
				navIdx: 0,
				leftScrollValue: 0,
				rightScrollValue: 0,
				leftHeights: [],
				rightHeights: [],
				foldState: false,
				dataList: [],
				timeout: null,
				freshKey: 0,
				swiperItems: [
					{
						imageUrl: 'https://oss.yindongwen.top/homepage/bg.jpg',
						onClick: function() { console.log('点击了轮播图1'); },
						title: '这是一个标题，这是一个标题，这是一个标题',
						desc: '这是一个描述，这是一个描述，这是一个描述，这是一个描述，这是一个描述，这是一个描述，这是一个描述，这是一个描述，这是一个描述，这是一个描述，这是一个描述，这是一个描述，这是一个描述。'
					},
					{
						imageUrl: 'https://oss.yindongwen.top/homepage/bg.jpg',
						onClick: function() { console.log('点击了轮播图2'); },
						title: '这是一个标题',
						desc: '这是一个描述'
					},
					{
						imageUrl: 'https://oss.yindongwen.top/homepage/bg.jpg',
						onClick: function() { console.log('点击了轮播图3'); },
						title: '这是一个标题',
						desc: '这是一个描述'	
					}
				]
			}
		},
		async onLoad() {
			await this.getGoodsData() // 等待获取数据后获取高度
			await this.$nextTick()
			this.getHeights()
		},
		async onShow(){
			this.freshKey += 1            // 强制刷新header
			if(this.dataList.length==0){
				await this.getGoodsData() // 等待获取数据后获取高度
				await this.$nextTick()
				this.getHeights()
			}	
		},
		computed:{
			...mapGetters(['goodsCount', 'cartList'])
		},
		watch:{
			// 深度监听
			cartList:{
				deep:true,
				handler(){
					this.setCount() // 更新购买商品数量
				}
			}
		},
		methods: {
			...mapMutations(['SET_FOLD_STATE']),
			// 获取商品数据
			async getGoodsData(){
				let res = await goodsCloudObj.get()
				this.dataList = res
				this.setCount()
			},
			// 修改购买数量
			setCount(){
				this.dataList.forEach((item,idx)=>{
					item.goodsGroup.forEach((child,cidx)=>{
						// this.dataList[idx].goodsGroup[cidx].count = 0
						this.$set(this.dataList[idx].goodsGroup[cidx], "count", 0)  // 响应式
					})
				})
				
				this.cartList.forEach((item1, idx1)=>{
					this.dataList.forEach((item2, idx2)=>{
						let index = item2.goodsGroup.findIndex(item3=>{
							return item3._id == item1._id
						})
						if(index>=0){
							this.$set(this.dataList[idx2].goodsGroup[index], "count", item1.count)
						}
					})
				})
			},
			// 点击导航菜单
			onClickNav(idx) {
				if (this.navIdx == idx) return;
				this.navIdx = idx;
				// 防抖处理
				if (this.timeout) {
					clearTimeout(this.timeout);
				}
				this.timeout = setTimeout(() => {
					// 容错：判断 idx 有效且 leftHeights/rightHeights 有对应数据
					if (idx >= 0 && idx < this.leftHeights.length) {
						this.leftScrollValue = this.leftHeights[idx];
						this.rightScrollValue = this.rightHeights[idx];
					}
				}, 100)
			},
			// 获取滚动视图每个盒子高度
			getHeights() {
				let query = uni.createSelectorQuery().in(this);
				// 获取头部导航栏高度
				let headerHeight;
				query.selectAll('#header').boundingClientRect(rect => {
					headerHeight = rect.height;
				}).exec();

				// 左侧滚动节点
				query.selectAll('.navItem').boundingClientRect(rect => {
					this.leftHeights = rect.map(item => item.top - 150);
				}).exec();
				// 右侧滚动节点
				query.selectAll('.goodsView').boundingClientRect(rect => {
					this.rightHeights = rect.map(item => item.top - 150);

				}).exec();
			},
			// 监听右侧滚动视图变化
			onRightScroll(e) {
				let scrollTop = Math.ceil(e.detail.scrollTop);			
				let idx = this.rightHeights.findIndex((value, index, arr) => {
					// 边界处理：最后一个分类时，只需判断 scrollTop >= value
					if (index === arr.length - 1) {
						return scrollTop >= value;
					}
					return scrollTop >= value && scrollTop < arr[index + 1];
				})
					
				this.navIdx = idx;
				this.leftScrollValue = this.leftHeights[idx];

				if (scrollTop < 200) {
					// this.foldState = false;
					this.SET_FOLD_STATE(false);
				}

				if (scrollTop > 300) {
					// this.foldState = true;
					this.SET_FOLD_STATE(true);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.home {
		height: 100vh;
		display: flex;
		flex-direction: column;
		.banner{
			margin-top: -10rpx;
		}
		.wrapper {
			flex: 1;
			background: #fff;
			border-radius: 10px 10px 0 0;
			margin-top: -25rpx;
			position: relative;
			z-index: 2;
			overflow: hidden;

			.info {
				color: $text-font-color-1;
				@include flex-box();
				height: 50px;
				background: #fff;
				padding: 0 30rpx;
				font-size: 32rpx;
				border-bottom: 1px solid $border-color;

				.right {
					color: $xxm-theme-color-aux;
					@include flex-box();
				}
			}

			.scrollLayout {
				height: calc(100% - 100rpx);
				@include flex-box();

				.leftScroll {
					height: 100%;
					width: 190rpx;
					border-right: 1px solid $border-color;
					background: $page-bg-color;

					.navItem {
						font-size: 30rpx;
						padding-left: 25rpx;
						line-height: 100rpx;
						color: $text-font-color-2;
						position: relative;

						&.active {
							color: $text-font-color-1;
							background: #fff;

							&::after {
								content: "";
								width: 6rpx;
								height: 30rpx;
								background-color: $xxm-theme-color;
								position: absolute;
								left: 0;
								top: 50%;
								transform: translateY(-50%);
							}
						}
					}
				}
				.rightScroll {
					height: 100%;
					flex: 1;
					position: relative;

					.searchView {
						position: absolute;
						top: 0;
						right: 30rpx;
						z-index: 3;
						@include flex-box-set();
						height: 90rpx;
						color: $xxm-theme-color-aux;
					}

					.goodsView {
						padding: 0 30rpx;

						.goodsTitle {
							line-height: 90rpx;
							font-size: 30rpx;
							background: #fff;
						}
					}
				}
				.scrollContent {
					height: 100%;
				}
			}
		}
	}
</style>