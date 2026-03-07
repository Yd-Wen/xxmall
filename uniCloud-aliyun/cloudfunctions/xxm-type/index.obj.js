const db = uniCloud.database()
const dbCmd = db.command
const cloudUtils = require("xxm-cloud-utils")

module.exports = {
	_before: async function () { // 通用预处理器
		this.userInfo = await cloudUtils.getUserInfo(this)
		if (!this.userInfo.uid) throw this.userInfo
	},
	async get() {
		return await db.collection("xxm-type").get()
	},
	async getById(id) {
		return await db.collection("xxm-type").doc(id).get()
	},
	async add(params) {
		return await db.collection("xxm-type").add(params)
	},
	async update(id, name) {
		return await db.collection('xxm-type').doc(id).update({
			name: name
		})
	},
	async delete(id) {
		return await db.collection("xxm-type").doc(id).remove()
	}
}
