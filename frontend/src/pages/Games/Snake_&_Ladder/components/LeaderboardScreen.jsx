import React from 'react'

const RANK_STYLES = [
  { icon: '🥇', accentColor: '#ffd700', rowBg: 'rgba(255,215,0,0.04)', rankBg: 'rgba(255,215,0,0.12)', rankBorder: 'rgba(255,215,0,0.3)', rankText: '#ffd700' },
  { icon: '🥈', accentColor: '#c0c0c0', rowBg: 'rgba(180,180,180,0.03)', rankBg: 'rgba(180,180,180,0.1)', rankBorder: 'rgba(180,180,180,0.25)', rankText: '#c0c0c0' },
  { icon: '🥉', accentColor: '#cd7f32', rowBg: 'rgba(200,120,50,0.03)', rankBg: 'rgba(200,120,50,0.1)', rankBorder: 'rgba(200,120,50,0.25)', rankText: '#cd7f32' },
]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  } catch { return '—' }
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Rajdhani:wght@500;600;700&display=swap');

  .lb-root {
    min-height: 100vh;
    background: #040a14;
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -5%, rgba(255,180,0,0.05) 0%, transparent 60%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,80,200,0.03) 39px, rgba(0,80,200,0.03) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,80,200,0.02) 39px, rgba(0,80,200,0.02) 40px);
    display: flex; align-items: center; justify-content: center;
    padding: 2rem 1rem;
    font-family: 'Space Mono', monospace;
  }
  .lb-inner { width: 100%; max-width: 560px; }

  .lb-header { text-align: center; margin-bottom: 1.75rem; }
  .lb-trophy {
    font-size: 48px; display: inline-block;
    filter: drop-shadow(0 0 20px rgba(255,215,0,0.4));
    animation: floatTrophy 3s ease-in-out infinite;
  }
  @keyframes floatTrophy {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  .lb-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2.4rem; font-weight: 700; line-height: 1;
    color: #ffd700; text-shadow: 0 0 30px rgba(255,215,0,0.35);
    margin: 0.4rem 0 0.2rem;
  }
  .lb-subtitle { font-size: 10px; letter-spacing: 0.18em; color: #2a5070; text-transform: uppercase; }

  .lb-table {
    background: rgba(6,14,28,0.9);
    border: 1px solid rgba(0,120,255,0.15);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 1rem;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.8), 0 20px 60px rgba(0,0,0,0.5);
    position: relative;
  }
  .lb-table::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent);
  }

  .lb-thead {
    display: grid; grid-template-columns: 48px 1fr 90px 120px;
    padding: 12px 20px;
    border-bottom: 1px solid rgba(0,80,160,0.15);
    background: rgba(0,0,0,0.3);
  }
  .lb-th { font-size: 9px; letter-spacing: 0.18em; color: #1e3a56; text-transform: uppercase; font-weight: 700; }
  .lb-th-right { text-align: right; }

  .lb-empty, .lb-loading {
    padding: 4rem 1rem; text-align: center;
  }
  .lb-empty-icon, .lb-loading-icon { font-size: 36px; display: block; margin-bottom: 10px; }
  .lb-loading-icon { display: inline-block; animation: spin 1.5s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .lb-empty-text, .lb-loading-text { font-size: 12px; color: #2a5070; }

  .lb-row {
    display: grid; grid-template-columns: 48px 1fr 90px 120px;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(0,80,160,0.08);
    transition: background 0.1s;
    align-items: center;
  }
  .lb-row:last-child { border-bottom: none; }
  .lb-row:hover { background: rgba(255,255,255,0.015); }

  .lb-rank-icon { font-size: 18px; }
  .lb-rank-num  { font-size: 13px; color: #2a5070; font-weight: 700; }

  .lb-player { display: flex; align-items: center; gap: 8px; }
  .lb-rank-badge {
    padding: 2px 8px; border-radius: 4px;
    font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
  }
  .lb-name { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 600; color: #90b0c8; }

  .lb-score {
    text-align: right;
    font-family: 'Rajdhani', sans-serif;
    font-size: 22px; font-weight: 700;
    color: #00ff88; text-shadow: 0 0 10px rgba(0,255,136,0.3);
  }
  .lb-date { text-align: right; font-size: 10px; color: #2a4060; }

  .lb-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1rem; }
  .lb-btn {
    padding: 14px; border-radius: 12px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s;
    position: relative; overflow: hidden;
  }
  .lb-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 100%);
  }
  .lb-btn:active { transform: scale(0.97); }
  .lb-btn-play {
    background: rgba(0,255,136,0.06);
    border: 1px solid rgba(0,255,136,0.35);
    color: #00ff88;
  }
  .lb-btn-play:hover { background: rgba(0,255,136,0.1); box-shadow: 0 0 16px rgba(0,255,136,0.12); }
  .lb-btn-home {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(0,80,160,0.2);
    color: #3a6080;
  }
  .lb-btn-home:hover { color: #6090b0; border-color: rgba(0,120,200,0.3); }

  .lb-footer { text-align: center; font-size: 10px; color: #1a3050; letter-spacing: 0.1em; }
`

export default function LeaderboardScreen({ leaderboard, loading, onPlayAgain }) {
  return (
    <div className="lb-root">
      <style>{CSS}</style>
      <div className="lb-inner">
        <div className="lb-header">
          <div className="lb-trophy">🏆</div>
          <h2 className="lb-title">Leaderboard</h2>
          <p className="lb-subtitle">Top players · Correct answers only</p>
        </div>

        <div className="lb-table">
          <div className="lb-thead">
            <span className="lb-th">#</span>
            <span className="lb-th">Player</span>
            <span className="lb-th lb-th-right">Correct</span>
            <span className="lb-th lb-th-right">Last Played</span>
          </div>

          {loading ? (
            <div className="lb-loading">
              <span className="lb-loading-icon">⚙️</span>
              <p className="lb-loading-text">Loading scores...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="lb-empty">
              <span className="lb-empty-icon">🌱</span>
              <p className="lb-empty-text">No scores yet — be the first!</p>
            </div>
          ) : (
            leaderboard.map((entry, i) => {
              const style = RANK_STYLES[i]
              return (
                <div
                  key={entry.playerName}
                  className="lb-row"
                  style={{ background: style ? style.rowBg : undefined }}
                >
                  <span>
                    {style
                      ? <span className="lb-rank-icon">{style.icon}</span>
                      : <span className="lb-rank-num">{i + 1}</span>
                    }
                  </span>
                  <span className="lb-player">
                    {style && (
                      <span
                        className="lb-rank-badge"
                        style={{ background: style.rankBg, border: `1px solid ${style.rankBorder}`, color: style.rankText }}
                      >
                        #{i + 1}
                      </span>
                    )}
                    <span className="lb-name" style={style ? { color: style.accentColor } : undefined}>
                      {entry.playerName}
                    </span>
                  </span>
                  <span className="lb-score">{entry.correctAnswers}</span>
                  <span className="lb-date">{formatDate(entry.lastAnswered)}</span>
                </div>
              )
            })
          )}
        </div>

        <div className="lb-actions">
          <button className="lb-btn lb-btn-play" onClick={onPlayAgain}>🎲 Play Again</button>
          <button className="lb-btn lb-btn-home" onClick={onPlayAgain}>🏠 Home</button>
        </div>

        <p className="lb-footer">Only correct answers are counted</p>
      </div>
    </div>
  )
}
