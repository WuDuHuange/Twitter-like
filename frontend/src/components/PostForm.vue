<template>
  <div class="post-form-container">
    <form @submit.prevent="submitPost" class="post-form">
      <div class="form-header">
        <div class="user-avatar">
          <img v-if="currentUser && currentUser.avatar" :src="getAvatarUrl(currentUser.avatar)" alt="用户头像" class="avatar-image">
          <span v-else>{{ userInitial }}</span>
        </div>
        <textarea 
          v-model="content" 
          placeholder="有什么新鲜事？" 
          :rows="textareaRows"
          @input="adjustTextareaHeight"
          ref="postTextarea"
        ></textarea>
      </div>
      
      <!-- 图片预览 -->
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="预览图片" />
        <button type="button" class="remove-image" @click="removeImage">
          &times;
        </button>
      </div>
      
      <div class="form-actions">
        <!-- 图片上传按钮 -->
        <div class="form-tools">
          <label class="upload-image-btn">
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/gif" 
              @change="handleImageUpload" 
              ref="imageInput"
              :disabled="!!imageFile || submitting"
            />
            <span class="icon">📷</span>
          </label>
        </div>
        
        <div class="form-right">
          <span class="char-count" :class="{ 'limit-exceeded': isCharLimitExceeded }">
            {{ content.length }}/280
          </span>
          <button 
            type="submit" 
            :disabled="!isValid || submitting"
            class="post-button"
          >
            发布
          </button>
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PostForm',
  data() {
    return {
      content: '',
      textareaRows: 2,
      submitting: false,
      error: '',
      charLimit: 280,
      imageFile: null,
      imagePreview: null
    };
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser'
    }),
    userInitial() {
      return this.currentUser ? this.currentUser.username.charAt(0).toUpperCase() : '?';
    },
    isValid() {
      // 有内容或有图片，且内容不超过字符限制
      return (this.content.trim().length > 0 || this.imageFile) && this.content.length <= this.charLimit;
    },
    isCharLimitExceeded() {
      return this.content.length > this.charLimit;
    }
  },
  methods: {
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
    
    async submitPost() {
      if (!this.isValid || this.submitting) {
        return;
      }
      
      this.submitting = true;
      this.error = '';
      
      try {
        console.log('开始提交帖子...');
        
        // 验证登录状态
        const token = localStorage.getItem('token');
        if (!token) {
          this.error = '您需要登录才能发布帖子';
          console.error('未找到登录令牌');
          return;
        }
        
        console.log('用户已登录，继续提交...');
        
        // 创建FormData对象用于包含文本和图片
        const formData = new FormData();
        formData.append('content', this.content);
        
        // 如果有图片，添加到表单数据
        if (this.imageFile) {
          console.log('添加图片文件:', this.imageFile.name);
          formData.append('image', this.imageFile);
        }
        
        // 使用FormData提交
        await this.$store.dispatch('createPostWithImage', formData);
        console.log('帖子提交成功');
        
        // 重置表单
        this.content = '';
        this.textareaRows = 2;
        this.removeImage();
        
        // 触发帖子创建事件
        this.$emit('post-created');
      } catch (error) {
        console.error('发布帖子失败:', error);
        // 添加详细错误信息
        if (error.response) {
          console.error('错误状态码:', error.response.status);
          console.error('错误详情:', error.response.data);
          this.error = `发布失败: ${error.response.status} - ${error.response.data.message || '服务器错误'}`;
        } else {
          this.error = `发布失败: ${error.message}`;
        }
      } finally {
        this.submitting = false;
      }
    },
    
    // 处理图片上传
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // 文件大小限制 (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.error = '图片大小不能超过5MB';
        this.$refs.imageInput.value = '';
        return;
      }
      
      // 验证文件类型
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        this.error = '只支持JPG、PNG和GIF格式的图片';
        this.$refs.imageInput.value = '';
        return;
      }
      
      // 设置预览
      this.imageFile = file;
      this.createImagePreview(file);
    },
    
    // 创建图片预览
    createImagePreview(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
    },
    
    // 移除图片
    removeImage() {
      this.imageFile = null;
      this.imagePreview = null;
      
      // 重置文件输入
      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = '';
      }
    },
    adjustTextareaHeight() {
      const textarea = this.$refs.postTextarea;
      const minRows = 2;
      const maxRows = 8;
      
      // 重置高度
      textarea.style.height = 'auto';
      
      // 计算新的行数
      const newRows = Math.min(
        Math.max(
          minRows,
          Math.ceil(textarea.scrollHeight / 24) // 假设每行约24px高
        ),
        maxRows
      );
      
      this.textareaRows = newRows;
    }
  }
};
</script>

<style scoped>
.post-form-container {
  background-color: white;
  padding: 16px;
}

.post-form {
  width: 100%;
}

.form-header {
  display: flex;
  margin-bottom: 16px;
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
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

textarea {
  flex-grow: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

textarea:focus {
  border-color: var(--primary-color);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tools {
  display: flex;
  align-items: center;
}

.form-right {
  display: flex;
  align-items: center;
}

.char-count {
  color: var(--text-secondary);
  font-size: 14px;
  margin-right: 16px;
}

/* 图片上传按钮样式 */
.upload-image-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--primary-color);
  background-color: transparent;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.upload-image-btn:hover {
  background-color: rgba(29, 161, 242, 0.1);
}

.upload-image-btn input[type="file"] {
  display: none;
}

.upload-image-btn .icon {
  font-size: 22px;
}

/* 图片预览样式 */
.image-preview {
  position: relative;
  margin: 12px 0;
  max-width: 100%;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.image-preview img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.limit-exceeded {
  color: var(--danger-color);
}

.post-button {
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
  padding: 8px 20px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.post-button:hover:not(:disabled) {
  background-color: #1a91da;
}

.post-button:disabled {
  background-color: #a0d1f1;
  cursor: not-allowed;
}

.error-message {
  margin-top: 12px;
  color: var(--danger-color);
  font-size: 14px;
}
</style>