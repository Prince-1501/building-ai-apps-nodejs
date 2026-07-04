// prompt-templates.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Reusable prompt templates
const templates = {
  codeReview: (code, language) => `
Review the following ${language} code.
List exactly 3 things: what is good, what can be improved, and any bugs.
Keep each point to one sentence.

Code:
${code}`,

  summarize: (text, maxSentences) => `
Summarize the following text in exactly ${maxSentences} sentences.
Use simple language that a 15-year-old would understand.

Text:
${text}`,

  explain: (concept, audience) => `
Explain ${concept} to ${audience}.
Use one real-world analogy.
Keep the explanation under 100 words.`,
};

async function askAI(prompt) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
}

async function main() {
  // Use the codeReview template
  console.log('=== CODE REVIEW ===');
  console.log(await askAI(templates.codeReview(
    'const data = fetch("https://api.example.com/users");\nconsole.log(data);',
    'JavaScript'
  )));

  console.log('');

  // Use the explain template
  console.log('=== EXPLAIN ===');
  console.log(await askAI(templates.explain(
    'async/await',
    'a complete beginner who has never programmed before'
  )));
}

main();
