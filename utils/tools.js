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

// 通用请求函数（新增 headers 参数）
const request = (
	url,
	method,
	data,
	headers
) => {
	return new Promise((resolve, reject) => {
		// 合并默认 header 和自定义 header
		const mergedHeaders = {
			'Content-Type': 'application/json', // 默认保留
			...headers, // 合并自定义 header（可覆盖默认值）
		};

		// 检查是否支持流式响应
		const isStreamSupported = typeof uni.request === 'function' &&
			(uni.getSystemInfoSync().platform === 'app' ||
				uni.getSystemInfoSync().platform === 'mp-weixin' ||
				uni.getSystemInfoSync().platform === 'mp-alipay');

		// 创建一个请求task
		const requestTask = uni.request({
			url: url,
			method: method,
			data: data,
			header: mergedHeaders, // 使用合并后的 header
			enableChunked: isStreamSupported, // 只在支持的平台启用
			success: (res) => {
				// 如果不支持流式响应，直接返回完整响应
				if (!isStreamSupported) {
					resolve({
						data: res.data,
						onChunkReceived: (callback) => {
							// 模拟流式响应，一次性返回所有数据
							if (res.data) {
								callback(res.data);
							}
						},
						onHeadersReceived: (callback) => {
							callback(res.header);
						},
						abort: () => { }
					});
				}
			},
			fail: (err) => {
				reject(err);
			},
		});

		// 如果支持流式响应，立即返回处理对象
		if (isStreamSupported) {
			resolve({
				onHeadersReceived: (callback) => {
					if (requestTask.onHeadersReceived) {
						requestTask.onHeadersReceived((res) => {
							callback(res.header);
						});
					}
				},
				onChunkReceived: (callback) => {
					if (requestTask.onChunkReceived) {
						requestTask.onChunkReceived((res) => {
							callback(res.data);
						});
					}
				},
				abort: () => {
					requestTask.abort();
				},
			});
		}
	});
};


// GET请求方法（保持原有参数）
const get = (url, data) => {
	return request(url, 'GET', data);
};

// POST请求方法（新增 headers 参数）
const post = (url, data, headers) => {
	return request(url, 'POST', data, headers);
};

// 导出GET和POST方法
export { get, post };

