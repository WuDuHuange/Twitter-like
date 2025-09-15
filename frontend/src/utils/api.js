// api.js - Axios服务配置
import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器（添加认证令牌）
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器（处理常见错误）
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理未授权错误（401）
    if (error.response && error.response.status === 401) {
      // 清除本地存储的令牌
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 可以在这里添加重定向到登录页面的逻辑
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;