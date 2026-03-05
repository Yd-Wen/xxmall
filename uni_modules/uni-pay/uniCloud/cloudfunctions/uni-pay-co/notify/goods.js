const db = uniCloud.database()
const dbCmd = db.command
module.exports = async (obj) => {
	let user_order_success = true
	let {data={}} = obj
	let {
		order_no,
		out_trade_no,
		total_fee
	} = data
	// 获取指定订单号的订单
	let orderRes = await db.collection('xxm-order').where(order_no).get()
	let cartList = orderRes.data[0].cartList
	// 订单商品ID
	let ids = cartList.map(item=>{
		return item._id
	})
	// 获取指定商品ID的商品
	let goodsRes = await db.collection('xxm-goods').where({
		_id: dbCmd.in(ids)
	}).get()
	// 计算总价格：sum(商品现价*购物车中对应商品数量)
	let totalPrice = 0
	goodsRes.data.forEach(item=>{
		let idx = cartList.findIndex(item2=>{
			return item._id == item2._id
		})
		totalPrice += cartList[idx].count * item.current_price
	})
	// 根据计算价格和支付费用修改状态（最后一步可不用同步等待）
	if (totalPrice == total_fee) {
		db.collection('xxm-order').where(order_no).update({
			status: 1
		})
	}else{
		db.collection('xxm-order').where(order_no).update({
			status: -2,
			realFee: totalPrice
		})
		user_order_success = false
	}
	return user_order_success
}