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
				<button type="primary">添加到知识库</button>
			</view>
		</uni-forms>
		<xxm-progress :progressPopState="knowledgeData.isUploading" :progressData="progressData"></xxm-progress>
	</view>
</template>

<script>
	const ragCloudObj = uniCloud.importObject("xxm-rag", {customUI:true})
	export default {
		data() {
				return {
					progressData: {
						title: '上传文件中',
						text: '上传进度：',
						percentage: 0
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
				this.knowledgeData.isUploading = true
				
				// 使用 for（顺序执行） 循环替代 forEach（并行执行）
				for (let i = 0; i < this.knowledgeData.files.length; i++) {
					const file = this.knowledgeData.files[i];
					// 读取本地文件内容
					// file.content = await getLocalFileContent(file.url);
					// 上传到服务空间
					let res = await uniCloud.uploadFile({
						filePath: file.url,
						cloudPath: `knowledge/${file.name}`,
						cloudPathAsRealPath: true
					})
					// 更新URL为服务空间URL
					file.url = res.fileID
					res = await ragCloudObj.getCloudFileContent(file.url)
					file.content = res.data
					// 上传到知识库
					res = await ragCloudObj.uploadKnowledge({
						id: file.name,
						category: "file",
						content: file.content,
						url: [file.url]
					})
					// 更新上传进度
					this.progressData.percentage = Math.round((i + 1) / this.knowledgeData.files.length * 100)
				}
				
				// 延迟0.3s后关闭进度条
				setTimeout(() => {
					this.knowledgeData.isUploading = false
				}, 300)
			},
			// 处理文件选择
			onSelectFiles(e) {
				// 存储选择的文件信息
				this.knowledgeData.files = e.tempFiles.map((tempFile) => ({
					name: tempFile.name,
					url: tempFile.url,  // 本地文件路径
					size: tempFile.size,
					content: ''
				}))
			},		
		}
	}
</script>

<style lang="scss">
.knowledgeView{
	.title{
		font-size: 30rpx;
		color: #333;
		margin: 50rpx 20rpx 100rpx 20rpx;
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
		padding: 30rpx 40rpx 40rpx 10rpx;
	}
	.button{
		margin-top: 150rpx;
		padding: 0 150rpx;
	}
}
</style>
