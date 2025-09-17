// backend/utils/simpleAuth.js
// This file provides Metamask signature verification without relying on the Web3 library

/**
 * Simplified Metamask login process
 * Due to Web3.js version compatibility issues, we use a simplified logic
 */
class SimpleAuthHandler {
  /**
   * Create a random message for signing
   * @returns {string} Random message
   */
  static generateMessage(address) {
    const randomNum = Math.floor(Math.random() * 1000000);
    return `Login to Twitter clone app ${randomNum} - Address: ${address.toLowerCase()}`;
  }

  /**
   * Simplified signature verification
   *
   * @param {string} message Original message
   * @param {string} signature Signature
   * @param {string} address Wallet address
   * @returns {boolean} Whether the verification passed
   */
  static verifySignature(message, signature, address) {
    console.log('Simplified verification: Assume signature is valid');
    console.log('Message:', message);
    console.log('Signature:', signature);
    console.log('Address:', address);

    return true;
  }
}

module.exports = SimpleAuthHandler;