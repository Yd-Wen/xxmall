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

// 通用请求函数（自动判断流式并控制 enableChunked）
const request = (url, method, data, headers) => {
	return new Promise((resolve, reject) => {
		// 合并默认 header
		const mergedHeaders = {
			'Content-Type': 'application/json',
			...headers,
		};

		// 核心：根据接口路径判断是否为流式接口
		const isStreamApi = url.includes('/chat/stream');

		// 非流式：直接返回简单对象
		if (!isStreamApi) {
			uni.request({
				url,
				method,
				data,
				header: mergedHeaders,
				enableChunked: false,
				success: (res) => {
					const result = res.data?.response || res.data;
					resolve({
						onData: (callback) => callback(result),
						onHeaders: () => { },
						abort: () => { },
						getResult: () => Promise.resolve(result),
					});
				},
				fail: reject,
			});
			return;
		}

		// 流式处理
		const requestTask = uni.request({
			url,
			method,
			data,
			header: mergedHeaders,
			enableChunked: true,
			success: () => { }, // 流式响应通过 onChunkReceived 处理
			fail: reject,
		});

		// 统一的响应处理对象（适配 UI 刷新）
		const responseHandler = {
			/**
			 * 监听数据（核心：直接返回可渲染的纯文本片段）
			 * @param {Function} callback - 接收文本片段的回调 (textChunk) => void
			 * @param {Object} options - 可选配置：{ speed: 100 } 逐字输出速率（ms）
			 */
			onData: (callback, options = { speed: 100 }) => {
				const { speed } = options;
				let chunkCache = '';

				if (requestTask.onChunkReceived) {
					requestTask.onChunkReceived((res) => {
						// 1. 解析 ArrayBuffer 为字符串
						let chunkStr = '';
						if (res.data instanceof ArrayBuffer) {
							chunkStr = new TextDecoder('utf-8').decode(res.data);
						} else {
							chunkStr = res.data || '';
						}

						// 2. 合并缓存
						chunkStr = chunkCache + chunkStr;
						chunkCache = '';

						// 3. 按行分割 SSE 格式数据
						const lines = chunkStr.split('\n');
						const validLines = [];

						// 处理最后一行可能不完整的情况
						if (lines.length > 0) {
							const lastLine = lines[lines.length - 1];
							if (!lastLine.startsWith('data: ') || !lastLine.trim()) {
								chunkCache = lastLine;
								lines.pop();
							}
						}

						// 过滤有效行并解析
						lines.forEach(line => {
							const jsonStr = line.replace('data: ', '').trim();
							try {
								const jsonData = JSON.parse(jsonStr);
								validLines.push(jsonData.chunk || jsonData.error || '');
							} catch (e) {
								validLines.push(jsonStr);
							}
						});

						// 4. 按速率逐行触发回调
						let lineIndex = 0;
						const interval = setInterval(() => {
							if (lineIndex >= validLines.length) {
								clearInterval(interval);
								return;
							}
							callback(validLines[lineIndex]);
							lineIndex++;
						}, speed);
					});
				} else {
					// 降级处理
					console.warn('当前平台不支持流式，已降级');
					requestTask.success = function (res) {
						callback(res.data?.response || res.data);
					};
				}
			},
			onHeaders: (callback) => {
				if (requestTask.onHeadersReceived) {
					requestTask.onHeadersReceived((res) => callback(res.header));
				}
			},
			abort: () => {
				if (requestTask.abort) {
					requestTask.abort();
				}
			},
			getResult: () => {
				return new Promise((resolve) => {
					let fullText = '';
					responseHandler.onData((chunk) => {
						fullText += chunk;
					}, { speed: 0 });
					setTimeout(() => resolve(fullText), 100);
				});
			},
		};

		resolve(responseHandler);
	});
};

// GET/POST 方法保持不变
const get = (url, data) => request(url, 'GET', data);
const post = (url, data, headers) => request(url, 'POST', data, headers);

export { get, post };
