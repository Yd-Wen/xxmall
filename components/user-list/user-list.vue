<template>
	<view class="userList">
		<u-popup :show="userListPopState" closeable round="10" @close="onClose">
			<view class="wrapper" v-if="userListData">
				<view class="header">
                    <view class="title">{{title}}</view>
                </view>
				<view class="body">
					<view class="navList">
						<view class="navTitle">邀请层级</view>
						<scroll-view class="scrollView" scroll-y>
							<view class="item" :class="index==activeLevel-1?'active':''" v-for="(item, index) in navList" :key="index" @click="onChangeTab(index)">
							{{item}}
							</view>
						</scroll-view>
					</view>
					<view class="content">
						<view class="page" v-if="userListData.length > 0">
							<view class="contentList">
								<scroll-view scroll-y>
									<view class="item" v-for="(user, index) in userListData" :key="index" @click="onSelectUser(user)">
										<view class="avatar">
											<image class="img" :src="(user.avatarFile && user.avatarFile.url) ? user.avatarFile.url : '/static/images/avatar.png'" mode="aspectFill"></image>
										</view>
										<view class="name">
											<view class="mobile" v-if="user.mobile">{{user.mobile}}</view>
											<view class="username" v-else-if="user.username">{{user.username}}</view>
											<view class="nickname" v-else-if="user.nickname">（{{user.nickname}}）</view>
										</view>
										<view class="inviteTime" v-if="user.inviteTime">{{timeFormat(user.inviteTime, 'yyyy-MM-dd hh:mm')}}</view>
									</view>
								</scroll-view>
							</view>
							<view class="pagination">
								<uni-pagination :show-icon="true" :total="pageData.total" :current="pageData.current" :page-size="pageData.pageSize" title="标题文字" @change="onPageChange" />
								<text class="pageInfo">共邀请{{ pageData.total }}人 当前页：{{ pageData.current}} 每页数据：{{ pageData.pageSize }}</text>
							</view>
						</view>
						<view class="empty" v-if="userListData.length == 0">
							<u-empty mode="data" icon="/static/images/no_address.png"></u-empty>
						</view>
					</view>
				</view>
				<view class="footer">
					<u-button color="#ec544f" icon="checkmark-circle-fill" iconColor="#fff" @click="onConfirm">确定</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import {timeFormat} from '@/utils/tools.js'
  	import { MAX_INVITE_LEVEL } from '../../uni_modules/uni-id-pages/uniCloud/cloudfunctions/uni-id-co/lib/utils/fission.js'
	export default {
		name:"user-list",
		props: {
            userListPopState: {
                type: Boolean,
                default: false
            },  
            title: {
                type: String,
                default: '用户列表'
            },
			userListData: {
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
			activeLevel: {
				type: Number,
				default: 1
			}
		},
		data(){
			return {
			}
		},
		computed: {
			navList(){
				let navList = []
				for (let level = 1; level <= MAX_INVITE_LEVEL; level++) {
					navList.push(`${level} 级`)
				}
				return navList
			}
		},
		methods:{
            timeFormat,
			onChangeTab(index){
				this.$emit('change-tab', index)
			},
			// 点击用户项
			onSelectUser(user){
				this.$emit('select-user', user)
			},
			// 点击遮罩层关闭弹窗
			onClose(){
				this.$emit('close')
			},
			// 点击确认按钮
			onConfirm(){
				this.$emit('close')
			},
			// 分页变化
			onPageChange(e){
				this.$emit('page-change', e)
			}
		}
	}
</script>

<style lang="scss">
.wrapper{
	height: 80vh;
    z-index: 10074;
	.header{
		height: 80rpx;
		width: 100%;	
		margin-top: 10rpx;
        .title{
			line-height: 80rpx;
			@include flex-box-set();
            font-size: 40rpx;
            font-weight: bold;
        }
	}
	.body{
		height: calc(100% - 80rpx - 140rpx); // 减去 header 和 footer 的高度
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		.navList{
			font-size: 32rpx;
			font-weight: bold;
			height: 100%;
			width: 190rpx;
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
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			.page{
				flex: 1;
				.contentList{	
					width: 100%;
					height: calc(100% - 140rpx - 80rpx);
					margin-top: 50rpx;
					.item{
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin: 20rpx 0;
						.avatar{
							width: 100rpx;
							height: 100rpx;
							border-radius: 50%;
							overflow: hidden;
							.img{
								width: 100%;
								height: 100%;
							}
						}
						.name{
							flex: 1;
							font-size: 28rpx;
							text-align: center;
						}
						.inviteTime{
							width: 200rpx;
							font-size: 28rpx;
							text-align: center;
						}		
					}
				}
				.pagination{
					height: 80rpx;
					width: 100%;
					margin: 20rpx 0 50rpx;
					.pageInfo{
						font-size: 32rpx;
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
	.footer{
		@include flex-box-set();
		height: 140rpx;
		border-top: 1px solid $border-color-light;
		padding: 0 200rpx;
	}
}
</style>