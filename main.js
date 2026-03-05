import App from './App'
Vue.config.devtools = true

// #ifndef VUE3
import Vue from 'vue'
import uView from '@/uni_modules/uview-ui'
Vue.use(uView)
// 全局挂载Vuex
import store from './store'
Vue.prototype.$store = store
// 全局挂载访问权限校验
import {isManage} from "@/utils/tools.js"
Vue.prototype.isManage = isManage
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif