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
    // Standard login
    async login({ commit }, credentials) {
      try {
        commit('clearErrors');
        const response = await axios.post(API_URL + 'login', credentials);
        
        const token = response.data.accessToken;
        const user = response.data.user;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update state
        commit('setToken', token);
        commit('setUser', user);
        
        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return response;
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Login failed, please try again';
        commit('setLoginError', errorMsg);
        throw error;
      }
    },
    
    // Register
    async register({ commit }, userData) {
      try {
        commit('clearErrors');
        const response = await axios.post(API_URL + 'register', userData);
        
        const token = response.data.accessToken;
        const user = response.data.user;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update state
        commit('setToken', token);
        commit('setUser', user);
        
        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return response;
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Registration failed, please try again';
        commit('setRegisterError', errorMsg);
        throw error;
      }
    },
    
    // Metamask login
    async loginWithMetamask({ commit }) {
      try {
        commit('clearErrors');
        
        // Check if Metamask is installed
        if (typeof window.ethereum === 'undefined') {
          throw new Error('Please install Metamask wallet extension');
        }
        
        console.log('Metamask detected, requesting accounts...');
        
        // Get accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        console.log('Wallet address obtained:', address);
        
        // Get server-generated message
        console.log('Requesting message from server...');
        const msgResponse = await axios.post(API_URL + 'metamask/message', { address });
        const { message, token: messageToken } = msgResponse.data;
        console.log('Server returned message:', message);
        
        // Request user signature
        console.log('Requesting user signature...');
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, address]
        });
        console.log('Signature obtained:', signature.substring(0, 10) + '...');
        
        // Verify signature
        console.log('Sending signature verification request to server...');
        const authResponse = await axios.post(API_URL + 'metamask/verify', {
          signature,
          token: messageToken
        });
        console.log('Signature verification successful');
        
        const token = authResponse.data.accessToken;
        const user = authResponse.data.user;
        
        // Ensure wallet address field name consistency (walletAddress -> wallet_address)
        if (user.walletAddress && !user.wallet_address) {
          user.wallet_address = user.walletAddress;
        }
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update state
        commit('setToken', token);
        commit('setUser', user);
        
        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return authResponse;
      } catch (error) {
        const errorMsg = error.message || 'Login failed, please try again';
        commit('setLoginError', errorMsg);
        throw error;
      }
    },
    
    // Logout
    logout({ commit }) {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      // Update state
      commit('clearAuth');
    }
  }
};

export default authModule;