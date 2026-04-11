// async-error-handling.js
// Demonstrates try/catch with async/await - essential for AI API calls

function simulateAICall(prompt) {
  return new Promise((resolve, reject) => {
    console.log('Sending your prompt to AI...');
    setTimeout(() => {
      // Simulate a random failure (50% chance)
      const isSuccess = Math.random() > 0.5;
      if (isSuccess) {
        resolve(`AI says: Here is my response to "${prompt}"`);
      } else {
        reject(new Error('AI service is temporarily unavailable'));
      }
    }, 2000);
  });
}

async function main() {
  try {
    const response = await simulateAICall('Explain Node.js');
    console.log(response);
  } catch (error) {
    console.error('Something went wrong:', error.message);
    console.log('Tip: Check your internet connection or API key');
  }
}

main();
