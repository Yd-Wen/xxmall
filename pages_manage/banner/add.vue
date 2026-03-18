<template>
	<view class="bannerView">
		<uni-forms ref="bannerForm" :model="bannerData" :rules="bannerRules" :label-width="90" label-align="right">
			<uni-forms-item label="标题" required name="name">
				<uni-easyinput type="text" v-model="bannerData.name" placeholder="请输入标题" trim="both"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item label="内容" required name="desc">
				<uni-easyinput type="textarea" v-model="bannerData.desc" placeholder="请输入内容" trim="both" maxlength="-1"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item class="thumbSrcItem" label="图片来源" name="thumb_src">
				<uni-data-checkbox v-model="bannerData.thumb_src" :localdata="thumbSrcOptions" style="width: 100%"></uni-data-checkbox>
			</uni-forms-item>
			<uni-forms-item label="上传图片" v-if="bannerData.thumb_src === '1'" name="thumb">
				<uni-file-picker v-model="bannerData.thumb" file-mediatype="image" mode="grid" :limit="1" dir="banner" ></uni-file-picker>
			</uni-forms-item>
			<uni-forms-item label="类型" required name="type_id">
				<uni-data-select collection="xxm-type" field="_id as value, name as text" v-model="bannerData.type_id"></uni-data-select>
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
		<xxm-progress ref="progress" :progressPopState="isSync" :progressData="progressData" @confirm="onConfirmSync"></xxm-progress>
	</view>
</template>

<script>
	import {mapMutations} from "vuex"
	const bannerCloudObj = uniCloud.importObject("xxm-banner", {'customUI': true})
	const ragCloudObj = uniCloud.importObject("xxm-rag", {'customUI': true})
	let bannerId = null
	export default {
		data() {
			return {
				isSync: false,
				checkSync: true,
				progressData: {
					title: '上传推荐中',
					data: [],
					percentage: 0,
					scrollTop: 0
				},
				thumbSrcOptions: [
					{ value: '0', text: '使用默认图片' },
					{ value: '1', text: '上传图片' }
				],
				originalThumbSrc: '0',
				originalThumb: [],
				bannerData: {
					thumb_src: '0',
					thumb: [],
					name: "",
					desc: "",
					type_id: null
				},
				bannerRules: {
					name: {
						rules: [{
							required: true,
							errorMessage: '请输入标题'
						}]
					},
					desc: {
						rules: [{
							required: true,
							errorMessage: '请输入内容'
						}]
					},
					thumb_src: {
						rules: [{
							required: true,
							errorMessage: '请选择图片类型'
						}]
					},
					type_id: {
						rules: [{
							required: true,
							errorMessage: '请选择类型'
						}]
					}
				}
			};
		},
		onLoad(e){
			this.isManage()
			bannerId = e?.id || null
			if(bannerId) this.getBannerById(e.id)
		},
		methods: {
			...mapMutations(['ADD_BANNER', 'SET_BANNER']),
			// 获取指定ID的banner
			async getBannerById(id){
				let res = await bannerCloudObj.getById(id)
				this.bannerData = res.data[0]
				// 保存原始图片信息，用于判断是否需要删除旧图片
				this.originalThumbSrc = this.bannerData.thumb_src || '0'
				this.originalThumb = this.bannerData.thumb.length ? this.bannerData.thumb : []
			},
			// 初始化上传进度
			initProgress(){
				this.isSync = true
				const items = [
					{
						name: this.bannerData.name,
						status: '【等待】上传推荐'
					}
				]
				if(this.checkSync){
					items.push({
						name: '',
						status: '【等待】同步到知识库'
					})
				}
				this.$refs.progress.initProgress('上传推荐中', items)
			},
			// 整理商品信息为知识库内容
			formatKnowledgeContent(){
				let content = `推荐名称: ${this.bannerData.name}\n`
				content += `所属分类: ${this.bannerData.type_id}\n`
				content += `推荐内容: ${this.bannerData.desc}\n`
				return content
			},
			// 格式化知识库图片URL
			formatKnowledgeUrls(){
				if(!Array.isArray(this.bannerData.thumb)) return []
				return this.bannerData.thumb
					.filter(item => item && typeof item.url === 'string' && item.url.trim())
					.map(item => item.url.trim())
			},
			// 提交
			async onSubmit(){
                // 先上传文件到云存储
				await this.$refs.bannerForm.validate()
                // 上传banner数据到云数据库
				this.upload()
			},
			// 整理推荐信息为知识库内容
			formatKnowledgeContent(){
				let content = `推荐标题: ${this.bannerData.name}\n`
				content += `所属分类: ${this.bannerData.type_id}\n`
				content += `推荐内容: ${this.bannerData.desc}\n`
				content += `推荐图片:\n`
				if (this.bannerData.thumb.length){
					this.bannerData.thumb.forEach(item => {
						content += `- ${item.url}\n`
					})
				}
				else{
					content += '- 没有图片\n'
				}
				return content
			},
			// 格式化知识库图片URL
			formatKnowledgeUrls(){
			if(!Array.isArray(this.bannerData.thumb)) return []
			return this.bannerData.thumb
				.filter(item => item && typeof item.url === 'string' && item.url.trim())
				.map(item => item.url.trim())
			},
			// 提交
			async onSubmit(){
                // 先上传文件到云存储
				await this.$refs.bannerForm.validate()
                // 上传banner数据到云数据库
				this.upload()
			},
			// 提交
			async onSubmit(){
                // 先上传文件到云存储
				await this.$refs.bannerForm.validate()
                // 上传banner数据到云数据库
				this.upload()
			},
			// 上传banner数据到云数据库（包含同步到知识库）
			async upload(){
				// 检查是否需要删除旧图片
				await this.deleteOldImageIfNeeded()
				
				this.bannerData.thumb = this.bannerData.thumb.map(item=>{
					return{
						url: item.url,
						name: item.name,
						extname: item.extname
					}
				})
				this.initProgress()
				let res, id
				if (bannerId){
					res = await bannerCloudObj.update(this.bannerData)
					// 提交成功后，更新banner数据到vuex
					await this.SET_BANNER(this.bannerData)
					id = this.bannerData._id
					this.$refs.progress.updateProgressStatus(0, res.updated ? '【成功】更新推荐' : '【跳过】推荐内容相同')
					if(this.checkSync){
						// 整理推荐信息为内容
						const content = this.formatKnowledgeContent()
						// 提取图片URL列表
						const imageUrls = this.formatKnowledgeUrls()
						res = await ragCloudObj.updateKnowledge({
							id: id,
							category: 'recommend',
							content: content,
							url: imageUrls
						})
						this.$refs.progress.updateProgressStatus(1, res.data.message)	
					}
				}else{
					res = await bannerCloudObj.add(this.bannerData)
					// 新增成功后，将banner数据添加到vuex
					await this.ADD_BANNER(this.bannerData)
					id = res.id
					this.$refs.progress.updateProgressStatus(0, '【成功】新增推荐')
					if(this.checkSync){
						// 整理推荐信息为内容
						const content = this.formatKnowledgeContent()
						// 提取图片URL列表
						const imageUrls = this.formatKnowledgeUrls()
						res = await ragCloudObj.uploadKnowledge({
							id: id,
							category: 'recommend',
							content: content,
							url: imageUrls
						})
						this.$refs.progress.updateProgressStatus(1, res.data.message)
					}
				}
			},
			// 检查并删除旧图片
			async deleteOldImageIfNeeded(){
				// 只有在编辑模式下才需要处理
				if (!bannerId) return
				
				// 情况1：原来是上传图片，现在改为默认图片
				if (this.originalThumbSrc === '1' && this.bannerData.thumb_src === '0') {
					// 获取待删除图片
					this.bannerData.thumb_urls_delete = this.originalThumb.map(item => item.url)
					this.bannerData.thumb = []
				}
				
				// 情况2：原来是上传图片，现在还是上传图片，但换了新图片
				if (this.originalThumbSrc === '1' && this.bannerData.thumb_src === '1') {
					// 获取待删除图片
					const newUrls = this.bannerData.thumb.map(item => item.url)
					this.bannerData.thumb_urls_delete = this.originalThumb.filter(oldItem => {
						return !newUrls.includes(oldItem.url)
					}).map(item => item.url)
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
			}
		}
	}
</script>

<style lang="scss">
.bannerView{
	padding: 30rpx 30rpx 30rpx 0;
	.syncToKnowledge{
		display: flex;
		align-items: center;
	}
	.thumbSrcItem{
		display: flex;
		align-items: center;
	}
	.button{
		margin: 100rpx 150rpx;
	}
}
</style>
