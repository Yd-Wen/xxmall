const db = uniCloud.database()
const dbCmd = db.command
module.exports = async (obj) => {
	let user_order_success = true
	let {data={}} = obj
	let {
		order_no,
		out_trade_no,
		total_fee,
		provider
	} = data
	// 更新状态和支付方式
	db.collection('xxm-order').where(order_no).update({
		status: 1,
		payType: provider
	})

	return user_order_success
}