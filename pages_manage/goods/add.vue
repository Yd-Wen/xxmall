<template>
	<view class="goodsView">
		<uni-forms ref="goodsForm" :model="goodsData" :rules="goodsRules" :label-width="90" label-align="right">
			<uni-forms-item label="商品图片" required name="thumb">
				<uni-file-picker v-model="goodsData.thumb" file-mediatype="image" mode="grid"></uni-file-picker>
			</uni-forms-item>
			<uni-forms-item label="商品名称" required name="name">
				<uni-easyinput type="text" v-model="goodsData.name" placeholder="请输入商品名称" trim="both"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item label="所属分类" required name="category_id">
				<uni-data-select collection="xxm-category" field="_id as value, name as text" v-model="goodsData.category_id"></uni-data-select>
			</uni-forms-item>
			<uni-forms-item label="商品价格" required name="current_price">
				<uni-easyinput type="number" v-model="goodsData.current_price" placeholder="请输入商品价格" trim="both"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item label="商品原价" name="origin_price">
				<uni-easyinput type="number" v-model="goodsData.origin_price" placeholder="请输入商品原价" trim="both"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item label="商品属性">
				<u-cell :title="skuTitle" is-link :border="false" @click="onSelectAttr"></u-cell>
				<view class="skuList">
					<view class="item" v-for="item in goodsData.sku"  @click="onSelectAttr">
						<view class="left">{{item.name}}:</view>
						<view class="right">{{skuChildName(item.children)}}</view>
					</view>
				</view>
			</uni-forms-item>
			<uni-forms-item label="商品描述">
				<uni-easyinput type="textarea" v-model="goodsData.desc" placeholder="请输入商品介绍" trim="both" maxlength="-1"></uni-easyinput>
				<!-- <editor class="desc" placeholder="请输入商品介绍" @statuschange="onStatusChange"></editor> -->
			</uni-forms-item>
			<view class="button" @click="onSubmit">
				<button type="primary">提交</button>
			</view>
		</uni-forms>
		<uni-popup ref="attrPop" type="bottom" height>
			<scroll-view scroll-y class="attr">
				<view class="header">
					<view class="title">商品属性</view>
					<view class="add" @click="onAdd()">+ 添加属性</view>
				</view>
				<view class="body">
					<view class="item" v-for="(item, idx) in skuArr">
						<view class="top">
							<checkbox :checked="item.checked" @click="onCheckAttr(idx)"/><text></text>
							<view class="text">{{item.name}}</view>
						</view>
						<view class="label" v-if="item.checked">
							<view class="button" :class="child.selected?'active':''" 
							v-for="(child, cIdx) in item.children" @click="onSelectLabel(idx, cIdx)">{{child.name}}</view>
							<view class="button" @click="onAdd(idx)">
								<u-icon name="plus"></u-icon>
							</view>
						</view>
					</view>
				</view>
				<view class="footer">
					<button type="primary" @click="onSelectConfirm">确认选择</button>
				</view>
			</scroll-view>
		</uni-popup>
		<uni-popup ref="addAttrPop">
			<uni-popup-dialog mode="input" title="添加属性" placeholder="请输入属性名称" 
			@confirm="onAddConfirm"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	const skuCloudObj = uniCloud.importObject("xxm-sku")
	const goodsCloudObj = uniCloud.importObject("xxm-goods")
	let goodsId
	export default {
		data() {
			return {
				addType: "parent", //parent:父类属性, child:子类标签
				goodsData: {
					thumb: [],
					name: "",
					category_id: null,
					current_price: null,
					origin_price: null,
					desc: "",
					sku: []
				},
				goodsRules: {
					thumb: {
						rules: [{
							required: true,
							errorMessage: '请上传商品图片',
						}]
					},
					name: {
						rules:[{
							required: true,
							errorMessage: '请输入商品名称'
						}]
					},
					current_price: {
						rules:[{
							required: true,
							errorMessage: '请输入商品价格'
						}]
					},
					category_id: {
						rules:[{
							required: true,
							errorMessage: '请选择所属分类'
						}]
					}
				},
				skuArr:[]
			};
		},
		onLoad(e){
			this.isManage()
			goodsId = e?.id || null
			if(goodsId) this.getGoodsById(e.id)
			this.getSku()
		},
		computed:{
			skuTitle(){
				if(this.goodsData.sku.length){
					return this.goodsData.sku.map(item=>{
						return item.name
					}).join("/")
				}else{
					return "点击添加属性"
				}
			}
		},
		methods: {
			// 获取指定ID的商品
			async getGoodsById(id){
				let res = await goodsCloudObj.getById(id)
				this.goodsData = res.data[0]
			},
			// 获取SKU列表
			async getSku(){
				 let res = await skuCloudObj.get()
				 this.skuArr = res.data
			},
			// 打开属性弹窗
			onSelectAttr(){
				this.$refs.attrPop.open()
				// 属性比对 this.skuAttr / this.goodsData.sku
				this.skuArr.forEach(item=>{
					this.arrSetCheck(this.skuArr, this.goodsData.sku, "_id", "checked")
				})
			},
			arrSetCheck(arr1, arr2, keyCompare, keyEdit){
				arr1.forEach(item=>{
					arr2.forEach(row=>{
						if(item[keyCompare] == row[keyCompare]){
							item[keyEdit] = true
							if(item?.children?.length) this.arrSetCheck(item.children, row.children, "name", "selected")
						}
					})
				})
			},
			// 新增属性/标签
			onAdd(index=null){
				if(index==null){
					this.addType='parent'
					this.addIndex=null
				}else{
					this.addType='child'
					this.addIndex=index
				}
				this.$refs.addAttrPop.open()
			},
			// 新增属性/标签确认
			async onAddConfirm(e){
				if(!e) return
				if(this.addType=='parent'){
					let obj = {
						name: e,
						checked: true,
						children: []
					}
					let res = await skuCloudObj.add(obj)
					obj._id = res.id
					this.skuArr.push(obj)	
				}else if(this.addType=='child'){
					let obj = {
						name: e,
						selected: true
					}
					let id = this.skuArr[this.addIndex]._id
					let res = await skuCloudObj.update(id, obj)
					this.skuArr[this.addIndex].children.push(obj)
				}
			},
			// 选择属性
			onCheckAttr(idx){
				this.skuArr[idx].checked = !this.skuArr[idx].checked
			},
			// 选择属性下的标签
			onSelectLabel(idx, cIdx){
				this.skuArr[idx].children[cIdx].selected = !this.skuArr[idx].children[cIdx].selected
			},
			// 确认选择属性/标签
			onSelectConfirm(){
				let arr = this.skuArr.filter(item=>{
					// 过滤得到：选择属性和标签的属性
					return item.checked && item.children.some(child=>child.selected)
				}).map(item=>{
					// 过滤得到：选择的标签
					let children = item.children.filter(child=>{
						return child.selected
					})
					return {...item, children}
				})
				this.goodsData.sku = arr
				this.$refs.attrPop.close()
			},
			// 格式化标签
			skuChildName(arr){
				return arr.map(item=>{
					return item.name
				}).join("/")
			},
			// 富文本
			onStatusChange(e) {
				console.log(e.detail)
			},
			// 提交
			onSubmit(){
				this.$refs.goodsForm.validate(err=>{
					if(!err) this.upload()
				})
			},
			// 上传数据库
			async upload(){
				// 判断价格为有效正数
				if (!Number(this.goodsData.current_price) || Number(this.goodsData.current_price) <= 0) {
					uni.showToast({ title: '请输入大于 0 的有效价格', icon: 'none' })
					return
				}
				
				this.goodsData.thumb = this.goodsData.thumb.map(item=>{
					return{
						url: item.url,
						name: item.name,
						extname: item.extname
					}
				})
				let toastTitle, res
				if (goodsId){
					toastTitle = "修改成功"
					res = await goodsCloudObj.update(this.goodsData)
				}else{
					toastTitle = "新增成功"
					res = await goodsCloudObj.add(this.goodsData)
				}
				if(res){
					uni.showToast({
						title: toastTitle,
						mask: true
					})
					setTimeout(()=>{
						uni.navigateBack()
					}, 1500)
				}
			}
		}
	}
</script>

<style lang="scss">
.goodsView{
	padding: 30rpx 30rpx 40rpx 10rpx;
	.button{
		padding: 0 150rpx;
	}
	.skuList{
		.item{
			@include flex-box-set(start);
			padding: 30rpx;
			background: $page-bg-color;
			margin: 15rpx 0;
		}
	}
	.desc{
		height: 250rpx;
		border: 1px solid $border-color-light;
	}
	.attr{
		height: 750rpx;
		padding: 30rpx;
		background: #fff;
		border-radius: 20rpx 20rpx 0 0;
		.header{
			@include flex-box();
			font-size: 34rpx;
			margin-bottom: 30rpx;
			.title{
				font-weight: bold;
			}
			.add{
				color: $xxm-theme-color-aux;
			}
		}
		.body{
			.item{
				border-top: 1px solid $border-color-light;
				&:last-child{
					border-bottom: 1px solid $border-color-light;
				}
				.top{
					@include flex-box-set(start);
					padding: 30rpx 0;
					.text{
						padding-left: 10rpx;
						font-weight: bold;
					}
				}
				.label{
					@include flex-box-set(start);
					padding: 10rpx 0 30rpx;
					flex-wrap: wrap;           //自动换行
					.button{
						@include flex-box-set();
						padding: 0 25rpx;
						height: 60rpx;
						border: 1rpx solid $border-color-light;
						margin-right: 20rpx;
						border-radius: 10rpx;
						color: $text-font-color-2;
						margin-bottom: 20rpx;
						&.active{
							border-color: $xxm-theme-color;
							color: $xxm-theme-color;
							background: rgba(236,87,79,0.1);;
						}
					}
				}
			}
		}
		.footer{
			padding: 50rpx 200rpx;
		}
	}
}
</style>
