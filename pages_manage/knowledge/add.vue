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
                title="最多选择9个文件" 
				:auto-upload="false"
                :limit="9"
                @select="onSelectFiles">
            </uni-file-picker>
			</uni-forms-item>
			<view class="button" @click="onSubmit">
				<button type="primary" :disabled="knowledgeData.files.length === 0">添加到知识库</button>
			</view>
		</uni-forms>
		<xxm-progress :progressPopState="knowledgeData.isUploading" :progressData="progressData" @confirm="onConfirmUpload"></xxm-progress>
	</view>
</template>

<script>
	const ragCloudObj = uniCloud.importObject("xxm-rag", {customUI:true})
	export default {
		data() {
				return {
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
		methods: {
			// 提交
			async onSubmit(){
				// 先上传文件到云存储
				// await this.$refs.filePicker.upload()
				// 初始化上传进度
				this.initProgress()
				// 使用 for（顺序执行） 循环替代 forEach（并行执行）
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
						this.updateProgressStatus(i * 2, res.success ? '【成功】文件上传成功' : '【失败】文件上传失败', true)
						// 再次读取文件：获取服务空间URL和文件内容
						res = await ragCloudObj.getFile(file.name)
					}else{
						this.updateProgressStatus(i * 2, '【跳过】文件已存在', true)
					}
					file.content = res.data.content
					file.url = res.data.url
					this.updateProgressStatus(i * 2 +  1, '【等待】同步到知识库')
					// 同步到知识库
					res = await ragCloudObj.uploadKnowledge({
						id: file.name,
						category: "file",
						content: file.content,
						url: [file.url]
					})
					this.updateProgressStatus(i * 2 +  1, res.data.message, true)
				}
			},
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
			// 初始化上传进度
			initProgress(){
				this.knowledgeData.isUploading = true
				this.progressData.percentage = 0
				this.progressData.scrollTop = 0
				this.progressData.data = []
				this.knowledgeData.files.forEach((file) => {
					this.progressData.data.push({
						name: file.name,
						status: '【等待】上传文件'
					})
					this.progressData.data.push({
						name: '',
						status: '【等待】同步到知识库'
					})
				})
			},
			// 更新进度条状态
			updateProgressStatus(index, status, setPercentage=false) {
				this.progressData.data[index].status = status
				// 更新上传进度
				if (setPercentage) {
					this.progressData.percentage = Math.round((index + 1) / (this.knowledgeData.files.length * 2) * 100)
				}
				// 滚动到当前上传的文件
				this.progressData.scrollTop = (index + 1) * 30 - 150 > this.progressData.scrollTop ? (index + 1) * 30 - 150 : this.progressData.scrollTop;
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
