<template>
  <div id="app">
    <header v-if="isLoggedIn">
      <nav>
        <div class="nav-container">
          <div class="logo">
            <router-link to="/">
              <h1>Twitter-like</h1>
            </router-link>
          </div>
          <div class="nav-links">
            <router-link to="/" class="nav-link">HomePage</router-link>
            <router-link :to="'/profile/' + currentUser.id" class="nav-link">Profile</router-link>
            <wallet-status v-if="currentUser && currentUser.wallet_address" class="wallet-status-container" />
            <button @click="logout" class="nav-link logout">Logout</button>
          </div>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    
    <!-- 页脚组件 - 显示小组成员信息 -->
    <app-footer />
  </div>
</template>

<script>
import WalletStatus from '@/components/WalletStatus.vue';
import AppFooter from '@/components/AppFooter.vue';

export default {
  name: 'App',
  components: {
    WalletStatus,
    AppFooter
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  created() {
    // 检查是否有存储的token
    const token = localStorage.getItem('token');
    let user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
      // 确保avatar URL是完整的
      if (user.avatar && !user.avatar.startsWith('http')) {
        user.avatar = `http://localhost:3000${user.avatar}`;
      }
      
      // 确保钱包地址字段名一致 (walletAddress -> wallet_address)
      if (user.walletAddress && !user.wallet_address) {
        user.wallet_address = user.walletAddress;
      }
      
      this.$store.commit('setToken', token);
      this.$store.commit('setUser', user);
      
      // 同时更新axios默认标头
      const axios = require('axios');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    }
  }
}
</script>

<style>
/* 应用全局样式 */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 确保应用至少占满整个视口高度 */
}

main {
  flex: 1; /* 主内容区域占用所有可用空间 */
}

header {
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.logo h1 {
  color: var(--primary-color);
  font-size: 20px;
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
}

.nav-link {
  color: var(--text-color);
  margin-left: 24px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--primary-color);
}

.logout {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  padding: 0;
}

.logout:hover {
  color: var(--danger-color);
  background: none;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 钱包状态组件样式 */
.wallet-status-container {
  margin-left: 48px;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 10px;
  }
  
  .logo h1 {
    font-size: 18px;
  }
  
  .nav-link {
    margin-left: 16px;
    font-size: 14px;
  }
  
  .wallet-status-container {
    margin-left: 32px;
  }
}
</style>