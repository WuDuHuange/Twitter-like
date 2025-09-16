// metamask.js - Web3相关工具函数

// 检查Metamask是否已安装
export const isMetamaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

// 检查Metamask是否已连接
export const isMetamaskConnected = async () => {
  if (!isMetamaskInstalled()) {
    return false;
  }
  
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    return accounts.length > 0;
  } catch (error) {
    console.error('检查Metamask连接状态失败:', error);
    return false;
  }
};

// 请求连接Metamask
export const connectMetamask = async () => {
  if (!isMetamaskInstalled()) {
    throw new Error('请安装Metamask钱包');
  }
  
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts[0];
  } catch (error) {
    console.error('连接Metamask失败:', error);
    throw new Error('连接钱包失败，请重试');
  }
};

// 获取ETH余额
export const getEthBalance = async (address) => {
  if (!isMetamaskInstalled()) {
    throw new Error('请安装Metamask钱包');
  }
  
  try {
    // 使用eth_getBalance方法获取余额（返回16进制字符串）
    const balanceHex = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    
    // 将16进制转换为10进制字符串
    const balanceWei = parseInt(balanceHex, 16).toString();
    
    // 将Wei转换为ETH (1 ETH = 10^18 Wei)
    const balanceEth = parseFloat(balanceWei) / Math.pow(10, 18);
    
    return balanceEth.toString();
  } catch (error) {
    console.error('获取ETH余额失败:', error);
    throw new Error('获取ETH余额失败');
  }
};

// 请求签名
export const signMessage = async (message, address) => {
  if (!isMetamaskInstalled()) {
    throw new Error('请安装Metamask钱包');
  }
  
  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address]
    });
    return signature;
  } catch (error) {
    console.error('签名消息失败:', error);
    throw new Error('签名失败，请重试');
  }
};

// 监听账户变化
export const setupAccountsChanged = (callback) => {
  if (isMetamaskInstalled()) {
    window.ethereum.on('accountsChanged', callback);
  }
};

// 监听链变化
export const setupChainChanged = (callback) => {
  if (isMetamaskInstalled()) {
    window.ethereum.on('chainChanged', callback);
  }
};