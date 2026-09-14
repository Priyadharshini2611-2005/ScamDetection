const axios = require('axios');

/**
 * Stage 4: Speech-to-Text (Whisper)
 *
 * Calls AI_SERVICE_URL/transcribe if configured,
 * otherwise returns a placeholder transcript.
 */
async function transcribeSpeech(filePath) {
  const aiUrl = process.env.AI_SERVICE_URL;

  if (aiUrl) {
    try {
      const { data } = await axios.post(`${aiUrl}/transcribe`, { filePath });
      return {
        transcript: data.transcript,
        language: data.language || 'en',
      };
    } catch (err) {
      console.warn('[Pipeline] transcribeSpeech — AI service error, using fallback:', err.message);
    }
  }

  // ── Placeholder ──────────────────────────────────────────────────
  console.log('[Pipeline] transcribeSpeech — using placeholder output');
  return {
    transcript:
      'Hello, this is a representative from your bank. We have detected suspicious activity on your account. ' +
      'Please provide your OTP to verify your identity. This is urgent and your account may be suspended if you do not comply immediately.',
    language: 'en',
    _placeholder: true,
  };
}

module.exports = transcribeSpeech;
