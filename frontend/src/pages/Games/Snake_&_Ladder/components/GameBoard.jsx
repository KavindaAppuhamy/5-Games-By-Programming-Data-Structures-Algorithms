import React, { useEffect, useRef, useMemo } from 'react'

const BOARD = 10
const CELLS = BOARD * BOARD

const DEFAULT_SNAKES  = { 99:78, 95:75, 87:24, 62:19, 54:34, 17:7 }
const DEFAULT_LADDERS = { 4:14, 9:31, 20:38, 28:84, 40:59, 51:67, 63:81, 71:91 }

export default function SnakesLaddersBoard({
  snakes  = DEFAULT_SNAKES,
  ladders = DEFAULT_LADDERS,
  boardSize = BOARD,
  totalCells = CELLS,
}) {
  const svgRef = useRef(null)
  const W = 500, H = 500
  const CELL = W / boardSize

  /* ── helpers ───────────────────────────────────────────────── */
  function cellCenter(num) {
    const idx        = num - 1
    const rowFromBot = Math.floor(idx / boardSize)
    const colInRow   = idx % boardSize
    const col        = rowFromBot % 2 === 0 ? colInRow : boardSize - 1 - colInRow
    const row        = boardSize - 1 - rowFromBot
    return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 }
  }

  function mk(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag)
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    return el
  }

  /* ── draw ladder ────────────────────────────────────────────── */
  function drawLadder(svg, from, to) {
    const a = cellCenter(from), b = cellCenter(to)
    const dx = b.x - a.x, dy = b.y - a.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const ux = dx / len, uy = dy / len
    const px = -uy * 5, py = ux * 5

    const g = mk('g')

    // Rails
    for (const s of [1, -1]) {
      g.appendChild(mk('line', {
        x1: a.x + px*s, y1: a.y + py*s,
        x2: b.x + px*s, y2: b.y + py*s,
        stroke: '#c8a84b', 'stroke-width': 2.5, 'stroke-linecap': 'round',
      }))
    }

    // Rungs
    const rungs = Math.max(3, Math.floor(len / 20))
    for (let i = 1; i < rungs; i++) {
      const t = i / rungs
      const rx = a.x + dx * t, ry = a.y + dy * t
      g.appendChild(mk('line', {
        x1: rx + px, y1: ry + py, x2: rx - px, y2: ry - py,
        stroke: '#e8c46a', 'stroke-width': 2, 'stroke-linecap': 'round',
      }))
    }

    // End circles
    g.appendChild(mk('circle', { cx: a.x, cy: a.y, r: 4, fill: '#639922', stroke: '#97c459', 'stroke-width': 1 }))
    g.appendChild(mk('circle', { cx: b.x, cy: b.y, r: 4, fill: '#1d9e75', stroke: '#5dcaa5', 'stroke-width': 1 }))

    svg.appendChild(g)
  }

  /* ── draw snake ─────────────────────────────────────────────── */
  function drawSnake(svg, from, to) {
    const a = cellCenter(from), b = cellCenter(to)
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
    const dx = b.x - a.x, dy = b.y - a.y
    const off = 35
    const cpx  = mx + dy * 0.35 + off,  cpy  = my - dx * 0.35
    const cp2x = mx - dy * 0.35 - off,  cp2y = my + dx * 0.35
    const curve = `M${a.x},${a.y} C${cpx},${cpy} ${cp2x},${cp2y} ${b.x},${b.y}`

    svg.appendChild(mk('path', { d: curve, fill: 'none', stroke: '#501313', 'stroke-width': 9,   'stroke-linecap': 'round' }))
    svg.appendChild(mk('path', { d: curve, fill: 'none', stroke: '#e24b4a', 'stroke-width': 5.5, 'stroke-linecap': 'round', 'stroke-dasharray': '12 6', opacity: 0.9 }))
    svg.appendChild(mk('path', { d: curve, fill: 'none', stroke: '#f09595', 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.5 }))

    // Head
    const g   = mk('g')
    const ang  = Math.atan2(b.y - a.y, b.x - a.x)
    const perpX = -Math.sin(ang) * 3, perpY = Math.cos(ang) * 3
    const fwdX  =  Math.cos(ang) * 2, fwdY  = Math.sin(ang) * 2

    g.appendChild(mk('circle', { cx: a.x, cy: a.y, r: 8, fill: '#a32d2d', stroke: '#e24b4a', 'stroke-width': 1.5 }))

    // Eyes
    for (const s of [1, -1]) {
      g.appendChild(mk('circle', { cx: a.x + fwdX + perpX*s, cy: a.y + fwdY + perpY*s, r: 1.8, fill: '#fcebeb' }))
      g.appendChild(mk('circle', { cx: a.x + fwdX + perpX*s, cy: a.y + fwdY + perpY*s, r: 0.8, fill: '#2c2c2a' }))
    }

    // Tongue
    const tx = a.x - fwdX * 3, ty = a.y - fwdY * 3
    g.appendChild(mk('line', { x1: a.x - fwdX * 1.5, y1: a.y - fwdY * 1.5, x2: tx, y2: ty, stroke: '#f09595', 'stroke-width': 1, 'stroke-linecap': 'round' }))
    for (const s of [1, -1]) {
      g.appendChild(mk('line', {
        x1: tx, y1: ty,
        x2: tx + perpX * 1.5 * s - fwdX, y2: ty + perpY * 1.5 * s - fwdY,
        stroke: '#f09595', 'stroke-width': 1, 'stroke-linecap': 'round',
      }))
    }

    // Tail dot
    g.appendChild(mk('circle', { cx: b.x, cy: b.y, r: 4, fill: '#791f1f', stroke: '#e24b4a88', 'stroke-width': 1 }))
    svg.appendChild(g)
  }

  /* ── build board imperatively ───────────────────────────────── */
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const snakeTails   = new Set(Object.values(snakes).map(Number))
    const ladderTops   = new Set(Object.values(ladders).map(Number))

    // Background
    svg.appendChild(mk('rect', { x: 0, y: 0, width: W, height: H, fill: '#12192b' }))

    // Cells
    for (let num = 1; num <= totalCells; num++) {
      const { x, y } = cellCenter(num)
      const cx = x - CELL / 2, cy = y - CELL / 2
      const isEven = (Math.floor((num-1)/boardSize) + ((num-1)%boardSize)) % 2 === 0

      let fill   = isEven ? '#1c2a40' : '#19243a'
      let stroke = '#ffffff10'

      if (num === 1)            { fill = '#0c447c44'; stroke = '#378add' }
      else if (num === totalCells) { fill = '#ba751744'; stroke = '#ef9f27' }
      else if (snakes[num])     { fill = '#a32d2d55'; stroke = '#e24b4a' }
      else if (snakeTails.has(num))  { fill = '#a32d2d18'; stroke = '#e24b4a55' }
      else if (ladders[num])    { fill = '#3b6d1140'; stroke = '#639922' }
      else if (ladderTops.has(num))  { fill = '#3b6d1120'; stroke = '#63992255' }

      svg.appendChild(mk('rect', { x: cx, y: cy, width: CELL, height: CELL, fill, stroke, 'stroke-width': 0.5, rx: 2 }))

      const t = mk('text', {
        x, y: cy + 9,
        'text-anchor': 'middle', 'dominant-baseline': 'middle',
        'font-size': 8, fill: '#ffffff55', 'font-family': 'monospace', 'font-weight': '600',
      })
      t.textContent = num
      svg.appendChild(t)
    }

    // Ladders (behind snakes)
    for (const [base, top] of Object.entries(ladders)) drawLadder(svg, +base, +top)

    // Snakes (on top)
    for (const [mouth, tail] of Object.entries(snakes)) drawSnake(svg, +mouth, +tail)

    // Start / End badges
    for (const [num, label, color] of [[1,'START','#85b7eb'], [totalCells,'END','#fac775']]) {
      const { x, y } = cellCenter(num)
      const t = mk('text', { x, y: y+4, 'text-anchor':'middle', 'dominant-baseline':'middle', 'font-size':9, fill:color, 'font-family':'monospace', 'font-weight':'bold' })
      t.textContent = label
      svg.appendChild(t)
    }

    // Grid lines
    for (let i = 0; i <= boardSize; i++) {
      svg.appendChild(mk('line', { x1: i*CELL, y1: 0, x2: i*CELL, y2: H, stroke: '#ffffff08', 'stroke-width': 0.5 }))
      svg.appendChild(mk('line', { x1: 0, y1: i*CELL, x2: W, y2: i*CELL, stroke: '#ffffff08', 'stroke-width': 0.5 }))
    }
  }, [snakes, ladders, boardSize, totalCells])

  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
      {/* Legend */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:12 }}>
        {[
          ['#e24b4a', 'Snake mouth'],
          ['#63992240', 'Ladder base'],
          ['#378add40', 'Start'],
          ['#ba751740', 'Finish'],
        ].map(([bg, label]) => (
          <span key={label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#888' }}>
            <span style={{ width:10, height:10, borderRadius:3, background:bg, flexShrink:0 }} />
            {label}
          </span>
        ))}
      </div>

      {/* Board */}
      <div style={{
        position:'relative', width:'100%', aspectRatio:'1',
        borderRadius:12, overflow:'hidden',
        border:'1.5px solid #ffffff22', background:'#1a2233',
      }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
        />
      </div>

      {/* Stats */}
      <div style={{ marginTop:10, display:'flex', gap:18, fontSize:12, color:'#666', fontFamily:'monospace' }}>
        <span>🐍 {Object.keys(snakes).length} snakes</span>
        <span>🪜 {Object.keys(ladders).length} ladders</span>
        <span>◼ {totalCells} cells</span>
      </div>
    </div>
  )
}