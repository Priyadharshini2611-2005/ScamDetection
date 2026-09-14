const axios = require('axios');

/**
 * Stage 3a: AI Voice Detection (Mamba + Classifier)
 *
 * Calls AI_SERVICE_URL/detect-voice if configured,
 * otherwise returns deterministic placeholder output.
 */
async function detectAiVoice(features) {
  const aiUrl = process.env.AI_SERVICE_URL;

  if (aiUrl) {
    try {
      const { data } = await axios.post(`${aiUrl}/detect-voice`, { features });
      return {
        voiceScore: data.voiceScore,
        isAiGenerated: data.isAiGenerated,
        confidence: data.confidence || null,
      };
    } catch (err) {
      console.warn('[Pipeline] detectAiVoice — AI service error, using fallback:', err.message);
    }
  }

  // ── Placeholder ──────────────────────────────────────────────────
  console.log('[Pipeline] detectAiVoice — using placeholder output');
  return {
    voiceScore: 25, // 0 = definitely human, 100 = definitely AI
    isAiGenerated: false,
    confidence: 0.75,
    _placeholder: true,
  };
}

module.exports = detectAiVoice;
