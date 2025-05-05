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

/**
 * Save data to JSON file
 * @param {string} filename - Path to file
 * @param {Object} data - Data to save
 */
async function saveToFile(filename, data) {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Data successfully saved to ${filename}`);
  } catch (error) {
    console.error(`Error saving file: ${error.message}`);
  }
}

/**
 * Display weather information in console
 * @param {Object} weatherData - Weather data
 */
function displayWeatherInfo(weatherData) {
  console.log('\n===== Weather Information =====');
  console.log(`City: ${weatherData.name}, ${weatherData.sys.country}`);
  console.log(`Temperature: ${weatherData.main.temp}°C`);
  console.log(`Feels like: ${weatherData.main.feels_like}°C`);
  console.log(`Humidity: ${weatherData.main.humidity}%`);
  console.log(`Pressure: ${weatherData.main.pressure} hPa`);
  console.log(`Weather conditions: ${weatherData.weather[0].description}`);
  console.log(`Wind speed: ${weatherData.wind.speed} m/s`);
  console.log('================================');
}

/**
 * Main program function
 */
async function main() {
  try {
    // Loading configuration
    const config = await loadConfig('config.json');
    console.log('Configuration successfully loaded');

    // Ask user for city name
    const city = readlineSync.question('Enter city name to get weather forecast: ');
    
    // Get data from API
    console.log(`Fetching weather data for ${city}...`);
    const weatherData = await getDataFromApi(config.api_key, city);
    
    if (weatherData) {
      // Display information in console
      displayWeatherInfo(weatherData);
      
      // Save data to file
      await saveToFile('output.json', weatherData);
    }
  } catch (error) {
    console.error(`An error occurred in the program: ${error.message}`);
  }
}

// Program start
console.log('Weather API Program Started!');
main();