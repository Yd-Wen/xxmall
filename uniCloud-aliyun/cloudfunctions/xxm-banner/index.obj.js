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
	async getByIds(ids) {
		return await db.collection("xxm-banner").where({
			_id: {
				$in: ids
			}
		}).field({
			_id: true,
			name: true,
			desc: true
		}).get()
	},
	async get() {
		return await db.collection("xxm-banner").get()

	},
	async getByGroup() {
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
		if (_params.thumb_urls_delete && _params.thumb_urls_delete.length) {
			await cloudUtils.deleteThumb(_params.thumb_urls_delete)
		}
		return await db.collection("xxm-banner").doc(params._id).update(_params)
	},
	async remove(id) {
		let banner = await db.collection("xxm-banner").doc(id).get()
		if (banner.data[0].thumb && banner.data[0].thumb.length) {
			await cloudUtils.deleteThumb(banner.data[0].thumb.map(item => item.url))
		}
		let res = await db.collection("xxm-banner").doc(id).remove()
		return res
	},
}
