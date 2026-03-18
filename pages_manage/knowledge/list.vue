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
                                    <view class="option" @click="onOption(knowledge.title)">
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
        <u-popup :show="filePopState" closeable round="10" @close="filePopState = false" mode="center">
            <view class="wrapper">
                <view class="header">
                    <view class="title">{{currentFileName}}</view>
                </view>
                <view class="body">
                    <view class="download" @click="onDownloadFile(currentFileName)">下载文件</view>
                    <view class="update" @click="onUpdateFile">更新文件</view>
                    <view class="delete" @click="onDeleteFile">删除文件</view>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script>
	import {timeFormat} from '@/utils/tools.js'
	const ragCloudObj = uniCloud.importObject("xxm-rag", {customUI:true})
    const goodsCloudObj = uniCloud.importObject("xxm-goods")
    const bannerCloudObj = uniCloud.importObject("xxm-banner")
	export default {
        data() {
            return {
                filePopState: false,
                currentFileName: '',
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
            onOption(knowledgeId) {
                const currentCategory = this.categoryList[this.activeCategoryIndex];
                if (!currentCategory) return;
                
                switch (currentCategory.value) {
                    case 'goods':
                        // 跳转到商品列表页面
                        uni.navigateTo({
                            url: '/pages_manage/goods/list'
                        });
                        break;
                    case 'recommend':
                        // 跳转到推荐列表页面
                        uni.navigateTo({
                            url: '/pages_manage/banner/list'
                        });
                        break;
                    case 'file':
                        // 弹出对话框
                        this.currentFileName = knowledgeId
                        this.filePopState = true
                        break;
                    default:
                        break;
                }
            },
            async onDownloadFile(fileName){
                this.filePopState = false
                // 获取文件下载链接
                let downloadUrl = await ragCloudObj.getFileUrl(fileName);
                // #ifdef H5
                // 新标签页打开链接
                window.open(downloadUrl, '_blank')
                // #endif
				// #ifdef MP-WEIXIN
				// 使用uni.downloadFile和uni.saveFile实现下载
				uni.downloadFile({
				    url: downloadUrl,
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
            }
        }
    }
</script>

<style lang="scss" scoped>
    page {
        background-color: #fff;
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
                                font-size: 20rpx;
                                color: $text-font-color-2;
                                margin-bottom: 8rpx;
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
        width: 450rpx;
        height: 350rpx;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        .title{
            height: 100rpx;
            width: 400rpx;
            line-height: 100rpx;
            text-align: center;
            vertical-align: middle;
            font-size: 30rpx;
            color: #333;
            font-weight: bold;
            border-bottom: 1px solid $border-color-light;
        }
        .body{
            flex: 1;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 0;
            .download,
            .update,
            .delete{
                flex: 1;
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
