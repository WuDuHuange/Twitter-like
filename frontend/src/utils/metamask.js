// metamask.js - Web3 related utility functions

// Check if Metamask is installed
export const isMetamaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

// Check if Metamask is connected
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
    console.error('Failed to check Metamask connection status:', error);
    return false;
  }
};

// Request Metamask connection
export const connectMetamask = async () => {
  if (!isMetamaskInstalled()) {
    throw new Error('Please install Metamask wallet extension');
  }
  
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts[0];
  } catch (error) {
    console.error('Failed to connect to Metamask:', error);
    throw new Error('Failed to connect wallet, please try again');
  }
};

// Get ETH balance
export const getEthBalance = async (address) => {
  if (!isMetamaskInstalled()) {
    throw new Error('Please install Metamask wallet extension');
  }
  
  try {
    // Use eth_getBalance method to get balance (returns hex string)
    const balanceHex = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    
    // Convert hex to decimal string
    const balanceWei = parseInt(balanceHex, 16).toString();
    
    // Convert Wei to ETH (1 ETH = 10^18 Wei)
    const balanceEth = parseFloat(balanceWei) / Math.pow(10, 18);
    
    return balanceEth.toString();
  } catch (error) {
    console.error('Failed to get ETH balance:', error);
    throw new Error('Failed to get ETH balance');
  }
};

// Request signature
export const signMessage = async (message, address) => {
  if (!isMetamaskInstalled()) {
    throw new Error('Please install Metamask wallet extension');
  }
  
  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address]
    });
    return signature;
  } catch (error) {
    console.error('Failed to sign message:', error);
    throw new Error('Signature failed, please try again');
  }
};

// Listen for account changes
export const setupAccountsChanged = (callback) => {
  if (isMetamaskInstalled()) {
    window.ethereum.on('accountsChanged', callback);
  }
};

// Listen for chain changes
export const setupChainChanged = (callback) => {
  if (isMetamaskInstalled()) {
    window.ethereum.on('chainChanged', callback);
  }
};