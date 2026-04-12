// env-demo.js
// Demonstrates using environment variables with dotenv
// Run: npm install dotenv first

// This line loads the .env file and makes its values available
require('dotenv').config();

// Now you can access any variable from the .env file
const apiKey = process.env.GEMINI_API_KEY;
const port = process.env.PORT;
const appName = process.env.APP_NAME;

console.log(`App Name: ${appName}`);
console.log(`Port: ${port}`);

// Never print the full API key! Only show the first few characters
console.log(`API Key starts with: ${apiKey.substring(0, 8)}...`);
console.log('Your API key is safe and hidden from your code!');
