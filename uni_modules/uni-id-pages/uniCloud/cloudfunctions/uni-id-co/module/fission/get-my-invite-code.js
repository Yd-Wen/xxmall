const { userCollection } = require('../../common/constants')

/**
 * 查询我的邀请码信息
 * @param {Object} params
 * @param {String} params._id  用户ID
 * @returns
 */
module.exports = async function (params = {}) {
    const schema = {
        _id: 'string'
    }
    this.middleware.validate(params, schema)

    const { _id } = params

    // 根据用户ID查询用户信息
    const userRes = await userCollection.where({
        _id: _id
    }).field({
        my_invite_code: true
    }).get()

    if (userRes.data.length === 0) {
        return {
            myInviteCode: ''
        }
    }

    return {
        myInviteCode: userRes.data[0].my_invite_code || ''
    }
}
