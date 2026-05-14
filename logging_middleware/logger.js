const axios = require("axios");
require("dotenv").config();

/**
 * Reusable Logger Function
 * Sends logs to Affordmed evaluation service
 * 
 * @param {string} stack - 'backend' or 'frontend'
 * @param {string} level - 'debug', 'info', 'warn', 'error', 'fatal'
 * @param {string} pkg - Package/module name (e.g., 'handler', 'db', 'controller')
 * @param {string} message - Log message
 */
const Log = async (stack, level, pkg, message) => {
  try {
    const accessToken = process.env.AFFORDMED_ACCESS_TOKEN;
    
    if (!accessToken || accessToken === "YOUR_ACCESS_TOKEN_HERE") {
      console.warn(
        "Warning: AFFORDMED_ACCESS_TOKEN not set. Set it in .env file"
      );
      // Still log locally for debugging
      console.log(
        `[${new Date().toISOString()}] [${level.toUpperCase()}] [${pkg}] ${message}`
      );
      return;
    }

    const response = await axios.post(
      `${process.env.AFFORDMED_API_URL}${process.env.LOG_ENDPOINT}`,
      {
        stack,
        level,
        package: pkg,
        message,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(
      `[${level.toUpperCase()}] Log created: ${pkg} - ${message}`
    );
  } catch (error) {
    console.error(
      "Logging failed:",
      error.response?.data || error.message
    );
  }
};

module.exports = Log;
