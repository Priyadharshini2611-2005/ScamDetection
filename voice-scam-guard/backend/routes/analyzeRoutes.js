const express = require('express');
const upload = require('../middleware/upload');
const {
  createAnalysis,
  getAnalysis,
  listAnalyses,
} = require('../controllers/analyzeController');

const router = express.Router();

// POST /api/analyze — upload + analyze
// Wrap multer in a manual call so its errors go through next()
router.post('/', (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err) return next(err);
    createAnalysis(req, res, next);
  });
});

// GET  /api/analyze — list past analyses
router.get('/', listAnalyses);

// GET  /api/analyze/:id — fetch single report
router.get('/:id', getAnalysis);

module.exports = router;
