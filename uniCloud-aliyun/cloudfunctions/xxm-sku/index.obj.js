const db = uniCloud.database()
const dbCmd = db.command
module.exports = {
	_before: function () { // 通用预处理器
		this.params = this.getParams()[0]
	},
	async get(){
		return await db.collection("xxm-sku").get()
	},
	async add(){
		this.params.checked = false
		return await db.collection("xxm-sku").add(this.params)
	},
	async update(id, obj){
		obj.selected = false
		return await db.collection("xxm-sku").doc(id).update({
			children: dbCmd.push(obj)
		})
	}
}
