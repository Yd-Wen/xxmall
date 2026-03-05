const brandCloudObj = uniCloud.importObject("xxm-brand")
const brand = {
	state:{
		brandData:{}
	},
	mutations:{
		SET_BRAND(state, value){
			state.brandData = value
		}
	},
	actions:{
		// 同步方法：网络请求
		async getBrandData(context){
			let arr = Object.keys(context.state.brandData) // 获取键数组
			if(arr.length) return                          //跳过二次网络请求
			let res = await brandCloudObj.get()
			context.commit("SET_BRAND", res.data[0])
		}
	}
}

export default brand