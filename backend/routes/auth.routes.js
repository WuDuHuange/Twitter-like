// auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// 常规登录/注册路由
router.post('/register', authController.register);
router.post('/login', authController.login);

// Metamask登录路由
router.post('/metamask/message', authController.getMetamaskMessage);
router.post('/metamask/verify', authController.verifyMetamaskSignature);

module.exports = router;