<template>
  <div class="home-container">
    <div class="home-content">
      <h1 class="visually-hidden">主页</h1>
      
      <!-- 创建帖子组件 -->
      <post-form @post-created="refreshPosts" />
      
      <div class="feed-divider"></div>
      
      <!-- 帖子加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 帖子列表 -->
      <post-list 
        :posts="posts" 
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
      <div v-if="!loading && posts.length === 0" class="empty-feed">
        <p>还没有任何帖子。</p>
        <p>成为第一个发帖的人吧！</p>
      </div>
    </div>
  </div>
</template>

<script>
import PostForm from '@/components/PostForm.vue';
import PostList from '@/components/PostList.vue';
import Pagination from '@/components/Pagination.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'HomeView',
  components: {
    PostForm,
    PostList,
    Pagination
  },
  data() {
    return {
      page: 1,
      limit: 10
    };
  },
  computed: {
    ...mapGetters({
      posts: 'allPosts',
      loading: 'isLoading',
      error: 'error',
      totalPages: 'totalPages',
      currentPage: 'currentPage'
    })
  },
  created() {
    // 加载帖子
    this.loadPosts();
  },
  methods: {
    async loadPosts() {
      try {
        await this.$store.dispatch('fetchPosts', {
          page: this.page,
          limit: this.limit
        });
      } catch (error) {
        console.error('加载帖子失败:', error);
      }
    },
    async refreshPosts() {
      // 刷新回到第一页
      this.page = 1;
      await this.loadPosts();
    },
    async handlePageChange(newPage) {
      this.page = newPage;
      await this.loadPosts();
      
      // 滚动回顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};
</script>

<style scoped>
.home-container {
  max-width: 600px;
  margin: 0 auto;
}

.home-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.feed-divider {
  height: 10px;
  background-color: var(--hover-color);
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

.empty-feed {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
}
</style>