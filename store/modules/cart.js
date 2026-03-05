const cart = {
	state:{
		cartList:[]
	},
	mutations:{
		SET_CARTLIST(state, params=null){
			if (!params) return state.cartList = []
			let {item, count} = params
			let cartItem = {
				...item,
				count
				// goods_id:item._id || item.goods_id,
				// name:item.name,
				// current_price:item.current_price,
				// origin_price:item.origin_price,
				// thumb:item.thumb,
				// count:count
			}
			let idx = state.cartList.findIndex(cart=>{
				if(cart.skuArr){
					return cart._id == cartItem._id &&
					JSON.stringify(cart.skuArr.sort()) == JSON.stringify(cartItem.skuArr.sort())
				}else{
					// return cart.goods_id == cartItem.goods_id
					return cart._id == cartItem._id
				}
			})
			if (idx < 0){
				state.cartList.unshift(cartItem)
			}else{
				if(cartItem.add) {
					state.cartList[idx].count += cartItem.count // 追加
				}else{
					state.cartList[idx].count = cartItem.count  // 覆盖
				}
				if(state.cartList[idx].count <= 0) state.cartList.splice(idx, 1)
			}
		}
	}
}

export default cart