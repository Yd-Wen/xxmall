const { userCollection } = require('../../common/constants')

/**
 * 查询我的邀请人
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

  // 查询用户信息，获取 inviter_uid
  const userRes = await userCollection.doc(_id).field({
    _id: true,
    inviter_uid: true
  }).get()

  if (userRes.data.length === 0) {
    return {
      errCode: 0,
      data: {
        hasInviter: false,
        inviter: null
      }
    }
  }

  const user = userRes.data[0]
  const inviterUidArray = user.inviter_uid || []

  // 只返回第一个元素（直接邀请人）
  const inviterUid = inviterUidArray[0]

  if (!inviterUid) {
    return {
      errCode: 0,
      data: {
        hasInviter: false,
        inviter: null
      }
    }
  }

  // 查询邀请人信息
  const inviterRes = await userCollection.doc(inviterUid).field({
    _id: true,
    username: true,
    nickname: true,
    avatar: true,
    avatar_file: true,
    my_invite_code: true
  }).get()

  if (inviterRes.data.length === 0) {
    return {
      errCode: 0,
      data: {
        hasInviter: false,
        inviter: null
      }
    }
  }

  const inviter = inviterRes.data[0]

  return {
    errCode: 0,
    data: {
      hasInviter: true,
      inviter: {
        uid: inviter._id,
        username: inviter.username,
        nickname: inviter.nickname,
        avatarFile: inviter.avatar_file,
        myInviteCode: inviter.my_invite_code
      }
    }
  }
}
