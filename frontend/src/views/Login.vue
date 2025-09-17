<template>
  <section class="login-page">
    <div class="login-container">
      <h1>Login</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required 
            placeholder="Enter username"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Enter password"
          />
        </div>
        
        <div class="buttons">
          <button type="submit" class="primary-btn">Login</button>
          <button 
            type="button" 
            class="metamask-btn" 
            @click="handleMetamaskLogin"
          >
            <span class="metamask-icon">🦊</span>
            Login with Metamask
          </button>
        </div>
      </form>
      
      <div class="register-link">
        Don't have an account? 
        <router-link to="/register">Register</router-link>
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
        console.error('Login failed:', error);
      }
    },
    async handleMetamaskLogin() {
      if (!isMetamaskInstalled()) {
        alert('Please install Metamask wallet extension');
        return;
      }
      
      try {
        await this.$store.dispatch('loginWithMetamask');
        this.$router.push('/');
      } catch (error) {
        console.error('Metamask login failed:', error);
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
  min-width: 450px;
  max-width: 600px;
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