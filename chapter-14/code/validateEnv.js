// validateEnv.js
// Add this to any project from Chapters 11-13 before deployment

function validateEnv(requiredVars) {
  const missing = [];

  for (const varName of requiredVars) {
    if (!process.env[varName] || process.env[varName].trim() === '') {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach((v) => console.error('  - ' + v));
    console.error(
      '\nCopy .env.example to .env and fill in the values.'
    );
    process.exit(1);
  }

  console.log('Environment variables validated successfully');
}

// Example usage for the AI Document Assistant (Chapter 11)
validateEnv(['GEMINI_API_KEY', 'PINECONE_API_KEY']);

module.exports = { validateEnv };
