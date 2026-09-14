const axios = require('axios');

/**
 * Stage 2: Feature Extraction (MFCC, Pitch, Energy, Speech Rate)
 *
 * Calls the Python ML service (AI_SERVICE_URL/extract-features), which uses
 * librosa to compute real audio features. Falls back to mock features if
 * the ML service is not running, so the rest of the pipeline never breaks.
 */
async function extractFeatures(filePath) {
  const aiUrl = process.env.AI_SERVICE_URL;

  if (aiUrl) {
    try {
      const { data } = await axios.post(`${aiUrl}/extract-features`, { filePath });
      return { ...data, _placeholder: false };
    } catch (err) {
      console.warn('[Pipeline] extractFeatures — AI service error, using fallback:', err.message);
    }
  }

  // ── Placeholder (used only if the ML service is unreachable) ───────
  console.log('[Pipeline] extractFeatures — using placeholder output');
  return {
    mfcc: Array.from({ length: 13 }, (_, i) => Math.sin(i) * 10),
    pitch: { mean: 165.3, std: 22.1 },
    energy: { mean: 0.42, std: 0.08 },
    speechRate: 3.2, // syllables per second
    duration: 12.5,  // seconds
    _placeholder: true,
  };
}

module.exports = extractFeatures;
