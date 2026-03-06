const cloudUtils = require("xxm-cloud-utils");

module.exports = {
	_before: async function () { // 通用预处理器
		this.userInfo = await cloudUtils.getUserInfo(this)
		if (!this.userInfo.uid) throw this.userInfo
	},
	async uploadKnowledge(options) {
		return res = await uniCloud.request({
			url: "https://192.168.0.101:8000/v1/knowledge/upload",
			method: 'POST',
			data: {
				data: options.data || "test",
				file_name: options.file_name || 'knowledge.txt'
			}
		});
	}
}
