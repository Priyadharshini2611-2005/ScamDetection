/**
 * Stage 7: Build Final Report
 * Assembles all pipeline outputs into a single report object.
 */
async function buildFinalReport({
  originalFilename,
  audioRef,
  voiceResult,
  behaviorResult,
  contentResult,
  transcriptResult,
  trustResult,
}) {
  const explanation = generateExplanation(voiceResult, behaviorResult, contentResult, trustResult);

  return {
    originalFilename,
    audioRef,
    voiceScore: voiceResult.voiceScore,
    behaviorScore: behaviorResult.behaviorScore,
    contentScore: contentResult.contentScore,
    trustScore: trustResult.trustScore,
    riskLevel: trustResult.riskLevel,
    explanation,
    transcript: transcriptResult.transcript,
    modelVersion: '1.0.0-placeholder',
  };
}

function generateExplanation(voiceResult, behaviorResult, contentResult, trustResult) {
  const parts = [];

  if (trustResult.riskLevel === 'High') {
    parts.push('⚠️ This audio has been flagged as HIGH RISK for potential scam activity.');
  } else if (trustResult.riskLevel === 'Medium') {
    parts.push('⚡ This audio shows MODERATE indicators of potential scam activity.');
  } else {
    parts.push('✅ This audio appears to be LOW RISK with minimal scam indicators.');
  }

  // Voice analysis
  if (voiceResult.voiceScore > 60) {
    parts.push(`Voice analysis detected a high likelihood of AI-generated speech (score: ${voiceResult.voiceScore}/100).`);
  } else if (voiceResult.voiceScore > 30) {
    parts.push(`Voice analysis shows some synthetic speech characteristics (score: ${voiceResult.voiceScore}/100).`);
  } else {
    parts.push(`Voice analysis indicates natural human speech (score: ${voiceResult.voiceScore}/100).`);
  }

  // Behavior analysis
  if (behaviorResult.behaviorScore > 60) {
    parts.push(`Behavior analysis flagged suspicious patterns: ${behaviorResult.patterns.join(', ')}.`);
  } else {
    parts.push(`Behavior patterns appear normal (score: ${behaviorResult.behaviorScore}/100).`);
  }

  // Content analysis
  if (contentResult.flags && contentResult.flags.length > 0) {
    parts.push(`Content analysis detected the following red flags: ${contentResult.flags.join(', ')}.`);
  } else {
    parts.push('No scam-related content patterns were detected in the transcript.');
  }

  return parts.join(' ');
}

module.exports = buildFinalReport;
