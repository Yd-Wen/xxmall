const db = uniCloud.database()
const cloudUtils = require("xxm-cloud-utils");

module.exports = {
	_before: async function () { // 通用预处理器
		this.userInfo = await cloudUtils.getUserInfo(this)
		if (!this.userInfo.uid) throw this.userInfo
	},
	async getById(id) {
		return await db.collection("xxm-banner").doc(id).get()
	},
	async get() {
		let type = await db.collection("xxm-type").get()
		let banner = await db.collection("xxm-banner").get()
		type.data.forEach(item => {
			let bannerGroup = banner.data.filter(g => {
				return g.type_id == item._id
			})
			item.bannerGroup = bannerGroup
		})

		let newArr = type.data.filter(item => {
			return item.bannerGroup.length
		})
		return newArr // 没有data属性
	},
	async add(params) {
		return await db.collection("xxm-banner").add(params)
	},
	async update(params) {
		let _params = { ...params }
		delete _params._id
		return await db.collection("xxm-banner").doc(params._id).update(_params)
	},
	async remove(id) {
		let res = await db.collection("xxm-banner").doc(id).remove()
		return res
	},
}
