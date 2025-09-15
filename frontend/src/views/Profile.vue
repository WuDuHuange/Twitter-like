<template>
  <div class="profile-container">
    <!-- 用户信息部分 -->
    <div class="profile-header">
      <div class="profile-avatar">
        <!-- 显示用户名首字母作为头像占位符 -->
        <span>{{ userInitial }}</span>
      </div>
      
      <div class="profile-info">
        <h1>{{ user.username }}</h1>
        
        <!-- 如果有钱包地址，显示它 -->
        <div v-if="user.wallet_address" class="wallet-address">
          <span class="wallet-icon">🦊</span>
          {{ shortenedWalletAddress }}
        </div>
        
        <!-- 加入日期 -->
        <div class="joined-date">
          加入于 {{ formattedDate }}
        </div>
      </div>
    </div>
    
    <!-- 钱包余额组件 - 仅在用户使用MetaMask登录时显示 -->
    <wallet-balance
      v-if="user.wallet_address" 
      :wallet-address="user.wallet_address"
      :show-balance="isWalletUser"
    />
    
    <!-- 用户帖子部分 -->
    <div class="profile-posts">
      <h2>帖子</h2>
      
      <!-- 帖子加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 用户帖子列表 -->
      <post-list 
        :posts="userPosts" 
        @post-deleted="refreshPosts" 
      />
      
      <!-- 分页控件 -->
      <pagination 
        v-if="totalPages > 1" 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        @page-change="handlePageChange"
      />
      
      <!-- 无帖子提示 -->
      <div v-if="!loading && userPosts.length === 0" class="empty-posts">
        <p>此用户还没有发布任何帖子。</p>
      </div>
    </div>
  </div>
</template>

<script>
import PostList from '@/components/PostList.vue';
import Pagination from '@/components/Pagination.vue';
import WalletBalance from '@/components/WalletBalance.vue';
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
  name: 'ProfileView',
  components: {
    PostList,
    Pagination,
    WalletBalance
  },
  data() {
    return {
      user: {},
      page: 1,
      limit: 10,
      userLoading: false,
      userError: null
    };
  },
  computed: {
    ...mapGetters({
      userPosts: 'userPosts',
      loading: 'isLoading',
      error: 'error',
      totalPages: 'totalPages',
      currentPage: 'currentPage'
    }),
    userId() {
      return this.$route.params.id;
    },
    // 获取用户名首字母作为头像
    userInitial() {
      return this.user.username ? this.user.username.charAt(0).toUpperCase() : '?';
    },
    // 格式化日期
    formattedDate() {
      if (!this.user.created_at) return '';
      const date = new Date(this.user.created_at);
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    // 缩短钱包地址显示
    shortenedWalletAddress() {
      if (!this.user.wallet_address) return '';
      const addr = this.user.wallet_address;
      return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    },
    // 判断是否是MetaMask用户
    isWalletUser() {
      // 检查用户是否有钱包地址，并且钱包地址非空
      return this.user && this.user.wallet_address && this.user.wallet_address.length > 0;
    }
  },
  watch: {
    // 监听路由参数变化，重新加载数据
    '$route.params.id': {
      handler() {
        this.loadUserData();
        this.refreshPosts();
      },
      immediate: true
    }
  },
  methods: {
    async loadUserData() {
      this.userLoading = true;
      this.userError = null;
      
      try {
        const response = await axios.get(`http://localhost:3000/api/users/${this.userId}`);
        this.user = response.data;
      } catch (error) {
        console.error('加载用户数据失败:', error);
        this.userError = '无法加载用户信息';
      } finally {
        this.userLoading = false;
      }
    },
    async loadUserPosts() {
      try {
        await this.$store.dispatch('fetchUserPosts', {
          userId: this.userId,
          page: this.page,
          limit: this.limit
        });
      } catch (error) {
        console.error('加载用户帖子失败:', error);
      }
    },
    async refreshPosts() {
      // 刷新回到第一页
      this.page = 1;
      await this.loadUserPosts();
    },
    async handlePageChange(newPage) {
      this.page = newPage;
      await this.loadUserPosts();
      
      // 滚动回顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
}

.profile-header {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 32px;
  font-weight: bold;
  margin-right: 24px;
  flex-shrink: 0;
}

.profile-info {
  flex-grow: 1;
}

.profile-info h1 {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--text-color);
}

.wallet-address {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-size: 14px;
}

.wallet-icon {
  margin-right: 4px;
}

.joined-date {
  color: var(--text-secondary);
  font-size: 14px;
}

.profile-posts {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-posts h2 {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 20px;
}

.loading-container {
  padding: 40px 0;
  text-align: center;
  color: var(--text-secondary);
}

.loading-spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(29, 161, 242, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-posts {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
}

/* 钱包余额组件的样式适配 */
.wallet-balance {
  max-width: 600px;
  margin: 0 auto 16px;
}

@media (max-width: 480px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>