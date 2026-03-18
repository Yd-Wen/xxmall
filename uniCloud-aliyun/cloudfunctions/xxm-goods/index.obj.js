const db = uniCloud.database()
const dbCmd = db.command
const cloudUtils = require("xxm-cloud-utils")
module.exports = {
	_before: async function () { // 通用预处理器
		this.userInfo = await cloudUtils.getUserInfo(this)
		if (!this.userInfo.uid) throw this.userInfo
	},
	async getById(id) {
		let res = await db.collection("xxm-goods").doc(id).get()
		res.data[0].current_price = res.data[0].current_price / 100
		res.data[0].origin_price = res.data[0].origin_price ? res.data[0].origin_price / 100 : null
		return res
	},
	async getByIds(ids) {
		return await db.collection("xxm-goods").where({
			_id: {
				$in: ids
			}
		}).field({
			name: true,
			desc: true
		}).get()
	},
	async get() {
		let category = await db.collection("xxm-category").get()
		let goods = await db.collection("xxm-goods").get()
		category.data.forEach(item => {
			let goodsGroup = goods.data.filter(g => {
				return g.category_id == item._id
			})
			item.goodsGroup = goodsGroup
		})

		let newArr = category.data.filter(item => {
			return item.goodsGroup.length
		})
		return newArr // 没有data属性
	},
	async add(params) {
		params.current_price = Math.round(Number(params.current_price).toFixed(2) * 100)
		params.origin_price = params.origin_price ? Math.round(Number(params.origin_price).toFixed(2) * 100) : null
		return await db.collection("xxm-goods").add(params)
	},
	async update(params) {
		let _params = { ...params }
		delete _params._id
		if (_params.thumb_urls_delete && _params.thumb_urls_delete.length) {
			await cloudUtils.deleteThumb(_params.thumb_urls_delete)
		}
		_params.current_price = Number(_params.current_price).toFixed(2) * 100
		_params.origin_price = _params.origin_price ? Number(_params.origin_price).toFixed(2) * 100 : null
		return await db.collection("xxm-goods").doc(params._id).update(_params)
	},
	async remove(id) {
		let goods = await db.collection("xxm-goods").doc(id).get()
		if (goods.data[0].thumb && goods.data[0].thumb.length) {
			await cloudUtils.deleteThumb(goods.data[0].thumb.map(item => item.url))
		}
		let res = await db.collection("xxm-goods").doc(id).remove()
		return res
	},
	async searchGoods(keyword) {
		return await db.collection("xxm-goods").where({
			name: new RegExp(keyword, 'gi')  //全局不区分大小写检索
		}).get()
	}
}
