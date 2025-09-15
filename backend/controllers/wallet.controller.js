// wallet.controller.js
const { Web3 } = require('web3');

// 获取钱包ETH余额
exports.getWalletBalance = async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).send({ message: '钱包地址为必填项' });
    }
    
    // 创建Web3实例（使用公共RPC）
    const web3 = new Web3('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'); // Infura公共端点
    
    try {
      // 获取余额（以Wei为单位）
      const balanceWei = await web3.eth.getBalance(address);
      
      // 转换为ETH（1 ETH = 10^18 Wei）
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      
      res.status(200).send({
        address,
        balanceWei,
        balanceEth
      });
    } catch (error) {
      console.error('获取余额失败:', error);
      res.status(200).send({
        address,
        balanceWei: '0',
        balanceEth: '0',
        error: '无法获取余额，使用默认值0'
      });
    }
  } catch (error) {
    console.error('钱包余额查询错误:', error);
    res.status(500).send({ message: '获取钱包余额时出现服务器错误' });
  }
};