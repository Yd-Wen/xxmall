<template>
	<view class="knowledgeView">
		<uni-forms ref="knowledgeForm" :model="knowledgeData" :rules="knowledgeRules" :label-width="90" label-align="right">
			<uni-forms-item label="选择文件" required name="files">
				<uni-file-picker 
                v-model="knowledgeData.files" 
                file-mediatype="all" 
                file-extname="txt,doc,docx,md" 
                dir="knowledge/" 
                title="最多选择9个文件" 
                :limit="9"
                :auto-upload="false">
            </uni-file-picker>
			</uni-forms-item>
			<view class="button" @click="onSubmit">
				<button type="primary">添加到知识库</button>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	const knowledgeCloudObj = uniCloud.importObject("xxm-knowledge")
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
			onSubmit(){
				this.$refs.knowledgeForm.validate(err=>{
					if(!err) this.upload()
				})
			},
			// 上传数据库
			async upload(){
				if (!this.knowledgeData.files || this.knowledgeData.files.length === 0) {
					uni.showToast({ title: '请选择文件', icon: 'none' })
					return
				}

				// 遍历上传每个文件
				for (let i = 0; i < this.knowledgeData.files.length; i++) {
					const file = this.knowledgeData.files[i];
					// 这里需要根据实际情况获取文件内容，可能需要使用uniCloud的文件API
					// 假设file对象中包含url和name属性
					let res = await knowledgeCloudObj.add({
						data: file.url, // 这里需要根据实际情况获取文件内容
						file_name: file.name
					})
				}

				uni.showToast({
					title: "上传成功",
					mask: true
				})
				setTimeout(()=>{
					uni.navigateBack()
				}, 1500)
			}
		}
	}
</script>

<style lang="scss">
.knowledgeView{
	padding: 30rpx 30rpx 40rpx 10rpx;
	.button{
		padding: 0 150rpx;
	}
}
</style>
