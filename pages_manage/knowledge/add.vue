<template>
	<view class="knowledgeView">
		<view class="title">
			<view class="desc">批量添加文件到知识库</view>
			<view class="tips">（请确保文件名唯一）</view>
		</view>
		<uni-forms ref="knowledgeForm" :model="knowledgeData" :rules="knowledgeRules" :label-width="90" label-align="right">
			<uni-forms-item label="选择文件" required name="files" class="file">
				<uni-file-picker 
                ref="filePicker"
                v-model="knowledgeData.files" 
                file-mediatype="all" 
                file-extname="txt,doc,docx,md" 
                dir="knowledge" 
                :title="fileLimit === 1 ? `请重新上传文件：${currentId}` : `最多选择${fileLimit}个文件`" 
				:auto-upload="false"
                :limit="fileLimit"
                @select="onSelectFiles">
            </uni-file-picker>
			</uni-forms-item>
			<view class="button" @click="onSubmit">
				<button type="primary" :disabled="knowledgeData.files.length === 0">添加到知识库</button>
			</view>
		</uni-forms>
		<xxm-progress ref="progress" :progressPopState="knowledgeData.isUploading" :progressData="progressData" @confirm="onConfirmUpload"></xxm-progress>
	</view>
</template>

<script>
	const ragCloudObj = uniCloud.importObject("xxm-rag", {customUI:true})
	export default {
		data() {
			return {
				currentId: '',
				fileLimit: 9,
				progressData: {
					title: '同步到知识库',
					data: [],
					percentage: 0,
					scrollTop: 0
				},
				knowledgeData: {
					isUploading: false,
					files: []
				},
				selectedFiles: [], // 存储用户选择的文件信息
				knowledgeRules: {
					files: {
						rules: [{
							required: true,
							errorMessage: '请选择文件',
						}]
					}
				}
			};
		},
		onLoad(e){
			this.isManage()
			this.currentId = e?.id || null
			this.fileLimit = e.id ? 1 : 9
		},
		methods: {
			// 处理文件选择
			onSelectFiles(e) {
				// 清除之前的选择
				this.knowledgeData.files = []
				// 存储选择的文件信息
				this.knowledgeData.files = e.tempFiles.map((tempFile) => ({
					name: tempFile.name,
					url: tempFile.url,  // 本地文件路径
					size: tempFile.size,
					content: '',
				}))
			},
			// 提交
			async onSubmit(){
				// 先上传文件到云存储
				// await this.$refs.filePicker.upload()
				// 初始化上传进度
				this.initProgress()
				// 使用 for（顺序执行） 循环替代 forEach（并行执行）
				if (this.fileLimit === 1 && this.currentId){
					await this.updateKnowledge()
				}
				else{
					await this.addKnowledge()
				}
			},
			// 添加知识库
			async addKnowledge(){
				for (let i = 0; i < this.knowledgeData.files.length; i++) {
					const file = this.knowledgeData.files[i];
					// 从本地获取文件内容
					// file.content = await getLocalFileContent(file.url);
					// 从云存储获取文件：查重
					let res = await ragCloudObj.getFile(file.name)
					if (res.statusCode != 200) {
						// 上传到服务空间
						res = await uniCloud.uploadFile({
							filePath: file.url,
							cloudPath: `knowledge/${file.name}`,
							cloudPathAsRealPath: true
						})
						this.$refs.progress.updateProgressStatus(i * 2, res.success ? '【成功】文件上传成功' : '【失败】文件上传失败', true)
						// 再次读取文件：获取服务空间URL和文件内容
						res = await ragCloudObj.getFile(file.name)
					}else{
						this.$refs.progress.updateProgressStatus(i * 2, '【跳过】文件已存在', true)
					}
					file.content = res.data.content
					file.url = res.data.url
					// 同步到知识库
					res = await ragCloudObj.uploadKnowledge({
						id: file.name,
						category: "file",
						content: file.content,
						url: [file.url]
					})
					this.$refs.progress.updateProgressStatus(i * 2 +  1, res.data.message, true)
				}
			},
			// 更新知识库
			async updateKnowledge(){
				let res
				const file = this.knowledgeData.files[0]
				// 1.校验文件名和文件内容
				if (this.currentId != file.name){
					this.$refs.progress.updateProgressStatus(0, '【失败】文件名不匹配')
					this.$refs.progress.updateProgressStatus(1, '【跳过】文件名不匹配')
					this.$refs.progress.updateProgressStatus(2, '【跳过】文件名不匹配')
					this.$refs.progress.updateProgressStatus(3, '【跳过】文件名不匹配')
					return
				}
				res = await ragCloudObj.getFile(this.currentId)
				if (res.statusCode != 200) {
					this.$refs.progress.updateProgressStatus(0, '【失败】文件不存在')
					this.$refs.progress.updateProgressStatus(1, '【跳过】文件不存在')
					this.$refs.progress.updateProgressStatus(2, '【跳过】文件不存在')
					this.$refs.progress.updateProgressStatus(3, '【跳过】文件不存在')
					return
				}
				this.$refs.progress.updateProgressStatus(0, '【成功】文件校验通过')
				file.content = res.data.content
				// 2.删除原文件
				res = await ragCloudObj.deleteFile(this.currentId)
				if(res.fileList[0].fileID.split('/').pop() != this.currentId){
					this.$refs.progress.updateProgressStatus(1, '【失败】文件删除失败')
					this.$refs.progress.updateProgressStatus(2, '【跳过】文件删除失败')
					this.$refs.progress.updateProgressStatus(3, '【跳过】文件删除失败')
				}
				this.$refs.progress.updateProgressStatus(1, '【成功】原文件已删除')
				// 3.上传新文件
				res = await uniCloud.uploadFile({
					filePath: file.url, // 本地文件路径
					cloudPath: `knowledge/${file.name}`,
					cloudPathAsRealPath: true
				})
				file.url = res.fileID  // 服务空间文件路径
				this.$refs.progress.updateProgressStatus(2, res.success ? '【成功】文件上传成功' : '【失败】文件上传失败', true)
				// 4.同步到知识库
				res = await ragCloudObj.updateKnowledge({
					id: this.currentId,
					category: "file",
					content: file.content,
					url: [file.url]
				})
				this.$refs.progress.updateProgressStatus(3, res.data.message)
			},
			// 初始化上传进度
			initProgress(){
				this.knowledgeData.isUploading = true
				const items = []
				if (this.fileLimit === 1 && this.currentId){
					this.knowledgeData.files.forEach((file) => {
						items.push({
							name: this.currentId,
							status: '【等待】校验文件'
						},{
							name: '',
							status: '【等待】删除原文件'
						},{
							name: '',
							status: '【等待】上传新文件'
						},
						{
							name: '',
							status: '【等待】同步到知识库'
						})
					})
				}
				else{
					this.knowledgeData.files.forEach((file) => {
						items.push({
							name: file.name,
							status: '【等待】上传文件'
						},{
							name: '',
							status: '【等待】同步到知识库'
						})
					})
				}
				this.$refs.progress.initProgress('上传和同步文件中', items)
			},
			// 确认上传
			onConfirmUpload(){
				this.knowledgeData.isUploading = false
				// 清空选择的文件
				this.knowledgeData.files = []
			}
		}
	}
</script>

<style lang="scss">
.knowledgeView{
	padding: 0 20rpx;
	.title{
		font-size: 30rpx;
		color: #333;
		margin: 20rpx 0;
		padding: 20rpx;
		border-bottom: 1px solid $border-color-light;
		.desc{
			padding-bottom: 30rpx;
		}
		.tips{
			padding-bottom: 20rpx;
			font-weight: bold;
		}
	}
	.file{
		padding: 0 40rpx 0 10rpx;
	}
	.button{
		margin-top: 50rpx;
		padding: 0 150rpx;
	}
}
</style>
