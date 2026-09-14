const preprocessAudio = require('./preprocessAudio');
const extractFeatures = require('./extractFeatures');
const detectAiVoice = require('./detectAiVoice');
const analyzeBehavior = require('./analyzeBehavior');
const transcribeSpeech = require('./transcribeSpeech');
const detectScamContent = require('./detectScamContent');
const computeTrustScore = require('./computeTrustScore');
const buildFinalReport = require('./buildFinalReport');

/**
 * Orchestrates the full scam-detection pipeline.
 *
 * Pipeline order:
 *  1. preprocessAudio
 *  2. extractFeatures
 *  3a. detectAiVoice  ⎫  parallel
 *  3b. analyzeBehavior ⎭
 *  4. transcribeSpeech
 *  5. detectScamContent
 *  6. computeTrustScore (fuses 3a, 3b, 5)
 *  7. buildFinalReport
 */
async function runPipeline(filePath, originalFilename) {
  // 1. Preprocess
  const { processedFilePath } = await preprocessAudio(filePath);

  // 2. Extract features
  const features = await extractFeatures(processedFilePath);

  // 3a & 3b — run in parallel
  const [voiceResult, behaviorResult] = await Promise.all([
    detectAiVoice(features),
    analyzeBehavior(features),
  ]);

  // 4. Transcribe
  const transcriptResult = await transcribeSpeech(processedFilePath);

  // 5. Scam content detection on transcript
  const contentResult = await detectScamContent(transcriptResult.transcript);

  // 6. Compute trust score
  const trustResult = await computeTrustScore(voiceResult, behaviorResult, contentResult);

  // 7. Build final report
  const report = await buildFinalReport({
    originalFilename,
    audioRef: filePath,
    voiceResult,
    behaviorResult,
    contentResult,
    transcriptResult,
    trustResult,
  });

  return report;
}

module.exports = {
  runPipeline,
  // Export individual stages for unit testing / direct use
  preprocessAudio,
  extractFeatures,
  detectAiVoice,
  analyzeBehavior,
  transcribeSpeech,
  detectScamContent,
  computeTrustScore,
  buildFinalReport,
};
