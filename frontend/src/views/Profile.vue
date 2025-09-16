<template>
  <div class="profile-container">
    <!-- 用户信息部分 -->
    <div class="profile-header">
      <div class="profile-avatar">
        <!-- 如果有头像，显示头像，否则显示用户名首字母 -->
        <img v-if="user.avatar" :src="getAvatarUrl(user.avatar)" alt="用户头像" class="avatar-image">
        <span v-else>{{ userInitial }}</span>
      </div>
      
      <div class="profile-info">
        <div class="profile-top-row">
          <h1>{{ user.username }}</h1>
          <!-- 编辑按钮 - 仅当当前用户查看自己的资料时显示 -->
          <button v-if="isCurrentUser" @click="openEditModal" class="edit-button">
            编辑资料
          </button>
        </div>
        
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
  
  <!-- 引入资料编辑模态框组件 -->
  <profile-edit 
    :show="showEditModal" 
    :user="user"
    @close="closeEditModal"
    @profile-updated="handleProfileUpdated"
  />
</template>

<script>
import PostList from '@/components/PostList.vue';
import Pagination from '@/components/Pagination.vue';
import WalletBalance from '@/components/WalletBalance.vue';
import ProfileEdit from '@/components/ProfileEdit.vue';
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
  name: 'ProfileView',
  components: {
    PostList,
    Pagination,
    WalletBalance,
    ProfileEdit
  },
  data() {
    return {
      user: {},
      page: 1,
      limit: 10,
      userLoading: false,
      userError: null,
      showEditModal: false
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
    },
    // 判断是否是当前登录用户查看自己的资料
    isCurrentUser() {
      return this.$store.state.auth.user && 
             this.$store.state.auth.user.id == this.userId;
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
        
        // 后端已处理头像URL，此处不需要额外处理
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
    },
    
    // 打开编辑模态框
    openEditModal() {
      this.showEditModal = true;
    },
    
    // 关闭编辑模态框
    closeEditModal() {
      this.showEditModal = false;
    },
    
    // 获取头像完整URL
    getAvatarUrl(avatarPath) {
      if (!avatarPath) return null;
      
      // 如果已经是完整URL，直接返回
      if (avatarPath.startsWith('http')) {
        return avatarPath;
      }
      
      // 如果路径包含uploads，使用标准路径
      if (avatarPath.includes('uploads/')) {
        return `http://localhost:3000/${avatarPath}`;
      }
      
      // 否则构建完整URL
      return `http://localhost:3000${avatarPath}`;
    },
    
    // 处理个人资料更新
    async handleProfileUpdated(updatedData) {
      // 更新用户数据
      if (updatedData.username) {
        this.user.username = updatedData.username;
      }
      
      if (updatedData.avatar) {
        this.user.avatar = updatedData.avatar;
      }
      
      // 如果是当前用户，更新全局存储的用户数据
      if (this.isCurrentUser) {
        const currentUser = this.$store.state.auth.user;
        const updatedUser = { ...currentUser };
        
        if (updatedData.username) {
          updatedUser.username = updatedData.username;
        }
        
        if (updatedData.avatar) {
          updatedUser.avatar = updatedData.avatar;
        }
        
        this.$store.commit('setUser', updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  }
};
</script>

<style scoped>
.profile-container {
  width: 600px;
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
  overflow: hidden;
  margin-right: 24px;
  flex-shrink: 0;
}

.profile-info {
  flex-grow: 1;
}

.profile-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.profile-info h1 {
  font-size: 24px;
  margin-bottom: 0;
  color: var(--text-color);
}

.edit-button {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-button:hover {
  background-color: rgba(29, 161, 242, 0.1);
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

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  
  .profile-top-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .edit-button {
    margin-top: 8px;
  }
}
</style>