const cloudUtils = require("xxm-cloud-utils")
const baseURL = "http://localhost:8000/v1/chat/stream"

module.exports = {
    _before: function () { // 通用预处理器
        this.userInfo = await cloudUtils.getUserInfo(this)
        if (!this.userInfo.uid) throw this.userInfo
        this.params = this.getParams()[0]
    },
    
    async chat(prompt:str, sessionId:str) {
        return new Promise((resolve, reject) => {
            let fullResponse = ""; // 存储完整响应
            
            uni.request({
                url: baseURL,
                method: 'POST',
                responseType: 'text', // 设置响应类型为文本
                data: {
                    session_id: sessionId,
                    prompt: prompt,
                    stream: true
                },
                success: (res) => {
                    // 处理完整的响应
                    const rawData = res.data;
                    // 解析SSE格式的数据
                    const lines = rawData.split('\n');
                    let chunks = [];
                    
                    lines.forEach(line => {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            if (data === '[DONE]') {
                                // 流结束
                                resolve({
                                    sessionId: sessionId,
                                    response: fullResponse,
                                    chunks: chunks
                                });
                            } else {
                                try {
                                    const jsonData = JSON.parse(data);
                                    if (jsonData.chunk) {
                                        chunks.push(jsonData.chunk);
                                        fullResponse += jsonData.chunk;
                                        // 实时更新UI
                                        this.onChunkReceived && this.onChunkReceived(jsonData.chunk);
                                    }
                                } catch (e) {
                                    console.error('解析数据失败:', e);
                                }
                            }
                        }
                    });
                },
                fail: (err) => {
                    reject(err);
                }
            });
        });
    },
    
    // 可选：设置实时更新回调
    setOnChunkReceived(callback) {
        this.onChunkReceived = callback;
    }
}
