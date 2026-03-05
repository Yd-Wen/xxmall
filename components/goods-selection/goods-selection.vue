<template>
	<view class="goodsSelection">
		<u-popup :show="selectionPopState" closeable round="10" @close="onClose" z-index="20001" :overlayStyle="{zIndex:20000}">
			<view class="wrapper">
				<view class="header"></view>
				<view class="body">
					<scroll-view class="scroll" scroll-y>
						<view class="item">
							<goods-item :item="detailData" :btnState="false"></goods-item>
						</view>
						<view class="selection" v-if="selectShow">
							<view class="list" v-for="(item,idx) in detailData.sku">
								<view class="title">{{item.name}}</view>
								<view class="group">
									<view class="option" :class="skuArr.includes(child.name)?'active':''" @click="onOption(idx, cIdx)" 
									v-for="(child, cIdx) in item.children">
										{{child.name}}
									</view>
								</view>
							</view>
						</view>
						<view class="numberbox">
							<view class="title">数量</view>
							<u-number-box v-model="count"></u-number-box>
						</view>
					</scroll-view>
				</view>
				<view class="footer">
					<u-button color="#ec544f" icon="shopping-cart" iconColor="#fff" :disabled="confirmState" @click="onConfirm">确认</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import {mapGetters, mapMutations} from "vuex"
	export default {
		name:"goods-selection",
		data() {
			return {
				count: 1,
				selected:[]
			};
		},
		computed:{
			...mapGetters(['selectionPopState', 'detailData']),
			selectShow(){
				return this.detailData?.sku?.length || null
			},
			skuArr(){
				return this.selected.map(item=>{
					return item.name
				})
			},
			confirmState(){
				if(this.selected.length == this.detailData?.sku?.length) {
					return false
				}else{
					return true
				}
				
			}
		},
		methods:{
			...mapMutations(['SET_DETAILPOPSTATE', 'SET_SELECTIONPOPSTATE', 'SET_CARTLIST']),
			// 点击遮罩层关闭弹窗
			onClose(){
				this.SET_SELECTIONPOPSTATE(false)
				// 清空用户选择
				this.selected = []
				this.count = 1
			},
			// 点击选择商品标签
			onOption(itemIdx, childIdx){
				let obj = {
					id: this.detailData.sku[itemIdx]._id, 
					name: this.detailData.sku[itemIdx].children[childIdx].name 
				}
				// 找到相同ID的属性的索引
				let idx = this.selected.findIndex(item=>{
					return item.id == obj.id 
				})
				
				if(idx < 0){
					this.selected.push(obj)
				}else{
					// 替换该属性对应的标签
					this.selected.splice(idx, 1, obj)
				}
			},
			// 确认选择
			onConfirm(){
				let goodsItem = JSON.parse(JSON.stringify(this.detailData))
				if(this.skuArr.length) goodsItem.skuArr = this.skuArr
				goodsItem.add = true  // 追加原有购物车商品数量
				this.SET_CARTLIST({item:goodsItem, count:this.count})
				this.onClose()
				this.SET_DETAILPOPSTATE(false)
				
			}
		}
	}
</script>

<style lang="scss" scoped>
.wrapper{
	height: 70vh;
	.header{
		height: 80rpx;
		width: 100%;
	}
	.body{
		height: calc(100% - 220rpx); //CSS的calc()函数要求运算符前后必须有空格
		.scroll{
			height: 100%;
			padding: 0 30rpx;
			.item{
				border-bottom: 1px solid $border-color-light;
			}
			.selection{
				border-bottom: 1px solid $border-color-light;
				padding: 10rpx 0;
				.list{
					padding: 20rpx 0;
					.title{
						font-size: 32rpx;
						font-weight: bold;
						padding-bottom: 20rpx;
					}
					.group{
						@include flex-box-set(start);
						flex-wrap: wrap;
						.option{
							@include flex-box-set();
							padding: 0 25rpx;
							height: 60rpx;
							border: 1rpx solid $border-color-light;
							margin-right: 20rpx;
							border-radius: 10rpx;
							color: $text-font-color-2;
							margin-bottom: 20rpx;
							background-color: $page-bg-color;
							&.active{
								border-color: $xxm-theme-color;
								color: $xxm-theme-color;
								background: rgba(236, 87, 79, 0.1);
							}
						}
					}
				}
			}
			.numberbox{
				display: flex;
				align-items: ceter;
				padding: 30rpx 0;
				border-bottom: 1px solid $border-color-light;
				.title{
					font-size: 32rpx;
					font-weight: bold;
					padding-right: 30rpx;
				}
			}
		}
	}
	.footer{
		@include flex-box-set();
		height: 140rpx;
		border-top: 1px solid $border-color-light;
		padding: 0 200rpx;
	}
}	

</style>