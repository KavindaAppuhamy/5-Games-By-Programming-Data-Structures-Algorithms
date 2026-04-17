import React, { useState } from 'react'
import GameBoard from './GameBoard'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Rajdhani:wght@500;600;700&display=swap');

  .play-root {
    min-height: 100vh;
    background: #040a14;
    background-image:
      radial-gradient(ellipse 60% 40% at 20% 0%, rgba(0,80,200,0.07) 0%, transparent 60%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,80,200,0.035) 39px, rgba(0,80,200,0.035) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,80,200,0.025) 39px, rgba(0,80,200,0.025) 40px);
    padding: 1rem;
    font-family: 'Space Mono', monospace;
  }
  .play-inner { max-width: 1200px; margin: 0 auto; }

  .play-topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.5rem;
    background: rgba(6,14,28,0.85);
    border: 1px solid rgba(0,120,255,0.15);
    border-radius: 12px;
    padding: 12px 20px;
    position: relative; overflow: hidden;
  }
  .play-topbar::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,180,255,0.3), transparent);
  }
  .topbar-left { display: flex; align-items: center; gap: 12px; }
  .topbar-avatar {
    width: 38px; height: 38px; border-radius: 8px;
    background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3);
    display: flex; align-items: center; justify-content: center; font-size: 18px;
  }
  .topbar-name { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 600; color: #c8e0f0; }
  .topbar-sub  { font-size: 10px; color: #2a5070; letter-spacing: 0.08em; margin-top: 1px; }

  .topbar-right { display: flex; align-items: center; gap: 20px; }
  .timer-box { text-align: right; }
  .timer-label { font-size: 9px; letter-spacing: 0.2em; color: #2a5070; text-transform: uppercase; }
  .timer-val { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; line-height: 1; }
  .timer-green  { color: #00ff88; text-shadow: 0 0 12px rgba(0,255,136,0.4); }
  .timer-yellow { color: #ffcc00; text-shadow: 0 0 12px rgba(255,200,0,0.4); }
  .timer-red    { color: #ff3355; text-shadow: 0 0 12px rgba(255,51,85,0.4); }

  .algo-tags { display: flex; gap: 8px; }
  .algo-tag {
    padding: 5px 10px; border-radius: 6px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  }
  .algo-bfs  { background: rgba(0,200,255,0.08); border: 1px solid rgba(0,200,255,0.25); color: #00ccff; }
  .algo-dijk { background: rgba(160,80,255,0.08); border: 1px solid rgba(160,80,255,0.25); color: #a050ff; }

  .play-layout { display: grid; grid-template-columns: 3fr 2fr; gap: 1.5rem; }
  @media (max-width: 900px) { .play-layout { grid-template-columns: 1fr; } }

  .panel {
    background: rgba(6,14,28,0.85);
    border: 1px solid rgba(0,120,255,0.15);
    border-radius: 16px;
    padding: 1.25rem;
    position: relative; overflow: hidden;
  }
  .panel::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,180,255,0.2), transparent);
  }
  .panel-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #4a7090; letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 1rem;
    display: flex; align-items: center; gap: 8px;
  }
  .panel-title-dot { width: 6px; height: 6px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 6px rgba(0,255,136,0.6); }

  .question-card {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(0,120,200,0.2);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }
  .question-sup { font-size: 9px; letter-spacing: 0.2em; color: #2a5070; text-transform: uppercase; margin-bottom: 8px; }
  .question-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 20px; font-weight: 600; color: #c8e0f0; line-height: 1.35;
  }
  .question-text .q-accent { color: #00ff88; text-shadow: 0 0 10px rgba(0,255,136,0.3); }
  .question-hint { font-size: 12px; color: #2a5070; margin-top: 8px; line-height: 1.5; }

  .choices-card {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(0,120,200,0.2);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }
  .choices-sup { font-size: 9px; letter-spacing: 0.2em; color: #2a5070; text-transform: uppercase; margin-bottom: 10px; }
  .choice-btn {
    width: 100%; padding: 12px 16px;
    border-radius: 10px;
    display: flex; align-items: center; gap: 14px;
    cursor: pointer; transition: all 0.15s;
    margin-bottom: 8px; text-align: left;
    font-family: 'Space Mono', monospace;
    font-size: 13px; font-weight: 700;
  }
  .choice-btn:last-child { margin-bottom: 0; }
  .choice-btn.idle {
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(0,80,160,0.25);
    color: #5a7a90;
  }
  .choice-btn.idle:hover:not(:disabled) {
    border-color: rgba(0,160,255,0.35); color: #90c0d8;
    background: rgba(0,80,160,0.08);
  }
  .choice-btn.selected {
    background: rgba(0,255,136,0.08);
    border: 1px solid rgba(0,255,136,0.45);
    color: #00ff88;
    box-shadow: 0 0 12px rgba(0,255,136,0.1);
  }
  .choice-btn:disabled { cursor: not-allowed; }
  .choice-letter {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; flex-shrink: 0; transition: all 0.15s;
  }
  .choice-letter.idle   { border: 1.5px solid rgba(0,80,160,0.4); color: #2a5070; }
  .choice-letter.selected { border: 1.5px solid rgba(0,255,136,0.7); background: rgba(0,255,136,0.15); color: #00ff88; }
  .choice-throws { font-size: 12px; color: #2a5070; margin-left: auto; }
  .choice-throws.selected-throws { color: rgba(0,255,136,0.5); }

  .submit-btn {
    width: 100%; padding: 14px;
    border-radius: 12px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 16px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s;
    background: rgba(0,255,136,0.06);
    border: 1px solid rgba(0,255,136,0.35);
    color: #00ff88; margin-bottom: 1rem;
    position: relative; overflow: hidden;
  }
  .submit-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(0,255,136,0.05) 100%);
  }
  .submit-btn:hover:not(:disabled) {
    background: rgba(0,255,136,0.1);
    box-shadow: 0 0 20px rgba(0,255,136,0.15);
    transform: translateY(-1px);
  }
  .submit-btn:active:not(:disabled) { transform: scale(0.98); }
  .submit-btn:disabled { opacity: 0.25; cursor: not-allowed; }
  .submit-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; }

  .config-card {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(0,80,160,0.18);
    border-radius: 12px;
    padding: 1rem 1.25rem;
  }
  .config-sup { font-size: 9px; letter-spacing: 0.2em; color: #2a5070; text-transform: uppercase; margin-bottom: 10px; }
  .config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .config-col-label { font-size: 11px; color: #ff5566; margin-bottom: 6px; }
  .config-col-label.green { color: #00cc77; }
  .config-entry { font-size: 11px; color: #3a5070; display: flex; gap: 4px; margin-bottom: 3px; }
  .config-from { }
  .config-arrow { color: #1a3050; }
  .config-to { color: #5a7a90; }
`

export default function PlayScreen({ gameData, playerName, elapsedSeconds, onSubmit, loading }) {
  const [selected, setSelected] = useState(null)

  const handleSubmit = () => {
    if (selected === null) return
    onSubmit(selected)
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  const timerClass = elapsedSeconds > 60 ? 'timer-red' : elapsedSeconds > 30 ? 'timer-yellow' : 'timer-green'

  return (
    <div className="play-root">
      <style>{CSS}</style>
      <div className="play-inner">

        <div className="play-topbar">
          <div className="topbar-left">
            <div className="topbar-avatar">🎲</div>
            <div>
              <div className="topbar-name">{playerName}</div>
              <div className="topbar-sub">{gameData.boardSize}×{gameData.boardSize} BOARD · ROUND #{gameData.gameRoundId}</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="timer-box">
              <div className="timer-label">Time</div>
              <div className={`timer-val ${timerClass}`}>{formatTime(elapsedSeconds)}</div>
            </div>
            <div className="algo-tags">
              <span className="algo-tag algo-bfs">BFS</span>
              <span className="algo-tag algo-dijk">Dijkstra</span>
            </div>
          </div>
        </div>

        <div className="play-layout">
          <div className="panel">
            <div className="panel-title">
              <span className="panel-title-dot" />
              Game Board
            </div>
            <GameBoard
              boardSize={gameData.boardSize}
              snakes={gameData.snakes}
              ladders={gameData.ladders}
              totalCells={gameData.totalCells}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="question-card">
              <div className="question-sup">Challenge</div>
              <div className="question-text">
                What is the <span className="q-accent">minimum</span> number of dice throws to reach cell {gameData.totalCells}?
              </div>
              <div className="question-hint">
                Start at cell 1. Snakes drag you down, ladders boost you up. Choose the correct minimum throws.
              </div>
            </div>

            <div className="choices-card">
              <div className="choices-sup">Your Answer</div>
              {gameData.choices.map((choice, i) => {
                const isSel = selected === choice
                return (
                  <button
                    key={i}
                    className={`choice-btn ${isSel ? 'selected' : 'idle'}`}
                    onClick={() => setSelected(choice)}
                    disabled={loading}
                  >
                    <span className={`choice-letter ${isSel ? 'selected' : 'idle'}`}>
                      {isSel ? '✓' : String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ fontSize: 16 }}>{choice}</span>
                    <span className={`choice-throws ${isSel ? 'selected-throws' : ''}`}>
                      {choice === 1 ? '1 throw' : `${choice} throws`}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={selected === null || loading}
            >
              <span className="submit-btn-inner">
                {loading
                  ? <><span style={{ display:'inline-block', animation:'spin 1s linear infinite' }}>⚙️</span> Checking...</>
                  : selected === null
                    ? '← Select an answer'
                    : '✓ Submit Answer'
                }
              </span>
            </button>

            <div className="config-card">
              <div className="config-sup">Board Config</div>
              <div className="config-grid">
                <div>
                  <div className="config-col-label">🐍 Snakes</div>
                  {Object.entries(gameData.snakes || {}).map(([m, t]) => (
                    <div key={m} className="config-entry">
                      <span className="config-from" style={{ color: '#ff5566' }}>{m}</span>
                      <span className="config-arrow">→</span>
                      <span className="config-to">{t}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="config-col-label green">🪜 Ladders</div>
                  {Object.entries(gameData.ladders || {}).map(([b, top]) => (
                    <div key={b} className="config-entry">
                      <span className="config-from" style={{ color: '#00cc77' }}>{b}</span>
                      <span className="config-arrow">→</span>
                      <span className="config-to">{top}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
