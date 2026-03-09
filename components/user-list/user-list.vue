<template>
	<view class="userList">
		<u-popup :show="userListPopState" closeable round="10" @close="onClose">
			<view class="wrapper" v-if="userListData.username">
				<view class="header">
                    <view class="title">{{title}}</view>
                </view>
				<view class="body">
					<view class="avatar">
						<image class="img" :src="(userListData.avatarFile && userListData.avatarFile.url) ? userListData.avatarFile.url : '/static/images/avatar.png'" mode="aspectFill"></image>
					</view>
					<view class="info">
						<view class="username">用户：{{userListData.username}}</view>
						<view class="nickname" v-if="userListData.nickname">昵  称：{{userListData.nickname}}</view>
						<view class="inviteCode" v-if="userListData.myInviteCode">
							邀请码：{{userListData.myInviteCode}}
						</view>
						<view class="inviteTime" v-if="userListData.inviteTime">
							邀请时间：{{userListData.inviteTime}}
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
				type: Object,
				default: () => {
					return {
						_id: '',
						username: '',
						nickname: '',
						avatarFile: {},
						myInviteCode: ''
					}
				}
			}
		},
		methods:{
			// 点击遮罩层关闭弹窗
			onClose(){
				this.$emit('close')
			},
			// 点击确认按钮
			onConfirm(){
				this.$emit('close')
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
		padding-left: 50rpx;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		.avatar{
			width: 250rpx;
			height: 250rpx;
			border-radius: 50%;
			overflow: hidden;
			.img{
				width: 100%;
				height: 100%;
			}
		}
		.info{
			padding-left: 50rpx;
			.username{
				margin-bottom: 20rpx;
				font-size: 32rpx;
				font-weight: bold;
			}
			.nickname{
				margin-bottom: 20rpx;
				font-size: 28rpx;
			}
			.inviteCode{
				font-size: 28rpx;
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