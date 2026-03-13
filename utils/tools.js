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
const request = (url, method, data, headers) => {
	return new Promise((resolve, reject) => {
		// 合并默认 header 和自定义 header
		const mergedHeaders = {
			'Content-Type': 'application/json', // 默认保留
			...headers, // 合并自定义 header（可覆盖默认值）
		};

		// 标记是否为流式请求（由调用方通过 data.stream 控制）
		const isStreamRequest = data && data.stream === true;
		// 存储流式处理的回调对象
		let streamHandlers = null;

		// 创建一个请求task
		const requestTask = uni.request({
			url: url,
			method: method,
			// 移除 stream 标记（避免传给后端）
			data: isStreamRequest ? { ...data, stream: undefined } : data,
			header: mergedHeaders, // 使用合并后的 header
			enableChunked: isStreamRequest, // 仅流式请求开启分片
			success: (res) => {
				// 非流式请求：直接 resolve 结果
				if (!isStreamRequest) {
					resolve(res);
				}
				// 流式请求：通过 onChunkReceived 回调返回数据，这里不重复 resolve
			},
			fail: (err) => {
				reject(err);
			},
		});

		// 构建流式处理对象（只创建一次，避免 Promise 多次 resolve）
		streamHandlers = {
			onHeadersReceived: (callback) => {
				if (requestTask.onHeadersReceived) {
					requestTask.onHeadersReceived((res) => {
						callback(res.header);
					});
				} else {
					// 仅开发环境打印警告，生产环境静默
					if (process.env.NODE_ENV === 'development') {
						console.warn('当前平台不支持 onHeadersReceived 方法');
					}
				}
			},
			onChunkReceived: (callback) => {
				if (requestTask.onChunkReceived) {
					requestTask.onChunkReceived((res) => {
						callback(res.data);
					});
				} else {
					// 仅开发环境打印警告
					if (process.env.NODE_ENV === 'development') {
						console.warn('当前平台不支持 onChunkReceived，已自动降级为传统响应模式');
					}
					// 降级处理：请求完成后一次性返回所有数据
					const originalSuccess = requestTask.success;
					requestTask.success = function (res) {
						callback(res.data); // 模拟分片回调，一次性返回全部数据
						if (originalSuccess) {
							originalSuccess.call(this, res);
						}
					};
				}
			},
			abort: () => {
				if (requestTask.abort) {
					requestTask.abort();
				} else if (process.env.NODE_ENV === 'development') {
					console.warn('当前平台不支持 abort 方法');
				}
			},
		};

		// 流式请求：resolve 处理对象；非流式请求：等待 success 回调 resolve
		if (isStreamRequest) {
			resolve(streamHandlers);
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

