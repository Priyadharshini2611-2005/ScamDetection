/**
 * Stage 5: Scam Content Detection
 * Looks for OTP requests, money requests, urgency cues, etc. in the transcript.
 *
 * This is plain keyword/regex matching — no ML model needed for this stage,
 * which keeps the project simple. Add more patterns any time.
 */

const SCAM_PATTERNS = [
  { pattern: /\botp\b/i, flag: 'OTP_REQUEST', weight: 30 },
  { pattern: /\bverif(y|ication)\b.*\b(code|number|otp)\b/i, flag: 'VERIFICATION_REQUEST', weight: 25 },
  { pattern: /\b(send|transfer|pay)\b.*\b(money|funds|amount|payment)\b/i, flag: 'MONEY_REQUEST', weight: 30 },
  { pattern: /\burgent(ly)?\b|\bimmediately\b|\bright\s+now\b/i, flag: 'URGENCY', weight: 20 },
  { pattern: /\b(suspend|block|deactivat|clos)(ed|e|ing)\b.*\baccount\b/i, flag: 'THREAT', weight: 25 },
  { pattern: /\b(bank|credit\s*card|insurance)\b.*\brepresentative\b/i, flag: 'IMPERSONATION', weight: 15 },
  { pattern: /\bsocial\s*security\b|\bssn\b/i, flag: 'SSN_REQUEST', weight: 35 },
  { pattern: /\bpin\b.*\bnumber\b/i, flag: 'PIN_REQUEST', weight: 30 },
  { pattern: /\bgift\s*card\b/i, flag: 'GIFT_CARD_REQUEST', weight: 30 },
  { pattern: /\bwire\s*transfer\b/i, flag: 'WIRE_TRANSFER', weight: 25 },
];

async function detectScamContent(transcript) {
  const flags = [];
  let totalWeight = 0;

  for (const { pattern, flag, weight } of SCAM_PATTERNS) {
    if (pattern.test(transcript)) {
      flags.push(flag);
      totalWeight += weight;
    }
  }

  const contentScore = Math.min(totalWeight, 100);

  return { contentScore, flags };
}

module.exports = detectScamContent;
