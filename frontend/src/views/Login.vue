<template>
  <section class="login-page">
    <div class="login-container">
      <h1>登录</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required 
            placeholder="输入用户名"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="输入密码"
          />
        </div>
        
        <div class="buttons">
          <button type="submit" class="primary-btn">登录</button>
          <button 
            type="button" 
            class="metamask-btn" 
            @click="handleMetamaskLogin"
          >
            <span class="metamask-icon">🦊</span>
            使用Metamask登录
          </button>
        </div>
      </form>
      
      <div class="register-link">
        没有账号? 
        <router-link to="/register">注册</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';
import { isMetamaskInstalled } from '@/utils/metamask';

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: ''
    };
  },
  computed: {
    ...mapGetters({
      error: 'loginError'
    })
  },
  methods: {
    async handleLogin() {
      try {
        await this.$store.dispatch('login', {
          username: this.username,
          password: this.password
        });
        this.$router.push('/');
      } catch (error) {
        console.error('登录失败:', error);
      }
    },
    async handleMetamaskLogin() {
      if (!isMetamaskInstalled()) {
        alert('请安装Metamask钱包扩展');
        return;
      }
      
      try {
        await this.$store.dispatch('loginWithMetamask');
        this.$router.push('/');
      } catch (error) {
        console.error('Metamask登录失败:', error);
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
  color: var(--primary-color);
}

.login-form {
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.primary-btn, .metamask-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.primary-btn {
  background-color: var(--primary-color);
  color: white;
}

.primary-btn:hover {
  background-color: #1a91da;
}

.metamask-btn {
  background-color: #f6851b;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.metamask-btn:hover {
  background-color: #e2761b;
}

.metamask-icon {
  margin-right: 8px;
  font-size: 20px;
}

.register-link {
  text-align: center;
  margin-top: 16px;
}

.error-message {
  background-color: #ffebee;
  color: var(--danger-color);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}
</style>