import React, { useState, useEffect } from 'react'
import GameBoard from './GameBoard'
import { gameApi } from '../services/api'

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

  /* ── Generate Button ── */
  .gen-btn {
    padding: 8px 16px;
    border-radius: 8px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer;
    background: rgba(0,200,255,0.08);
    border: 1px solid rgba(0,200,255,0.35);
    color: #00ccff;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .gen-btn:hover {
    background: rgba(0,200,255,0.15);
    box-shadow: 0 0 16px rgba(0,200,255,0.2);
    transform: translateY(-1px);
  }

  /* ── Modal Overlay ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .modal-box {
    background: #060e1c;
    border: 1px solid rgba(0,120,255,0.25);
    border-radius: 20px;
    width: 100%; max-width: 980px;
    max-height: 90vh; overflow-y: auto;
    position: relative;
  }
  .modal-box::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,180,255,0.4), transparent);
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(0,80,160,0.2);
  }
  .modal-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 20px; font-weight: 700; color: #c8e0f0;
    display: flex; align-items: center; gap: 10px;
  }
  .modal-title-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #00ff88; box-shadow: 0 0 8px rgba(0,255,136,0.7);
  }
  .modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(255,50,80,0.08); border: 1px solid rgba(255,50,80,0.25);
    color: #ff3350; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; transition: all 0.15s;
  }
  .modal-close:hover { background: rgba(255,50,80,0.15); }
  .modal-body { padding: 1.5rem; }

  /* ── Selection Toggle ── */
  .sel-toggle {
    display: flex; gap: 0;
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(0,80,160,0.25);
    border-radius: 10px; overflow: hidden;
    margin-bottom: 1.25rem;
  }
  .sel-btn {
    flex: 1; padding: 10px 20px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; background: transparent;
    border: none; color: #2a5070; transition: all 0.2s;
  }
  .sel-btn.active {
    background: rgba(0,200,255,0.1); color: #00ccff;
    box-shadow: inset 0 0 20px rgba(0,200,255,0.05);
  }
  .sel-divider { width: 1px; background: rgba(0,80,160,0.25); }

  /* ── Player Select ── */
  .player-select-wrap { margin-bottom: 1.25rem; }
  .player-select-label {
    font-size: 9px; letter-spacing: 0.2em;
    color: #2a5070; text-transform: uppercase; margin-bottom: 8px;
  }
  .player-select {
    width: 100%; padding: 10px 14px;
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(0,80,160,0.3);
    border-radius: 10px; color: #c8e0f0;
    font-family: 'Space Mono', monospace; font-size: 13px;
    outline: none; cursor: pointer;
    appearance: none; -webkit-appearance: none;
  }
  .player-select:focus { border-color: rgba(0,200,255,0.4); }

  /* ── Stats Row ── */
  .stats-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1rem; margin-bottom: 1.25rem;
  }
  .stat-card {
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(0,80,160,0.2);
    border-radius: 12px; padding: 1rem;
  }
  .stat-label {
    font-size: 9px; letter-spacing: 0.15em;
    color: #2a5070; text-transform: uppercase; margin-bottom: 6px;
  }
  .stat-val {
    font-family: 'Rajdhani', sans-serif;
    font-size: 24px; font-weight: 700;
  }
  .stat-val.green { color: #00ff88; text-shadow: 0 0 10px rgba(0,255,136,0.3); }
  .stat-val.blue  { color: #00ccff; text-shadow: 0 0 10px rgba(0,200,255,0.3); }
  .stat-val.purple{ color: #a050ff; text-shadow: 0 0 10px rgba(160,80,255,0.3); }
  .stat-sub { font-size: 10px; color: #1a4060; margin-top: 3px; }

  /* ── Rounds Table ── */
  .rounds-table-wrap { overflow-x: auto; }
  .rounds-table { width: 100%; border-collapse: collapse; }
  .rounds-table th {
    padding: 10px 14px; text-align: left;
    font-size: 10px; letter-spacing: 0.15em;
    color: #2a5070; text-transform: uppercase;
    background: rgba(0,0,0,0.4);
    border-bottom: 1px solid rgba(0,80,160,0.2);
    white-space: nowrap;
  }
  .rounds-table td {
    padding: 10px 14px; font-size: 12px;
    border-bottom: 1px solid rgba(0,40,80,0.3);
    white-space: nowrap;
  }
  .rounds-table tr:hover td { background: rgba(0,80,160,0.06); }
  .rounds-table tr:last-child td { border-bottom: none; }
  .t-round  { font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #4a7090; }
  .t-player { color: #00ccff; }
  .t-throws { font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #00ff88; font-size: 15px; }
  .t-bfs    { color: #00ccff; }
  .t-dijk   { color: #a050ff; }
  .badge-bfs  { display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgba(0,200,255,0.1); border: 1px solid rgba(0,200,255,0.3); color: #00ccff; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; }
  .badge-dijk { display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgba(160,80,255,0.1); border: 1px solid rgba(160,80,255,0.3); color: #a050ff; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; }
  .t-win  { color: #00ff88; font-weight: 700; }
  .t-lose { color: #ff3355; font-weight: 700; }
  .t-draw { color: #ffcc00; font-weight: 700; }
  .t-nodata { text-align: center; padding: 3rem; color: #2a5070; font-size: 13px; }
  .mini-bar-wrap { margin-top: 4px; height: 4px; background: rgba(0,0,0,0.4); border-radius: 2px; width: 100px; }
  .mini-bar { height: 4px; border-radius: 2px; opacity: 0.7; }

  @keyframes spin { to { transform: rotate(360deg); } }
`

// ── Helper: format nanoseconds ──────────────────────────────────────────────
const fmtNs = (v) => {
  if (v == null || isNaN(v)) return '—'
  if (v < 1000) return `${v} ns`
  if (v < 1_000_000) return `${(v / 1000).toFixed(1)} µs`
  return `${(v / 1_000_000).toFixed(2)} ms`
}

// ── Enrich PlayerResult rows with GameRound timing data ─────────────────────
//
// Root cause: PlayerResult rows (from player_results table) do NOT carry
// bfsTimeNs / dijkstraTimeNs — those live on GameRound (game_rounds table).
// Each PlayerResult has a gameRoundId foreign key we use to fetch the
// matching GameRound and merge its timing fields in.
//
// We deduplicate IDs and fire requests in parallel to minimise latency.
async function enrichWithGameRounds(playerResultRows) {
  const uniqueIds = [...new Set(
    playerResultRows.map(r => r.gameRoundId).filter(id => id != null)
  )]

  // Fetch each GameRound once, keyed by id
  const roundMap = {}
  await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        // Calls GET /api/game-rounds/{id}  (adjust path to match your backend)
        const round = await gameApi.getStats(id)
        if (round) roundMap[id] = round
      } catch {
        // Leave undefined — affected rows will show '—' rather than crashing
      }
    })
  )

  // Merge bfsTimeNs, dijkstraTimeNs, minDiceThrows onto each result row
  return playerResultRows.map(r => {
    const round = roundMap[r.gameRoundId]
    return {
      ...r,
      bfsTimeNs:      round?.bfsTimeNs      ?? null,
      dijkstraTimeNs: round?.dijkstraTimeNs ?? null,
      // prefer the authoritative value from GameRound; fall back to correctAnswer
      minDiceThrows:  round?.minDiceThrows  ?? r.correctAnswer,
    }
  })
}

// ── 20-Rounds Modal Component ───────────────────────────────────────────────
function RoundsModal({ onClose }) {
  const [mode, setMode] = useState('individual')
  const [players, setPlayers] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch distinct player names on mount
  useEffect(() => {
    gameApi.getPlayers()           // ← now hits /api/game/players
      .then(names => setPlayers(names))
      .catch(() => {})
  }, [])

  // Fetch + enrich rows whenever mode or selectedPlayer changes
  useEffect(() => {
    if (mode === 'individual' && !selectedPlayer) {
      setRows([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    const fetchResults = mode === 'all'
      ? gameApi.getRounds({ limit: 20 })
      : gameApi.getRoundsByPlayer(selectedPlayer, { limit: 20 })

    fetchResults
      .then(data => enrichWithGameRounds(data))
      .then(enriched => setRows(enriched))
      .catch(() => {
        setRows([])
        setError('Failed to load rounds. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [mode, selectedPlayer])

  // Stats — only average rows that actually have timing data
  const rowsWithTiming = rows.filter(r => r.bfsTimeNs != null && r.dijkstraTimeNs != null)
  const avgBfs  = rowsWithTiming.length
    ? rowsWithTiming.reduce((s, r) => s + r.bfsTimeNs, 0) / rowsWithTiming.length
    : null
  const avgDijk = rowsWithTiming.length
    ? rowsWithTiming.reduce((s, r) => s + r.dijkstraTimeNs, 0) / rowsWithTiming.length
    : null
  const wins = rows.filter(r => r.correct).length

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-dot" />
            20 Rounds — Algorithm Timing Table
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* Mode Toggle */}
          <div className="sel-toggle">
            <button
              className={`sel-btn ${mode === 'individual' ? 'active' : ''}`}
              onClick={() => setMode('individual')}
            >
              Individual
            </button>
            <div className="sel-divider" />
            <button
              className={`sel-btn ${mode === 'all' ? 'active' : ''}`}
              onClick={() => setMode('all')}
            >
              All Players
            </button>
          </div>

          {/* Player Select (Individual only) */}
          {mode === 'individual' && (
            <div className="player-select-wrap">
              <div className="player-select-label">Select Player</div>
              <select
                className="player-select"
                value={selectedPlayer}
                onChange={e => setSelectedPlayer(e.target.value)}
              >
                <option value="">— Choose a player —</option>
                {players.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="t-nodata" style={{ color: '#ff3355' }}>{error}</div>
          )}

          {/* Stats cards */}
          {!error && rows.length > 0 && (
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total Rounds</div>
                <div className="stat-val blue">{rows.length}</div>
                <div className="stat-sub">{wins} correct · {rows.length - wins} incorrect</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg BFS Time</div>
                {/* Sourced from GameRound.bfsTimeNs via enrichWithGameRounds */}
                <div className="stat-val green">{avgBfs != null ? fmtNs(Math.round(avgBfs)) : '—'}</div>
                <div className="stat-sub">Breadth-First Search</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Dijkstra Time</div>
                {/* Sourced from GameRound.dijkstraTimeNs via enrichWithGameRounds */}
                <div className="stat-val purple">{avgDijk != null ? fmtNs(Math.round(avgDijk)) : '—'}</div>
                <div className="stat-sub">Priority Queue</div>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="t-nodata">
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span>
              {' '}Loading rounds...
            </div>
          ) : rows.length === 0 && !error ? (
            <div className="t-nodata">
              {mode === 'individual' && !selectedPlayer
                ? 'Select a player to view their rounds'
                : 'No rounds found'}
            </div>
          ) : !error && (
            <div className="rounds-table-wrap">
              <table className="rounds-table">
                <thead>
                  <tr>
                    <th>#</th>
                    {mode === 'all' && <th>Player</th>}
                    <th>Board</th>
                    <th>Min Throws</th>
                    <th style={{ color: '#00ccff' }}>BFS Time</th>
                    <th style={{ color: '#a050ff' }}>Dijkstra Time</th>
                    <th>Faster</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const hasTiming = r.bfsTimeNs != null && r.dijkstraTimeNs != null
                    const maxNs     = hasTiming ? Math.max(r.bfsTimeNs, r.dijkstraTimeNs) : 1
                    const bfsW      = hasTiming ? Math.round(r.bfsTimeNs      / maxNs * 100) : 0
                    const dijW      = hasTiming ? Math.round(r.dijkstraTimeNs / maxNs * 100) : 0
                    const isBfsFaster = hasTiming && r.bfsTimeNs <= r.dijkstraTimeNs
                    const diff      = Math.abs((r.playerAnswer ?? 0) - (r.correctAnswer ?? 0))
                    const resultLabel = r.correct ? 'WIN' : diff === 1 ? 'DRAW' : 'LOSE'
                    const resultClass = r.correct ? 't-win' : diff === 1 ? 't-draw' : 't-lose'

                    return (
                      <tr key={r.id || i}>
                        <td><span className="t-round">#{i + 1}</span></td>
                        {mode === 'all' && <td><span className="t-player">{r.playerName}</span></td>}
                        <td>{r.boardSize}×{r.boardSize}</td>
                        <td>
                          <span className="t-throws">
                            {r.minDiceThrows ?? r.correctAnswer ?? '—'}
                          </span>
                        </td>

                        {/* BFS Time — from GameRound.bfsTimeNs */}
                        <td>
                          {hasTiming ? (
                            <>
                              <span className="t-bfs">{fmtNs(r.bfsTimeNs)}</span>
                              <div className="mini-bar-wrap">
                                <div className="mini-bar" style={{ width: `${bfsW}%`, background: '#00ccff' }} />
                              </div>
                            </>
                          ) : (
                            <span style={{ color: '#2a5070' }}>—</span>
                          )}
                        </td>

                        {/* Dijkstra Time — from GameRound.dijkstraTimeNs */}
                        <td>
                          {hasTiming ? (
                            <>
                              <span className="t-dijk">{fmtNs(r.dijkstraTimeNs)}</span>
                              <div className="mini-bar-wrap">
                                <div className="mini-bar" style={{ width: `${dijW}%`, background: '#a050ff' }} />
                              </div>
                            </>
                          ) : (
                            <span style={{ color: '#2a5070' }}>—</span>
                          )}
                        </td>

                        <td>
                          {hasTiming
                            ? isBfsFaster
                              ? <span className="badge-bfs">BFS</span>
                              : <span className="badge-dijk">Dijkstra</span>
                            : <span style={{ color: '#2a5070' }}>—</span>
                          }
                        </td>
                        <td>
                          <span className={resultClass}>{resultLabel}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Main PlayScreen ─────────────────────────────────────────────────────────
export default function PlayScreen({ gameData, playerName, elapsedSeconds, onSubmit, loading }) {
  const [selected, setSelected] = useState(null)
  const [showRoundsModal, setShowRoundsModal] = useState(false)

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
            <button className="gen-btn" onClick={() => setShowRoundsModal(true)}>
              📊 Generate 20 Rounds Table
            </button>
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
                  ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span> Checking...</>
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

      {showRoundsModal && (
        <RoundsModal onClose={() => setShowRoundsModal(false)} />
      )}
    </div>
  )
}