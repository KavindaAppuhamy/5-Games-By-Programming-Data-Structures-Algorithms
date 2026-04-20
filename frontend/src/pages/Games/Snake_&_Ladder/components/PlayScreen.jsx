import React, { useState, useEffect, useRef } from 'react'
import GameBoard from './GameBoard'
import { gameApi } from '../services/api'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'

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

  .topbar-right { display: flex; align-items: center; gap: 12px; }
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
  .config-arrow { color: #1a3050; }
  .config-to { color: #5a7a90; }

  .gen-btn {
    padding: 8px 16px; border-radius: 8px;
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
    background: rgba(0,200,255,0.08); border: 1px solid rgba(0,200,255,0.35);
    color: #00ccff; transition: all 0.2s; white-space: nowrap;
  }
  .gen-btn:hover { background: rgba(0,200,255,0.15); box-shadow: 0 0 16px rgba(0,200,255,0.2); transform: translateY(-1px); }
  .gen-btn-chart {
    padding: 8px 16px; border-radius: 8px;
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
    background: rgba(160,80,255,0.08); border: 1px solid rgba(160,80,255,0.35);
    color: #a050ff; transition: all 0.2s; white-space: nowrap;
  }
  .gen-btn-chart:hover { background: rgba(160,80,255,0.15); box-shadow: 0 0 16px rgba(160,80,255,0.2); transform: translateY(-1px); }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.82);
    backdrop-filter: blur(6px); z-index: 1000;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal-box {
    background: #060e1c; border: 1px solid rgba(0,120,255,0.25);
    border-radius: 20px; width: 100%; max-width: 980px;
    max-height: 90vh; overflow-y: auto; position: relative;
  }
  .modal-box::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,180,255,0.4), transparent);
  }
  .modal-box-chart {
    background: #060e1c; border: 1px solid rgba(160,80,255,0.25);
    border-radius: 20px; width: 100%; max-width: 1100px;
    max-height: 92vh; overflow-y: auto; position: relative;
  }
  .modal-box-chart::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(160,80,255,0.5), transparent);
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,80,160,0.2);
  }
  .modal-title {
    font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #c8e0f0;
    display: flex; align-items: center; gap: 10px;
  }
  .modal-title-dot { width: 8px; height: 8px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 8px rgba(0,255,136,0.7); }
  .modal-title-dot-purple { width: 8px; height: 8px; border-radius: 50%; background: #a050ff; box-shadow: 0 0 8px rgba(160,80,255,0.7); }
  .modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(255,50,80,0.08); border: 1px solid rgba(255,50,80,0.25);
    color: #ff3350; cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 16px; transition: all 0.15s;
  }
  .modal-close:hover { background: rgba(255,50,80,0.15); }
  .modal-body { padding: 1.5rem; }

  .sel-toggle {
    display: flex; background: rgba(0,0,0,0.4);
    border: 1px solid rgba(0,80,160,0.25); border-radius: 10px; overflow: hidden; margin-bottom: 1.25rem;
  }
  .sel-btn {
    flex: 1; padding: 10px 20px; font-family: 'Rajdhani', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; background: transparent; border: none; color: #2a5070; transition: all 0.2s;
  }
  .sel-btn.active { background: rgba(0,200,255,0.1); color: #00ccff; box-shadow: inset 0 0 20px rgba(0,200,255,0.05); }
  .sel-divider { width: 1px; background: rgba(0,80,160,0.25); }

  .player-select-wrap { margin-bottom: 1.25rem; }
  .player-select-label { font-size: 9px; letter-spacing: 0.2em; color: #2a5070; text-transform: uppercase; margin-bottom: 8px; }
  .player-select {
    width: 100%; padding: 10px 14px; background: rgba(0,0,0,0.4);
    border: 1px solid rgba(0,80,160,0.3); border-radius: 10px; color: #c8e0f0;
    font-family: 'Space Mono', monospace; font-size: 13px; outline: none; cursor: pointer;
    appearance: none; -webkit-appearance: none;
  }
  .player-select:focus { border-color: rgba(0,200,255,0.4); }

  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
  .stat-card { background: rgba(0,0,0,0.35); border: 1px solid rgba(0,80,160,0.2); border-radius: 12px; padding: 1rem; }
  .stat-label { font-size: 9px; letter-spacing: 0.15em; color: #2a5070; text-transform: uppercase; margin-bottom: 6px; }
  .stat-val { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; }
  .stat-val.green  { color: #00ff88; text-shadow: 0 0 10px rgba(0,255,136,0.3); }
  .stat-val.blue   { color: #00ccff; text-shadow: 0 0 10px rgba(0,200,255,0.3); }
  .stat-val.purple { color: #a050ff; text-shadow: 0 0 10px rgba(160,80,255,0.3); }
  .stat-sub { font-size: 10px; color: #1a4060; margin-top: 3px; }

  .chart-section { background: rgba(0,0,0,0.3); border: 1px solid rgba(0,80,160,0.18); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem; }
  .chart-title { font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; color: #c8e0f0; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }
  .chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
  @media (max-width: 700px) { .chart-grid { grid-template-columns: 1fr; } }

  .rounds-table-wrap { overflow-x: auto; }
  .rounds-table { width: 100%; border-collapse: collapse; }
  .rounds-table th {
    padding: 10px 14px; text-align: left; font-size: 10px; letter-spacing: 0.15em;
    color: #2a5070; text-transform: uppercase; background: rgba(0,0,0,0.4);
    border-bottom: 1px solid rgba(0,80,160,0.2); white-space: nowrap;
  }
  .rounds-table td { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid rgba(0,40,80,0.3); white-space: nowrap; }
  .rounds-table tr:hover td { background: rgba(0,80,160,0.06); }
  .rounds-table tr:last-child td { border-bottom: none; }
  .t-round  { font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #4a7090; }
  .t-player { color: #00ccff; }
  .t-throws { font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #00ff88; font-size: 15px; }
  .t-bfs  { color: #00ccff; }
  .t-dijk { color: #a050ff; }
  .badge-bfs  { display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgba(0,200,255,0.1); border: 1px solid rgba(0,200,255,0.3); color: #00ccff; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; }
  .badge-dijk { display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgba(160,80,255,0.1); border: 1px solid rgba(160,80,255,0.3); color: #a050ff; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; }
  .t-win  { color: #00ff88; font-weight: 700; }
  .t-lose { color: #ff3355; font-weight: 700; }
  .t-draw { color: #ffcc00; font-weight: 700; }
  .t-nodata { text-align: center; padding: 3rem; color: #2a5070; font-size: 13px; }
  .mini-bar-wrap { margin-top: 4px; height: 4px; background: rgba(0,0,0,0.4); border-radius: 2px; width: 100px; }
  .mini-bar { height: 4px; border-radius: 2px; opacity: 0.7; }

  /* Progress loader */
  .load-progress-wrap { text-align: center; padding: 2rem 1rem; }
  .load-progress-label { font-size: 12px; color: #4a7090; margin-bottom: 12px; font-family: 'Space Mono', monospace; }
  .load-progress-bar-bg { width: 100%; height: 6px; background: rgba(0,0,0,0.4); border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
  .load-progress-bar { height: 6px; border-radius: 3px; background: linear-gradient(90deg, #00ccff, #00ff88); transition: width 0.3s ease; box-shadow: 0 0 8px rgba(0,200,255,0.4); }
  .load-progress-sub { font-size: 10px; color: #2a5070; }

  /* Pagination */
  .pagination-wrap { display: flex; align-items: center; justify-content: space-between; margin-top: 1.25rem; padding: 10px 0; border-top: 1px solid rgba(0,80,160,0.15); }
  .pagination-info { font-size: 11px; color: #2a5070; font-family: 'Space Mono', monospace; }
  .pagination-info span { color: #4a7090; }
  .pagination-btns { display: flex; gap: 8px; align-items: center; }
  .page-btn {
    padding: 8px 18px; border-radius: 8px; font-family: 'Rajdhani', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: all 0.18s; background: rgba(0,0,0,0.4);
    border: 1px solid rgba(0,80,160,0.3); color: #4a7090;
    display: flex; align-items: center; gap: 6px;
  }
  .page-btn:hover:not(:disabled) { border-color: rgba(0,200,255,0.4); color: #00ccff; background: rgba(0,200,255,0.06); transform: translateY(-1px); }
  .page-btn:disabled { opacity: 0.25; cursor: not-allowed; transform: none; }
  .page-indicator { font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; color: #00ccff; background: rgba(0,200,255,0.08); border: 1px solid rgba(0,200,255,0.2); border-radius: 8px; padding: 7px 14px; min-width: 70px; text-align: center; }

  @keyframes spin { to { transform: rotate(360deg); } }
`

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtNs = (v) => {
  if (v == null || isNaN(v)) return '—'
  if (v < 1000) return `${v} ns`
  if (v < 1_000_000) return `${(v / 1000).toFixed(1)} µs`
  return `${(v / 1_000_000).toFixed(2)} ms`
}
const nsToMs = (v) => {
  if (v == null || isNaN(v)) return 0
  return parseFloat((v / 1_000_000).toFixed(4))
}

// ── FIX 1: Fully parallel fetch for all players ────────────────────────────
// Old code used batched sequential fetching with delays (3 at a time, 200ms gap).
// New code fires ALL player requests simultaneously then waits for all to settle.
async function fetchAllPlayersRounds(players, limitPerPlayer = 20) {
  const results = await Promise.allSettled(
    players.map(async (player) => {
      const data = await gameApi.getRoundsByPlayer(player, { limit: limitPerPlayer })
      return (data || []).map(r => ({ ...r, playerName: r.playerName ?? player }))
    })
  )
  const allRows = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
  allRows.sort((a, b) => (a.id > b.id ? -1 : a.id < b.id ? 1 : 0))
  return allRows
}

// ── FIX 2: Parallel enrichment — fire all gameRound fetches at once ────────
// Old code fetched gameRound details in batches of 4 with 100ms delays.
// New code fires all unique IDs in parallel and resolves in one pass.
// FIX 3: Skip enrichment entirely if the base rows already carry timing data.
async function enrichWithGameRounds(playerResultRows) {
  // If the API already returns timing fields, skip the extra fetch entirely.
  const needsEnrich = playerResultRows.some(
    r => r.gameRoundId != null && r.bfsTimeNs == null && r.dijkstraTimeNs == null
  )
  if (!needsEnrich) return playerResultRows

  const uniqueIds = [...new Set(
    playerResultRows.map(r => r.gameRoundId).filter(id => id != null)
  )]
  if (uniqueIds.length === 0) return playerResultRows

  // Fire all requests in parallel
  const settled = await Promise.allSettled(
    uniqueIds.map(id => gameApi.getStats(id).then(round => ({ id, round })))
  )

  const roundMap = {}
  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value.round) {
      roundMap[result.value.id] = result.value.round
    }
  }

  return playerResultRows.map(r => {
    const round = roundMap[r.gameRoundId]
    return {
      ...r,
      bfsTimeNs:      round?.bfsTimeNs      ?? r.bfsTimeNs      ?? null,
      dijkstraTimeNs: round?.dijkstraTimeNs ?? r.dijkstraTimeNs ?? null,
      minDiceThrows:  round?.minDiceThrows  ?? r.correctAnswer,
    }
  })
}

const PAGE_SIZE = 20

// ── Progress bar component ────────────────────────────────────────────────────
function ProgressLoader({ label }) {
  return (
    <div className="load-progress-wrap">
      <div className="load-progress-label">
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 8 }}>⚙️</span>
        {label}
      </div>
      <div className="load-progress-bar-bg">
        {/* Indeterminate animation when total is unknown */}
        <div className="load-progress-bar" style={{ width: '60%', animation: 'indeterminate 1.4s ease-in-out infinite' }} />
      </div>
      <style>{`
        @keyframes indeterminate {
          0%   { margin-left: -20%; width: 20%; }
          50%  { margin-left: 30%; width: 50%; }
          100% { margin-left: 110%; width: 20%; }
        }
      `}</style>
    </div>
  )
}

// ── Pagination component ──────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, totalItems, onPrev, onNext }) {
  const start = (currentPage - 1) * PAGE_SIZE + 1
  const end   = Math.min(currentPage * PAGE_SIZE, totalItems)
  return (
    <div className="pagination-wrap">
      <div className="pagination-info">
        Showing <span>{start}–{end}</span> of <span>{totalItems}</span> records
      </div>
      <div className="pagination-btns">
        <button className="page-btn" onClick={onPrev} disabled={currentPage === 1}>← Prev</button>
        <div className="page-indicator">{currentPage} / {totalPages}</div>
        <button className="page-btn" onClick={onNext} disabled={currentPage === totalPages}>Next →</button>
      </div>
    </div>
  )
}

// ── Chart tooltips ────────────────────────────────────────────────────────────
const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(0,120,255,0.3)', borderRadius: 8, padding: '10px 14px', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>
      <p style={{ color: '#4a7090', marginBottom: 6 }}>Round #{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, margin: '2px 0' }}>{p.name}: {p.value.toFixed(4)} ms</p>)}
    </div>
  )
}
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(0,120,255,0.3)', borderRadius: 8, padding: '10px 14px', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>
      <p style={{ color: '#4a7090', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.fill, margin: '2px 0' }}>{p.name}: {p.value.toFixed(4)} ms</p>)}
    </div>
  )
}

// ── FIX 4: Unified data-loading hook — two phases, fully parallel ─────────
// Old hook tracked done/total progress across slow sequential batches.
// New hook fires Phase 1 (base rows) and Phase 2 (enrichment) back-to-back,
// each fully parallel, so total wall-clock time ≈ max(single slowest request).
function useRoundData(mode, selectedPlayer, players) {
  const [allRows, setAllRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [phase, setPhase]     = useState('')
  const cancelRef             = useRef(false)

  useEffect(() => {
    if (mode === 'individual' && !selectedPlayer) { setAllRows([]); setError(null); return }
    if (mode === 'all' && players.length === 0) return

    cancelRef.current = false
    setLoading(true)
    setError(null)
    setAllRows([])

    const run = async () => {
      try {
        let baseRows = []

        if (mode === 'all') {
          setPhase('Fetching all players…')
          // FIX: fully parallel — all players at once
          baseRows = await fetchAllPlayersRounds(players, 20)
        } else {
          setPhase('Fetching rounds…')
          // FIX: only fetch 20 rows, not 200 — we only ever display 20
          const data = await gameApi.getRoundsByPlayer(selectedPlayer, { limit: 20 })
          baseRows = (data || []).map(r => ({ ...r, playerName: r.playerName ?? selectedPlayer }))
        }

        if (cancelRef.current) return

        setPhase('Loading timing data…')
        // FIX: fully parallel enrichment, skipped when timing already present
        const enriched = await enrichWithGameRounds(baseRows)

        if (!cancelRef.current) setAllRows(enriched)
      } catch {
        if (!cancelRef.current) setError('Failed to load data. Please try again.')
      } finally {
        if (!cancelRef.current) setLoading(false)
      }
    }

    run()
    return () => { cancelRef.current = true }
  }, [mode, selectedPlayer, players])

  return { allRows, loading, error, phase }
}

// ── Charts Modal ──────────────────────────────────────────────────────────────
function ChartsModal({ onClose }) {
  const [mode, setMode]                     = useState('individual')
  const [players, setPlayers]               = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [playersReady, setPlayersReady]     = useState(false)

  useEffect(() => {
    gameApi.getPlayers()
      .then(names => setPlayers([...names].sort((a, b) => a.localeCompare(b))))
      .catch(() => setPlayers([]))
      .finally(() => setPlayersReady(true))
  }, [])

  const { allRows: rows, loading, error, phase } = useRoundData(mode, selectedPlayer, players)

  const timedRows  = rows.filter(r => r.bfsTimeNs != null && r.dijkstraTimeNs != null)
  const avgBfs     = timedRows.length ? timedRows.reduce((s, r) => s + nsToMs(r.bfsTimeNs), 0) / timedRows.length : 0
  const avgDijk    = timedRows.length ? timedRows.reduce((s, r) => s + nsToMs(r.dijkstraTimeNs), 0) / timedRows.length : 0
  const wins       = rows.filter(r => r.correct).length
  const draws      = rows.filter(r => !r.correct && Math.abs((r.playerAnswer ?? 0) - (r.correctAnswer ?? 0)) === 1).length
  const loses      = rows.length - wins - draws

  const chartSlice = timedRows.slice(0, 20)
  const lineData   = chartSlice.map((r, i) => ({ round: i + 1, BFS: nsToMs(r.bfsTimeNs), Dijkstra: nsToMs(r.dijkstraTimeNs) }))
  const barAvgData = [
    { name: 'BFS',      'Avg Time (ms)': parseFloat(avgBfs.toFixed(4)) },
    { name: 'Dijkstra', 'Avg Time (ms)': parseFloat(avgDijk.toFixed(4)) },
  ]
  const throwsData = rows.slice(0, 20).map((r, i) => ({ round: i + 1, 'Min Throws': r.minDiceThrows ?? r.correctAnswer ?? 0 }))
  const distData   = [
    { name: 'WIN',  value: wins,  fill: '#00ff88' },
    { name: 'DRAW', value: draws, fill: '#ffcc00' },
    { name: 'LOSE', value: loses, fill: '#ff3355' },
  ]

  const showCharts = !loading && !error && lineData.length > 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box-chart" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title"><span className="modal-title-dot-purple" />Algorithm Timing Charts</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">

          <div className="sel-toggle">
            <button className={`sel-btn ${mode === 'individual' ? 'active' : ''}`} onClick={() => setMode('individual')}>Individual</button>
            <div className="sel-divider" />
            <button className={`sel-btn ${mode === 'all' ? 'active' : ''}`} onClick={() => setMode('all')}>All Players</button>
          </div>

          {mode === 'individual' && (
            <div className="player-select-wrap">
              <div className="player-select-label">Select Player</div>
              <select className="player-select" value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} disabled={!playersReady}>
                <option value="">— Choose a player —</option>
                {players.map((p, i) => <option key={`${p}-${i}`} value={p}>{p}</option>)}
              </select>
            </div>
          )}

          {error && <div className="t-nodata" style={{ color: '#ff3355' }}>{error}</div>}
          {loading && <ProgressLoader label={phase || 'Loading…'} />}

          {!loading && !error && lineData.length === 0 && (
            <div className="t-nodata">
              {mode === 'individual' && !selectedPlayer ? 'Select a player to view their charts' : 'No data found'}
            </div>
          )}

          {showCharts && (
            <>
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-label">Total Rounds</div>
                  <div className="stat-val blue">{rows.length}</div>
                  <div className="stat-sub">{wins}W · {draws}D · {loses}L</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg BFS Time</div>
                  <div className="stat-val green">{avgBfs.toFixed(4)} ms</div>
                  <div className="stat-sub">over {timedRows.length} timed rounds</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg Dijkstra Time</div>
                  <div className="stat-val purple">{avgDijk.toFixed(4)} ms</div>
                  <div className="stat-sub">over {timedRows.length} timed rounds</div>
                </div>
              </div>

              <div className="chart-section">
                <div className="chart-title">📈 Runtime by Round (first 20 timed rounds)</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,80,160,0.2)" />
                    <XAxis dataKey="round" stroke="#2a5070" tick={{ fill: '#4a7090', fontSize: 11, fontFamily: 'Space Mono' }} label={{ value: 'Round', position: 'insideBottomRight', offset: -5, fill: '#2a5070', fontSize: 10 }} />
                    <YAxis stroke="#2a5070" tick={{ fill: '#4a7090', fontSize: 11, fontFamily: 'Space Mono' }} tickFormatter={v => `${v}ms`} />
                    <Tooltip content={<LineTooltip />} />
                    <Legend wrapperStyle={{ fontFamily: 'Space Mono', fontSize: 11, color: '#4a7090' }} />
                    <Line type="monotone" dataKey="BFS" stroke="#00ccff" strokeWidth={2} dot={{ fill: '#00ccff', r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Dijkstra" stroke="#a050ff" strokeWidth={2} dot={{ fill: '#a050ff', r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-grid">
                <div className="chart-section" style={{ marginBottom: 0 }}>
                  <div className="chart-title">⏱ Average Runtime — All Rounds</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barAvgData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,80,160,0.2)" />
                      <XAxis dataKey="name" stroke="#2a5070" tick={{ fill: '#4a7090', fontSize: 11, fontFamily: 'Space Mono' }} />
                      <YAxis stroke="#2a5070" tick={{ fill: '#4a7090', fontSize: 11, fontFamily: 'Space Mono' }} tickFormatter={v => `${v}ms`} />
                      <Tooltip content={<BarTooltip />} />
                      <Legend wrapperStyle={{ fontFamily: 'Space Mono', fontSize: 11, color: '#4a7090' }} />
                      <Bar dataKey="Avg Time (ms)" radius={[6, 6, 0, 0]}>
                        {barAvgData.map((_, i) => <Cell key={i} fill={i === 0 ? '#00ccff' : '#a050ff'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-section" style={{ marginBottom: 0 }}>
                  <div className="chart-title">🎲 Min Dice Throws (first 20)</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={throwsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,80,160,0.2)" />
                      <XAxis dataKey="round" stroke="#2a5070" tick={{ fill: '#4a7090', fontSize: 11, fontFamily: 'Space Mono' }} label={{ value: 'Round', position: 'insideBottomRight', offset: -5, fill: '#2a5070', fontSize: 10 }} />
                      <YAxis stroke="#2a5070" tick={{ fill: '#4a7090', fontSize: 11, fontFamily: 'Space Mono' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,120,255,0.3)', borderRadius: 8, fontFamily: 'Space Mono', fontSize: 11 }} labelStyle={{ color: '#4a7090' }} itemStyle={{ color: '#00ff88' }} />
                      <Legend wrapperStyle={{ fontFamily: 'Space Mono', fontSize: 11, color: '#4a7090' }} />
                      <Bar dataKey="Min Throws" fill="#00ff88" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-section">
                <div className="chart-title">🏆 Result Distribution — All {rows.length} Rounds</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={distData} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,80,160,0.2)" horizontal={false} />
                    <XAxis type="number" stroke="#2a5070" tick={{ fill: '#4a7090', fontSize: 11, fontFamily: 'Space Mono' }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#2a5070" tick={{ fill: '#4a7090', fontSize: 12, fontFamily: 'Space Mono', fontWeight: 700 }} width={40} />
                    <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,120,255,0.3)', borderRadius: 8, fontFamily: 'Space Mono', fontSize: 11 }} labelStyle={{ color: '#4a7090' }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {distData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Rounds Table Modal ────────────────────────────────────────────────────────
function RoundsModal({ onClose }) {
  const [mode, setMode]                     = useState('individual')
  const [players, setPlayers]               = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [playersReady, setPlayersReady]     = useState(false)
  const [currentPage, setCurrentPage]       = useState(1)

  useEffect(() => {
    gameApi.getPlayers()
      .then(names => setPlayers([...names].sort((a, b) => a.localeCompare(b))))
      .catch(() => setPlayers([]))
      .finally(() => setPlayersReady(true))
  }, [])

  useEffect(() => { setCurrentPage(1) }, [mode, selectedPlayer])

  const { allRows, loading, error, phase } = useRoundData(mode, selectedPlayer, players)

  const totalItems = allRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const rows       = allRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const timedRows = allRows.filter(r => r.bfsTimeNs != null && r.dijkstraTimeNs != null)
  const avgBfs    = timedRows.length ? timedRows.reduce((s, r) => s + r.bfsTimeNs, 0) / timedRows.length : null
  const avgDijk   = timedRows.length ? timedRows.reduce((s, r) => s + r.dijkstraTimeNs, 0) / timedRows.length : null
  const wins      = allRows.filter(r => r.correct).length

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-dot" />
            {mode === 'all' ? 'All Players' : selectedPlayer || 'Player'} — Algorithm Timing Table
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="sel-toggle">
            <button className={`sel-btn ${mode === 'individual' ? 'active' : ''}`} onClick={() => setMode('individual')}>Individual</button>
            <div className="sel-divider" />
            <button className={`sel-btn ${mode === 'all' ? 'active' : ''}`} onClick={() => setMode('all')}>All Players</button>
          </div>

          {mode === 'individual' && (
            <div className="player-select-wrap">
              <div className="player-select-label">Select Player</div>
              <select className="player-select" value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} disabled={!playersReady}>
                <option value="">— Choose a player —</option>
                {players.map((p, i) => <option key={`${p}-${i}`} value={p}>{p}</option>)}
              </select>
            </div>
          )}

          {error && <div className="t-nodata" style={{ color: '#ff3355' }}>{error}</div>}

          {loading && <ProgressLoader label={phase || 'Loading…'} />}

          {!error && !loading && allRows.length > 0 && (
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total Rounds</div>
                <div className="stat-val blue">{totalItems}</div>
                <div className="stat-sub">{wins} correct · {totalItems - wins} incorrect</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg BFS Time</div>
                <div className="stat-val green">{avgBfs != null ? fmtNs(Math.round(avgBfs)) : '—'}</div>
                <div className="stat-sub">Breadth-First Search</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Dijkstra Time</div>
                <div className="stat-val purple">{avgDijk != null ? fmtNs(Math.round(avgDijk)) : '—'}</div>
                <div className="stat-sub">Priority Queue</div>
              </div>
            </div>
          )}

          {!loading && !error && allRows.length === 0 && (
            <div className="t-nodata">
              {mode === 'individual' && !selectedPlayer ? 'Select a player to view their rounds' : 'No rounds found'}
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <>
              <div className="rounds-table-wrap">
                <table className="rounds-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
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
                      const globalIdx   = (currentPage - 1) * PAGE_SIZE + i + 1
                      const hasTiming   = r.bfsTimeNs != null && r.dijkstraTimeNs != null
                      const maxNs       = hasTiming ? Math.max(r.bfsTimeNs, r.dijkstraTimeNs) : 1
                      const bfsW        = hasTiming ? Math.round(r.bfsTimeNs / maxNs * 100) : 0
                      const dijW        = hasTiming ? Math.round(r.dijkstraTimeNs / maxNs * 100) : 0
                      const isBfsFaster = hasTiming && r.bfsTimeNs <= r.dijkstraTimeNs
                      const diff        = Math.abs((r.playerAnswer ?? 0) - (r.correctAnswer ?? 0))
                      const resultLabel = r.correct ? 'WIN' : diff === 1 ? 'DRAW' : 'LOSE'
                      const resultClass = r.correct ? 't-win' : diff === 1 ? 't-draw' : 't-lose'
                      return (
                        <tr key={r.id ?? `row-${globalIdx}`}>
                          <td><span className="t-round">#{globalIdx}</span></td>
                          <td><span className="t-player">{r.playerName ?? '—'}</span></td>
                          <td>{r.boardSize}×{r.boardSize}</td>
                          <td><span className="t-throws">{r.minDiceThrows ?? r.correctAnswer ?? '—'}</span></td>
                          <td>
                            {hasTiming
                              ? <><span className="t-bfs">{fmtNs(r.bfsTimeNs)}</span><div className="mini-bar-wrap"><div className="mini-bar" style={{ width: `${bfsW}%`, background: '#00ccff' }} /></div></>
                              : <span style={{ color: '#2a5070' }}>—</span>}
                          </td>
                          <td>
                            {hasTiming
                              ? <><span className="t-dijk">{fmtNs(r.dijkstraTimeNs)}</span><div className="mini-bar-wrap"><div className="mini-bar" style={{ width: `${dijW}%`, background: '#a050ff' }} /></div></>
                              : <span style={{ color: '#2a5070' }}>—</span>}
                          </td>
                          <td>
                            {hasTiming
                              ? isBfsFaster ? <span className="badge-bfs">BFS</span> : <span className="badge-dijk">Dijkstra</span>
                              : <span style={{ color: '#2a5070' }}>—</span>}
                          </td>
                          <td><span className={resultClass}>{resultLabel}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
                  onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main PlayScreen ───────────────────────────────────────────────────────────
export default function PlayScreen({ gameData, playerName, elapsedSeconds, onSubmit, loading }) {
  const [selected, setSelected]               = useState(null)
  const [showRoundsModal, setShowRoundsModal] = useState(false)
  const [showChartsModal, setShowChartsModal] = useState(false)

  const handleSubmit = () => { if (selected !== null) onSubmit(selected) }

  const formatTime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60
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
            <button className="gen-btn" onClick={() => setShowRoundsModal(true)}>📊 Generate 20 Rounds Table</button>
            <button className="gen-btn-chart" onClick={() => setShowChartsModal(true)}>📈 Generate 20 Rounds Charts</button>
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
            <div className="panel-title"><span className="panel-title-dot" />Game Board</div>
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

            <button className="submit-btn" onClick={handleSubmit} disabled={selected === null || loading}>
              <span className="submit-btn-inner">
                {loading
                  ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span> Checking...</>
                  : selected === null ? '← Select an answer' : '✓ Submit Answer'}
              </span>
            </button>

            <div className="config-card">
              <div className="config-sup">Board Config</div>
              <div className="config-grid">
                <div>
                  <div className="config-col-label">🐍 Snakes</div>
                  {Object.entries(gameData.snakes || {}).map(([m, t]) => (
                    <div key={m} className="config-entry">
                      <span style={{ color: '#ff5566' }}>{m}</span>
                      <span className="config-arrow">→</span>
                      <span className="config-to">{t}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="config-col-label green">🪜 Ladders</div>
                  {Object.entries(gameData.ladders || {}).map(([b, top]) => (
                    <div key={b} className="config-entry">
                      <span style={{ color: '#00cc77' }}>{b}</span>
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

      {showRoundsModal && <RoundsModal onClose={() => setShowRoundsModal(false)} />}
      {showChartsModal && <ChartsModal onClose={() => setShowChartsModal(false)} />}
    </div>
  )
}