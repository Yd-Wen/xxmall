const uniID = require('uni-id-common')
const getUserInfo = async function(context){
	const token = context.getUniIdToken()
	const clientInfo = context.getClientInfo()
	const uniIDIns = uniID.createInstance({clientInfo})
	return await uniIDIns.checkToken(token)     // 校验
}

module.exports = {
	getUserInfo
}