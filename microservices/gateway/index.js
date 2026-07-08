const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4000';

app.use(express.json());

// GET /
app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/stats`);
    res.json({
      service: "nodejs-gateway",
      status: "running",
      message: "Gateway is working",
      analytics: response.data
    });
  } catch (error) {
    res.json({
      service: "nodejs-gateway",
      status: "running",
      message: "Gateway is working, but analytics service is unreachable",
      analytics: {
        error: error.message
      }
    });
  }
});

// GET /health
app.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/health`);
    res.json({
      service: "nodejs-gateway",
      status: "running",
      dependencies: {
        analytics: response.data
      }
    });
  } catch (error) {
    res.json({
      service: "nodejs-gateway",
      status: "running",
      dependencies: {
        analytics: {
          status: "down",
          error: error.message
        }
      }
    });
  }
});

// GET /analytics
app.get('/analytics', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/stats`);
    res.json(response.data);
  } catch (error) {
    res.status(502).json({
      error: "Bad Gateway",
      message: "Could not reach analytics service",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
  console.log(`Targeting Analytics Service at: ${ANALYTICS_SERVICE_URL}`);
});
