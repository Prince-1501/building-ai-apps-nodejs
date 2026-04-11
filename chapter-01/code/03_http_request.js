// http-request.js
// Demonstrates making HTTP GET requests with fetch

async function fetchRandomJoke() {
  try {
    // Step 1: Send the request
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');

    // Step 2: Convert the response to JSON format
    const data = await response.json();

    // Step 3: Use the data
    console.log('Here is a joke for you:');
    console.log(`Setup: ${data.setup}`);
    console.log(`Punchline: ${data.punchline}`);
  } catch (error) {
    console.error('Failed to fetch joke:', error.message);
  }
}

fetchRandomJoke();
