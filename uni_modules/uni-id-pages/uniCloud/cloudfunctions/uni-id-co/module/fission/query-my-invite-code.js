const { userCollection } = require('../../common/constants')

/**
 * 查询我的邀请码信息
 * @param {Object} params
 * @param {String} params.myInviteCode  我的邀请码
 * @returns
 */
module.exports = async function (params = {}) {
    const schema = {
        _id: 'string'
    }
    this.middleware.validate(params, schema)

    const { _id } = params

    // 根据邀请码查询用户信息
    const userRes = await userCollection.where({
        _id: _id
    }).field({
        my_invite_code: true
    }).get()

    if (userRes.data.length === 0) {
        return ''
    }

    return userRes.data[0]
}
