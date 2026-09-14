"""
Stage 3b: Behavior Analysis (placeholder for "Neural CDE" model)

Looks at speaking-pattern features — speech rate and energy variation — to
flag caller behavior often seen in scam calls: rushed/pressured delivery,
or an unnaturally flat, "script-reading" cadence.

Swap this out later for a real sequence model (e.g. a Neural CDE / RNN
trained on labeled call recordings) — it would consume a time-series of
frame-level features instead of these summary stats.
"""


def analyze_behavior(features: dict) -> dict:
    speech_rate = features.get("speechRate", 0) or 0
    energy_std = features.get("energy", {}).get("std", 0) or 0
    duration = features.get("duration", 0) or 0

    score = 0
    patterns = []

    if speech_rate > 4.5:
        score += 35
        patterns.append("rushed_speech")
    elif speech_rate < 1.0 and duration > 3:
        score += 15
        patterns.append("unusually_slow_speech")
    else:
        patterns.append("consistent_speech_rate")

    if energy_std < 0.02:
        score += 25
        patterns.append("monotone_script_like_delivery")
    else:
        patterns.append("normal_pause_pattern")

    behavior_score = int(min(max(score, 0), 100))

    return {
        "behaviorScore": behavior_score,
        "patterns": patterns,
    }
