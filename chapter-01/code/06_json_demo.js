// json-demo.js
// Demonstrates JSON.stringify and JSON.parse - the language of AI APIs

// Creating a JavaScript object (this is what we build in code)
const aiRequest = {
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'What is Node.js?' }
  ],
  temperature: 0.7
};

// Convert object to JSON string (for sending to an API)
const jsonString = JSON.stringify(aiRequest, null, 2);
console.log('JSON String (what we send to the API):');
console.log(jsonString);

console.log('---');

// Convert JSON string back to object (for reading API responses)
const parsedObject = JSON.parse(jsonString);
console.log('Parsed Object (what we work with in code):');
console.log('Model:', parsedObject.model);
console.log('User message:', parsedObject.messages[0].content);
