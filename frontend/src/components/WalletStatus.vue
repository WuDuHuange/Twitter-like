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
      currentUser: 'currentUser',
    }),
    // 判断钱包是否连接
    walletConnected() {
      return this.currentUser && (this.currentUser.wallet_address || this.currentUser.walletAddress);
    },
    // 获取钱包地址
    walletAddress() {
      if (!this.currentUser) return null;
      return this.currentUser.wallet_address || this.currentUser.walletAddress || null;
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
        // 使用MetaMask工具类直接获取余额
        const { getEthBalance, isMetamaskInstalled } = await import('@/utils/metamask');
        
        if (!isMetamaskInstalled()) {
          throw new Error('请安装并登录MetaMask');
        }
        
        // 直接通过MetaMask获取余额
        this.balance = await getEthBalance(this.walletAddress);
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