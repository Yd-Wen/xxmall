<template>
	<view class="knowledgeList">
		<view class="navList">
            <view class="navTitle">知识库分类</view>
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
                        <view class="item" v-for="(knowledge, index) in knowledgeListData" :key="index" @click="onSelectKnowledge(knowledge)">
                            <view class="left">
                                <image :src="knowledge.cover" mode="aspectFill" class="img"></image>
                            </view>
                            <view class="middle">
                                <view class="title">{{knowledge.title}}</view>
                                <view class="content">{{knowledge.content}}</view>
                                <view class="time">
                                    <view class="createTime" v-if="knowledge.updateTime == knowledge.createTime">创建于 {{timeFormat(knowledge.createTime, 'yyyy-MM-dd hh:mm')}}</view>
                                    <view class="updateTime" v-else>上次更新 {{timeFormat(knowledge.updateTime, 'yyyy-MM-dd hh:mm')}}</view>
                                </view>    
                             </view>
                            <view class="right">
                                <view class="icon" @click="onDownLoad(knowledge._id)">
                                    <u-icon name="down" size="25" color="#576b95"></u-icon>
                                </view>
                                <view class="icon" @click="onUpdate(knowledge._id)">
                                    <u-icon name="edit-pen" size="25" color="#576b95"></u-icon>
                                </view>
                                <view class="icon" @click="onDelete(knowledge._id)">
                                    <u-icon name="trash" size="25" color="#ec544f"></u-icon>
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
</template>

<script>
	const ragCloudObj = uniCloud.importObject("xxm-rag", {customUI:true})
	export default {
        data() {
            return {
                categoryList: {
                    type: Array,
                    default: () => []
                },
                activeCategoryIndex: {
                    type: Number,
                    default: 0
                },
                knowledgeListData: {
                    type: Array,
                    default: () => []
                },
                pageData: {
                    type: Object,
                    default: () => {
                        return {
                            current: 1,
                            pageSize: 2,
                            total: 0
                        }
                    }
                },
            };
        },
        async onLoad(){
            await this.getCategory()
            await this.getKnowledgeList()
        },
        async onKnowledgePageChange(e){
            this.pageData.current = e.current
            await this.getKnowledgeList()
        },
        methods:{
            // 获取知识库分类
            async getCategory(){
                let res = await ragCloudObj.getCategory()
                console.log(res)
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
                let res = await ragCloudObj.queryKnowledge({
                    category: this.categoryList[this.activeCategoryIndex].value,
                    offset: (this.pageData.current - 1) * this.pageData.pageSize,
                    limit: this.pageData.pageSize
                })
                console.log(res)
                this.knowledgeListData = res.data.knowledge
                this.pageData.total = res.data.total
            },
        }
    }
</script>

<style lang="scss" scoped>
	.knowledgeList{
		@include flex-box-set(column);
        .navList{
            @include flex-box-set(start);
            width: 100%;
            height: 100rpx;
            line-height: 100rpx;
            font-size: 34rpx;
            color: #333;
            background-color: #f5f5f5;
            border-bottom: 1px solid #ededed;
        }
        .content{
            @include flex-box-set(column);
            width: 100%;
            height: 100%;
            padding: 30rpx;
        }
    }	
</style>
