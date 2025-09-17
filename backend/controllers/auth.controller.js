// auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');
// Web3
const { Web3 } = require('web3');
const SimpleAuthHandler = require('../utils/simpleAuth');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).send({ message: 'Username and password are required fields' });
    }

    // Check if the username already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).send({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const [result] = await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    // Generate JWT token
    console.log('JWT expiration time set to:', process.env.JWT_EXPIRES_IN);
    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) || 86400 }
    );
    
    res.status(201).send({
      message: 'User registration successful',
      user: {
        id: result.insertId,
        username
      },
      accessToken: token
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).send({ message: 'Server error occurred during registration' });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).send({ message: 'Username and password are required fields' });
    }

    // Find user
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }
    
    const user = users[0];

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).send({ message: 'Invalid password' });
    }
    
    // Generate JWT token
    console.log('JWT expiration time set to:', process.env.JWT_EXPIRES_IN);
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) || 86400 }
    );

    // Handle avatar path
    let avatarUrl = user.avatar;
    if (avatarUrl) {
      avatarUrl = `http://localhost:3000${avatarUrl}`;
    }
    
    res.status(200).send({
      user: {
        id: user.id,
        username: user.username,
        walletAddress: user.wallet_address,
        avatar: avatarUrl
      },
      accessToken: token
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).send({ message: 'Server error occurred during login' });
  }
};

// Get Metamask login message
exports.getMetamaskMessage = async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).send({ message: 'Wallet address is required' });
    }
    
    // Create a random message for the user to sign
    const message = SimpleAuthHandler.generateMessage(address);

    // Store the message for later verification (in a real application, this should be stored in a database or cache)
    // Here we simplify by returning the message as a JWT
    const token = jwt.sign(
      { address, message },
      process.env.JWT_SECRET,
      { expiresIn: '5m' } // Short expiration time
    );
    
    res.status(200).send({ message, token });
  } catch (error) {
    console.error('Metamask message error:', error);
    res.status(500).send({ message: 'Server error occurred while generating message' });
  }
};

// Verify Metamask signature
exports.verifyMetamaskSignature = async (req, res) => {
  try {
    const { signature, token } = req.body;
    
    if (!signature || !token) {
      return res.status(400).send({ message: 'Signature and token are required fields' });
    }
    
    // Verify and decode the temporary token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).send({ message: 'Token invalid or expired' });
    }
    
    const { address, message } = decoded;

    // First, try to verify the signature using Web3
    try {
     
      
      let isSignatureValid = false;
      let recoveredAddress = null;
      
      try {
        // Try to use Web3.js
        const web3 = new Web3();
        recoveredAddress = web3.eth.accounts.recover(message, signature);
        console.log('Recovered address (Web3 method):', recoveredAddress);
        isSignatureValid = recoveredAddress.toLowerCase() === address.toLowerCase();
      } catch (web3Error) {
        console.error('Web3 signature verification failed, switching to simplified verification:', web3Error);

        // Use simplified verification logic as a fallback
        isSignatureValid = SimpleAuthHandler.verifySignature(message, signature, address);
        recoveredAddress = isSignatureValid ? address : null;
      }

      // If verification fails
      if (!isSignatureValid) {
        return res.status(401).send({ message: 'Signature verification failed' });
      }

      // Verification passed, continue processing
      console.log('Signature verification passed');

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).send({ message: 'Signature verification failed' });
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      return res.status(500).send({ message: 'Server error occurred while verifying signature' });
    }

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE wallet_address = ?',
      [address]
    );
    
    let user;
    
    if (users.length === 0) {
      // Create a new user
      const username = `user_${address.substring(2, 8)}`;
      const [result] = await db.query(
        'INSERT INTO users (username, wallet_address) VALUES (?, ?)',
        [username, address]
      );
      
      user = {
        id: result.insertId,
        username,
        walletAddress: address
      };
    } else {
      // Process avatar URL
      let avatarUrl = users[0].avatar;
      if (avatarUrl) {
        avatarUrl = `http://localhost:3000${avatarUrl}`;
      }
      
      user = {
        id: users[0].id,
        username: users[0].username,
        walletAddress: users[0].wallet_address,
        avatar: avatarUrl
      };
    }

    // Generate JWT token
    console.log('JWT expiration time set to:', process.env.JWT_EXPIRES_IN);
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) || 86400 }
    );
    
    res.status(200).send({
      user,
      accessToken
    });
  } catch (error) {
    console.error('Metamask verification error:', error);
    console.error('Error stack:', error.stack);
    
    // Try to extract more error information
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack
    };
    
    console.log('Detailed error information:', JSON.stringify(errorDetails, null, 2));
    
    res.status(500).send({ 
      message: 'Server error occurred during signature verification process',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
  }
};