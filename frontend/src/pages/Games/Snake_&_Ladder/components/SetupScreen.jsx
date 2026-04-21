import React from 'react'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Rajdhani:wght@500;600;700&display=swap');

  .setup-root {
    min-height: 100vh;
    background: #040a14;
    background-image:
      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,100,255,0.08) 0%, transparent 70%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,80,200,0.04) 39px, rgba(0,80,200,0.04) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,80,200,0.03) 39px, rgba(0,80,200,0.03) 40px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    font-family: 'Space Mono', monospace;
  }
  .setup-inner { width: 100%; max-width: 420px; }

  .setup-header { text-align: center; margin-bottom: 2.5rem; }
  .setup-dice {
    font-size: 52px; display: inline-block;
    animation: floatDice 3s ease-in-out infinite;
    filter: drop-shadow(0 0 18px rgba(0,180,255,0.4));
  }
  @keyframes floatDice {
    0%,100% { transform: translateY(0) rotate(-3deg); }
    50%      { transform: translateY(-10px) rotate(3deg); }
  }
  .setup-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2.6rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1;
    margin: 0.5rem 0 0.3rem;
  }
  .setup-title .t-green { color: #00ff88; text-shadow: 0 0 20px rgba(0,255,136,0.5); }
  .setup-title .t-amp   { color: #3a5a7a; }
  .setup-title .t-red   { color: #ff3355; text-shadow: 0 0 20px rgba(255,51,85,0.5); }
  .setup-tagline {
    font-size: 10px; letter-spacing: 0.2em; color: #3a5a7a;
    text-transform: uppercase; margin-top: 4px;
  }

  .setup-card {
    background: rgba(8,16,30,0.9);
    border: 1px solid rgba(0,120,255,0.18);
    border-radius: 16px;
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.6);
    position: relative;
    overflow: hidden;
  }
  .setup-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,180,255,0.4), transparent);
  }

  .field-label {
    font-size: 10px; letter-spacing: 0.18em; color: #3a6080;
    text-transform: uppercase; margin-bottom: 8px; display: block;
  }
  .setup-input {
    width: 100%; box-sizing: border-box;
    background: rgba(0,0,0,0.5);
    border: 1px solid rgba(0,100,180,0.25);
    border-radius: 10px;
    padding: 12px 16px;
    color: #c8ddf0;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .setup-input::placeholder { color: #2a4060; }
  .setup-input:focus {
    border-color: rgba(0,200,100,0.5);
    box-shadow: 0 0 0 3px rgba(0,200,100,0.08), 0 0 12px rgba(0,200,100,0.08);
  }
  .input-error { font-size: 11px; color: #ff4466; margin-top: 5px; }

  .size-grid { display: flex; gap: 8px; flex-wrap: wrap; }
  .size-btn {
    padding: 8px 12px;
    border-radius: 8px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid rgba(0,80,160,0.3);
    background: rgba(0,0,0,0.4);
    color: #3a6080;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.03em;
  }
  .size-btn:hover { border-color: rgba(0,180,255,0.35); color: #6ab0d0; }
  .size-btn.active {
    background: rgba(0,255,136,0.08);
    border-color: rgba(0,255,136,0.45);
    color: #00ff88;
    box-shadow: 0 0 10px rgba(0,255,136,0.12);
  }

  .info-box {
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(0,80,160,0.2);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .info-row { display: flex; justify-content: space-between; font-size: 12px; color: #3a6080; }
  .info-val-red    { color: #ff4466; }
  .info-val-green  { color: #00cc77; }
  .info-val-cyan   { color: #00ccff; }

  .start-btn {
    width: 100%; padding: 15px;
    border-radius: 12px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 17px; font-weight: 700;
    letter-spacing: 0.1em;
    background: rgba(0,255,136,0.06);
    border: 1px solid rgba(0,255,136,0.4);
    color: #00ff88;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
  }
  .start-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(0,255,136,0.07) 100%);
  }
  .start-btn:hover:not(:disabled) {
    background: rgba(0,255,136,0.1);
    box-shadow: 0 0 20px rgba(0,255,136,0.15), 0 0 40px rgba(0,255,136,0.06);
    transform: translateY(-1px);
  }
  .start-btn:active:not(:disabled) { transform: scale(0.98); }
  .start-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .start-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; }

  .setup-footer { text-align: center; font-size: 10px; color: #1e3a56; margin-top: 12px; letter-spacing: 0.1em; }
`

export default function SetupScreen({ playerName, setPlayerName, boardSize, setBoardSize, onStart, loading }) {
  const sizes = [6, 7, 8, 9, 10, 11, 12]

  return (
    <div className="setup-root">
      <style>{CSS}</style>
      <div className="setup-inner">
        <div className="setup-header">
          <div className="setup-dice">🎲</div>
          <h1 className="setup-title">
            <span className="t-green">Snake</span>
            <span className="t-amp"> &amp; </span>
            <span className="t-red">Ladder</span>
          </h1>
          <p className="setup-tagline">Algorithm Challenge</p>
        </div>

        <div className="setup-card">
          <div>
            <label className="field-label">Player Name</label>
            <input
              type="text"
              className="setup-input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onStart()}
              placeholder="Enter your callsign..."
              maxLength={100}
            />
            {playerName.length > 0 && playerName.trim().length < 2 && (
              <p className="input-error">⚠ Minimum 2 characters required</p>
            )}
          </div>

          <div>
            <label className="field-label">
              Board Size — <span style={{ color: '#00ff88' }}>{boardSize}×{boardSize}</span>
              <span style={{ color: '#1e3a56', marginLeft: 8 }}>({boardSize * boardSize} cells)</span>
            </label>
            <div className="size-grid">
              {sizes.map((n) => (   // ✅ changed s → n
                <button
                  key={n}
                  className={`size-btn${boardSize === n ? ' active' : ''}`}
                  onClick={() => setBoardSize(n)}
                >
                  {n}×{n}
                </button>
              ))}
            </div>
          </div>

          <div className="info-box">
            <div className="info-row">
              <span>🐍 Snakes</span>
              <span className="info-val-red">{boardSize - 2}</span>
            </div>
            <div className="info-row">
              <span>🪜 Ladders</span>
              <span className="info-val-green">{boardSize - 2}</span>
            </div>
            <div className="info-row">
              <span>🔬 Algorithms</span>
              <span className="info-val-cyan">BFS + Dijkstra</span>
            </div>
          </div>

          <button
            className="start-btn"
            onClick={onStart}
            disabled={loading || !playerName.trim() || playerName.trim().length < 2}
          >
            <span className="start-btn-inner">
              {loading ? (
                <><span style={{ display:'inline-block', animation:'spin 1s linear infinite' }}>⚙️</span> Generating Board...</>
              ) : (
                <><span>🚀</span> Start Game</>
              )}
            </span>
          </button>
        </div>

        <p className="setup-footer">
          Find the minimum dice throws using graph algorithms
        </p>
      </div>
    </div>
  )
}
