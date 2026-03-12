<!-- 短信验证码登录页 -->
<template>
	<view class="uni-content">
		<view class="login-logo">
			<image :src="logo"></image>
		</view>
		<!-- 顶部文字 -->
		<text class="title">请输入验证码</text>
		<text class="tip">先输入图形验证码，再获取短信验证码</text>
		<uni-forms>
			<uni-id-pages-sms-form focusCaptchaInput v-model="code" type="login-by-sms" ref="smsCode" :phone="phone">
			</uni-id-pages-sms-form>
			<view class="inviteCode">
				<uni-forms-item name="inviteCode" v-model="inviteCode">
					<uni-easyinput :inputBorder="false" :focus="focusInviteCodeInput" class="input-box" placeholder="请输入邀请码" maxlength="6" type="text" v-model="inviteCode" trim="both" />
				</uni-forms-item>
			</view>
			<button class="uni-btn send-btn" type="primary" @click="submit">登录</button>
		</uni-forms>
		<uni-popup-captcha @confirm="submit" v-model="captcha" scene="login-by-sms" ref="popup"></uni-popup-captcha>
	</view>
</template>
<script>
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	export default {
		mixins: [mixin],
		data() {
			return {
				"code": "",
				"phone": "",
				"captcha": "",
				"inviterName": "",
				"inviteCode": "",
				"focusInviteCodeInput": false,
				"logo": "/static/images/logo.png"
			}
		},
		computed: {
			tipText() {
				return '验证码已通过短信发送至' + this.phone;
			},
		},
		onLoad(e) {
			if (e.phoneNumber) {
				this.phone = e.phoneNumber;
			}
			// 邀请人赋值给 inviterName（字符串）
			if (e.inviterName) {
				this.inviterName = e.inviterName
			}
			// 邀请码赋值给 inviteCode（字符串）
			if (e.inviteCode) {
				this.inviteCode = e.inviteCode
				this.focusInviteCodeInput = true
			}
		},
		onShow() {
			// #ifdef H5
			document.onkeydown = event => {
				var e = event || window.event;
				if (e && e.keyCode == 13) { //回车键的键值为13
					this.submit()
				}
			};
			// #endif
		},
		methods: {
			async submit() { //完成并提交
				const uniIdCo = uniCloud.importObject("uni-id-co", {
					errorOptions: {
						type: 'toast'
					}
				})
				if (this.code.length != 6) {
					this.$refs.smsCode.focusSmsCodeInput = true
					return uni.showToast({
						title: '验证码不能为空',
						icon: 'none',
						duration: 3000
					});
				}
				// 登录参数
				let loginParams = {
					"mobile": this.phone,
					"code": this.code,
					"captcha": this.captcha
				}
				if (this.inviteCode && this.inviteCode.length > 0) {
					const confirm = await new Promise((resolve) => {
						uni.showModal({
							title: '提示',
							content: `是否使用 ${this.inviterName} 的邀请码 ${this.inviteCode} 以注册？`,
							success: (res) => {
								resolve(res.confirm)
							},
							fail: () => {
								resolve(false)
							}
						})
					})
					
					// 只有点击确定时才添加邀请码参数
					if (confirm) {
						loginParams.inviteCode = this.inviteCode
					}
				} 
				// 登录
				uniIdCo.loginBySms(loginParams).then(e => {
					this.loginSuccess(e)
				}).catch(e => {
					if (e.errCode == 'uni-id-captcha-required') {
						this.$refs.popup.open()
					} else {
						console.log(e.errMsg);
					}
				}).finally(e => {
					this.captcha = ''
				})
			}
		}
	}
</script>
<style scoped lang="scss">
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	.tip {
		margin-top: -15px;
		margin-bottom: 15px;
	}

	.inviteCode {
		margin-top: 20rpx;
	}

	.popup-captcha {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		padding: 20rpx;
		background-color: #FFF;
		border-radius: 2px;
		flex-direction: column;
		position: relative;
	}

	.popup-captcha .title {
		font-weight: normal;
		padding: 0;
		padding-bottom: 15px;
		color: #666;
	}

	.popup-captcha .close {
		position: absolute;
		bottom: -40px;
		margin-left: -13px;
		left: 50%;
	}

	.popup-captcha .uni-btn {
		margin: 0;
	}
</style>
