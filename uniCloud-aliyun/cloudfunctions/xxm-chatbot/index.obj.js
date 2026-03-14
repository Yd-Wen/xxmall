const cloudUtils = require("xxm-cloud-utils")
const URL_CHAT_STREAM = "https://api-xxmall.yindongwen.top/v1/chat/stream"
const URL_CHAT_COMPLETION = "https://api-xxmall.yindongwen.top/v1/chat/completion"

module.exports = {
    _before: async function () {
        this.userInfo = await cloudUtils.getUserInfo(this)
        if (!this.userInfo.uid) throw this.userInfo
        this.params = this.getParams()[0]
    },
    getUrl: async function (urlType, isStream) {
        return {
            session_id: this.userInfo.uid,
            url: urlType === "chat" ? (isStream ? URL_CHAT_STREAM : URL_CHAT_COMPLETION) : ""
        }
    }
}