<template>
	<view class="brand">
		<uni-forms ref="brandForm" :model="brandData" :rules="brandRules" :label-width="100" label-align="right">
			<uni-forms-item  label="品牌标识" name="logo" required>
				<uni-file-picker v-model="brandData.thumb" file-mediatype="image" mode="grid" :limit="1" dir="brand"></uni-file-picker>
			</uni-forms-item>
			<uni-forms-item  label="品牌名称" name="name" required>
				<uni-easyinput type="text" v-model="brandData.name" placeholder="请输入品牌名称"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item  label="商家电话" name="phone" required>
				<uni-easyinput type="text" v-model="brandData.phone" placeholder="请输入联系电话"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item  label="商家地址" name="address">
				<uni-easyinput type="text" v-model="brandData.address" placeholder="请输入商家地址"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item  label="商家介绍" name="desc">
				<uni-easyinput type="textarea" v-model="brandData.desc" placeholder="请输入商家介绍"></uni-easyinput>
			</uni-forms-item>
			<button type="primary" @click="onSubmit">提交</button>
		</uni-forms>
	</view>
</template>

<script>
	import {mapMutations} from "vuex"
	const brandCloudObj = uniCloud.importObject("xxm-brand")
	export default {
		data() {
			return {
				originalThumb: [],
				brandData: {
					thumb: {},
					name: "", 
					phone: "",
					address: "",
					desc: ""
				},
				brandRules: {
					name: {
						rules:[{
							required: true,
							errorMessage: '品牌名不正确'
						},{
							minLength: 3,
							maxLength: 6,
							errorMessage: '长度在{minLength}到{maxLength}个字符'
						}]
					},
					phone: {
						rules:[{
							required: true,
							errorMessage: "手机号不正确"
						},{
							validateFunction(rule, value, data, callback){
								let res = /^1[3-9]\d{9}$/.test(value)
								if(!res){
									callback('手机号不正确')
								}
								return
							}
						}]
					}
				}
			};
		},
		onLoad(){
			this.isManage()
			this.getBrand()
		},
		methods:{
			...mapMutations(['SET_BRAND']),
			// 获取商家信息
			getBrand(){
				brandCloudObj.get().then(res=>{
					if(!res.data.length) return
					this.brandData = res.data[0]
				})
			},
			// 提交
			onSubmit(){
				this.$refs.brandForm.validate().then(res=>{
					// 过滤缩略图数据
					let arr = this.brandData.thumb.map(item=>{
						return {
							name: item.name,
							extname: item.extname,
							url: item.url,
							size: item.size
						}
					})
					this.brandData.thumb = arr
					this.addAndUpdata()
				}).catch(err=>{
					console.log(err)
				})
			},
			// 添加和修改
			async addAndUpdata(){
				let title
				if(this.brandData._id){
					await this.deleteOldImageIfNeeded()
					await brandCloudObj.update(this.brandData)
					title = '信息更新成功'
				}else{
					await brandCloudObj.add(this.brandData)
					title = '信息添加成功'
				}
				// 网络请求完成后
				uni.showToast({
					title: title,
					mask: true
				})
				setTimeout(()=>{
					uni.navigateBack()
				}, 1000)
				this.SET_BRAND(this.brandData)
			},
			// 检查并删除旧图片
			async deleteOldImageIfNeeded(){
				// 检查是否有旧图片需要删除
				const newUrls = this.brandData.thumb.map(item => item.url)
				await brandCloudObj.deleteThumb(
					// 找出被替换掉的旧图片
					this.originalThumb.filter(oldItem => {
						return !newUrls.includes(oldItem.url)
					}).map(item => item.url)
				)
			}
		}
	}
</script>

<style lang="scss" scoped>
.brand{
	padding: 30rpx;
}
</style>
