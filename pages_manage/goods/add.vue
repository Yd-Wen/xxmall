<template>
	<view class="goodsView">
		<uni-forms ref="goodsForm" :model="goodsData" :rules="goodsRules" :label-width="90" label-align="right">
			<uni-forms-item label="商品图片" required name="thumb">
				<uni-file-picker v-model="goodsData.thumb" file-mediatype="image" mode="grid" :limit="9" dir="goods">	
				</uni-file-picker>
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
			<uni-forms-item label="是否同步" class="syncToKnowledge">
				<u-checkbox-group @change="handleSyncChange">
					<u-checkbox label="同步到知识库" name="syncToKnowledge" :checked="checkSync"></u-checkbox>
				</u-checkbox-group>
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
		<xxm-progress :progressPopState="isSync" :progressData="progressData" @confirm="onConfirmSync"></xxm-progress>
	</view>
</template>

<script>
	const skuCloudObj = uniCloud.importObject("xxm-sku")
	const goodsCloudObj = uniCloud.importObject("xxm-goods")
	const ragCloudObj = uniCloud.importObject("xxm-rag", {customUI:true})
	let goodsId
	export default {
		data() {
			return {
				originalThumb: [],
				addType: "parent", //parent:父类属性, child:子类标签
				checkSync: true,
				isSync: false,
				progressData: {
					title: '上传商品中',
					data: [],
					percentage: 0,
					scrollTop: 0
				},
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
		async onLoad(e){
			this.isManage()
			goodsId = e?.id || null
			if(goodsId) await this.getGoodsById(e.id)
			// 保存原始图片数据
			this.originalThumb = this.goodsData.thumb.length ? this.goodsData.thumb : []
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
					await skuCloudObj.update(id, obj)
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
			// 初始化上传进度
			initProgress(){
				this.isSync = true
				this.progressData.percentage = 0
				this.progressData.scrollTop = 0
				this.progressData.data = [
					{
						name: this.goodsData.name,
						status: '【等待】上传商品'
					}
				]
				if(this.checkSync){
					this.progressData.data.push({
						name: '',
						status: '【等待】同步到知识库'
					})
				}
			},
			// 更新进度条状态
			updateProgressStatus(index, status) {
				this.progressData.data[index].status = status
				this.progressData.percentage = Math.round((index + 1) / (this.checkSync ? 2 : 1) * 100)
			},
			// 整理商品信息为知识库内容
			formatKnowledgeContent(){
				let content = `商品名称: ${this.goodsData.name}\n`
				content += `所属分类: ${this.goodsData.category_id}\n`
				content += `商品价格: ${this.goodsData.current_price}\n`
				if (this.goodsData.origin_price) {
					content += `商品原价: ${this.goodsData.origin_price}\n`
				}
				if (this.goodsData.sku && this.goodsData.sku.length > 0) {
					content += `商品属性:\n`
					this.goodsData.sku.forEach(attr => {
						content += `- ${attr.name}: ${attr.children.map(child => child.name).join('/')}\n`
					})
				}
				if (this.goodsData.desc) {
					content += `商品描述: ${this.goodsData.desc}\n`
				}
				content += `商品图片:\n`
				this.goodsData.thumb.forEach(item => {
					content += `- ${item.url}\n`
				})
				return content
			},
			// 格式化知识库图片URL
			formatKnowledgeUrls(){
			if(!Array.isArray(this.goodsData.thumb)) return []
			return this.goodsData.thumb
				.filter(item => item && typeof item.url === 'string' && item.url.trim())
				.map(item => item.url.trim())
			},
			// 检查并删除旧图片
			deleteOldImageIfNeeded(){
				// 待删除图片
				const newUrls = this.goodsData.thumb.map(item => item.url)
				this.goodsData.thumb_urls_delete = this.originalThumb.filter(oldItem => {
					return !newUrls.includes(oldItem.url)
				}).map(item => item.url)
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
				this.initProgress()
				let res, id
				if (goodsId){
					// 检查并删除旧图片
					this.deleteOldImageIfNeeded()
					res = await goodsCloudObj.update(this.goodsData)
					id = this.goodsData._id
					this.updateProgressStatus(0, res.updated ? '【成功】更新商品' : '【跳过】商品内容相同')
					if(this.checkSync){
						// 整理商品信息为内容
						const content = this.formatKnowledgeContent()
						// 提取图片URL列表
						const imageUrls = this.formatKnowledgeUrls()
						res = await ragCloudObj.updateKnowledge({
							id: id,
							category: 'goods',
							content: content,
							url: imageUrls
						})
						this.updateProgressStatus(1, res.data.message)
					}
				}else{
					res = await goodsCloudObj.add(this.goodsData)
					id = res.id
					this.updateProgressStatus(0, '【成功】新增商品')
					console.log(this.checkSync)
					if(this.checkSync){
						// 整理商品信息为内容
						const content = this.formatKnowledgeContent()
						// 提取图片URL列表
						const imageUrls = this.formatKnowledgeUrls()
						res = await ragCloudObj.uploadKnowledge({
							id: id,
							category: 'goods',
							content: content,
							url: imageUrls
						})
						console.log(res)
						this.updateProgressStatus(1, res.data.message)
					}
				}
			},
			// 上传结束
			onConfirmSync(){
				this.isSync = false
				setTimeout(()=>{
					uni.navigateBack()
				}, 500)
			},
			// 处理同步复选框变化
			handleSyncChange(e){
				// e为选中的数组，包含选中的name值
				this.checkSync = e.includes('syncToKnowledge')
			},
		}
	}
</script>

<style lang="scss">
.goodsView{
	padding: 30rpx 30rpx 40rpx 10rpx;
	.syncToKnowledge{
		display: flex;
		align-items: center;
	}
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
