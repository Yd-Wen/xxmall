const uniID = require('uni-id-common')
const getUserInfo = async function (context) {
	const token = context.getUniIdToken()
	const clientInfo = context.getClientInfo()
	const uniIDIns = uniID.createInstance({ clientInfo })
	return await uniIDIns.checkToken(token)     // 校验
}

const deleteThumb = async function (thumbUrls) {
	if (thumbUrls.length == 0) return
	await uniCloud.deleteFile({
		fileList: thumbUrls, // 待删除的文件地址列表
	})
}

module.exports = {
	getUserInfo,
	deleteThumb
}