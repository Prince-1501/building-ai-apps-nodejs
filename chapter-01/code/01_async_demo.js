// async-demo.js
// Demonstrates async/await - the foundation of every AI API call

// This function pretends to be an AI API call
// It waits for 2 seconds and then returns a response
function simulateAICall(prompt) {
  return new Promise((resolve) => {
    console.log('Sending your prompt to AI...');
    setTimeout(() => {
      resolve(`AI says: I received your prompt - "${prompt}"`);
    }, 2000);
  });
}

// The main function uses async/await
async function main() {
  console.log('Starting the program...');

  // The await keyword pauses HERE until the AI responds
  const response = await simulateAICall('What is Node.js?');

  console.log(response);
  console.log('Program finished!');
}

main();
