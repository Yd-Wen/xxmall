const cloudUtils = require("xxm-cloud-utils")
const URL_CHAT_STREAM = "https://api-xxmall.yindongwen.top/v1/chat/stream"
const URL_CHAT_COMPLETION = "https://api-xxmall.yindongwen.top/v1/chat/completion"
const URL_HISTORY_QUERY = "https://api-xxmall.yindongwen.top/v1/history/query"
const URL_KNOWLEDGE_UPLOAD = "https://api-xxmall.yindongwen.top/v1/knowledge/upload"

module.exports = {
	_before: async function () {
		this.userInfo = await cloudUtils.getUserInfo(this)
		if (!this.userInfo.uid) throw this.userInfo
		this.params = this.getParams()[0]
	},
	getUrl: async function (urlType, isStream) {
		return {
			session_id: this.userInfo.uid,
			url: urlType === "chat" ? (isStream ? URL_CHAT_STREAM : URL_CHAT_COMPLETION) : ""
		}
	},
	async queryHistory(limit = 100) {
		return await uniCloud.request({
			url: URL_HISTORY_QUERY,
			method: "POST",
			data: {
				session_id: this.userInfo.uid,
				limit: limit
			}
		})
	},
	async uploadKnowledge(options) {
		return res = await uniCloud.request({
			url: URL_KNOWLEDGE_UPLOAD,
			method: 'POST',
			data: {
				data: options.data || "test",
				file_name: options.file_name || 'knowledge.txt'
			}
		});
	}
}

