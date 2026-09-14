"""
Stage 4: Speech-to-Text (Whisper in the diagram)

For a SIMPLE project this uses the `SpeechRecognition` library with Google's
free Web Speech API (no API key, needs internet, fine for short clips/demos).

To use real OpenAI Whisper instead (offline, more accurate, heavier):
    pip install -U openai-whisper
    import whisper
    model = whisper.load_model("base")
    result = model.transcribe(file_path)
    return result["text"]
Then just swap the body of transcribe() below.
"""

import speech_recognition as sr
from pydub import AudioSegment
import os
import tempfile


def _to_wav(file_path: str) -> str:
    """Convert any supported audio format to a 16kHz mono WAV for recognition."""
    if file_path.lower().endswith(".wav"):
        return file_path

    audio = AudioSegment.from_file(file_path)
    audio = audio.set_frame_rate(16000).set_channels(1)
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    audio.export(tmp.name, format="wav")
    return tmp.name


def transcribe(file_path: str) -> dict:
    recognizer = sr.Recognizer()
    wav_path = _to_wav(file_path)

    try:
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)
        return {"transcript": text, "language": "en"}
    except sr.UnknownValueError:
        return {"transcript": "", "language": "en"}
    except sr.RequestError as e:
        # No internet / API unreachable
        return {"transcript": "", "language": "en", "error": f"STT service error: {e}"}
    finally:
        if wav_path != file_path and os.path.exists(wav_path):
            os.remove(wav_path)
