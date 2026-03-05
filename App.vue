<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-ui/index.scss";
	view, text, scroll-view, navigator{
		box-sizing: border-box;
	}
	// .safeArea{
	// 	// 针对IOS设置底部安全区
	// 	width: 100%;
	// 	height: env(safe-area-inset-bottom);
	// 	background: #fff;
	// }
</style>
