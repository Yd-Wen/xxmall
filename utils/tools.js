// 价格转换
export function priceFormat(num) {
	return (num / 100).toFixed(2)
}
// 计算折扣
export function discount(num1, num2) {
	let res = parseInt((num1 / num2) * 100)
	return res + '折'
}

// 日期格式化
export function timeFormat(timestamp, fmt = "yyyy-MM-dd hh:mm:ss", targetTimezone = 0) {
	const validTimestamp = String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
	const date = new Date(validTimestamp);
	if (isNaN(date.getTime())) {
		return "无效的时间戳";
	}
	const timeMap = {
		yyyy: date.getFullYear(),
		MM: String(date.getMonth() + 1).padStart(2, '0'),
		dd: String(date.getDate()).padStart(2, '0'),
		hh: String(date.getHours()).padStart(2, '0'),
		mm: String(date.getMinutes()).padStart(2, '0'),
		ss: String(date.getSeconds()).padStart(2, '0')
	};
	return fmt.replace(/yyyy|MM|dd|hh|mm|ss/g, (match) => timeMap[match]);
}

// 后台访问权限
export function isManage() {
	let userInfo = uniCloud.getCurrentUserInfo()
	if (!userInfo.uid || !userInfo.role.includes('manage')) {
		uni.showToast({
			title: "无访问权限",
			icon: "error",
			mask: true
		})
		setTimeout(() => {
			uni.reLaunch({
				url: "/pages/index/index"
			})
		}, 1000)
	}
}

// export function http(options, loading = true) {
// 	console.log('%c请求拦截：', ' background:orange', options);
// 	if (loading) {
// 		uni.showLoading({
// 			title: "加载中...",
// 			mask: true
// 		});
// 	};

// 	return new Promise((resolve, reject) => {
// 		uni.request({
// 			url: options.url,
// 			method: options.method || 'GET',
// 			data: options.data || {},
// 			async success(res) {
// 				uni.hideLoading();
// 				resolve(res.data);
// 			}
// 		});
// 	});
// };
