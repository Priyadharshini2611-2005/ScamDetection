/**
 * Stage 6: Trust Score & Risk Analysis
 * Fuses voiceScore (3a), behaviorScore (3b), and contentScore (5)
 * into a single trustScore with a riskLevel classification.
 */
async function computeTrustScore(voiceResult, behaviorResult, contentResult) {
  const { voiceScore } = voiceResult;
  const { behaviorScore } = behaviorResult;
  const { contentScore } = contentResult;

  // Weighted average — content is weighted most heavily because
  // keyword-based scam content is the strongest signal available.
  const weights = { voice: 0.25, behavior: 0.25, content: 0.50 };

  const rawScore =
    voiceScore * weights.voice +
    behaviorScore * weights.behavior +
    contentScore * weights.content;

  const trustScore = Math.round(Math.min(Math.max(rawScore, 0), 100));

  let riskLevel;
  if (trustScore >= 70) {
    riskLevel = 'High';
  } else if (trustScore >= 40) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'Low';
  }

  return { trustScore, riskLevel };
}

module.exports = computeTrustScore;
