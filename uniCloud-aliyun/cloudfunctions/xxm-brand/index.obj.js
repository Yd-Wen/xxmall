const db = uniCloud.database()
const cloudUtils = require("xxm-cloud-utils")
module.exports = {
	_before: async function () { // 通用预处理器
		this.userInfo = await cloudUtils.getUserInfo(this)
		if (!this.userInfo.uid) throw this.userInfo
		this.params = this.getParams()[0]
	},
	async get() {
		return await db.collection('xxm-brand').get()
	},
	async add() {
		return await db.collection('xxm-brand').add(this.params)
	},
	async update() {
		let params = { ...this.params } // 深拷贝
		delete params._id             // 删除ID
		if (params.thumb_urls_delete && params.thumb_urls_delete.length) {
			await cloudUtils.deleteThumb(params.thumb_urls_delete)
		}
		return await db.collection('xxm-brand').doc(this.params._id).update(params)
	}
}
