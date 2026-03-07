const bannerCloudObj = uniCloud.importObject("xxm-banner")
const banner = {
    state: {
        bannerData: []
    },
    mutations: {
        ADD_BANNER(state, data) {
            if (!data) return
            if (!Array.isArray(data)) {
                state.bannerData.push(data)
            } else {
                data.forEach(item => {
                    state.bannerData.push(item)
                })
            }
        },
        SET_BANNER(state, item) {
            let index = state.bannerData.findIndex(i => i._id === item._id)
            if (index !== -1) {
                // state.bannerData[index] = item  // 直接复制时 vuex 不会检测到变化
                state.bannerData.splice(index, 1, item)
            }
        },
        REMOVE_BANNER(state, id) {
            let index = state.bannerData.findIndex(i => i._id === id)
            if (index !== -1) {
                state.bannerData.splice(index, 1)
            }
        },
    },
    actions: {
        // 同步方法：网络请求
        async getBannerData(context) {
            let arr = Object.keys(context.state.bannerData) // 获取键数组
            if (arr.length) return                          //跳过二次网络请求
            let res = await bannerCloudObj.get()
            context.commit("ADD_BANNER", res.data)
        }
    }
}

export default banner
