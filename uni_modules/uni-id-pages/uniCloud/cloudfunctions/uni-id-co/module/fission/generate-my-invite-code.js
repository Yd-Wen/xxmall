const {
    userCollection
} = require('../../common/constants')
const {
    getValidInviteCode
} = require('../../lib/utils/fission')
const {
    ERROR
} = require('../../common/error')

/**
 * 生成我的邀请码
 * @param {Object} params
 * @param {String} params._id  用户ID
 * @returns {Object} { errCode: 0, errMsg: string, myInviteCode: string }
 */
module.exports = async function (params = {}) {
    const schema = {
        _id: 'string'
    }
    this.middleware.validate(params, schema)
    const {
        _id
    } = params

    // 检查用户是否存在
    const getUserRes = await userCollection.doc(_id).get()
    if (getUserRes.data.length === 0) {
        throw {
            errCode: ERROR.USER_NOT_EXISTS
        }
    }

    // 检查用户是否已有邀请码
    const user = getUserRes.data[0]
    if (user.my_invite_code) {
        return {
            errCode: 0,
            errMsg: '已有邀请码',
            myInviteCode: user.my_invite_code
        }
    }

    // 生成有效的邀请码
    const myInviteCode = await getValidInviteCode()

    // 更新用户的邀请码
    await userCollection.doc(_id).update({
        my_invite_code: myInviteCode
    })

    return {
        errCode: 0,
        errMsg: '获取邀请码成功',
        myInviteCode
    }
}
