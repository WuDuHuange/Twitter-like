import axios from 'axios';

const API_URL = 'http://localhost:3000/api/posts/';

const postsModule = {
  state: () => ({
    posts: [],
    userPosts: [],
    currentPost: null,
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 1
  }),
  
  getters: {
    allPosts: state => state.posts,
    userPosts: state => state.userPosts,
    currentPost: state => state.currentPost,
    isLoading: state => state.loading,
    error: state => state.error,
    totalPages: state => state.totalPages,
    currentPage: state => state.currentPage
  },
  
  mutations: {
    setPosts(state, { posts, totalPages, currentPage }) {
      state.posts = posts;
      state.totalPages = totalPages;
      state.currentPage = currentPage;
    },
    setUserPosts(state, { posts, totalPages, currentPage }) {
      state.userPosts = posts;
      state.totalPages = totalPages;
      state.currentPage = currentPage;
    },
    setCurrentPost(state, post) {
      state.currentPost = post;
    },
    addPost(state, post) {
      state.posts.unshift(post);
    },
    removePost(state, postId) {
      state.posts = state.posts.filter(post => post.id !== postId);
      state.userPosts = state.userPosts.filter(post => post.id !== postId);
    },
    setLoading(state, status) {
      state.loading = status;
    },
    setError(state, error) {
      state.error = error;
    },
    clearError(state) {
      state.error = null;
    }
  },
  
  actions: {
    // get all posts (with pagination)
    async fetchPosts({ commit }, { page = 1, limit = 10 } = {}) {
      try {
        commit('setLoading', true);
        commit('clearError');
        
        const response = await axios.get(API_URL, {
          params: { page, limit }
        });
        
        commit('setPosts', {
          posts: response.data.posts,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage
        });
        
        return response.data;
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'get posts failed';
        commit('setError', errorMsg);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    // get posts by user ID (with pagination)
    async fetchUserPosts({ commit }, { userId, page = 1, limit = 10 }) {
      try {
        commit('setLoading', true);
        commit('clearError');
        
        const response = await axios.get(`http://localhost:3000/api/users/${userId}/posts`, {
          params: { page, limit }
        });
        
        commit('setUserPosts', {
          posts: response.data.posts,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage
        });
        
        return response.data;
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'get user posts failed';
        commit('setError', errorMsg);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    // get single post by ID
    async fetchPostById({ commit }, postId) {
      try {
        commit('setLoading', true);
        commit('clearError');
        
        const response = await axios.get(API_URL + postId);
        commit('setCurrentPost', response.data);
        
        return response.data;
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'get post failed';
        commit('setError', errorMsg);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    // Create new post
    async createPost({ commit, rootState }, content) {
      try {
        commit('setLoading', true);
        commit('clearError');
        
        // Ensure we have an auth token
        const token = rootState.auth.token;
        if (!token) {
          throw new Error('Not logged in, unable to create post');
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.post(API_URL, { content }, config);
        commit('addPost', response.data.post);
        
        return response.data;
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to create post';
        commit('setError', errorMsg);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    // Create new post with image
    async createPostWithImage({ commit, rootState }, formData) {
      try {
        commit('setLoading', true);
        commit('clearError');
        
        // Ensure we have an auth token
        let token = rootState.auth.token;
        if (!token) {
          // Try to get token from localStorage
          token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Not logged in, unable to create post');
          }
        }
        
        // Ensure using Bearer prefix
        if (!token.startsWith('Bearer ')) {
          token = `Bearer ${token}`;
        }
        
        console.log('Using Token:', token);
        
        const config = {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data'
          }
        };
        
        const response = await axios.post(API_URL, formData, config);
        commit('addPost', response.data.post);
        
        return response.data;
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'failed to create post with image';
        commit('setError', errorMsg);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    // Delete post
    async deletePost({ commit, rootState }, postId) {
      try {
        commit('setLoading', true);
        commit('clearError');

        // Ensure we have an auth token
        const token = rootState.auth.token;
        if (!token) {
          throw new Error('Not logged in, unable to delete post');
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        await axios.delete(API_URL + postId, config);
        commit('removePost', postId);
        
        return { success: true };
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'failed to delete post';
        commit('setError', errorMsg);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    }
  }
};

export default postsModule;