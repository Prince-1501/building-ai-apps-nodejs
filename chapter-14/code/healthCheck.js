// healthCheck.js
// Add this middleware to any Express.js project before deployment

function addHealthCheck(app) {
  const startTime = Date.now();

  app.get('/health', (req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    res.json({
      status: 'ok',
      uptime: uptime + ' seconds',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });
}

module.exports = { addHealthCheck };
