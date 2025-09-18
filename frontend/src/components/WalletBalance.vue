<template>
    <div class="wallet-balance" v-if="showBalance">
        <div class="balance-header">
            <i class="eth-icon">Ξ</i>
            <h3>ETH balance</h3>
        </div>

        <div class="balance-content" v-if="!loading">
            <span class="balance-amount">{{ formattedBalance }}</span>
            <span class="balance-currency">ETH</span>
        </div>

        <div class="balance-loading" v-else>
            <div class="loading-spinner small"></div>
            <span>loading...</span>
        </div>

        <div class="balance-error" v-if="error">
            {{ error }}
        </div>
    </div>
</template>

<script>
export default {
    name: "WalletBalance",
    props: {
        walletAddress: {
            type: String,
            required: true,
        },
        showBalance: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            balance: "0",
            loading: false,
            error: null,
        };
    },
    computed: {
        // Format the balance display to retain 4 decimal places
        formattedBalance() {
            if (!this.balance) return "0.0000";

            const balanceNum = parseFloat(this.balance);
            return balanceNum.toFixed(4);
        },
    },
    watch: {
        // Get the balance when the wallet address changes or showBalance becomes true
        walletAddress: {
            handler(newAddress) {
                if (newAddress && this.showBalance) {
                    this.fetchBalance();
                }
            },
            immediate: true,
        },
        showBalance: {
            handler(newBalance) {
                if (newBalance && this.walletAddress) {
                    this.fetchBalance();
                }
            },
            immediate: true,
        },
    },
    methods: {
        // get balance
        async fetchBalance() {
            if (!this.walletAddress) return;

            this.loading = true;
            this.error = null;

            try {
                // Use MetaMask tool class to directly obtain balance
                const { getEthBalance, isMetamaskInstalled } = await import(
                    "@/utils/metamask"
                );

                if (!isMetamaskInstalled()) {
                    throw new Error("Please install and log in to MetaMask");
                }

                this.balance = await getEthBalance(this.walletAddress);
            } catch (error) {
                this.error = "Unable to obtain balance information";
                this.balance = "0";
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.wallet-balance {
    background-color: #f8f9fa;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    margin-top: 16px;
}

.balance-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.eth-icon {
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    color: #627eea;
    margin-right: 8px;
}

h3 {
    font-size: 16px;
    margin: 0;
    color: var(--text-secondary);
}

.balance-content {
    display: flex;
    align-items: baseline;
}

.balance-amount {
    font-size: 24px;
    font-weight: 700;
    color: #212529;
}

.balance-currency {
    margin-left: 4px;
    font-size: 16px;
    color: var(--text-secondary);
}

.balance-loading {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: var(--text-secondary);
}

.loading-spinner.small {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(29, 161, 242, 0.2);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
}

.balance-error {
    margin-top: 8px;
    font-size: 14px;
    color: var(--danger-color);
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
