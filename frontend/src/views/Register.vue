<template>
  <section class="register-page">
    <div class="register-container">
      <h1>注册</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required 
            placeholder="选择用户名"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="创建密码"
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required 
            placeholder="再次输入密码"
          />
          <div v-if="passwordMismatch" class="error-message">
            两次输入的密码不匹配
          </div>
        </div>
        
        <button type="submit" class="primary-btn" :disabled="passwordMismatch">注册</button>
      </form>
      
      <div class="login-link">
        已有账号? 
        <router-link to="/login">登录</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: ''
    };
  },
  computed: {
    ...mapGetters({
      error: 'registerError'
    }),
    passwordMismatch() {
      return this.confirmPassword && this.password !== this.confirmPassword;
    }
  },
  methods: {
    async handleRegister() {
      if (this.passwordMismatch) {
        return;
      }
      
      try {
        await this.$store.dispatch('register', {
          username: this.username,
          password: this.password
        });
        this.$router.push('/');
      } catch (error) {
        console.error('注册失败:', error);
      }
    }
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.register-container {
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

.register-form {
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

.primary-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 600;
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 16px;
}

.primary-btn:hover:not(:disabled) {
  background-color: #1a91da;
}

.primary-btn:disabled {
  background-color: #a0d1f1;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 16px;
}

.error-message {
  color: var(--danger-color);
  font-size: 14px;
  margin-top: 4px;
}

.error-message:first-child {
  background-color: #ffebee;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}
</style>