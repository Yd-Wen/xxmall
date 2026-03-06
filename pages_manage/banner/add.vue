<template>
	<view class="bannerView">
		<uni-forms ref="bannerForm" :model="bannerData" :rules="bannerRules" :label-width="60" label-align="right">
			<uni-forms-item label="图片" required name="thumb">
				<uni-file-picker v-model="bannerData.thumb" file-mediatype="image" mode="grid" :limit="1" dir="banner/"></uni-file-picker>
			</uni-forms-item>
			<uni-forms-item label="标题" required name="name">
				<uni-easyinput type="text" v-model="bannerData.name" placeholder="请输入标题" trim="both"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item label="内容" required name="desc">
				<uni-easyinput type="textarea" v-model="bannerData.desc" placeholder="请输入内容" trim="both" maxlength="-1"></uni-easyinput>
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
	export default {
		data() {
			return {
				bannerData: {
					files: []
				},
				bannerRules: {
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
				await this.$refs.filePicker.upload()
                // 遍历上传每个文件到知识库
				this.upload()
			},
			// 上传知识库
			async upload(){
				for (let i = 0; i < this.knowledgeData.files.length; i++) {
					const file = this.knowledgeData.files[i];
                    console.log(file.name)
                    let res = await knowledgeCloudObj.uploadKnowledge({
                        // data: file.url, // 这里需要根据实际情况获取文件内容
                        file_name: file.name
                    })
                    console.log(res)
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
.bannerView{
	padding: 30rpx 30rpx 30rpx 10rpx;
	.button{
		padding: 0 150rpx;
	}
}
</style>
