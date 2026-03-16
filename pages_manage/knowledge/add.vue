<template>
	<view class="knowledgeView">
		<view class="title">
			<view class="desc">批量添加文件到知识库</view>
			<view class="tips">（请确保文件名唯一）</view>
		</view>
		<uni-forms ref="knowledgeForm" :model="knowledgeData" :rules="knowledgeRules" :label-width="90" label-align="right">
			<uni-forms-item label="选择文件" required name="files" class="form">
				<uni-file-picker 
                ref="filePicker"
                v-model="knowledgeData.files" 
                file-mediatype="all" 
                file-extname="txt,doc,docx,md" 
                dir="knowledge" 
                title="最多选择9个文件" 
                :limit="9">
            </uni-file-picker>
			</uni-forms-item>
			<view class="button" @click="onSubmit">
				<button type="primary">添加到知识库</button>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	const ragCloudObj = uniCloud.importObject("xxm-rag")
	export default {
		data() {
			return {
				knowledgeData: {
					files: []
				},
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
                // 遍历上传每个文件到知识库
				this.upload()
			},
			// 上传知识库
			async upload(){
				for (let i = 0; i < this.knowledgeData.files.length; i++) {
					const file = this.knowledgeData.files[i];
					let res = await ragCloudObj.getCloudFileContent(file.url)
                    await ragCloudObj.uploadKnowledge({
                        id: file.name,
						category: "file",
						content: res.data,
						url: [file.url]
                    })
				}
				uni.showToast({
					title: "上传成功",
					mask: true
				})
			}
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
	.form{
		padding: 30rpx 40rpx 40rpx 10rpx;
	}
	.button{
		margin-top: 150rpx;
		padding: 0 150rpx;
	}
}
</style>
