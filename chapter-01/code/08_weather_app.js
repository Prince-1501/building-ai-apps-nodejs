// weather-app.js
// Mini-project: Combines async/await, fetch, env variables, JSON, and Express
// Run: npm install express dotenv first

const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const WEATHER_URL = process.env.WEATHER_API_URL;

app.use(express.json());

// Function to fetch weather data
async function getWeather(city) {
  try {
    const url = `${WEATHER_URL}/${city}?format=j1`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      city: city,
      temperature: data.current_condition[0].temp_C + ' degrees Celsius',
      description: data.current_condition[0].weatherDesc[0].value,
      humidity: data.current_condition[0].humidity + '%',
      windSpeed: data.current_condition[0].windspeedKmph + ' km/h'
    };
  } catch (error) {
    throw new Error(`Could not fetch weather for ${city}: ${error.message}`);
  }
}

// Route to get weather
app.get('/weather/:city', async (req, res) => {
  try {
    const city = req.params.city;
    console.log(`Fetching weather for: ${city}`);

    const weather = await getWeather(city);

    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Weather App is running!',
    usage: 'Visit /weather/London to get weather for London'
  });
});

app.listen(PORT, () => {
  console.log(`Weather app running at http://localhost:${PORT}`);
  console.log('Try: http://localhost:3000/weather/London');
});
