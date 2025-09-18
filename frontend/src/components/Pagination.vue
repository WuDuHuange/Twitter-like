<template>
    <nav class="pagination-container">
        <ul class="pagination">
            <!-- previous page button -->
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button
                    @click="changePage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="page-link prev"
                >
                    &laquo;
                </button>
            </li>

            <!-- first  -->
            <li
                v-if="showFirstPage"
                class="page-item"
                :class="{ active: currentPage === 1 }"
            >
                <button @click="changePage(1)" class="page-link">1</button>
            </li>

            <li v-if="showLeftEllipsis" class="page-item ellipsis">
                <span>&hellip;</span>
            </li>

            <!-- page -->
            <li
                v-for="page in visiblePageNumbers"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
            >
                <button @click="changePage(page)" class="page-link">
                    {{ page }}
                </button>
            </li>

            <li v-if="showRightEllipsis" class="page-item ellipsis">
                <span>&hellip;</span>
            </li>

            <!-- final -->
            <li
                v-if="showLastPage"
                class="page-item"
                :class="{ active: currentPage === totalPages }"
            >
                <button @click="changePage(totalPages)" class="page-link">
                    {{ totalPages }}
                </button>
            </li>

            <!-- next page button -->
            <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
            >
                <button
                    @click="changePage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="page-link next"
                >
                    &raquo;
                </button>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    name: "Pagination",
    props: {
        currentPage: {
            type: Number,
            required: true,
        },
        totalPages: {
            type: Number,
            required: true,
        },
    },
    computed: {
        // Visible page range
        visiblePageNumbers() {
            let startPage, endPage;
            const maxVisiblePages = 5;

            if (this.totalPages <= maxVisiblePages) {
                startPage = 1;
                endPage = this.totalPages;
            } else {
                const halfVisiblePages = Math.floor(maxVisiblePages / 2);

                if (this.currentPage <= halfVisiblePages + 1) {
                    // near the beginning
                    startPage = 1;
                    endPage = maxVisiblePages - 2;
                } else if (
                    this.currentPage >=
                    this.totalPages - halfVisiblePages
                ) {
                    // near the ending
                    startPage = this.totalPages - maxVisiblePages + 3;
                    endPage = this.totalPages;
                } else {
                    // middle
                    startPage = this.currentPage - halfVisiblePages + 1;
                    endPage = this.currentPage + halfVisiblePages - 1;
                }
            }
            // Generate an array of visible page numbers from startPage to endPage.

            return Array.from(
                { length: endPage - startPage + 1 },
                (_, i) => startPage + i
            );
        },
        showFirstPage() {
            return (
                this.visiblePageNumbers.length > 0 &&
                this.visiblePageNumbers[0] > 1
            );
        },
        showLastPage() {
            return (
                this.visiblePageNumbers.length > 0 &&
                this.visiblePageNumbers[this.visiblePageNumbers.length - 1] <
                    this.totalPages
            );
        },
        showLeftEllipsis() {
            return this.showFirstPage && this.visiblePageNumbers[0] > 2;
        },
        showRightEllipsis() {
            return (
                this.showLastPage &&
                this.visiblePageNumbers[this.visiblePageNumbers.length - 1] <
                    this.totalPages - 1
            );
        },
    },
    methods: {
        changePage(page) {
            if (
                page !== this.currentPage &&
                page >= 1 &&
                page <= this.totalPages
            ) {
                this.$emit("page-change", page);
            }
        },
    },
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

.page-link.prev,
.page-link.next {
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
