import Vue from "vue"
import Vuex from "vuex"
import system from "@/store/modules/system.js"
import cart from "@/store/modules/cart.js"
import brand from "@/store/modules/brand.js"
import goods from "@/store/modules/goods.js"
import getters from "./getters.js"
import banner from "@/store/modules/banner.js"


Vue.use(Vuex)

const store = new Vuex.Store({
	getters,
	modules: {
		system,
		cart,
		brand,
		goods,
		banner
	}
})

export default store