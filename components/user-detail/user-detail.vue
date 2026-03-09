<template>
	<view class="userDetail">
		<!-- 遮罩层 -->
		<u-overlay 
			:show="userDetailPopState" 
			:zIndex="10075" 
			:duration="100" 
			:opacity="0.1" 
			@click="onClose"
		></u-overlay>
		<u-popup :show="userDetailPopState" closeable round="10" @close="onClose">
			<view class="wrapper" v-if="userDetailData">
				<view class="header">
                    <view class="title">{{title}}</view>
                </view>
				<view class="body">
					<view class="avatar">
						<image class="img" :src="(userDetailData.avatarFile && userDetailData.avatarFile.url) ? userDetailData.avatarFile.url : '/static/images/avatar.png'" mode="aspectFill"></image>
					</view>
					<view class="info">
						<view class="username">用户：{{userDetailData.username}}</view>
						<view class="nickname" v-if="userDetailData.nickname">昵  称：{{userDetailData.nickname}}</view>
						<view class="inviteCode" v-if="userDetailData.myInviteCode">
							邀请码：{{userDetailData.myInviteCode}}
						</view>
						<view class="inviteTime" v-if="userDetailData.inviteTime">
							邀请于 {{timeFormat(userDetailData.inviteTime, 'yyyy-MM-dd hh:mm')}}
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
	export default {
		name:"user-detail",
		props: {
            userDetailPopState: {
                type: Boolean,
                default: false
            },  
            title: {
                type: String,
                default: '用户详情'
            },
			userDetailData: {
				type: Object,
				default: () => {
					return {
						_id: '',
						username: '',
						nickname: '',
						avatarFile: {},
						myInviteCode: '',
						inviteTime: ''
					}
				}
			}
		},
		methods:{
			timeFormat,	
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
	height: 50vh;
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
			height: 60%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: flex-start;	
			padding-left: 50rpx;
			.username{
				font-size: 32rpx;
				font-weight: bold;
			}
			.nickname{
				font-size: 28rpx;
			}
			.inviteCode{
				font-size: 28rpx;
			}
			.inviteTime{
				font-size: 24rpx;
				color: $text-font-color-3;
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