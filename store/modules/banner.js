const bannerCloudObj = uniCloud.importObject("xxm-banner")
const banner = {
    state: {
        bannerData: [],
        currentIndex: 0,
        currentBanner: {
            name: '',
            thumb_src: '',
            thumb: [{ url: "../../static/images/no_address.png" }],
            desc: ''
        }
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
        CLEAR_BANNER(state) {
            state.bannerData = []
        },
        SET_CURRENT_BANNER(state, idx) {
            state.currentIndex = idx
            state.currentBanner = state.bannerData[idx]
        },
    },
    actions: {
        // 同步方法：网络请求
        async getBannerData(context) {
            if (context.state.bannerData.length > 0) return  //跳过二次网络请求
            let res = await bannerCloudObj.get()
            context.commit("CLEAR_BANNER")
            context.commit("ADD_BANNER", res.data)
        }
    }
}

export default banner
