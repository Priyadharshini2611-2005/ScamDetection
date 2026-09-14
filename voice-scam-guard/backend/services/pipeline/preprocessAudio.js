const path = require('path');

/**
 * Stage 1: Audio Preprocessing (Noise Removal & Voice Enhancement)
 *
 * PLACEHOLDER — no actual noise removal/enhancement is applied here.
 * Replace with a real implementation (e.g. FFmpeg noise gate, RNNoise,
 * or a call to a Python pre-processing microservice) if you need it.
 *
 * It DOES resolve the path to an absolute path, because later stages send
 * this path to the separate Python ML service (services/pipeline/*.js ->
 * AI_SERVICE_URL) — a relative path would resolve against the wrong
 * process's working directory there.
 */
async function preprocessAudio(filePath) {
  console.log(`[Pipeline] preprocessAudio — processing ${filePath}`);
  return { processedFilePath: path.resolve(filePath) };
}

module.exports = preprocessAudio;
