const cloudUtils = require("xxm-cloud-utils")
const CHATURL = "https://api-xxmall.yindongwen.top/v1/chat/stream"

module.exports = {
    _before: async function () {
        this.userInfo = await cloudUtils.getUserInfo(this)
        if (!this.userInfo.uid) throw this.userInfo
        this.params = this.getParams()[0]
    },
    getUrl: async function (urlType) {
        return urlType === "chat" ? CHATURL : ""
    }
}