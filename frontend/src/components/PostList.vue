<template>
  <div class="post-list">
    <article 
      v-for="post in posts" 
      :key="post.id" 
      class="post"
    >
      <div class="post-header">
        <div class="user-avatar">
          <img v-if="post.avatar" :src="getAvatarUrl(post.avatar)" alt="用户头像" class="avatar-image">
          <span v-else>{{ getUserInitial(post.username) }}</span>
        </div>
        <div class="post-meta">
          <router-link :to="`/profile/${post.user_id}`" class="username">
            {{ post.username }}
          </router-link>
          <span class="post-time">{{ formatTime(post.created_at) }}</span>
        </div>
      </div>
      
      <div class="post-content">
        {{ post.content }}
        
        <!-- 图片显示 -->
        <div v-if="post.image_url" class="post-image">
          <img :src="getImageUrl(post.image_url)" alt="发布图片" @click="openImageModal(getImageUrl(post.image_url))" />
        </div>
      </div>
      
      <div class="post-actions" v-if="isCurrentUserPost(post.user_id)">
        <button 
          @click="deletePost(post.id)" 
          class="delete-button"
          :disabled="deleteInProgress === post.id"
        >
          删除
        </button>
      </div>
    </article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PostList',
  props: {
    posts: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      deleteInProgress: null,
      showImageModal: false,
      modalImage: null
    };
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser'
    })
  },
  methods: {
    getUserInitial(username) {
      return username ? username.charAt(0).toUpperCase() : '?';
    },
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
    getImageUrl(imagePath) {
      if (!imagePath) return null;
      
      // 如果已经是完整URL，直接返回
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      
      // 如果路径包含uploads，使用标准路径
      if (imagePath.includes('uploads/')) {
        return `http://localhost:3000/${imagePath}`;
      }
      
      // 否则构建完整URL
      return `http://localhost:3000/uploads/${imagePath}`;
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffSec < 60) {
        return '刚刚';
      } else if (diffMin < 60) {
        return `${diffMin}分钟前`;
      } else if (diffHour < 24) {
        return `${diffHour}小时前`;
      } else if (diffDay < 7) {
        return `${diffDay}天前`;
      } else {
        // 日期格式化
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        });
      }
    },
    isCurrentUserPost(userId) {
      return this.currentUser && this.currentUser.id === userId;
    },
    openImageModal(imageUrl) {
      // 在新标签页中打开图片
      window.open(imageUrl, '_blank');
    },
    
    async deletePost(postId) {
      if (this.deleteInProgress) return;
      
      if (confirm('确定要删除这条帖子吗？')) {
        this.deleteInProgress = postId;
        
        try {
          await this.$store.dispatch('deletePost', postId);
          this.$emit('post-deleted');
        } catch (error) {
          console.error('删除帖子失败:', error);
          alert('删除帖子失败，请重试');
        } finally {
          this.deleteInProgress = null;
        }
      }
    }
  }
};
</script>

<style scoped>
.post-list {
  width: 100%;
}

.post {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.post:last-child {
  border-bottom: none;
}

.post-header {
  display: flex;
  margin-bottom: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-meta {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  color: var(--text-color);
  text-decoration: none;
}

.username:hover {
  text-decoration: underline;
  color: var(--primary-color);
}

.post-time {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.post-content {
  margin-left: 60px;
  margin-bottom: 12px;
  white-space: pre-wrap;
  line-height: 1.5;
}

.post-image {
  margin: 12px 0;
  border-radius: 12px;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  cursor: pointer;
  transition: filter 0.2s ease;
}

.post-image img:hover {
  filter: brightness(0.9);
}

.post-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-button {
  background-color: transparent;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-button:hover:not(:disabled) {
  background-color: rgba(224, 36, 94, 0.1);
}

.delete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>