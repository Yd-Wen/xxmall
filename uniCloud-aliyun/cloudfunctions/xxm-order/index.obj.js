const cloudUtils = require("xxm-cloud-utils")
const db = uniCloud.database()
const dbCmd = db.command
module.exports = {
	_before: async function () { // 通用预处理器
		this.userInfo = await cloudUtils.getUserInfo(this)
		if (!this.userInfo.uid) throw this.userInfo
	},
	// 创建订单
	async createOrder(data){
		data.user_id = this.userInfo.uid
		data.order_no = getOrderId()
		await db.collection('xxm-order').add(data)
		return data.order_no
	},
	// 获取订单详情
	async getByNo(order_no){
		let res = await db.collection('xxm-order').where({
			order_no,
			status:dbCmd.neq(0)
		}).get() 
		return res
	},
	// 获取订单列表
	async getList(){
		return await db.collection('xxm-order').where({
			user_id:this.userInfo.uid,
			status:dbCmd.neq(0)
		}).orderBy("createTime", "desc").get() 
	},
	// 获取所有用户的订单
	async getAll(){
		return await db.collection('xxm-order').where({
			status:dbCmd.neq(0)
		}).orderBy("createTime", "desc").get() 
	},
	// 完成订单
	async completeOrder(id){
		return await db.collection('xxm-order').doc(id).update({
			complete:true
		})
	},
	// 定时任务-删除未支付订单
	async _timing(){
		let time = Date.now() -  3 * 60 * 60 * 1000
		return await db.collection('xxm-order').where({
			status: 0,
			createTime: dbCmd.lt(time)
		}).remove()
	}
}

function getOrderId(){
	return Date.now()+"_"+String(Math.random()).substring(3, 9)
}
