import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function riskColor(riskLevel = 'Low') {
  const normalized = String(riskLevel || 'Low').toLowerCase();
  if (normalized === 'high' || normalized === 'critical') return '#ff6b6b';
  if (normalized === 'medium') return '#f6ad55';
  return '#22c55e';
}

function riskClassName(riskLevel = 'Low') {
  const normalized = String(riskLevel || 'Low').toLowerCase();
  if (normalized === 'high' || normalized === 'critical') return 'risk-high';
  if (normalized === 'medium') return 'risk-medium';
  return 'risk-low';
}

function formatScore(value) {
  return typeof value === 'number' ? Math.round(value) : 0;
}

function ScoreBar({ label, value }) {
  const score = formatScore(value);
  return (
    <div className="score-bar">
      <div className="score-meta">
        <span>{label}</span>
        <span>{score}/100</span>
      </div>
      <div className="score-track">
        <div className="score-fill" style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      setError('Please choose an audio file first.');
      return;
    }

    if (!file.type.startsWith('audio/')) {
      setError('Please upload a valid audio file.');
      return;
    }

    setError('');
    setReport(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Analysis failed.');
      }

      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function onFileChange(inputFile) {
    const selected = inputFile?.files?.[0] || null;
    if (selected && selected.type.startsWith('audio/')) {
      setFile(selected);
      setError('');
      return;
    }

    setError('Only audio files are supported.');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🛡️</span>
          <span className="brand-title">Voice Scam Guard</span>
        </div>

        <nav className="side-nav">
          <div className="nav-label">Workspace</div>
          <a className="nav-link active" href="#">
            <span className="nav-icon">✦</span>
            <span>Call Analysis</span>
          </a>
          <a className="nav-link" href="#">
            <span className="nav-icon">◌</span>
            <span>Signal Monitor</span>
          </a>
          <a className="nav-link" href="#">
            <span className="nav-icon">☰</span>
            <span>Case History</span>
          </a>
          <a className="nav-link" href="#">
            <span className="nav-icon">⚙</span>
            <span>Detection Rules</span>
          </a>
        </nav>

        <div className="sidebar-card">
          <span className="mini-label">Current Mode</span>
          <span className="mode-status">
            <span className="pulse-dot"></span>
            Active Scan
          </span>
        </div>
      </aside>

      <main className="main-panel">
        <section className="topbar">
          <div>
            <div className="section-kicker">Voice Intelligence</div>
            <h1>Scam Detection Console</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button">Export</button>
            <button className="primary-button small-button">+ New Analysis</button>
          </div>
        </section>

        <section className="analysis-grid">
          <section className="upload-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">01 / Intake</span>
                <h2>Upload Recording</h2>
              </div>
              <span className="status-chip">Ready</span>
            </div>

            <form className="scan-form" onSubmit={handleSubmit}>
              <label
                className={`dropzone ${dragActive ? 'active' : ''}`}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) {
                    if (droppedFile.type.startsWith('audio/')) {
                      setFile(droppedFile);
                      setError('');
                    } else {
                      setError('Only audio files are supported.');
                    }
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
              >
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => onFileChange(e.target)}
                />
                <div className="drop-content">
                  <span className="drop-icon">🎙️</span>
                  <span className="drop-title">
                    {file ? file.name : 'Drop audio file here'}
                  </span>
                  <span className="drop-subtitle">
                    or browse from your device
                  </span>
                </div>
              </label>

              <div className="file-details">
                <div>
                  <span className="detail-label">Selected file</span>
                  <span className="detail-value">{file ? file.name : 'No file selected'}</span>
                </div>
                <div>
                  <span className="detail-label">Size</span>
                  <span className="detail-value">{file ? `${Math.round(file.size / 1024)} KB` : '--'}</span>
                </div>
                <button type="button" className="clear-button" onClick={() => setFile(null)}>
                  Clear
                </button>
              </div>

              {error && <div className="error-box">{error}</div>}

              <div className="action-row">
                <button className="primary-button" disabled={loading || !file}>
                  {loading ? 'Analyzing…' : 'Analyze Call'}
                </button>
                <button type="button" className="ghost-button">
                  Run Quick Check
                </button>
              </div>
            </form>
          </section>

          <section className="risk-card">
            <div className="risk-card-header">
              <div>
                <span className="section-kicker">Risk Signal</span>
                <div className="risk-title">
                  {report ? report.riskLevel || 'Unknown' : 'Awaiting Analysis'}
                </div>
              </div>
              <span className={`risk-badge ${report ? riskClassName(report.riskLevel) : ''}`}> 
                {report ? report.riskLevel || 'Unknown' : '—'}
              </span>
            </div>

            <div className="score-display">
              <span className="score-number">
                {report ? formatScore(report.trustScore) : '—'}
              </span>
              <span className="score-unit">/100</span>
            </div>

            <div className="scan-wave">
              <span></span><span></span><span></span><span></span><span></span><span></span>
            </div>

            <div className="risk-summary">
              <div>
                <span className="summary-label">AI Voice</span>
                <span className="summary-value">{report ? formatScore(report.voiceScore) : '--'}</span>
              </div>
              <div>
                <span className="summary-label">Behavior</span>
                <span className="summary-value">{report ? formatScore(report.behaviorScore) : '--'}</span>
              </div>
              <div>
                <span className="summary-label">Content</span>
                <span className="summary-value">{report ? formatScore(report.contentScore) : '--'}</span>
              </div>
            </div>

            <div className="signal-grid">
              <div>
                <span className="signal-label">Signal Strength</span>
                <span className="signal-bars">
                  <span className="bar active"></span><span className="bar active"></span><span className="bar active"></span><span className="bar"></span>
                </span>
              </div>
              <div>
                <span className="signal-label">Status</span>
                <span className="signal-status">
                  {loading ? 'Analyzing' : report ? 'Complete' : 'Idle'}
                </span>
              </div>
            </div>
          </section>
        </section>

        {report && (
          <section className="report-panel">
            <section className="report-header">
              <div>
                <span className="section-kicker">02 / Report</span>
                <h2>Assessment Summary</h2>
              </div>
              <span className="report-date">{new Date().toLocaleDateString()}</span>
            </section>

            <section className="report-grid">
              <article className="report-card score-card">
                <div className="report-card-title">Trust & Scam Score</div>
                <div className="report-score-row">
                  <span className="big-score">{formatScore(report.trustScore)}</span>
                  <span className="big-score-unit">/100</span>
                </div>
                <div className="score-bars">
                  <ScoreBar label="AI Voice" value={report.voiceScore} />
                  <ScoreBar label="Behavior" value={report.behaviorScore} />
                  <ScoreBar label="Scam Content" value={report.contentScore} />
                </div>
              </article>

              <article className="report-card">
                <div className="report-card-title">Explanation</div>
                <p className="explanation-text">{report.explanation}</p>
              </article>

              <article className="report-card transcript-card">
                <div className="report-card-title">Transcript</div>
                <div className="transcript-text">
                  {report.transcript || 'Transcript not available for this analysis.'}
                </div>
              </article>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}
