const cloudUtils = require("xxm-cloud-utils")
const URL_CHAT_STREAM = "https://api-xxmall.yindongwen.top/v1/chat/stream"
const URL_CHAT_COMPLETION = "https://api-xxmall.yindongwen.top/v1/chat/completion"
const URL_HISTORY_QUERY = "https://api-xxmall.yindongwen.top/v1/history/query"
const URL_KNOWLEDGE_UPLOAD = "https://api-xxmall.yindongwen.top/v1/knowledge/upload"
const URL_KNOWLEDGE_UPDATE = "https://api-xxmall.yindongwen.top/v1/knowledge/update"
const URL_KNOWLEDGE_DELETE = "https://api-xxmall.yindongwen.top/v1/knowledge/delete"
const URL_KNOWLEDGE_QUERY = "https://api-xxmall.yindongwen.top/v1/knowledge/query"
const URL_KNOWLEDGE_CATEGORY = "https://api-xxmall.yindongwen.top/v1/knowledge/category"

const URL_CLOUD_STORAGE_DOWNLOAD = "https://mp-73e40e97-a1b0-469e-90c8-485169335ec2.cdn.bspapp.com"

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
	async getCategory() {
		return await uniCloud.request({
			url: URL_KNOWLEDGE_CATEGORY,
			method: 'GET',
		});
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
	async uploadFile(file) {
		return await uniCloud.uploadFile({
			filePath: file.url,
			cloudPath: `knowledge/${file.name}`,
			cloudPathAsRealPath: true
		});
	},
	async getFile(filename) {
		let url = URL_CLOUD_STORAGE_DOWNLOAD + `/knowledge/${filename}`
		let res = await uniCloud.request({
			url: url,
			method: 'GET',
			dataType: 'text',
			responseType: 'text'
		});
		new_res = { ...res }
		new_res.data = {
			content: res.data,
			url: url
		}
		return new_res
	},
	async getFileUrl(filename) {
		// 生成临时下载链接
		return URL_CLOUD_STORAGE_DOWNLOAD + `/knowledge/${filename}`;
	},
	async deleteFile(filename) {
		return await uniCloud.deleteFile({
			fileList: [`/knowledge/${filename}`]
		});
	},
	async uploadKnowledge(options) {
		return await uniCloud.request({
			url: URL_KNOWLEDGE_UPLOAD,
			method: 'POST',
			data: {
				id: options.id,
				category: options.category || 'file',
				content: options.content,
				url: options.url
			}
		});
	},
	async updateKnowledge(options) {
		return await uniCloud.request({
			url: URL_KNOWLEDGE_UPDATE,
			method: 'POST',
			data: {
				id: options.id,
				category: options.category || 'file',
				content: options.content,
				url: options.url
			}
		});
	},
	async queryKnowledge(options) {
		return await uniCloud.request({
			url: URL_KNOWLEDGE_QUERY,
			method: 'POST',
			data: {
				category: options.category || 'file',
				offset: options.offset,
				limit: options.limit
			}
		});
	},
	async deleteKnowledge(options) {
		return await uniCloud.request({
			url: URL_KNOWLEDGE_DELETE,
			method: 'POST',
			data: {
				id: options.id
			}
		});
	},
}

