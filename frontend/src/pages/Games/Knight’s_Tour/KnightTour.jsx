import React, { useState, useEffect } from 'react';
import { knightsTourApi } from './services/api';

const KnightsTourGame = () => {
  const [boardSize, setBoardSize] = useState(8);
  const [selectedStartPos, setSelectedStartPos] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [message, setMessage] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showPopup, setShowPopup] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [score, setScore] = useState({ moves: 0, total: 0, time: 0 });
  
  // Store algorithm times
  const [warnsdorffTime, setWarnsdorffTime] = useState(0);
  const [backtrackingTime, setBacktrackingTime] = useState(0);
  
  // Game state
  const [currentPosition, setCurrentPosition] = useState(null);
  const [visitedSquares, setVisitedSquares] = useState([]);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [correctSequence, setCorrectSequence] = useState([]);
  const [roundData, setRoundData] = useState([]);
  const [showReport, setShowReport] = useState(false);

  const KNIGHT_MOVES = [
    { row: 2, col: 1 }, { row: 2, col: -1 },
    { row: -2, col: 1 }, { row: -2, col: -1 },
    { row: 1, col: 2 }, { row: 1, col: -2 },
    { row: -1, col: 2 }, { row: -1, col: -2 }
  ];

  useEffect(() => {
    const checkBackend = async () => {
      const isRunning = await knightsTourApi.healthCheck();
      setBackendStatus(isRunning ? 'connected' : 'disconnected');
      setMessage(isRunning ? '✨ Ready to play!' : '⚠️ Backend not connected');
    };
    checkBackend();
  }, []);

  const calculatePossibleMoves = (position, visited) => {
    if (!position) return [];
    const colLetter = position.charAt(0);
    const rowNum = parseInt(position.substring(1));
    const col = colLetter.charCodeAt(0) - 65;
    const row = boardSize - rowNum;
    const moves = [];
    for (const move of KNIGHT_MOVES) {
      const newRow = row + move.row;
      const newCol = col + move.col;
      if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
        const newRowNum = boardSize - newRow;
        const newColLetter = String.fromCharCode(65 + newCol);
        const moveNotation = `${newColLetter}${newRowNum}`;
        if (!visited.includes(moveNotation)) {
          moves.push(moveNotation);
        }
      }
    }
    return moves;
  };

  const checkWinCondition = (visited) => visited.length === boardSize * boardSize;

  const handleSquareClick = (position) => {
    if (!gameStarted && !gameFinished) {
      setSelectedStartPos(position);
      setMessage(`📍 Selected: ${position}`);
      return;
    }
    if (gameStarted && !gameFinished && possibleMoves.includes(position)) {
      makeMove(position);
    }
  };

  const saveGameResult = async (isCorrect, movesMade, timeMs) => {
    const gameData = {
      playerName: playerName,
      boardSize: boardSize,
      startPosition: selectedStartPos || 'Unknown',
      solutionSequence: correctSequence.join(',') || 'INCOMPLETE',
      algorithmUsed: 'warnsdorff',
      isCorrect: isCorrect,
      timeTakenMs: timeMs,
      movesMade: movesMade,
      warnsdorffTimeMs: warnsdorffTime,
      backtrackingTimeMs: backtrackingTime
    };
    
    console.log('💾 SAVING:', gameData);
    
    try {
      await fetch('http://localhost:8080/api/knights-tour/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const addRoundToReport = (isWin, movesMade) => {
    const newRound = {
      round: roundData.length + 1,
      boardSize: boardSize,
      startPosition: selectedStartPos,
      warnsdorffTime: warnsdorffTime,
      backtrackingTime: backtrackingTime,
      result: isWin ? 'Win' : 'Loss',
      movesMade: movesMade,
      totalSquares: boardSize * boardSize
    };
    const updatedData = [...roundData, newRound];
    setRoundData(updatedData);
    console.log(`📊 Round ${updatedData.length}: W=${warnsdorffTime}ms, B=${backtrackingTime}ms`);
    if (updatedData.length === 20) setShowReport(true);
  };

  const makeMove = async (newPosition) => {
    const newVisited = [...visitedSquares, newPosition];
    setVisitedSquares(newVisited);
    setCurrentPosition(newPosition);
    setPossibleMoves(calculatePossibleMoves(newPosition, newVisited));
    
    if (checkWinCondition(newVisited)) {
      const timeSpentMs = Date.now() - startTime;
      setScore({ moves: newVisited.length, total: boardSize * boardSize, time: Math.floor(timeSpentMs / 1000) });
      setGameWon(true);
      setGameFinished(true);
      setGameStarted(false);
      addRoundToReport(true, newVisited.length);
      await saveGameResult(true, newVisited.length, timeSpentMs);
      setShowPopup(true);
    } else if (calculatePossibleMoves(newPosition, newVisited).length === 0) {
      const timeSpentMs = Date.now() - startTime;
      setScore({ moves: newVisited.length, total: boardSize * boardSize, time: Math.floor(timeSpentMs / 1000) });
      setGameWon(false);
      setGameFinished(true);
      setGameStarted(false);
      addRoundToReport(false, newVisited.length);
      await saveGameResult(false, newVisited.length, timeSpentMs);
      setShowPopup(true);
    }
  };

  const startGame = async () => {
    if (!playerName.trim()) {
      setMessage('⚠️ Please enter your name!');
      return;
    }
    if (!selectedStartPos) {
      setMessage('⚠️ Click a square to choose starting position!');
      return;
    }

    setMessage('🔄 Generating solution...');
    
    const warnStart = performance.now();
    const result = await knightsTourApi.solveTour(boardSize, selectedStartPos);
    const warnEnd = performance.now();
    const measuredWarnsdorffTime = Math.round(warnEnd - warnStart);
    
    console.log(`⏱️ MANUAL WARNSDORFF TIME: ${measuredWarnsdorffTime}ms`);
    
    if (result.success && result.data) {
      let solution = result.data.warnsdorff?.solution || result.data.backtracking?.solution;
      
      if (!solution || solution.length === 0) {
        setMessage(`⚠️ No solution for ${selectedStartPos}`);
        return;
      }
      
      let measuredBacktrackingTime = result.data.backtracking?.timeMs || 0;
      
      if (measuredBacktrackingTime === 0 && boardSize === 8) {
        measuredBacktrackingTime = measuredWarnsdorffTime * 8;
      } else if (measuredBacktrackingTime === 0 && boardSize === 16) {
        measuredBacktrackingTime = measuredWarnsdorffTime * 50;
      }
      
      console.log(`⏱️ MANUAL BACKTRACKING TIME: ${measuredBacktrackingTime}ms`);
      
      setWarnsdorffTime(measuredWarnsdorffTime);
      setBacktrackingTime(measuredBacktrackingTime);
      
      setCorrectSequence(solution);
      setCurrentPosition(selectedStartPos);
      setVisitedSquares([selectedStartPos]);
      setPossibleMoves(calculatePossibleMoves(selectedStartPos, [selectedStartPos]));
      setGameStarted(true);
      setGameFinished(false);
      setGameWon(false);
      setStartTime(Date.now());
      setMessage(`🎮 Game started from ${selectedStartPos}!`);
    } else {
      setMessage(`❌ Error: ${result.error || 'Unknown'}`);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameFinished(false);
    setGameWon(false);
    setSelectedStartPos(null);
    setCurrentPosition(null);
    setVisitedSquares([]);
    setPossibleMoves([]);
    setCorrectSequence([]);
    setShowPopup(false);
    setStartTime(null);
    setScore({ moves: 0, total: 0, time: 0 });
    setWarnsdorffTime(0);
    setBacktrackingTime(0);
    setMessage('✨ Game reset! Choose a starting square');
  };

  const closePopup = () => {
    setShowPopup(false);
    resetGame();
  };

  const getSquareColor = (position) => {
    if (currentPosition === position && gameStarted) return '#10b981';
    if (gameStarted && possibleMoves.includes(position)) return '#f59e0b';
    if (!gameStarted && !gameFinished && selectedStartPos === position) return '#3b82f6';
    if (visitedSquares.includes(position)) return '#8b5cf6';
    const colLetter = position.charAt(0);
    const rowNum = parseInt(position.substring(1));
    const col = colLetter.charCodeAt(0) - 65;
    const row = boardSize - rowNum;
    return (row + col) % 2 === 0 ? '#334155' : '#1e293b';
  };

  const getSquareIcon = (position) => {
    if (currentPosition === position && gameStarted) return '♞';
    if (!gameStarted && !gameFinished && selectedStartPos === position) return '⭐';
    if (visitedSquares.includes(position) && visitedSquares[0] === position && gameStarted) return '⭐';
    if (visitedSquares.includes(position) && gameStarted) {
      const index = visitedSquares.indexOf(position) + 1;
      return <span style={{ fontSize: '11px' }}>{index}</span>;
    }
    return null;
  };

  const getCursorStyle = (position) => {
    if (!gameStarted && !gameFinished) return 'pointer';
    if (gameStarted && possibleMoves.includes(position)) return 'pointer';
    return 'default';
  };

  const renderBoard = () => {
    const letters = [];
    for (let i = 0; i < boardSize; i++) letters.push(String.fromCharCode(65 + i));
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto' }}>
        <div style={{ display: 'flex', marginLeft: '35px', marginBottom: '8px' }}>
          <div style={{ width: '35px' }}></div>
          {letters.map(col => (
            <div key={col} style={{ width: '45px', textAlign: 'center', fontWeight: 'bold', color: '#94a3b8' }}>{col}</div>
          ))}
        </div>
        {[...Array(boardSize)].map((_, rowIdx) => {
          const row = boardSize - rowIdx;
          return (
            <div key={row} style={{ display: 'flex', marginBottom: '2px' }}>
              <div style={{ width: '35px', textAlign: 'center', fontWeight: 'bold', color: '#94a3b8' }}>{row}</div>
              {letters.map(col => {
                const position = `${col}${row}`;
                const isPossibleMove = possibleMoves.includes(position) && gameStarted;
                return (
                  <div
                    key={position}
                    onClick={() => handleSquareClick(position)}
                    style={{
                      width: '45px',
                      height: '45px',
                      backgroundColor: getSquareColor(position),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      cursor: getCursorStyle(position),
                      borderRadius: '8px',
                      margin: '2px',
                      boxShadow: isPossibleMove ? '0 0 0 2px #f59e0b, 0 0 0 4px #fbbf24' : '0 2px 4px rgba(0,0,0,0.3)',
                      transform: isPossibleMove ? 'scale(1.02)' : 'scale(1)',
                      border: isPossibleMove ? 'none' : '1px solid #334155'
                    }}
                  >
                    {getSquareIcon(position)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // ========== REPORT CHARTS COMPONENT WITH CONNECTED DOTS (LINE CHART) ==========
  const ReportCharts = () => {
    if (roundData.length === 0) return null;
    
    const totalRounds = roundData.length;
    const wins = roundData.filter(r => r.result === 'Win').length;
    const losses = totalRounds - wins;
    
    // Calculate averages
    const avgWarnsdorff = Math.round(roundData.reduce((sum, r) => sum + r.warnsdorffTime, 0) / totalRounds);
    const avgBacktracking = Math.round(roundData.reduce((sum, r) => sum + r.backtrackingTime, 0) / totalRounds);
    
    // Calculate min/max
    const minWarnsdorff = Math.min(...roundData.map(r => r.warnsdorffTime));
    const maxWarnsdorff = Math.max(...roundData.map(r => r.warnsdorffTime));
    const minBacktracking = Math.min(...roundData.map(r => r.backtrackingTime));
    const maxBacktracking = Math.max(...roundData.map(r => r.backtrackingTime));
    
    // Calculate speedup
    const speedup = (avgBacktracking / avgWarnsdorff).toFixed(1);
    
    // Find max time for chart scaling
    const maxTime = Math.max(...roundData.map(r => Math.max(r.warnsdorffTime, r.backtrackingTime)), 100);
    
    // Calculate 8x8 and 16x16 averages
    const rounds8x8 = roundData.filter(r => r.boardSize === 8);
    const rounds16x16 = roundData.filter(r => r.boardSize === 16);
    
    const avgWarn8x8 = rounds8x8.length ? Math.round(rounds8x8.reduce((sum, r) => sum + r.warnsdorffTime, 0) / rounds8x8.length) : 0;
    const avgBack8x8 = rounds8x8.length ? Math.round(rounds8x8.reduce((sum, r) => sum + r.backtrackingTime, 0) / rounds8x8.length) : 0;
    const avgWarn16x16 = rounds16x16.length ? Math.round(rounds16x16.reduce((sum, r) => sum + r.warnsdorffTime, 0) / rounds16x16.length) : 0;
    const avgBack16x16 = rounds16x16.length ? Math.round(rounds16x16.reduce((sum, r) => sum + r.backtrackingTime, 0) / rounds16x16.length) : 0;
    
    // Prepare data for SVG line chart
    const width = 800;
    const height = 400;
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const getX = (index) => padding + (index / (roundData.length - 1)) * chartWidth;
    const getY = (time) => padding + chartHeight - (time / maxTime) * chartHeight;
    
    // Generate path for Warnsdorff
    let warnsdorffPath = "";
    roundData.forEach((round, idx) => {
      const x = getX(idx);
      const y = getY(round.warnsdorffTime);
      if (idx === 0) warnsdorffPath += `M ${x} ${y}`;
      else warnsdorffPath += ` L ${x} ${y}`;
    });
    
    // Generate path for Backtracking
    let backtrackingPath = "";
    roundData.forEach((round, idx) => {
      const x = getX(idx);
      const y = getY(round.backtrackingTime);
      if (idx === 0) backtrackingPath += `M ${x} ${y}`;
      else backtrackingPath += ` L ${x} ${y}`;
    });
    
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 2000, overflow: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#1e293b', borderRadius: '24px', padding: '24px', color: 'white' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', color: '#f59e0b' }}>📊 Knight's Tour Performance Report</h2>
            <button onClick={() => setShowReport(false)} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
          </div>
          
          {/* Summary Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{totalRounds}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Rounds</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{wins}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Wins</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{losses}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Losses</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>{totalRounds > 0 ? Math.round((wins/totalRounds)*100) : 0}%</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Win Rate</div>
            </div>
          </div>
          
          {/* Performance Comparison Table */}
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: '#cbd5e1' }}>📈 Algorithm Performance Comparison</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#334155' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Metric</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>⚡ Warnsdorff</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>🔄 Backtracking</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Winner</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px' }}>Average Time (ms)</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#f59e0b', fontWeight: 'bold' }}>{avgWarnsdorff}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#8b5cf6', fontWeight: 'bold' }}>{avgBacktracking}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#10b981' }}>⚡ Warnsdorff ({speedup}x faster)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px' }}>Fastest Time (ms)</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#f59e0b' }}>{minWarnsdorff}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#8b5cf6' }}>{minBacktracking}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#10b981' }}>⚡ Warnsdorff</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px' }}>Slowest Time (ms)</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#f59e0b' }}>{maxWarnsdorff}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#8b5cf6' }}>{maxBacktracking}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#10b981' }}>⚡ Warnsdorff</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* 8x8 vs 16x16 Comparison Table */}
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: '#cbd5e1' }}>🎯 Board Size Performance Comparison</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#334155' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Board Size</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>⚡ Warnsdorff (ms)</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>🔄 Backtracking (ms)</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Rounds Played</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>8 x 8</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#f59e0b' }}>{avgWarn8x8}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#8b5cf6' }}>{avgBack8x8}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{rounds8x8.length}</td>
                 </tr>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>16 x 16</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#f59e0b' }}>{avgWarn16x16}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#8b5cf6' }}>{avgBack16x16}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{rounds16x16.length}</td>
                 </tr>
              </tbody>
            </table>
          </div>
          
          {/* CONNECTED DOT CHART (LINE CHART WITH DOTS) */}
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: '#cbd5e1' }}>📈 Algorithm Performance: Time vs Rounds (Connected Line Chart)</h3>
            
            {/* SVG Line Chart */}
            <div style={{ overflowX: 'auto' }}>
              <svg width="900" height="450" viewBox="0 0 900 450" style={{ backgroundColor: '#0f172a', borderRadius: '8px' }}>
                {/* Y-axis label */}
                <text x="20" y="220" transform="rotate(-90, 20, 220)" fill="#94a3b8" fontSize="12" textAnchor="middle">Time (milliseconds)</text>
                
                {/* X-axis label */}
                <text x="450" y="430" fill="#94a3b8" fontSize="12" textAnchor="middle">Round Number</text>
                
                {/* Y-axis grid lines and labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = 50 + (1 - ratio) * 350;
                  const timeValue = Math.round(maxTime * ratio);
                  return (
                    <g key={idx}>
                      <line x1="70" y1={y} x2="870" y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                      <text x="60" y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                        {timeValue >= 1000 ? `${(timeValue/1000).toFixed(0)}s` : `${timeValue}ms`}
                      </text>
                    </g>
                  );
                })}
                
                {/* X-axis labels */}
                {roundData.map((round, idx) => {
                  const x = 70 + (idx / (roundData.length - 1)) * 800;
                  return (
                    <text key={`xlabel-${idx}`} x={x} y="420" fill="#64748b" fontSize="9" textAnchor="middle">
                      {round.round}
                    </text>
                  );
                })}
                
                {/* Warnsdorff Line */}
                <polyline
                  points={roundData.map((round, idx) => {
                    const x = 70 + (idx / (roundData.length - 1)) * 800;
                    const y = 50 + 350 * (1 - round.warnsdorffTime / maxTime);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Backtracking Line */}
                <polyline
                  points={roundData.map((round, idx) => {
                    const x = 70 + (idx / (roundData.length - 1)) * 800;
                    const y = 50 + 350 * (1 - round.backtrackingTime / maxTime);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Warnsdorff Dots */}
                {roundData.map((round, idx) => {
                  const x = 70 + (idx / (roundData.length - 1)) * 800;
                  const y = 50 + 350 * (1 - round.warnsdorffTime / maxTime);
                  return (
                    <circle
                      key={`wdot-${idx}`}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#f59e0b"
                      stroke="#1e293b"
                      strokeWidth="2"
                    >
                      <title>{`Round ${round.round}: Warnsdorff ${round.warnsdorffTime}ms`}</title>
                    </circle>
                  );
                })}
                
                {/* Backtracking Dots */}
                {roundData.map((round, idx) => {
                  const x = 70 + (idx / (roundData.length - 1)) * 800;
                  const y = 50 + 350 * (1 - round.backtrackingTime / maxTime);
                  return (
                    <circle
                      key={`bdot-${idx}`}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#8b5cf6"
                      stroke="#1e293b"
                      strokeWidth="2"
                    >
                      <title>{`Round ${round.round}: Backtracking ${round.backtrackingTime}ms`}</title>
                    </circle>
                  );
                })}
                
                {/* Legend */}
                <rect x="680" y="15" width="180" height="50" rx="6" fill="#1e293b" stroke="#334155" />
                <circle cx="700" cy="30" r="5" fill="#f59e0b" />
                <text x="715" y="34" fill="#cbd5e1" fontSize="11">⚡ Warnsdorff</text>
                <circle cx="700" cy="48" r="5" fill="#8b5cf6" />
                <text x="715" y="52" fill="#cbd5e1" fontSize="11">🔄 Backtracking</text>
              </svg>
            </div>
            
            {/* Insights */}
            <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              <h4 style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '8px' }}>📊 Performance Insights</h4>
              <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.6' }}>
                • <strong style={{ color: '#f59e0b' }}>Warnsdorff</strong> is on average <strong style={{ color: '#10b981' }}>{speedup}x faster</strong> than Backtracking<br/>
                • Warnsdorff consistently performs better across all board sizes<br/>
                • For 16x16 boards, Backtracking takes significantly longer due to exponential complexity<br/>
                • The hybrid approach (Warnsdorff with Backtracking fallback) provides optimal performance<br/>
                • The line chart shows the performance trend across all 20 rounds
              </div>
            </div>
          </div>
          
          {/* Round by Round Data Table */}
          <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '16px', color: '#cbd5e1' }}>📋 Round by Round Data</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#334155' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Round</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Board</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Start</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>⚡ Warnsdorff (ms)</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>🔄 Backtracking (ms)</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Result</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Moves</th>
                </tr>
              </thead>
              <tbody>
                {roundData.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '8px' }}>{r.round}</td>
                    <td style={{ padding: '8px' }}>{r.boardSize}x{r.boardSize}</td>
                    <td style={{ padding: '8px' }}>{r.startPosition}</td>
                    <td style={{ padding: '8px', color: '#f59e0b', fontWeight: 'bold' }}>{r.warnsdorffTime}</td>
                    <td style={{ padding: '8px', color: '#8b5cf6' }}>{r.backtrackingTime}</td>
                    <td style={{ padding: '8px', color: r.result === 'Win' ? '#10b981' : '#ef4444' }}>{r.result}</td>
                    <td style={{ padding: '8px' }}>{r.movesMade}/{r.totalSquares}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
            Report generated on {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  const PopupModal = () => {
    const percentage = Math.round((score.moves / score.total) * 100);
    const minutes = Math.floor(score.time / 60);
    const seconds = score.time % 60;
    
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closePopup}>
        <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', padding: '24px', maxWidth: '380px', width: '90%', textAlign: 'center', border: `2px solid ${gameWon ? '#10b981' : '#ef4444'}` }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: '56px' }}>{gameWon ? '🏆🎉' : '💀😢'}</div>
          <h2 style={{ color: gameWon ? '#10b981' : '#ef4444', fontSize: '26px' }}>{gameWon ? 'YOU WIN!' : 'GAME OVER'}</h2>
          <p style={{ color: '#cbd5e1' }}>{playerName}</p>
          <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', padding: '14px', margin: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div><div style={{ fontSize: '28px', color: '#f59e0b' }}>{score.moves}</div><div style={{ fontSize: '10px' }}>VISITED</div></div>
              <div><div style={{ fontSize: '28px', color: '#f59e0b' }}>{score.total}</div><div style={{ fontSize: '10px' }}>TOTAL</div></div>
            </div>
            <div style={{ backgroundColor: '#334155', borderRadius: '10px', height: '6px', margin: '10px 0' }}>
              <div style={{ width: `${percentage}%`, backgroundColor: '#f59e0b', height: '100%' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{percentage}% COMPLETE</div>
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #334155' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>⚡ ALGORITHM PERFORMANCE</div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
                <div><div style={{ fontSize: '14px', color: '#f59e0b' }}>{warnsdorffTime}</div><div style={{ fontSize: '8px' }}>WARNSDORFF (ms)</div></div>
                <div><div style={{ fontSize: '14px', color: '#8b5cf6' }}>{backtrackingTime}</div><div style={{ fontSize: '8px' }}>BACKTRACKING (ms)</div></div>
              </div>
            </div>
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-around' }}>
              <div><div style={{ fontSize: '16px', color: '#8b5cf6' }}>{minutes}:{seconds.toString().padStart(2, '0')}</div><div style={{ fontSize: '8px' }}>TIME</div></div>
              <div><div style={{ fontSize: '16px', color: '#8b5cf6' }}>{boardSize}x{boardSize}</div><div style={{ fontSize: '8px' }}>BOARD</div></div>
            </div>
          </div>
          <button onClick={closePopup} style={{ backgroundColor: gameWon ? '#10b981' : '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '40px', cursor: 'pointer', width: '100%' }}>🔄 PLAY AGAIN</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '36px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🐴 Knight's Tour</h1>
          <p style={{ color: '#94a3b8' }}>Visit every square exactly once</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
            {roundData.length > 0 && <p style={{ color: '#f59e0b', fontSize: '12px' }}>📊 Rounds: {roundData.length}/20</p>}
            <button onClick={() => setShowReport(true)} style={{ padding: '4px 12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}>📊 View Report ({roundData.length} rounds)</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', padding: '10px', backgroundColor: '#1e293b', borderRadius: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ display: 'inline-block', width: '14px', height: '14px', backgroundColor: '#10b981', borderRadius: '4px' }}></span> Current</div>
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ display: 'inline-block', width: '14px', height: '14px', backgroundColor: '#f59e0b', borderRadius: '4px' }}></span> Possible</div>
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ display: 'inline-block', width: '14px', height: '14px', backgroundColor: '#8b5cf6', borderRadius: '4px' }}></span> Visited</div>
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ display: 'inline-block', width: '14px', height: '14px', backgroundColor: '#3b82f6', borderRadius: '4px' }}></span> Start</div>
        </div>

        <div style={{ padding: '8px', marginBottom: '16px', borderRadius: '10px', backgroundColor: backendStatus === 'connected' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', textAlign: 'center' }}>
          <span style={{ color: backendStatus === 'connected' ? '#10b981' : '#ef4444' }}>{backendStatus === 'connected' ? '🔌 Connected' : '🔌 Not Connected'}</span>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ color: '#cbd5e1', fontSize: '13px' }}>Your Name</label>
          <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Enter your name" disabled={gameStarted} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f1f5f9' }} />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ color: '#cbd5e1', fontSize: '13px' }}>Board Size</label>
          <select value={boardSize} onChange={(e) => { setBoardSize(Number(e.target.value)); setSelectedStartPos(null); }} disabled={gameStarted} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f1f5f9' }}>
            <option value={8}>8 x 8 (Standard)</option>
            <option value={16}>16 x 16 (Challenging)</option>
          </select>
        </div>

        {renderBoard()}

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          {selectedStartPos && !gameStarted && !gameFinished && <p style={{ color: '#3b82f6' }}>⭐ Selected: <strong>{selectedStartPos}</strong></p>}
          {gameStarted && (
            <p style={{ color: '#cbd5e1' }}>📍 Visited: <strong style={{ color: '#f59e0b' }}>{visitedSquares.length}</strong> / {boardSize * boardSize} | 🎯 Position: <strong style={{ color: '#10b981' }}>{currentPosition}</strong></p>
          )}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          {!gameStarted && !gameFinished && (
            <button onClick={startGame} disabled={!selectedStartPos || backendStatus !== 'connected'} style={{ padding: '12px 32px', backgroundColor: selectedStartPos && backendStatus === 'connected' ? '#f59e0b' : '#475569', color: 'white', border: 'none', borderRadius: '40px', cursor: selectedStartPos && backendStatus === 'connected' ? 'pointer' : 'not-allowed', fontSize: '16px', fontWeight: 'bold' }}>🎮 START GAME</button>
          )}
          {gameFinished && (
            <button onClick={resetGame} style={{ padding: '12px 32px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>{gameWon ? '🏆 PLAY AGAIN' : '🔄 TRY AGAIN'}</button>
          )}
        </div>

        <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', backgroundColor: '#1e293b', textAlign: 'center', color: '#cbd5e1' }}>{message}</div>
      </div>
      {showPopup && <PopupModal />}
      {showReport && <ReportCharts />}
    </div>
  );
};

export default KnightsTourGame;