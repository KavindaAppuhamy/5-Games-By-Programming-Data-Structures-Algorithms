import React, { useMemo } from 'react'

const SNAKE_ICON  = '🐍'
const LADDER_ICON = '🪜'
const START_ICON  = '🚀'
const END_ICON    = '🏆'

export default function GameBoard({ boardSize, snakes, ladders, totalCells }) {
  const cellMeta = useMemo(() => {
    const meta = {}
    Object.entries(snakes || {}).forEach(([mouth, tail]) => {
      meta[parseInt(mouth)] = { type: 'snake-mouth', target: parseInt(tail), icon: SNAKE_ICON }
      meta[parseInt(tail)]  = { type: 'snake-tail' }
    })
    Object.entries(ladders || {}).forEach(([base, top]) => {
      meta[parseInt(base)] = { type: 'ladder-base', target: parseInt(top), icon: LADDER_ICON }
      meta[parseInt(top)]  = { type: 'ladder-top' }
    })
    meta[1]          = { type: 'start', icon: START_ICON }
    meta[totalCells] = { type: 'end', icon: END_ICON }
    return meta
  }, [snakes, ladders, totalCells])

  const rows = useMemo(() => {
    const result = []
    for (let row = boardSize - 1; row >= 0; row--) {
      const cells = []
      const leftToRight = row % 2 === 0
      for (let col = 0; col < boardSize; col++) {
        const actualCol = leftToRight ? col : boardSize - 1 - col
        const cellNum = row * boardSize + actualCol + 1
        cells.push(cellNum)
      }
      result.push(cells)
    }
    return result
  }, [boardSize])

  const getCellClass = (num) => {
    const meta = cellMeta[num]
    if (!meta) return 'gb-cell-default'
    switch (meta.type) {
      case 'snake-mouth': return 'gb-cell-snake-mouth'
      case 'snake-tail':  return 'gb-cell-snake-tail'
      case 'ladder-base': return 'gb-cell-ladder-base'
      case 'ladder-top':  return 'gb-cell-ladder-top'
      case 'start':       return 'gb-cell-start'
      case 'end':         return 'gb-cell-end'
      default: return 'gb-cell-default'
    }
  }

  const cellFontSize = boardSize <= 7 ? '11px' : boardSize <= 9 ? '9px' : '8px'
  const cellMinH     = boardSize <= 7 ? '48px' : boardSize <= 9 ? '40px' : '32px'
  const iconSize     = boardSize <= 8 ? '13px' : '10px'

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .gb-legend { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:12px; }
        .gb-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; color:#6b8099; font-family:'Space Mono',monospace; }
        .gb-legend-dot { width:9px; height:9px; border-radius:2px; flex-shrink:0; }
        .gb-board { border-radius:10px; overflow:hidden; background:#050c18;
          border:1px solid rgba(0,140,255,0.15);
          box-shadow:0 0 0 1px rgba(0,0,0,0.8), 0 4px 40px rgba(0,100,200,0.08); }
        .gb-cell { position:relative; display:flex; flex-direction:column; align-items:center;
          justify-content:center; transition:filter 0.12s; cursor:default;
          border:0.5px solid rgba(255,255,255,0.04); }
        .gb-cell:hover { filter:brightness(1.4); }
        .gb-cell-default   { background:#070e1c; }
        .gb-cell-snake-mouth { background:rgba(210,40,70,0.2); border-color:rgba(210,40,70,0.35) !important; }
        .gb-cell-snake-tail  { background:rgba(160,20,50,0.09); border-color:rgba(160,20,50,0.18) !important; }
        .gb-cell-ladder-base { background:rgba(0,210,110,0.17); border-color:rgba(0,210,110,0.35) !important; }
        .gb-cell-ladder-top  { background:rgba(0,170,90,0.08); border-color:rgba(0,170,90,0.18) !important; }
        .gb-cell-start { background:rgba(0,170,255,0.2); border-color:rgba(0,170,255,0.45) !important; }
        .gb-cell-end   { background:rgba(255,200,0,0.2); border-color:rgba(255,200,0,0.45) !important; }
        .gb-cell-num   { color:rgba(90,120,160,0.85); line-height:1; font-family:'Space Mono',monospace; font-weight:500; }
        .gb-cell-icon  { line-height:1; }
        .gb-badge { position:absolute; top:1px; right:1px; font-size:7px;
          font-family:'Space Mono',monospace; padding:1px 2px; border-radius:2px; line-height:1.3; }
        .gb-badge-snake  { color:#ff5566; background:rgba(160,10,30,0.75); }
        .gb-badge-ladder { color:#00ff99; background:rgba(0,100,50,0.75); }
        .gb-stats { margin-top:8px; display:flex; gap:14px; font-size:11px;
          color:rgba(80,110,150,0.6); font-family:'Space Mono',monospace; letter-spacing:0.05em; }
      `}</style>

      <div className="gb-legend">
        {[
          { bg: 'rgba(210,40,70,0.65)',  label: 'Snake 🐍' },
          { bg: 'rgba(0,210,110,0.6)',   label: 'Ladder 🪜' },
          { bg: 'rgba(0,170,255,0.6)',   label: 'Start 🚀' },
          { bg: 'rgba(255,200,0,0.6)',   label: 'Finish 🏆' },
        ].map(({ bg, label }) => (
          <span key={label} className="gb-legend-item">
            <span className="gb-legend-dot" style={{ background: bg }} />
            {label}
          </span>
        ))}
      </div>

      <div className="gb-board" style={{ display:'grid', gridTemplateRows:`repeat(${boardSize},1fr)` }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display:'grid', gridTemplateColumns:`repeat(${boardSize},1fr)` }}>
            {row.map((num) => {
              const meta = cellMeta[num]
              return (
                <div
                  key={num}
                  className={`gb-cell ${getCellClass(num)}`}
                  style={{ minHeight: cellMinH }}
                  title={
                    meta?.type === 'snake-mouth' ? `Snake → ${meta.target}` :
                    meta?.type === 'ladder-base' ? `Ladder → ${meta.target}` :
                    `Cell ${num}`
                  }
                >
                  <span className="gb-cell-num" style={{ fontSize: cellFontSize }}>{num}</span>
                  {meta?.icon && (
                    <span className="gb-cell-icon" style={{ fontSize: iconSize }}>{meta.icon}</span>
                  )}
                  {meta?.type === 'snake-mouth' && (
                    <span className="gb-badge gb-badge-snake">→{meta.target}</span>
                  )}
                  {meta?.type === 'ladder-base' && (
                    <span className="gb-badge gb-badge-ladder">→{meta.target}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="gb-stats">
        <span>🐍 {Object.keys(snakes || {}).length} snakes</span>
        <span>🪜 {Object.keys(ladders || {}).length} ladders</span>
        <span>◼ {totalCells} cells</span>
      </div>
    </div>
  )
}
