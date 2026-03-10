const {
    userCollection,
    dbCmd
} = require('../../common/constants')

/**
 * 获取受邀用户总数
 * @param {Object} params
 * @returns {Object} { errCode: 0, total: number }
 */
module.exports = async function (params = {}) {
    const schema = {}
    this.middleware.validate(params, schema)
    const uid = params._id || this.authInfo.uid

    // 一次查询所有inviter_uid包含当前用户uid的文档数量
    const query = {
        inviter_uid: dbCmd.all([uid])
    }

    const getTotalRes = await userCollection.where(query).count()

    return {
        errCode: 0,
        total: getTotalRes.total
    }
}
