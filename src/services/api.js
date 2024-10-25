import axios from 'axios'


const baseURL = () => {
    const ip = window.electronAPI?.queryServerIp() ?? '192.168.2.100'
    const port = window.electronAPI?.queryServerPort() ?? '8888'
    const apiVersion = 'v1'
    return `http://${ip}:${port}/${apiVersion}`
}


const apiClient = axios.create({
    baseURL: baseURL(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// // 可以添加请求拦截器
// apiClient.interceptors.request.use(
//     config => {
//         // 在请求之前做些什么，例如添加 tokens
//         return config
//     },
//     error => {
//         // 处理请求错误
//         return Promise.reject(error)
//     }
// )

// // 可以添加响应拦截器
// apiClient.interceptors.response.use(
//     response => {
//         // 对响应数据做些什么
//         return response.data
//     },
//     error => {
//         // 处理响应错误
//         return Promise.reject(error)
//     }
// )

export default apiClient