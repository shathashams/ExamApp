const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// GET /health
app.get('/health', (req, res) => {
  res.json({
    status: 'running',
    service: 'analytics-service',
    timestamp: new Date().toISOString()
  });
});

// GET /stats
app.get('/stats', (req, res) => {
  res.json({
    service: 'analytics-service',
    status: 'running',
    totalExams: 5,
    totalStudents: 7
  });
});

app.listen(PORT, () => {
  console.log(`Analytics Service running internally on port ${PORT}`);
});
