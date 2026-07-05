// 03_cost_calculator.js
// No API key needed — this is pure math

function calculateRAGCost(config) {
  const {
    users, queriesPerUserPerDay, avgInputTokens,
    avgOutputTokens, inputPricePerMillion,
    outputPricePerMillion, daysPerMonth,
  } = config;

  const totalQueries = users * queriesPerUserPerDay * daysPerMonth;
  const totalInputTokens = totalQueries * avgInputTokens;
  const totalOutputTokens = totalQueries * avgOutputTokens;

  const inputCost = (totalInputTokens / 1000000) * inputPricePerMillion;
  const outputCost = (totalOutputTokens / 1000000) * outputPricePerMillion;
  const totalCost = inputCost + outputCost;

  return {
    totalQueries,
    totalInputTokens,
    totalOutputTokens,
    inputCost: '$' + inputCost.toFixed(2),
    outputCost: '$' + outputCost.toFixed(2),
    totalCost: '$' + totalCost.toFixed(2),
    costPerUser: '$' + (totalCost / users).toFixed(4),
    costPerQuery: '$' + (totalCost / totalQueries).toFixed(6),
  };
}

// Scenario 1: Gemini 2.5 Flash
console.log('=== Scenario 1: Gemini 2.5 Flash ===');
const flash = calculateRAGCost({
  users: 1000,
  queriesPerUserPerDay: 5,
  avgInputTokens: 2000,
  avgOutputTokens: 500,
  inputPricePerMillion: 0.30,
  outputPricePerMillion: 2.50,
  daysPerMonth: 30,
});
console.log(flash);

// Scenario 2: Gemini 2.5 Flash-Lite (cheapest)
console.log('\n=== Scenario 2: Gemini 2.5 Flash-Lite ===');
const lite = calculateRAGCost({
  users: 1000,
  queriesPerUserPerDay: 5,
  avgInputTokens: 2000,
  avgOutputTokens: 500,
  inputPricePerMillion: 0.10,
  outputPricePerMillion: 0.40,
  daysPerMonth: 30,
});
console.log(lite);

// Comparison
console.log('\n=== Cost Comparison ===');
console.log('Flash monthly:      ' + flash.totalCost);
console.log('Flash-Lite monthly: ' + lite.totalCost);
const savings = parseFloat(flash.totalCost.replace('$','')) - parseFloat(lite.totalCost.replace('$',''));
console.log('Savings:            $' + savings.toFixed(2));
