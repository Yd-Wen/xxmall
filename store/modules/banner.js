const bannerCloudObj = uniCloud.importObject("xxm-banner")
const banner = {
    state: {
        bannerData: []
    },
    mutations: {
        SET_BANNER(state, value) {
            state.bannerData = value
        }
    },
    actions: {
        // 同步方法：网络请求
        async getBannerData(context) {
            let arr = Object.keys(context.state.bannerData) // 获取键数组
            if (arr.length) return                          //跳过二次网络请求
            let res = await bannerCloudObj.get()
            context.commit("SET_BANNER", res.data)
        }
    }
}

export default banner
