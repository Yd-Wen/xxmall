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
			<view class="button" @click="onSubmit">
				<button type="primary">提交</button>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	const bannerCloudObj = uniCloud.importObject("xxm-banner")
	let bannerId = null
	export default {
		data() {
			return {
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
			// 获取指定ID的banner
			async getBannerById(id){
				let res = await bannerCloudObj.getById(id)
				this.bannerData = res.data[0]
				// 保存原始图片信息，用于判断是否需要删除旧图片
				this.originalThumbSrc = this.bannerData.thumb_src || '0'
				this.originalThumb = this.bannerData.thumb.length ? this.bannerData.thumb : []
			},

			// 提交
			async onSubmit(){
                // 先上传文件到云存储
				await this.$refs.bannerForm.validate()
                // 上传banner数据到云数据库
				this.upload()
			},
			// 上传banner数据到云数据库
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
				let toastTitle, res
				if (bannerId){
					toastTitle = "修改成功"
					res = await bannerCloudObj.update(this.bannerData)
				}else{
					toastTitle = "新增成功"
					res = await bannerCloudObj.add(this.bannerData)
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
			},
			
			// 检查并删除旧图片
			async deleteOldImageIfNeeded(){
				// 只有在编辑模式下才需要处理
				if (!bannerId) return
				
				// 情况1：原来是上传图片，现在改为默认图片
				if (this.originalThumbSrc === '1' && this.bannerData.thumb_src === '0') {
					// 删除原来的上传图片
					await bannerCloudObj.deleteThumb(this.originalThumb.map(item => item.url))
					this.bannerData.thumb = []
				}
				
				// 情况2：原来是上传图片，现在还是上传图片，但换了新图片
				if (this.originalThumbSrc === '1' && this.bannerData.thumb_src === '1') {
					// 检查是否有旧图片需要删除
					const newUrls = this.bannerData.thumb.map(item => item.url)
					await bannerCloudObj.deleteThumb(
						// 找出被替换掉的旧图片
						this.originalThumb.filter(oldItem => {
							return !newUrls.includes(oldItem.url)
						}).map(item => item.url)
					)
				}
			}
		}
	}
</script>

<style lang="scss">
.bannerView{
	padding: 30rpx 30rpx 30rpx 0;
	.thumbSrcItem{
		display: flex;
		align-items: center;
	}
	.button{
		margin: 100rpx 150rpx;
	}
}
</style>
