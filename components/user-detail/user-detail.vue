<template>
	<view class="userDetail">
		<u-popup :show="userDetailPopState" closeable round="10" @close="onClose">
			<view class="wrapper" v-if="userDetailData.username">
				<view class="header">
                    <view class="title">{{title}}</view>
                </view>
				<view class="body">
					<scroll-view class="scroll" scroll-y>
						<view class="avatar">
							<image class="img" :src="userDetailData.avatarFile?.url || '/static/images/avatar.png'" mode="aspectFill"></image>
						</view>
						<view class="info">
							<view class="username">用户名：{{userDetailData.username}}</view>
							<view class="nickname" v-if="userDetailData.nickname">昵  称：{{userDetailData.nickname}}</view>
                            <view class="inviteCode" v-if="userDetailData.myInviteCode">
                                邀请码：{{userDetailData.myInviteCode}}
                            </view>
						</view>
					</scroll-view>
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
						myInviteCode: ''
					}
				}
			}
		},
		methods:{
			// 点击遮罩层关闭弹窗
			onClose(){
				this.$emit('update:userDetailPopState', false)
			},
			// 点击确认按钮
			onConfirm(){
				this.$emit('update:userDetailPopState', false)
			}
		}
	}
</script>

<style lang="scss">
.wrapper{
	height: 50vh;
    z-index: 20;
	.header{
		height: 80rpx;
		width: 100%;
        .title{
            font-size: 40rpx;
            font-weight: bold;
        }
	}
	.body{
		height: calc(100% - 20rpx); //CSS的calc()函数要求运算符前后必须有空格
		.scroll{
			height: 100%;
			padding: 0 30rpx;
			.avatar{
				width: 200rpx;
				height: 200rpx;
				.img{
					width: 100%;
					height: 100%;
				}
			}
			.info{
				padding: 20rpx 0;
				border-bottom: 1px solid $border-color-light;
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
	}
	.footer{
		@include flex-box-set();
		height: 140rpx;
		border-top: 1px solid $border-color-light;
		padding: 0 200rpx;
	}
}
</style>