# Voice Scam Guard — Simple MERN + AI/ML Scam Detection Project

This matches your pipeline diagram:

```
Audio → Preprocessing → Feature Extraction → [AI Voice Detection | Behavior Analysis]
      → Speech-to-Text → Scam Content Detection → Trust Score → Final Report
```

## Why your original zip "didn't work"

The `backend/` you had was a complete, correctly-wired Express + MongoDB API —
but **every AI/ML stage was a hardcoded placeholder** (`detectAiVoice`,
`analyzeBehavior`, `transcribeSpeech` always returned the same fake numbers),
and there was **no `ml-service/` and no `frontend/`** in the zip at all — so
there was nothing to actually record real analysis or let you use it from a
browser.

## What was added / fixed

1. **`ml-service/`** (new, Python + Flask) — the real AI/ML brain:
   - `features.py` — real audio features via `librosa` (MFCC, pitch, energy, speech rate)
   - `voice_detector.py` — simple, explainable heuristic "AI voice" classifier (stands in for the diagram's "Mamba + Classifier"; swap in a trained model later)
   - `behavior_analyzer.py` — simple heuristic behavior/pattern flags (stands in for "Neural CDE")
   - `transcriber.py` — real speech-to-text (Google Web Speech via `SpeechRecognition`; swap-in instructions for real OpenAI Whisper included in the file)
   - `app.py` — Flask server exposing `/extract-features`, `/detect-voice`, `/analyze-behavior`, `/transcribe`

2. **`backend/`** (fixed):
   - `services/pipeline/extractFeatures.js` now actually calls the ML service instead of always returning mock data
   - `services/pipeline/preprocessAudio.js` now resolves an **absolute** file path (the ML service is a separate process, so a relative path would resolve wrong)
   - `services/pipeline/detectScamContent.js` simplified to a clean keyword/regex detector (no ML needed for this stage — kept simple on purpose)
   - `.env` now points `AI_SERVICE_URL` at the ML service (`http://localhost:8000`) and sets `CORS_ORIGIN` for the new frontend

3. **`frontend/`** (new, React + Vite) — a one-page UI: upload an audio file, see the trust score, risk level, sub-scores, explanation, and transcript.

I tested `ml-service` and the `backend` pipeline directly (not through the UI, since I don't have MongoDB in this environment) and confirmed the ML service returns real feature/score data and the backend pipeline consumes it correctly end-to-end.

## How it fits together (MERN + AI/ML)

```
React (frontend, :5173) → Express/Node (backend, :5000) → MongoDB
                                     │
                                     ▼
                     Python Flask ML service (:8000)
                     [librosa features, heuristic classifiers, speech-to-text]
```

## Running it locally

You need 3 things running at once: MongoDB, the Python ML service, and the Node backend — then the React frontend.

### 1. MongoDB
Install MongoDB Community Server and make sure it's running on `localhost:27017`
(or use a free MongoDB Atlas cluster and put its connection string in `backend/.env` as `MONGO_URI`).

### 2. ML service (Python)
```bash
cd ml-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Runs on `http://localhost:8000`. Check it with `curl http://localhost:8000/health`.

> Note: `SpeechRecognition`'s Google Web Speech backend needs internet access and works best on short, clear clips. For an offline/more-accurate transcriber, install `openai-whisper` and swap the body of `transcribe()` in `ml-service/transcriber.py` (instructions are in that file).

### 3. Backend (Node/Express)
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:5000`. Check it with `curl http://localhost:5000/api/health`.

### 4. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`, upload an audio file (wav/mp3/m4a/etc.), click **Analyze Call**.

## API

`POST /api/analyze` — multipart form, field name `audio` — returns the full report.
`GET /api/analyze` — list past analyses.
`GET /api/analyze/:id` — fetch one report.

## Where this is intentionally simple (and how to level it up later)

- **AI voice detection / behavior analysis** are rule-based heuristics on top of real signal-processing features, not trained neural networks. To go further: collect a labeled dataset (real vs. AI-generated voices), extract the same features, and train a real classifier (e.g. scikit-learn `RandomForestClassifier` to start, or a small neural net / Mamba block later) in place of `voice_detector.py` / `behavior_analyzer.py`.
- **Speech-to-text** uses the free Google Web API for simplicity; swap to local Whisper for offline/robust use (see note above).
- **Scam content detection** uses keyword/regex matching, which is honestly a fine, explainable approach for this stage — you could upgrade it to a small text classifier (e.g. TF-IDF + Logistic Regression) trained on labeled scam/non-scam transcripts if you want an ML component here too.
