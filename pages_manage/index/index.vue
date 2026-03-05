<template>
	<view class="manage">
		<uni-section title="商品管理" type="line"></uni-section>
		<uni-list>
			<uni-list-item title="所有商品" showArrow to="/pages_manage/goods/list"></uni-list-item>
			<uni-list-item title="新增商品" showArrow to="/pages_manage/goods/add"></uni-list-item>
		</uni-list>

		 <uni-section title="订单管理" type="line"></uni-section>
		 <uni-list>
		 	 <uni-list-item title="所有订单" showArrow to="/pages_manage/order/order"></uni-list-item>
		 </uni-list>

		<uni-section title="内容管理" type="line"></uni-section>
		<uni-list>
			<uni-list-item title="商品分类" showArrow to="/pages_manage/category/category"></uni-list-item>
			<uni-list-item title="所有推荐" showArrow to="/pages_manage/banner/list"></uni-list-item>
			<uni-list-item title="新增推荐" showArrow to="/pages_manage/banner/add"></uni-list-item>
			<uni-list-item title="查看知识库" showArrow to="/pages_manage/knowledge/list"></uni-list-item>
			<uni-list-item title="知识库新增" showArrow to="/pages_manage/knowledge/add"></uni-list-item>
			<uni-list-item title="商家信息" showArrow to="/pages_manage/brand/brand"></uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		},
		onLoad() {
			this.isManage()
		},
		methods:{
		}
	}
</script>

<style lang="scss" scoped>
.manage{
	padding: 30rpx;
}
</style>
