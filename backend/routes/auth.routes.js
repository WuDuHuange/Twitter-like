// auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Regular login/register routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Metamask login routes
router.post('/metamask/message', authController.getMetamaskMessage);
router.post('/metamask/verify', authController.verifyMetamaskSignature);

module.exports = router;