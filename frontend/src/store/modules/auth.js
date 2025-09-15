import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth/';

const authModule = {
  state: () => ({
    token: null,
    user: null,
    loginError: null,
    registerError: null
  }),
  
  getters: {
    isLoggedIn: state => !!state.token,
    currentUser: state => state.user,
    loginError: state => state.loginError,
    registerError: state => state.registerError
  },
  
  mutations: {
    setToken(state, token) {
      state.token = token;
    },
    setUser(state, user) {
      state.user = user;
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
    },
    setLoginError(state, error) {
      state.loginError = error;
    },
    setRegisterError(state, error) {
      state.registerError = error;
    },
    clearErrors(state) {
      state.loginError = null;
      state.registerError = null;
    }
  },
  
  actions: {
    // 普通登录
    async login({ commit }, credentials) {
      try {
        commit('clearErrors');
        const response = await axios.post(API_URL + 'login', credentials);
        
        const token = response.data.accessToken;
        const user = response.data.user;
        
        // 保存到localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 更新状态
        commit('setToken', token);
        commit('setUser', user);
        
        // 设置axios默认标头
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return response;
      } catch (error) {
        const errorMsg = error.response?.data?.message || '登录失败，请重试';
        commit('setLoginError', errorMsg);
        throw error;
      }
    },
    
    // 注册
    async register({ commit }, userData) {
      try {
        commit('clearErrors');
        const response = await axios.post(API_URL + 'register', userData);
        
        const token = response.data.accessToken;
        const user = response.data.user;
        
        // 保存到localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 更新状态
        commit('setToken', token);
        commit('setUser', user);
        
        // 设置axios默认标头
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return response;
      } catch (error) {
        const errorMsg = error.response?.data?.message || '注册失败，请重试';
        commit('setRegisterError', errorMsg);
        throw error;
      }
    },
    
    // Metamask登录
    async loginWithMetamask({ commit }) {
      try {
        commit('clearErrors');
        
        // 检查Metamask是否安装
        if (typeof window.ethereum === 'undefined') {
          throw new Error('请安装Metamask钱包');
        }
        
        console.log('Metamask已检测到，正在请求账户...');
        
        // 获取账户
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        console.log('获取到钱包地址:', address);
        
        // 获取服务器生成的消息
        console.log('向服务器请求消息...');
        const msgResponse = await axios.post(API_URL + 'metamask/message', { address });
        const { message, token: messageToken } = msgResponse.data;
        console.log('服务器返回消息:', message);
        
        // 请求用户签名
        console.log('请求用户签名消息...');
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, address]
        });
        console.log('获取到签名:', signature.substring(0, 10) + '...');
        
        // 验证签名
        console.log('向服务器发送签名验证请求...');
        const authResponse = await axios.post(API_URL + 'metamask/verify', {
          signature,
          token: messageToken
        });
        console.log('签名验证成功');
        
        const token = authResponse.data.accessToken;
        const user = authResponse.data.user;
        
        // 保存到localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 更新状态
        commit('setToken', token);
        commit('setUser', user);
        
        // 设置axios默认标头
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return authResponse;
      } catch (error) {
        const errorMsg = error.message || '登录失败，请重试';
        commit('setLoginError', errorMsg);
        throw error;
      }
    },
    
    // 登出
    logout({ commit }) {
      // 清除localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 清除axios标头
      delete axios.defaults.headers.common['Authorization'];
      
      // 更新状态
      commit('clearAuth');
    }
  }
};

export default authModule;