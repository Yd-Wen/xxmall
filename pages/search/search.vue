<template>
	<view>
		<view class="search">
			<u-search placeholder="请输入搜索内容" v-model="keyword" clearabled showAction animation @search="onSearch"
				@custom="onSearch" @clear="onClear"></u-search>
			<view class="history" v-if="goods.length==0">
				<view class="item" v-for="(item,index) in history" :key="item" @click="onHistoryItem(item)">
					<view class="text">{{item}}</view>
					<view class="close" @click.stop="onClose(index)">
						<u-icon name="close" size="16" color="#999"></u-icon>
					</view>
				</view>
			</view>
			<view class="goods">
				<view class="item" v-for="item in goods" :key="item._id">
					<goods-item :item="item"></goods-item>
				</view>
			</view>
			<view class="empty" v-if="emptyState">
				<u-empty mode="search" icon="/static/images/no_search.png"></u-empty>
			</view>
		</view>
		<goods-detail></goods-detail>
		<goods-selection></goods-selection>
		<view class="cart">
			<xxm-cart v-if="goodsCount>0"></xxm-cart>
		</view>
	</view>
</template>

<script>
	import {mapGetters, mapMutations} from "vuex"
	const goodsCloudObj = uniCloud.importObject("xxm-goods")
	export default {
		data() {
			return {
				keyword: "",
				history: [],
				goods: [],
				emptyState: false
			};
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
		onLoad() {
			let history = uni.getStorageSync("history")
			this.history = history || []
		},
		methods: {
			// 搜索
			onSearch() {
				this.history.unshift(this.keyword)
				this.history = [...new Set(this.history)] // 去重展开
				if (this.history.length > 5) {
				    this.history = this.history.slice(0, 5);
				}
				uni.setStorageSync("history", this.history)
				this.getData()
			},
			// 清空搜索
			onClear(){
				this.keyword=''
				this.goods=[]
			},
			// 删除搜索历史
			onClose(idx) {
				this.history.splice(idx, 1)
				uni.setStorageSync("history", this.history)
			},
			// 点击搜索历史
			onHistoryItem(item) {
				this.keyword = item
				this.getData()
			},
			// 根据搜索关键词请求数据
			async getData() {
				let res = await goodsCloudObj.searchGoods(this.keyword)
				this.goods = res.data
				this.setCount()
				if(this.goods.length){
					this.emptyState = false
				}else {
					this.emptyState = true
				}
			},
			// 修改购买数量
			setCount() {
				this.goods.forEach(item => {
					this.$set(item, "count", 0) // 响应式
				})
				this.cartList.forEach((item1, idx1)=>{
					let index = this.goods.findIndex((item2, idx2)=>{
						return item2._id == item1._id
					})
					if(index>=0){
						this.$set(this.goods[index], "count", item1.count)
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.search {
		padding: 30rpx;
		padding-bottom: 150rpx;
		.history {
			margin-top: 30rpx;
			.item {
				@include flex-box();
				font-size: 32rpx;
				padding: 30rpx 0;
				color: #333;
				border-bottom: 1px solid $border-color-light;
			}
		}

	}
	.cart{
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
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
</style>