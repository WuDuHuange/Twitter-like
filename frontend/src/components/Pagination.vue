<template>
  <nav class="pagination-container" aria-label="分页">
    <ul class="pagination">
      <!-- 上一页按钮 -->
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-link prev"
          aria-label="上一页"
        >
          &laquo;
        </button>
      </li>
      
      <!-- 第一页 -->
      <li v-if="showFirstPage" class="page-item" :class="{ active: currentPage === 1 }">
        <button @click="changePage(1)" class="page-link">1</button>
      </li>
      
      <!-- 左省略号 -->
      <li v-if="showLeftEllipsis" class="page-item ellipsis">
        <span>&hellip;</span>
      </li>
      
      <!-- 页码 -->
      <li 
        v-for="page in visiblePageNumbers" 
        :key="page" 
        class="page-item"
        :class="{ active: currentPage === page }"
      >
        <button @click="changePage(page)" class="page-link">{{ page }}</button>
      </li>
      
      <!-- 右省略号 -->
      <li v-if="showRightEllipsis" class="page-item ellipsis">
        <span>&hellip;</span>
      </li>
      
      <!-- 最后一页 -->
      <li v-if="showLastPage" class="page-item" :class="{ active: currentPage === totalPages }">
        <button @click="changePage(totalPages)" class="page-link">{{ totalPages }}</button>
      </li>
      
      <!-- 下一页按钮 -->
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-link next"
          aria-label="下一页"
        >
          &raquo;
        </button>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  computed: {
    // 可见的页码范围
    visiblePageNumbers() {
      let startPage, endPage;
      const maxVisiblePages = 5;
      
      if (this.totalPages <= maxVisiblePages) {
        // 如果总页数小于最大可见页数，显示所有页码
        startPage = 1;
        endPage = this.totalPages;
      } else {
        // 否则，计算可见的页码范围
        const halfVisiblePages = Math.floor(maxVisiblePages / 2);
        
        if (this.currentPage <= halfVisiblePages + 1) {
          // 当前页靠近开始
          startPage = 1;
          endPage = maxVisiblePages - 2;
        } else if (this.currentPage >= this.totalPages - halfVisiblePages) {
          // 当前页靠近结束
          startPage = this.totalPages - maxVisiblePages + 3;
          endPage = this.totalPages;
        } else {
          // 当前页在中间
          startPage = this.currentPage - halfVisiblePages + 1;
          endPage = this.currentPage + halfVisiblePages - 1;
        }
      }
      
      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    },
    // 是否显示第一页
    showFirstPage() {
      return this.visiblePageNumbers.length > 0 && this.visiblePageNumbers[0] > 1;
    },
    // 是否显示最后一页
    showLastPage() {
      return this.visiblePageNumbers.length > 0 && 
             this.visiblePageNumbers[this.visiblePageNumbers.length - 1] < this.totalPages;
    },
    // 是否显示左侧省略号
    showLeftEllipsis() {
      return this.showFirstPage && this.visiblePageNumbers[0] > 2;
    },
    // 是否显示右侧省略号
    showRightEllipsis() {
      return this.showLastPage && this.visiblePageNumbers[this.visiblePageNumbers.length - 1] < this.totalPages - 1;
    }
  },
  methods: {
    changePage(page) {
      if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
        this.$emit('page-change', page);
      }
    }
  }
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.pagination {
  display: flex;
  list-style: none;
  padding: 0;
  border-radius: 4px;
}

.page-item {
  margin: 0 4px;
}

.page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 4px;
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-link:hover:not(:disabled) {
  background-color: var(--hover-color);
  border-color: var(--primary-color);
}

.page-item.active .page-link {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-item.ellipsis {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.page-link.prev, .page-link.next {
  font-weight: bold;
}

@media (max-width: 480px) {
  .page-link {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
  }
}
</style>