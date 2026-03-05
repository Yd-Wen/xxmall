const goods = {
	state:{
		detailPopState: false,    // 弹窗状态（vuex 实现兄弟组件传值）
		detailData:{},
		selectionPopState: false, // 弹窗状态
	},
	mutations:{
		SET_DETAILPOPSTATE(state, value){
			state.detailPopState = value
		},
		SET_DETAILDATA(state, value){
			value.desc = value.desc.replace(/\n/g, "<br/>")
			state.detailData = value
		},
		SET_SELECTIONPOPSTATE(state, value){
			state.selectionPopState = value
		}
	}
}

export default goods