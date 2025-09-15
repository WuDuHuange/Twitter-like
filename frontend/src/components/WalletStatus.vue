<template>
  <div class="wallet-status" v-if="walletConnected">
    <div class="wallet-icon">🦊</div>
    <div class="wallet-info">
      <div class="wallet-address">{{ shortenedAddress }}</div>
      <div class="wallet-balance" v-if="balance !== null">
        {{ formattedBalance }} ETH
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
  name: 'WalletStatus',
  data() {
    return {
      balance: null,
      loading: false,
      error: null
    };
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    // 判断钱包是否连接
    walletConnected() {
      return this.currentUser && this.currentUser.wallet_address;
    },
    // 获取钱包地址
    walletAddress() {
      return this.currentUser ? this.currentUser.wallet_address : null;
    },
    // 缩短钱包地址显示
    shortenedAddress() {
      if (!this.walletAddress) return '';
      const addr = this.walletAddress;
      return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
    },
    // 格式化余额
    formattedBalance() {
      if (this.balance === null) return '';
      const balanceNum = parseFloat(this.balance);
      return balanceNum.toFixed(4);
    }
  },
  watch: {
    // 当钱包地址变化时获取余额
    walletAddress: {
      handler(newAddress) {
        if (newAddress) {
          this.fetchBalance();
        } else {
          this.balance = null;
        }
      },
      immediate: true
    }
  },
  methods: {
    // 获取钱包余额
    async fetchBalance() {
      if (!this.walletAddress) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`http://localhost:3000/api/wallet/balance/${this.walletAddress}`);
        this.balance = response.data.balanceEth;
      } catch (error) {
        console.error('获取钱包余额失败:', error);
        this.error = '无法获取余额';
        this.balance = null;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.wallet-status {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 6px 10px;
  margin: 10px 0;
  border: 1px solid var(--border-color);
}

.wallet-icon {
  margin-right: 8px;
  font-size: 16px;
}

.wallet-info {
  display: flex;
  flex-direction: column;
}

.wallet-address {
  font-size: 12px;
  color: var(--text-color);
  font-weight: 500;
}

.wallet-balance {
  font-size: 11px;
  color: var(--text-secondary);
}
</style>