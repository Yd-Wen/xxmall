<template>
    <view>
        <view class="knowledgeList">
            <view class="navList">
                <view class="navTitle">分类</view>
                <scroll-view class="scrollView" scroll-y>
                    <view class="item" :class="index==activeCategoryIndex?'active':''" v-for="(item, index) in categoryList" :key="index" @click="onChangeTab(index)">
                    {{item.name}}
                    </view>
                </scroll-view>
            </view>
            <view class="content">
                <view class="page" v-if="knowledgeListData.length > 0">
                    <view class="contentList">
                        <scroll-view scroll-y>
                            <view class="item" v-for="(knowledge, index) in knowledgeListData" :key="index">
                                <view class="left">
                                    <image :src="knowledge.cover" mode="aspectFill" class="img"></image>
                                </view>
                                <view class="right">
                                    <view class="title">{{knowledge.title}}</view>
                                    <view class="content" v-if="knowledge.content">{{knowledge.content}}</view>
                                    <view class="time">
                                        <view class="createTime" v-if="knowledge.updateTime == knowledge.createTime">创建于 {{timeFormat(knowledge.createTime, 'yyyy-MM-dd hh:mm')}}</view>
                                        <view class="updateTime" v-else>上次更新 {{timeFormat(knowledge.updateTime, 'yyyy-MM-dd hh:mm')}}</view>
                                    </view>    
                                    <view class="option" @click="onOption(knowledge)">
                                        <u-icon name="more-dot-fill" size="18" color="#576b95"></u-icon>
                                    </view>
                                </view>
                            </view>
                        </scroll-view>
                    </view>
                    <view class="pagination">
                        <uni-pagination :show-icon="true" :total="pageData.total" :current="pageData.current" :page-size="pageData.pageSize" title="标题文字" @change="onKnowledgePageChange" />
                        <text class="pageInfo">共{{ pageData.total }}条数据 当前页：{{ pageData.current}} 每页数据：{{ pageData.pageSize }}</text>
                    </view>
                </view>
                <view class="empty" v-if="knowledgeListData.length == 0">
                    <u-empty mode="data" icon="/static/images/no_address.png"></u-empty>
                </view>
            </view>
        </view>
        <u-popup :show="popState" closeable round="10" @close="popState = false" mode="bottom">
            <view class="wrapper">
                <view class="header">
                    <view class="title">{{currentKnowledge.title}}</view>
                </view>
                <view class="body">
                    <view class="download" v-if="activeCategoryIndex == 0" @click="onDownload">下载</view>
                    <view class="update" @click="onUpdate">更新</view>
                    <view class="delete" @click="onDelete">删除</view>
                </view>
            </view>
        </u-popup>
        <xxm-progress ref="progress" :progressPopState="isDelete" :progressData="progressData" @confirm="onConfirmDelete"></xxm-progress>
    </view>
</template>

<script>
	import {timeFormat} from '@/utils/tools.js'
	const ragCloudObj = uniCloud.importObject("xxm-rag", {customUI:true})
    const goodsCloudObj = uniCloud.importObject("xxm-goods", {customUI:true})
    const bannerCloudObj = uniCloud.importObject("xxm-banner", {customUI:true})
	export default {
        data() {
            return {
                isDelete: false,
				progressData: {
					title: '删除知识库中',
					data: [],
					percentage: 0,
					scrollTop: 0
				},
                popState: false,
                currentKnowledge: {},
                categoryList: [],
                activeCategoryIndex: 0,
                knowledgeListData: [],
                pageData: {
                    current: 1,
                    pageSize: 5,
                    total: 0
                },
            };
        },
        async onLoad(){
            await this.getCategory()
            await this.getKnowledgeList()
        },
        methods:{
            timeFormat,
            async onKnowledgePageChange(e){
                this.pageData.current = e.current
                await this.getKnowledgeList()
            },
            // 获取知识库分类
            async getCategory(){
                let res = await ragCloudObj.getCategory()
                this.categoryList = res.data.category.map(item => ({
                    name: item.name,
                    value: item.value
                }))
            },
            // 切换分类
            async onChangeTab(index){
                if (this.activeCategoryIndex == index) return
                this.activeCategoryIndex = index
                this.pageData.current = 1 // 切换分类后重置当前页
                await this.getKnowledgeList()   // 切换分类后获取知识库列表
            },
            // 获取知识库列表
            async getKnowledgeList(){
                if (!this.categoryList[this.activeCategoryIndex]) {
                    console.error('Category not found')
                    return
                }
                let res = await ragCloudObj.queryKnowledge({
                    category: this.categoryList[this.activeCategoryIndex].value,
                    offset: (this.pageData.current - 1) * this.pageData.pageSize,
                    limit: this.pageData.pageSize
                })
                await this.queryKnowledgeContent(res.data.knowledge)
                this.pageData.total = res.data.total
            },
            // 根据分类查询知识库
            async queryKnowledgeContent(knowledgeList){
                if (this.categoryList[this.activeCategoryIndex] && this.categoryList[this.activeCategoryIndex].value == "file"){
                    // 文件分类
                    this.knowledgeListData = knowledgeList.map(item => ({
                        id: item.id,
                        cover: '/static/images/file_'+item.id.split('.')[1]+'.png',
                        title: item.id,
                        createTime: item.create_time,
                        updateTime: item.update_time,
                        url: item.url[0]  // 下载链接
                    }))
                }else if (this.categoryList[this.activeCategoryIndex] && this.categoryList[this.activeCategoryIndex].value == "goods"){
                    // 商品分类
                    this.knowledgeListData = knowledgeList.map(item => ({
                        id: item.id,
                        cover: item.url[0],
                        createTime: item.create_time,
                        updateTime: item.update_time,
                    }))
                    // 查询商品获取商品名称和内容
                    let res = await goodsCloudObj.getByIds(knowledgeList.map(item => item.id))
                    this.knowledgeListData = this.knowledgeListData.map(item => {
                        // 根据id匹配商品接口返回的数据
                        const goodsItem = res.data.find(goods => goods._id === item.id)
                        return {
                            ...item, // 保留原有字段（cover/createTime/updateTime）
                            title: goodsItem ? goodsItem.name : '', // 追加商品名称
                            content: goodsItem ? goodsItem.desc : '' // 追加商品描述
                        }
                    })
                }else if (this.categoryList[this.activeCategoryIndex].value == "recommend"){
                    // 推荐分类
                    this.knowledgeListData = knowledgeList.map(item => ({
                        id: item.id,
                        cover: item.url[0] || '/static/images/banner/banner_default_'+(Number((item.create_time + '').slice(-1) || 0) % 3 + 1)+'.png',
                        createTime: item.create_time,
                        updateTime: item.update_time,
                    }))
                    // 查询商品获取商品名称和内容
                    let res = await bannerCloudObj.getByIds(knowledgeList.map(item => item.id))
                    this.knowledgeListData = this.knowledgeListData.map(item => {
                        // 根据id匹配商品接口返回的数据
                        const bannerItem = res.data.find(banner => banner._id === item.id)
                        return {
                            ...item, // 保留原有字段（cover/createTime/updateTime）
                            title: bannerItem ? bannerItem.name : '', // 追加商品名称
                            content: bannerItem ? bannerItem.desc : '' // 追加商品描述
                        }
                    })
                }
            },
            // 处理选项操作
            onOption(knowledge) {
                this.currentKnowledge = knowledge
                this.popState = true
            },
            async onDownload(){
                this.popState = false
                // 获取文件下载链接
                // let downloadUrl = await ragCloudObj.getFileUrl(this.currentKnowledge.title);
                // #ifdef H5
                // 新标签页打开链接
                window.open(this.currentKnowledge.url, '_blank')
                // #endif
				// #ifdef MP-WEIXIN
				// 使用uni.downloadFile和uni.saveFile实现下载
				uni.downloadFile({
				    url: this.currentKnowledge.url,
				    success: function(downloadRes) {
				        if (downloadRes.statusCode === 200) {
				            // 保存文件
				            uni.saveFile({
				                tempFilePath: downloadRes.tempFilePath,
				                success: () => {
				                    uni.showToast({
				                        title: '文件下载成功',
				                        icon: 'success'
				                    });
				                }
				            });
				        } 
				    },
				});
				// #endif
            },
            onUpdate(){
                this.popState = false
                let pageName
                // 跳转到添加页面，传递当前知识库数据的ID
                if (this.categoryList[this.activeCategoryIndex].value == "file"){
                    pageName = 'knowledge'
                }else if (this.categoryList[this.activeCategoryIndex].value == "goods"){
                    pageName = 'goods'
                }else if (this.categoryList[this.activeCategoryIndex].value == "recommend"){
                    pageName = 'banner'
                }
                uni.navigateTo({
                    url: `/pages_manage/${pageName}/add?id=${this.currentKnowledge.id}`
                })
            },
            // 初始化删除进度
			initProgress(name){
				this.isDelete = true
				this.$refs.progress.initProgress('删除知识库中', [
					{
						name: name,
						status: `【等待】删除${this.categoryList[this.activeCategoryIndex].name}`
					},
					{
						name: '',
						status: '【等待】同步到知识库'
					}
				])
			},
            async onDelete(){
                this.popState = false
                uni.showModal({
					title:"是否确认删除",
					success: async res=>{
						if(res.confirm){
                            this.initProgress(this.currentKnowledge.title)
                            await this.onDeleteAccCategory(this.currentKnowledge.id)
  						}
					}
				})
            },
            // 根据分类删除知识库数据
            async onDeleteAccCategory(id){
                let res, deleted = false
                const category = this.categoryList[this.activeCategoryIndex].value
                switch(category){
                    case "file":
                        // 文件分类
                        res = await ragCloudObj.deleteFile(id)    
                        deleted = res.fileList[0].fileID.split('/').pop()==id
                        break;
                    case "goods":
                        // 商品分类
                        res = await goodsCloudObj.remove(id)
                        deleted = res.deleted > 0
                        break;
                    case "recommend":
                        // 推荐分类
                        res = await bannerCloudObj.remove(id)
                        deleted = res.deleted > 0
                        break;
                    default:
                        break;
                }
                if (deleted){
                    this.$refs.progress.updateProgressStatus(0, `【成功】删除${this.categoryList[this.activeCategoryIndex].name}成功`)
                    res = await ragCloudObj.deleteKnowledge({id: id})
                    this.$refs.progress.updateProgressStatus(1, res.data.message)
                }else{
                    this.$refs.progress.updateProgressStatus(0, `【失败】删除${this.categoryList[this.activeCategoryIndex].name}失败`)
                    this.$refs.progress.updateProgressStatus(1, `【失败】需先删除${this.categoryList[this.activeCategoryIndex].name}`)
                }
            },
            // 删除结束
            onConfirmDelete(){
                this.isDelete = false
                setTimeout(()=>{
                    this.getKnowledgeList()
                }, 500) 
            }
        }
    }
</script>

<style lang="scss" scoped>
    page {
        background-color: #fff;
        padding-top: 0;
        padding-bottom: 0;
    }
	.knowledgeList{
        width: 750rpx;
		display: flex;
        height: 100vh;
        background-color: #fff;
        .navList{
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            width: 150rpx;
            background: $page-bg-color;
            .navTitle{
				text-align: center;
				padding: 30rpx 0;
				border-bottom: 1px solid $border-color;
			}
			.item{
				text-align: center;
				font-size: 30rpx;
				line-height: 100rpx;
				color: $text-font-color-2;
				position: relative;
				&.active{
					color: $text-font-color-1;
					background: #fff;
					&::after {
						content: "";
						width: 6rpx;
						height: 50rpx;
						background-color: $xxm-theme-color;
						position: absolute;
						left: 0;
						top: 50%;
						transform: translateY(-50%);
					}
				}
			}
        }
        .content{
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
            background-color: #fff;
            width: 100%;
			.page{
				flex: 1;
                width: 100%;
                display: flex;
                flex-direction: column;
                padding: 0 10rpx;
					.contentList{	
					width: 100%;
					margin-top: 30rpx;
					max-height: calc(100vh - 420rpx);
					.item{
                        min-height: 120rpx;
                        height: auto;
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						margin: 10rpx 0;
                        padding: 15rpx;
                        border-bottom: 1px solid $border-color-light;
						.left{
                            width: 80rpx;
							height: 80rpx;
						    border-radius: 15rpx;
							overflow: hidden;
							.img{
								width: 100%;
								height: 100%;
							}
                        }
                        .right{
                            flex: 1;
                            min-height: 80rpx;
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-start;
                            align-items: flex-start;
                            padding: 0 15rpx;
                            position: relative;
                            .title{
                                font-size: 30rpx;
                                color: #333;
                                font-weight: bold;
                                margin-bottom: 8rpx;
                            }
                            .content{
                                @include ellipse(2);
                                font-size: 26rpx;
                                color: $text-font-color-2;
                                margin-bottom: 8rpx;
                                line-height: 36rpx;
                            }
                            .time{
                                width: 100%;
                                font-size: 20rpx;
                                color: $text-font-color-2;
                                margin-bottom: 8rpx;
                                text-align: right;
                            }
                            .option{
                                position: absolute;
                                right: 0;
                                top: 0;
                                padding: 5rpx;
                            }
                        }
					}
				}
				.pagination{
					height: 120rpx;
					padding: 15rpx 20rpx;
					text-align: center;
					background-color: #fff;
					position: fixed;
					bottom: 50rpx;
					left: 150rpx;
					right: 0;
					z-index: 100;
					box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
					box-sizing: border-box;
					.pageInfo{
						font-size: 28rpx;
					}
				}
			}
			.empty{
				height: 100%;
				width: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
    }	
    .wrapper{
        width: 750rpx;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        .title{
            height: 100rpx;
            width: 750rpx;
            line-height: 100rpx;
            text-align: center;
            vertical-align: middle;
            font-size: 30rpx;
            color: #333;
            font-weight: bold;
            border-bottom: 1px solid $border-color-light;
        }
        .body{
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 0;
            .download,
            .update,
            .delete{
                height: 100rpx;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 28rpx;
                border-bottom: 1px solid $border-color-light;
            }
            .download,
            .update{
                color: #436cc5;
            }
            .delete{
                color: $xxm-theme-color;
                border-bottom: none;
            }
        }
    }
</style>
