const axios = require('axios');

/**
 * Stage 3b: Behavior Analysis (Neural CDE / custom model)
 *
 * Calls AI_SERVICE_URL/analyze-behavior if configured,
 * otherwise returns deterministic placeholder output.
 */
async function analyzeBehavior(features) {
  const aiUrl = process.env.AI_SERVICE_URL;

  if (aiUrl) {
    try {
      const { data } = await axios.post(`${aiUrl}/analyze-behavior`, { features });
      return {
        behaviorScore: data.behaviorScore,
        patterns: data.patterns || [],
      };
    } catch (err) {
      console.warn('[Pipeline] analyzeBehavior — AI service error, using fallback:', err.message);
    }
  }

  // ── Placeholder ──────────────────────────────────────────────────
  console.log('[Pipeline] analyzeBehavior — using placeholder output');
  return {
    behaviorScore: 30,
    patterns: ['normal_pause_pattern', 'consistent_speech_rate'],
    _placeholder: true,
  };
}

module.exports = analyzeBehavior;
