<template>
	<view class="numberbox">
		<u-number-box min="0" max="99" v-model="item.count" @change="onNumChange">
			<view slot="minus" class="minus skuButton" :class="item.count<=0?'none':''">
				<u-icon name="minus" size="12" color="#ccc"></u-icon>
			</view>
			<text slot="input" class="input" :class="item.count<=0?'none':''">{{item.count}}</text>
			<view slot="plus" class="plus skuButton">
				<u-icon name="plus" color="#FFFFFF" size="12"></u-icon>
			</view>
		</u-number-box>
	</view>
</template>

<script>
	import {mapMutations} from "vuex"
	export default {
		name:"xxm-numberbox",
		data() {
			return {

			};
		},
		props:{
			// 微信小程序子组件无法修改props
			item: {
				type: Object,
				default: () => {return {}}
			}
		},
		methods: {
			...mapMutations(['SET_CARTLIST']),
			onNumChange(e){
				this.item.add = false  // 覆盖原有购物车商品数量
				this.SET_CARTLIST({
					item:this.item,
					count:e.value
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.numberbox{
	.skuButton{
		width: 40rpx;
		height: 40rpx;
		@include flex-box-set();
	}
	.minus{
		border: 1px solid #ccc;
	}
	.plus{
		background: $xxm-theme-color;
	}
	.input{
		width: 60rpx;
		height: 40rpx;
		font-size: 26rpx;
		color: #888;
		@include flex-box-set();
	}
	.none{
		display: none;
	}
}
</style>