<template>
	<view class="knowledgeList">
		<view class="navList">
            <view class="navTitle">知识库分类</view>
            <scroll-view class="scrollView" scroll-y>
                <view class="item" :class="index==activeCategoryIndex?'active':''" v-for="(item, index) in navList" :key="index" @click="onChangeTab(index)">
                {{item}}
                </view>
            </scroll-view>
        </view>
        <view class="content">
            <view class="page" v-if="knowledgeListData.length > 0">
                <view class="header">
                    <view class="name">名称</view>
                    <view class="creatTime">创建时间</view>
                    <view class="updateTime">更新时间</view>
                    <view class="operation">操作</view>
                </view>
                <view class="contentList">
                    <scroll-view scroll-y>
                        <view class="item" v-for="(knowledge, index) in knowledgeListData" :key="index" @click="onSelectKnowledge(knowledge)">
                            <view class="title">{{knowledge.title}}</view>
                        <view class="creatTime">{{timeFormat(knowledge.createTime, 'yyyy-MM-dd hh:mm')}}</view>
                        <view class="updateTime">{{timeFormat(knowledge.updateTime, 'yyyy-MM-dd hh:mm')}}</view>
                        <view class="operation">
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
	export default {
        data() {
            return {
                knowledgeListPopState: {
                type: Boolean,
                default: false
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
			activeCategoryIndex: {
				type: Number,
				default: 0
			}
            };
        }
    }
</script>

<style lang="scss" scoped>
	
</style>
