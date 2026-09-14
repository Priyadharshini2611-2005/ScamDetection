"""
Stage 2: Feature Extraction (MFCC, Pitch, Energy, Speech Rate)

Uses librosa to compute real signal-processing features from an audio file.
These are classic, lightweight features (no GPU / deep model needed), which
is why this whole service can run on a laptop for a student project.
"""

import numpy as np
import librosa


def extract_features(file_path: str) -> dict:
    # Load audio, resample to 16kHz mono (standard for speech)
    y, sr = librosa.load(file_path, sr=16000, mono=True)

    duration = float(librosa.get_duration(y=y, sr=sr))

    # --- MFCC (13 coefficients, averaged over time) ---
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = mfcc.mean(axis=1).tolist()

    # --- Pitch (fundamental frequency) via YIN ---
    try:
        f0 = librosa.yin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        f0 = f0[np.isfinite(f0)]
        f0 = f0[f0 > 0]
        pitch_mean = float(np.mean(f0)) if len(f0) else 0.0
        pitch_std = float(np.std(f0)) if len(f0) else 0.0
    except Exception:
        pitch_mean, pitch_std = 0.0, 0.0

    # --- Energy (RMS) ---
    rms = librosa.feature.rms(y=y)[0]
    energy_mean = float(np.mean(rms))
    energy_std = float(np.std(rms))

    # --- Speech rate (rough proxy): onset events per second ---
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
    speech_rate = float(len(onsets) / duration) if duration > 0 else 0.0

    return {
        "mfcc": mfcc_mean,
        "pitch": {"mean": round(pitch_mean, 2), "std": round(pitch_std, 2)},
        "energy": {"mean": round(energy_mean, 4), "std": round(energy_std, 4)},
        "speechRate": round(speech_rate, 2),
        "duration": round(duration, 2),
    }
