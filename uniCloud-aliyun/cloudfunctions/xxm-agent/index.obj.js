const db = uniCloud.database()
const dbCmd = db.command
module.exports = {
	_before: async function () { // 通用预处理器
		this.params = this.getParams()[0]
	},
	// 地址查询
	async getAddressById() {
		const addressId = this.params.addressId
		return await db.collection('xxm-address').doc(addressId).get()
	},
	async getAddressByUser() {
		const userId = this.params.userId
		return await db.collection('xxm-address').where({
			user_id: userId
		}).orderBy("default", "desc").orderBy("create_time", "desc").get()
	},
	async getAddressDefault() {
		const userId = this.params.userId
		return await db.collection('xxm-address').where({
			user_id: userId,
			default: true
		}).get()
	},
	// 订单查询
	// 获取订单详情
	async getOrderByNo() {
		const order_no = this.params.order_no
		let res = await db.collection('xxm-order').where({
			order_no,
			status: dbCmd.neq(0)
		}).get()
		return res
	},
	// 获取订单列表
	async getOrderList() {
		const userId = this.params.userId
		return await db.collection('xxm-order').where({
			user_id: userId,
			status: dbCmd.neq(0)
		}).orderBy("createTime", "desc").get()
	},
	// 获取所有用户的订单
	async getOrderAll() {
		return await db.collection('xxm-order').where({
			status: dbCmd.neq(0)
		}).orderBy("createTime", "desc").get()
	}
}