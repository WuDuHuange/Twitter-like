<template>
  <div class="home-container">
    <div class="home-content">
      <h1 class="visually-hidden">Home</h1>
      
      <!-- Create Post Component -->
      <post-form @post-created="refreshPosts" />
      
      <div class="feed-divider"></div>
      
      <!-- Post Loading Status -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>
      
      <!-- Post List -->
      <post-list 
        :posts="posts" 
        @post-deleted="refreshPosts"
      />
      
      <!-- Pagination Controls -->
      <pagination 
        v-if="totalPages > 1" 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        @page-change="handlePageChange"
      />
      
      <!-- Empty Feed Message -->
      <div v-if="!loading && posts.length === 0" class="empty-feed">
        <p>No posts yet.</p>
        <p>Be the first to post something!</p>
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
    // Load posts
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
        console.error('Failed to load posts:', error);
      }
    },
    async refreshPosts() {
      // Refresh to first page
      this.page = 1;
      await this.loadPosts();
    },
    async handlePageChange(newPage) {
      this.page = newPage;
      await this.loadPosts();
      
      // Scroll to top
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