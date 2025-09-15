import { createStore } from 'vuex';
import authModule from './modules/auth';
import postsModule from './modules/posts';

export default createStore({
  modules: {
    auth: authModule,
    posts: postsModule
  }
});