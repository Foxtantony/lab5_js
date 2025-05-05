const fs = require('fs').promises;
const axios = require('axios');
const readlineSync = require('readline-sync');

/**
 * Load configuration from JSON file
 * @param {string} filename - Path to configuration file
 * @returns {Promise<Object>} - Configuration object
 */
async function loadConfig(filename) {
  try {
    const configData = await fs.readFile(filename, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error(`Error loading config: ${error.message}`);
    process.exit(1);
  }
}