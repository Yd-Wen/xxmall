const cloudUtils = require("xxm-cloud-utils");

const BASE_URL = "https://127.0.0.1:8080/";

module.exports = {
	_before: async function () { // 通用预处理器
		this.userInfo = await cloudUtils.getUserInfo(this)
		if (!this.userInfo.uid) throw this.userInfo
	},
	async uploadKnowledge(id) {
		let res = await db.collection("xxm-goods").doc(id).get()
		res.data[0].current_price = res.data[0].current_price / 100
		res.data[0].origin_price = res.data[0].origin_price ? res.data[0].origin_price / 100 : null
		return res
	}
}

