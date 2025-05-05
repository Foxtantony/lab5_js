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

/**
 * Get weather data from OpenWeatherMap API
 * @param {string} apiKey - API key
 * @param {string} city - City name
 * @returns {Promise<Object>} - Weather data
 */
async function getDataFromApi(apiKey, city) {
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
        lang: 'en' // Changed to English
      }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`API returned error code: ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      // Server responded with an error
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.status === 404) {
        console.error('City not found. Check your input.');
      } else if (error.response.status === 401) {
        console.error('Invalid API key. Check your config.json file.');
      }
    } else {
      console.error(`Request error: ${error.message}`);
    }
    return null;
  }
}