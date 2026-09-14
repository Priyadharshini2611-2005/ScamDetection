const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const errorHandler = require('./middleware/errorHandler');
const analyzeRoutes = require('./routes/analyzeRoutes');

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  })
);

// Body parsing
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'voice-scam-guard' });
});

// Routes
app.use('/api/analyze', analyzeRoutes);

// Centralized error handling (must be after routes)
app.use(errorHandler);

module.exports = app;
