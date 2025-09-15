// wallet.routes.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

// 获取钱包余额
router.get('/balance/:address', walletController.getWalletBalance);

module.exports = router;