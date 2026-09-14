"""
Stage 3a: AI Voice Detection (placeholder for "Mamba + Classifier")

This is a SIMPLE, explainable heuristic classifier — not a trained deep
model. It looks at signal properties that tend to differ between natural
human speech and many TTS / voice-cloning systems:

  - Human pitch tends to vary more (natural intonation) -> higher pitch std.
  - Human energy/loudness varies more (breathing, emphasis) -> higher energy std.
  - Very "flat"/uniform MFCC vectors can indicate synthetic, smoothed speech.

Swap this out later for a real trained model (e.g. a Mamba/SSM or CNN
classifier trained on real vs. AI-voice datasets like ASVspoof) — the
extract_features() output is already shaped to be a model's input vector.
"""

import numpy as np


def detect_ai_voice(features: dict) -> dict:
    pitch_std = features.get("pitch", {}).get("std", 0) or 0
    energy_std = features.get("energy", {}).get("std", 0) or 0
    mfcc = features.get("mfcc", [0] * 13)
    mfcc_var = float(np.var(mfcc)) if len(mfcc) else 0.0

    score = 0

    # Low pitch variation => more likely synthetic
    if pitch_std < 15:
        score += 40
    elif pitch_std < 30:
        score += 15

    # Low energy variation => more likely synthetic / robotic
    if energy_std < 0.03:
        score += 30
    elif energy_std < 0.06:
        score += 10

    # Very low MFCC variance => unusually smooth spectral envelope
    if mfcc_var < 5:
        score += 20
    elif mfcc_var < 15:
        score += 5

    voice_score = int(min(max(score, 0), 100))
    is_ai_generated = voice_score >= 50
    confidence = round(0.5 + abs(voice_score - 50) / 100, 2)

    return {
        "voiceScore": voice_score,
        "isAiGenerated": is_ai_generated,
        "confidence": confidence,
    }
