const Analysis = require('../models/Analysis');
const { runPipeline } = require('../services/pipeline');

/**
 * POST /api/analyze
 * Uploads an audio file, runs the scam-detection pipeline, saves and returns the report.
 */
async function createAnalysis(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'NO_FILE', message: 'An audio file is required.' });
    }

    const report = await runPipeline(req.file.path, req.file.originalname);

    const analysis = await Analysis.create(report);

    res.status(201).json(analysis);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analyze/:id
 * Fetch a single saved report by its ID.
 */
async function getAnalysis(req, res, next) {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Analysis not found.' });
    }
    res.json(analysis);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid analysis ID format.' });
    }
    next(err);
  }
}

/**
 * GET /api/analyze
 * List past analyses (summary fields), most recent first.
 */
async function listAnalyses(_req, res, next) {
  try {
    const analyses = await Analysis.find()
      .select('originalFilename trustScore riskLevel createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Transform _id → id in lean results
    const result = analyses.map(({ _id, ...rest }) => ({ id: _id, ...rest }));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { createAnalysis, getAnalysis, listAnalyses };
