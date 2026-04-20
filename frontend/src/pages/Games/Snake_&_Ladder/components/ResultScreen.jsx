import React, { useEffect, useState } from 'react'

const RESULT_CONFIG = {
  WIN: {
    emoji: '🏆',
    headline: 'You Nailed It!',
    subtext: 'Perfect answer. You clearly understand graph traversal.',
    accentColor: '#ffd700',
    glowColor: 'rgba(255,215,0,0.3)',
    borderColor: 'rgba(255,215,0,0.35)',
    bgColor: 'rgba(255,215,0,0.04)',
    badgeBg: 'rgba(255,215,0,0.12)',
    badgeBorder: 'rgba(255,215,0,0.35)',
    badgeText: '#ffd700',
  },
  DRAW: {
    emoji: '😅',
    headline: 'So Close!',
    subtext: 'Just 1 throw off. You were almost perfect!',
    accentColor: '#00ccff',
    glowColor: 'rgba(0,200,255,0.25)',
    borderColor: 'rgba(0,200,255,0.35)',
    bgColor: 'rgba(0,200,255,0.04)',
    badgeBg: 'rgba(0,200,255,0.12)',
    badgeBorder: 'rgba(0,200,255,0.35)',
    badgeText: '#00ccff',
  },
  LOSE: {
    emoji: '💀',
    headline: 'Not Quite!',
    subtext: 'Study the board carefully — snakes and ladders change the optimal path.',
    accentColor: '#ff3355',
    glowColor: 'rgba(255,51,85,0.25)',
    borderColor: 'rgba(255,51,85,0.35)',
    bgColor: 'rgba(255,51,85,0.04)',
    badgeBg: 'rgba(255,51,85,0.12)',
    badgeBorder: 'rgba(255,51,85,0.35)',
    badgeText: '#ff5577',
  },
}

function formatNs(ns) {
  if (!ns) return '—'
  if (ns < 1000) return `${ns} ns`
  if (ns < 1_000_000) return `${(ns / 1000).toFixed(2)} µs`
  return `${(ns / 1_000_000).toFixed(2)} ms`
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Rajdhani:wght@500;600;700&display=swap');

  .result-root {
    min-height: 100vh;
    background: #040a14;
    background-image:
      radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,80,200,0.08) 0%, transparent 65%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,80,200,0.03) 39px, rgba(0,80,200,0.03) 40px);
    display: flex; align-items: center; justify-content: center;
    padding: 2rem 1rem;
    font-family: 'Space Mono', monospace;
  }
  .result-inner {
    width: 100%; max-width: 480px;
    transition: opacity 0.5s, transform 0.5s;
  }
  .result-inner.hidden { opacity: 0; transform: translateY(16px); }
  .result-inner.visible { opacity: 1; transform: translateY(0); }

  .result-card {
    border-radius: 18px; padding: 2rem;
    text-align: center; margin-bottom: 1rem;
    position: relative; overflow: hidden;
  }
  .result-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
    opacity: 0.6;
  }
  .result-emoji {
    font-size: 56px; display: inline-block; margin-bottom: 1rem;
    animation: floatResult 3s ease-in-out infinite;
  }
  @keyframes floatResult {
    0%,100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-8px) scale(1.05); }
  }
  .result-badge {
    display: inline-block;
    padding: 4px 14px; border-radius: 20px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
    margin-bottom: 12px;
  }
  .result-headline {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2.2rem; font-weight: 700; color: #c8e0f0; line-height: 1;
    margin-bottom: 8px;
  }
  .result-subtext { font-size: 12px; color: #3a6080; line-height: 1.6; margin-bottom: 1.5rem; }

  .answers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 1.25rem; }
  .answer-box {
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(0,80,160,0.2);
    border-radius: 12px; padding: 1rem;
  }
  .answer-label { font-size: 9px; letter-spacing: 0.18em; color: #2a5070; text-transform: uppercase; margin-bottom: 6px; }
  .answer-num {
    font-family: 'Rajdhani', sans-serif;
    font-size: 3rem; font-weight: 700; line-height: 1;
  }
  .answer-num.correct { color: #00ff88; text-shadow: 0 0 16px rgba(0,255,136,0.4); }
  .answer-num.wrong   { color: #ff3355; text-shadow: 0 0 16px rgba(255,51,85,0.4); }
  .answer-sub { font-size: 10px; color: #2a4060; margin-top: 4px; }

  .algo-perf {
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(0,80,160,0.18);
    border-radius: 12px; padding: 1rem;
    text-align: left; margin-bottom: 1.25rem;
  }
  .algo-perf-title { font-size: 9px; letter-spacing: 0.18em; color: #2a5070; text-transform: uppercase; margin-bottom: 12px; }
  .algo-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .algo-left { display: flex; align-items: center; gap: 8px; }
  .algo-chip {
    padding: 3px 8px; border-radius: 5px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
  }
  .algo-chip-bfs  { background: rgba(0,200,255,0.1); border: 1px solid rgba(0,200,255,0.25); color: #00ccff; }
  .algo-chip-dijk { background: rgba(160,80,255,0.1); border: 1px solid rgba(160,80,255,0.25); color: #a050ff; }
  .algo-name { font-size: 10px; color: #2a5070; }
  .algo-time-bfs  { font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 600; color: #00ccff; }
  .algo-time-dijk { font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 600; color: #a050ff; }
  .algo-bar-track { height: 3px; background: rgba(0,80,160,0.2); border-radius: 2px; overflow: hidden; margin-bottom: 10px; }
  .algo-bar-fill  { height: 100%; border-radius: 2px; transition: width 0.8s ease; }
  .algo-bar-bfs   { background: rgba(0,200,255,0.6); }
  .algo-bar-dijk  { background: rgba(160,80,255,0.6); }
  .algo-winner {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 10px; border-top: 1px solid rgba(0,80,160,0.18);
    font-size: 10px;
  }
  .algo-winner-label { color: #2a5070; }
  .algo-winner-val   { font-weight: 700; font-size: 11px; }
  .algo-winner-bfs   { color: #00ccff; }
  .algo-winner-dijk  { color: #a050ff; }

  .result-quote { font-size: 11px; color: #2a5070; font-style: italic; line-height: 1.6; }

  .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .action-btn {
    padding: 14px; border-radius: 12px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s;
    position: relative; overflow: hidden;
  }
  .action-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 100%);
  }
  .action-btn:active { transform: scale(0.97); }
  .action-btn-play {
    background: rgba(0,255,136,0.06);
    border: 1px solid rgba(0,255,136,0.35);
    color: #00ff88;
  }
  .action-btn-play:hover { background: rgba(0,255,136,0.1); box-shadow: 0 0 16px rgba(0,255,136,0.12); }
  .action-btn-lb {
    background: rgba(255,210,0,0.06);
    border: 1px solid rgba(255,210,0,0.3);
    color: #ffd700;
  }
  .action-btn-lb:hover { background: rgba(255,210,0,0.1); box-shadow: 0 0 16px rgba(255,210,0,0.1); }
`

export default function ResultScreen({ result, onPlayAgain, onLeaderboard }) {
  const cfg = RESULT_CONFIG[result.result] || RESULT_CONFIG.LOSE
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const stats = result.algorithmStats

  return (
    <div className="result-root">
      <style>{CSS}</style>
      <div className={`result-inner ${visible ? 'visible' : 'hidden'}`}>
        <div
          className="result-card"
          style={{
            background: cfg.bgColor,
            border: `1px solid ${cfg.borderColor}`,
            boxShadow: `0 0 50px ${cfg.glowColor}, 0 0 0 1px rgba(0,0,0,0.8)`,
            '--accent-color': cfg.accentColor,
          }}
        >
          <div className="result-emoji">{cfg.emoji}</div>

          <div
            className="result-badge"
            style={{ background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}`, color: cfg.badgeText }}
          >
            {result.result}
          </div>

          <h2 className="result-headline">{cfg.headline}</h2>
          <p className="result-subtext">{cfg.subtext}</p>

          <div className="answers-grid">
            <div className="answer-box">
              <div className="answer-label">Your Answer</div>
              <div className={`answer-num ${result.correct ? 'correct' : 'wrong'}`}>{result.playerAnswer}</div>
              <div className="answer-sub">dice throws</div>
            </div>
            <div className="answer-box">
              <div className="answer-label">Correct Answer</div>
              <div className="answer-num correct">{result.correctAnswer}</div>
              <div className="answer-sub">dice throws</div>
            </div>
          </div>

          {stats && (
            <div className="algo-perf">
              <div className="algo-perf-title">⚡ Algorithm Performance</div>
              <div className="algo-row">
                <div className="algo-left">
                  <span className="algo-chip algo-chip-bfs">BFS</span>
                  <span className="algo-name">Breadth-First Search</span>
                </div>
                <span className="algo-time-bfs">{formatNs(stats.bfsTimeNs)}</span>
              </div>
              <div className="algo-bar-track">
                <div
                  className="algo-bar-fill algo-bar-bfs"
                  style={{ width: `${Math.min(100, (stats.bfsTimeNs / Math.max(stats.bfsTimeNs, stats.dijkstraTimeNs)) * 100)}%` }}
                />
              </div>
              <div className="algo-row">
                <div className="algo-left">
                  <span className="algo-chip algo-chip-dijk">Dijkstra</span>
                  <span className="algo-name">Priority Queue</span>
                </div>
                <span className="algo-time-dijk">{formatNs(stats.dijkstraTimeNs)}</span>
              </div>
              <div className="algo-bar-track">
                <div
                  className="algo-bar-fill algo-bar-dijk"
                  style={{ width: `${Math.min(100, (stats.dijkstraTimeNs / Math.max(stats.bfsTimeNs, stats.dijkstraTimeNs)) * 100)}%` }}
                />
              </div>
              <div className="algo-winner">
                <span className="algo-winner-label">Faster algorithm</span>
                <span className={`algo-winner-val ${stats.fasterAlgorithm === 'BFS' ? 'algo-winner-bfs' : 'algo-winner-dijk'}`}>
                  {stats.fasterAlgorithm} ⚡
                </span>
              </div>
            </div>
          )}

          <p className="result-quote">"{result.message.replace(/^[^\w]*/, '')}"</p>
        </div>

        <div className="actions-grid">
          <button className="action-btn action-btn-play" onClick={onPlayAgain}>🎲 Play Again</button>
          <button className="action-btn action-btn-lb" onClick={onLeaderboard}>🏅 Leaderboard</button>
        </div>
      </div>
    </div>
  )
}
