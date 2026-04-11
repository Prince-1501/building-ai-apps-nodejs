// post-request.js
// Demonstrates making HTTP POST requests - same pattern used for AI APIs

async function sendPostRequest() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'My first AI app',
        body: 'Learning to build AI apps with Node.js',
        userId: 1,
      }),
    });

    const data = await response.json();
    console.log('Server responded with:', data);
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

sendPostRequest();
