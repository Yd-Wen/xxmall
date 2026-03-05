const db = uniCloud.database()
const cloudUtils = require('xxm-cloud-utils')
module.exports = {
	_before: async function () { // 通用预处理器
		this.params = this.getParams()[0]
		this.userInfo = await cloudUtils.getUserInfo(this)
	},
	async get(addressId=null){
		if(!this.userInfo.uid) return this.userInfo
		if(addressId) return await db.collection('xxm-address').doc(addressId).get()
		return await db.collection('xxm-address').where({
			user_id: this.userInfo.uid
		}).orderBy("default","desc").orderBy("create_time", "desc").get()
	},
	async add(data){
		if(!this.userInfo.uid) return this.userInfo
		data.user_id = this.userInfo.uid		
		data.create_time = Date.now();
		// 将其余地址修改为非默认
		if(data.default){
			await db.collection('xxm-address').where({
				user_id: this.userInfo.uid
			}).update({
				default: false
			})
		}
		return await db.collection('xxm-address').add(data)
	},
	async setDefault(id){
		if(!this.userInfo.uid) return this.userInfo
		await db.collection('xxm-address').where({
			user_id: this.userInfo.uid
		}).update({
			default: false
		})
		return await db.collection('xxm-address').doc(id).update({
			default: true
		})
	},
	async update(data){
		if(!this.userInfo.uid) return this.userInfo
		data.user_id = this.userInfo.uid
		data.update_time = Date.now()
		if(data.default) {
			await db.collection('xxm-address').where({
				user_id: this.userInfo.uid
			}).update({
				default: false
			})
		}
		let newData = {...data}
		delete newData._id
		return await db.collection('xxm-address').doc(data._id).update(newData)
	},
	async remove(id){
		return await db.collection("xxm-address").doc(id).remove()
	},
	async getDefault(){
		if(!this.userInfo.uid) return this.userInfo
		return await db.collection('xxm-address').where({
			user_id: this.userInfo.uid,
			default: true
		}).get()
	},
}