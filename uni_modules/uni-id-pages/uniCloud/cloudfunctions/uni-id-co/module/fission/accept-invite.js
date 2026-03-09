const {
  acceptInvite
} = require('../../lib/utils/fission')

/**
 * 接受邀请
 * @tutorial https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#accept-invite
 * @param {Object} params
 * @param {String} params._id  用户ID
 * @param {String} params.inviteCode  邀请码
 * @returns
 */
module.exports = async function (params = {}) {
  const schema = {
    _id: 'string',
    inviteCode: 'string'
  }
  this.middleware.validate(params, schema)
  const {
    _id,
    inviteCode
  } = params
  return acceptInvite({
    uid: _id,
    inviteCode
  })
}
