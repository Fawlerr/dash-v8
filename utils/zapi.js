const axios = require('axios');

/**
 * Make a request to Z-API
 * @param {string} url - The API URL
 * @param {string} clientToken - The client token
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<Object>} - API response or error object
 */
async function zapiRequest(url, clientToken, timeout = 10000) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        'Client-Token': clientToken,
        'Content-Type': 'application/json'
      },
      timeout: timeout,
      validateStatus: function (status) {
        return status === 200;
      }
    });

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return { error: true, message: 'Request timeout' };
    }
    
    if (error.response) {
      return { 
        error: true, 
        message: `HTTP ${error.response.status}: ${error.response.statusText}` 
      };
    }
    
    return { 
      error: true, 
      message: error.message || 'Unknown error' 
    };
  }
}

/**
 * Check instance status
 * @param {Object} instance - Instance object with id and token
 * @param {string} accountToken - Account token
 * @returns {Promise<Object>} - Status response
 */
async function checkInstanceStatus(instance, accountToken) {
  const url = `https://api.z-api.io/instances/${instance.id}/token/${instance.token}/status`;
  return await zapiRequest(url, accountToken, 8000);
}

/**
 * Get instance statistics
 * @param {Object} instance - Instance object with id and token
 * @param {string} accountToken - Account token
 * @returns {Promise<Object>} - Statistics response
 */
async function getInstanceStatistics(instance, accountToken) {
  const url = `https://api.z-api.io/instances/${instance.id}/token/${instance.token}/statistics`;
  return await zapiRequest(url, accountToken, 8000);
}

/**
 * Get instance info (me endpoint)
 * @param {Object} instance - Instance object with id and token
 * @param {string} accountToken - Account token
 * @returns {Promise<Object>} - Instance info response
 */
async function getInstanceInfo(instance, accountToken) {
  const url = `https://api.z-api.io/instances/${instance.id}/token/${instance.token}/me`;
  return await zapiRequest(url, accountToken, 10000);
}

/**
 * Generate phone verification code
 * @param {Object} instance - Instance object with id and token
 * @param {string} phone - Phone number
 * @param {string} accountToken - Account token
 * @returns {Promise<Object>} - Code generation response
 */
async function generatePhoneCode(instance, phone, accountToken) {
  const url = `https://api.z-api.io/instances/${instance.id}/token/${instance.token}/phone-code/${phone}`;
  return await zapiRequest(url, accountToken, 10000);
}

module.exports = {
  zapiRequest,
  checkInstanceStatus,
  getInstanceStatistics,
  getInstanceInfo,
  generatePhoneCode
};

