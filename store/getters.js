const getters = {
	// 系统状态
	statusBarHeight: state=>state.system.statusBarHeight,
	titleBarHeight: state=>state.system.titleBarHeight,
	bodyBarHeight: state=>{
		if (state.system.foldState) return state.system.titleBarHeight;
		return 100;
	},
	totalHeadHeight:state=>{
		if (state.system.foldState) return state.system.statusBarHeight + state.system.titleBarHeight + 10;
		return state.system.statusBarHeight + state.system.titleBarHeight + 100 + 10;
	},
	foldState:state=>state.system.foldState,
	// 购物车状态
	cartList:state=>state.cart.cartList,
	totalPrice:state=>{
		return state.cart.cartList.reduce((prev,next)=>{
			return prev+=next.current_price * next.count
		}, 0)
	},
	preferentialPrice:state=>{
		let current = state.cart.cartList.reduce((prev,next)=>{
			return prev+=next.current_price * next.count
		}, 0)
		let origin = state.cart.cartList.reduce((prev,next)=>{
			return prev+=(next.origin_price?next.origin_price:next.current_price) * next.count
		}, 0)
		return origin - current
	},
	goodsCount:state=>{
		return state.cart.cartList.reduce((prev,next)=>{
			return prev+=next.count
		}, 0)
	},
	// 品牌状态
	brandData:state=>state.brand.brandData,
	// 商品状态
	detailPopState:state=>state.goods.detailPopState,
	detailData:state=>state.goods.detailData,
	selectionPopState:state=>state.goods.selectionPopState
}

export default getters