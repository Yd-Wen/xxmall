<template>
	<view class="addressEdit">
		<u--form labelPosition="top" labelWidth="100" :model="addressForm" :rules="addressRules" ref="form">
			<u-form-item label="姓名" prop="name">
				<u--input v-model="addressForm.name" placeholder="请输入姓名"></u--input>
			</u-form-item>
			<u-form-item label="联系电话" prop="phone">
				<u--input v-model="addressForm.phone" placeholder="请输入联系电话"></u--input>
			</u-form-item>
			<u-form-item label="所在地区" prop="area_name">
				<uni-data-picker v-model="addressForm.area_code" placeholder="请选择地区" popup-title="请选择地区" collection="opendb-city-china" 
				field="code as value, name as text" orderby="value asc" :step-searh="true" self-field="code" parent-field="parent_code" @change="onArea">
				</uni-data-picker>
			</u-form-item>
			<u-form-item label="详细地址" prop="address">
				<u--input v-model="addressForm.address" placeholder="请输入详细地址"></u--input>
			</u-form-item>
			<u-form-item label="设为默认" prop="default">
				<u-switch v-model="addressForm.default" inactive-color="#eee"></u-switch>
			</u-form-item>
			<u-form-item></u-form-item>
			<u-form-item>
				<u-button type="primary" @click="onSubmit">提交</u-button>
			</u-form-item>
		</u--form>
	</view>
</template>

<script>
	const addressCloudObj = uniCloud.importObject("xxm-address")
	let addressId
	export default {
		data() {
			return {
				addressForm:{
					name: "",
					phone: "",
					area_code: null,
					area_name: "",
					address: "",
					default: false
				},
				addressRules:{
					name: [
						{
							required: true,
							message: '必填项',
							trigger: ['blur', 'change']
						},{
							min: 2,
							max: 8,
							message: '长度在2-8个字符',
							trigger: ['blur', 'change']
						}
					],
					phone: [
						{
							required: true,
							message: '必填项',
							trigger: ['blur', 'change']
						},{
							validator: (rule, value, callback)=>{
								return uni.$u.test.mobile(value)
							},
							message: '手机号码不正确',
							trigger: ['blur', 'change']
						}
					],
					area_name: [
						{
							required: true,
							message: '必填项',
							trigger: ['blur', 'change']
						}
					],
					address: [
						{
							required: true,
							message: '必填项',
							trigger: ['blur', 'change']
						}
					]
				}
			};
		},
		onLoad(e){
			addressId = e?.id || null
			if (addressId) this.getAddress()
		},
		methods:{
			async getAddress(){
				let res =await addressCloudObj.get(addressId)
				console.log(res)
				this.addressForm = res.data[0]
			},
			onArea(e){
				let area_name = e.detail.value.map(item=>{
					return item.text
				})
				this.addressForm.area_name = area_name.join("")
			},			
			onSubmit(){
				this.$refs.form.validate().then(async res=>{
					let title
					if (this.addressForm._id){
						let r = await addressCloudObj.update(this.addressForm)
						title = "更新成功"
					}else{
						let r = await addressCloudObj.add(this.addressForm),
						title = "新增成功"
					}
					uni.showToast({
						title:title,
						mask:true
					})
					setTimeout(()=>{
						uni.navigateBack()
					},1000)
				}).catch(err=>{
					uni.$u.toast('校验失败')
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.addressEdit{
	padding: 30rpx;
	
	
}
</style>