import React, { useState, useEffect } from 'react';
import { knightsTourApi } from "./services/api";


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
  
  // Game state
  const [currentPosition, setCurrentPosition] = useState(null);
  const [visitedSquares, setVisitedSquares] = useState([]);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [correctSequence, setCorrectSequence] = useState([]);

  // Knight move offsets
  const KNIGHT_MOVES = [
    { row: 2, col: 1 }, { row: 2, col: -1 },
    { row: -2, col: 1 }, { row: -2, col: -1 },
    { row: 1, col: 2 }, { row: 1, col: -2 },
    { row: -1, col: 2 }, { row: -1, col: -2 }
  ];

  // Check backend on startup
  useEffect(() => {
    const checkBackend = async () => {
      const isRunning = await knightsTourApi.healthCheck();
      setBackendStatus(isRunning ? 'connected' : 'disconnected');
      setMessage(isRunning ? '✨ Ready to play! Click a square to start' : '⚠️ Backend not connected');
    };
    checkBackend();
  }, []);

  // Calculate possible moves from a given position
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

  // Check if the player has won
  const checkWinCondition = (visited) => {
    return visited.length === boardSize * boardSize;
  };

  // Handle clicking on a square
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

  // Save game result to database - FIXED VERSION
  const saveGameResult = async (isCorrect, movesMade, timeMs) => {
    console.log(`💾 Saving ${isCorrect ? 'WIN' : 'LOSS'} to database...`);
    console.log(`   - Time: ${timeMs} ms`);
    console.log(`   - Moves: ${movesMade}`);
    
    if (!playerName) {
      console.error('❌ No player name!');
      setMessage('⚠️ Please enter your name before playing!');
      return;
    }
    
    const correctSolution = correctSequence.join(',');
    
    const gameData = {
      playerName: playerName,
      boardSize: boardSize,
      startPosition: selectedStartPos || 'Unknown',
      solutionSequence: correctSolution || 'INCOMPLETE',
      algorithmUsed: 'warnsdorff',
      isCorrect: isCorrect,
      timeTakenMs: timeMs,
      movesMade: movesMade
    };
    
    console.log('📤 Sending to backend:', gameData);
    
    try {
      const response = await fetch('http://localhost:8082/api/knights-tour/save-result', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(gameData)
      });
      
      const result = await response.json();
      console.log('📥 Backend response:', result);
      
      if (response.ok && result.status === 'success') {
        console.log(`✅ ${isCorrect ? 'WIN' : 'LOSS'} saved! Time: ${timeMs}ms`);
        setMessage(isCorrect ? `🏆 Victory recorded! Time: ${(timeMs/1000).toFixed(1)}s` : `📝 Game recorded!`);
      } else {
        console.error('❌ Backend error:', result);
        setMessage('⚠️ Failed to save to database.');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setMessage('⚠️ Cannot connect to backend.');
    }
  };

  // Make a move during gameplay
  const makeMove = async (newPosition) => {
    const newVisited = [...visitedSquares, newPosition];
    setVisitedSquares(newVisited);
    setCurrentPosition(newPosition);
    
    const newPossibleMoves = calculatePossibleMoves(newPosition, newVisited);
    setPossibleMoves(newPossibleMoves);
    
    setMessage(`🎯 Moved to ${newPosition}`);
    
    // Check if player won (visited all squares)
    if (checkWinCondition(newVisited)) {
      const endTime = Date.now();
      const timeSpentSeconds = Math.floor((endTime - startTime) / 1000);
      const timeSpentMs = endTime - startTime;
      
      console.log(`🏆 WIN! Time: ${timeSpentSeconds} seconds (${timeSpentMs} ms)`);
      
      setScore({
        moves: newVisited.length,
        total: boardSize * boardSize,
        time: timeSpentSeconds
      });
      setGameWon(true);
      setGameFinished(true);
      setGameStarted(false);
      
      await saveGameResult(true, newVisited.length, timeSpentMs);
      
      setShowPopup(true);
      setPossibleMoves([]);
    }
    // Check if player lost (stuck with no moves)
    else if (newPossibleMoves.length === 0) {
      const endTime = Date.now();
      const timeSpentSeconds = Math.floor((endTime - startTime) / 1000);
      const timeSpentMs = endTime - startTime;
      
      console.log(`💀 LOSS! Time: ${timeSpentSeconds} seconds (${timeSpentMs} ms)`);
      
      setScore({
        moves: newVisited.length,
        total: boardSize * boardSize,
        time: timeSpentSeconds
      });
      setGameWon(false);
      setGameFinished(true);
      setGameStarted(false);
      
      await saveGameResult(false, newVisited.length, timeSpentMs);
      
      setShowPopup(true);
    }
  };

  // Start the game
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
    setStartTime(Date.now());
    
    const result = await knightsTourApi.solveTour(boardSize, selectedStartPos);
    
    if (result.success && result.data) {
      const solution = result.data.warnsdorff?.solution || result.data.backtracking?.solution;
      
      if (!solution || solution.length === 0) {
        setMessage(`⚠️ No solution for ${selectedStartPos}. Try another square!`);
        return;
      }
      
      setCorrectSequence(solution);
      setCurrentPosition(selectedStartPos);
      setVisitedSquares([selectedStartPos]);
      setPossibleMoves(calculatePossibleMoves(selectedStartPos, [selectedStartPos]));
      setGameStarted(true);
      setGameFinished(false);
      setGameWon(false);
      setMessage(`🎮 Game started from ${selectedStartPos}!`);
    } else {
      setMessage(`❌ Error: ${result.error || 'Unknown'}`);
    }
  };

  // Reset game
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
    setMessage('✨ Game reset! Choose a starting square');
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    resetGame();
  };

  // Get square color (dark theme)
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

  // Get square icon
  const getSquareIcon = (position) => {
    if (currentPosition === position && gameStarted) return '♞';
    if (!gameStarted && !gameFinished && selectedStartPos === position) return '⭐';
    if (visitedSquares.includes(position) && visitedSquares[0] === position && gameStarted) return '⭐';
    if (visitedSquares.includes(position) && gameStarted) {
      const index = visitedSquares.indexOf(position) + 1;
      return <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{index}</span>;
    }
    return null;
  };

  // Get cursor style
  const getCursorStyle = (position) => {
    if (!gameStarted && !gameFinished) return 'pointer';
    if (gameStarted && possibleMoves.includes(position)) return 'pointer';
    return 'default';
  };

  // Render board
  const renderBoard = () => {
    const letters = [];
    for (let i = 0; i < boardSize; i++) letters.push(String.fromCharCode(65 + i));
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto' }}>
        <div style={{ display: 'flex', marginLeft: '35px', marginBottom: '8px' }}>
          <div style={{ width: '35px' }}></div>
          {letters.map(col => (
            <div key={col} style={{ width: '45px', textAlign: 'center', fontWeight: 'bold', color: '#94a3b8' }}>
              {col}
            </div>
          ))}
        </div>
        
        {[...Array(boardSize)].map((_, rowIdx) => {
          const row = boardSize - rowIdx;
          return (
            <div key={row} style={{ display: 'flex', marginBottom: '2px' }}>
              <div style={{ width: '35px', textAlign: 'center', fontWeight: 'bold', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {row}
              </div>
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
                      fontWeight: 'bold',
                      cursor: getCursorStyle(position),
                      borderRadius: '8px',
                      margin: '2px',
                      transition: 'all 0.2s ease',
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

  // Score Popup Modal
  const PopupModal = () => {
    const percentage = Math.round((score.moves / score.total) * 100);
    const minutes = Math.floor(score.time / 60);
    const seconds = score.time % 60;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease',
        backdropFilter: 'blur(5px)',
        overflow: 'auto',
        padding: '20px'
      }} onClick={closePopup}>
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: '380px',
          width: '100%',
          textAlign: 'center',
          animation: 'slideUp 0.3s ease',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: `2px solid ${gameWon ? '#10b981' : '#ef4444'}`,
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 'auto'
        }} onClick={(e) => e.stopPropagation()}>
          
          <div style={{ fontSize: '56px', marginBottom: '8px' }}>
            {gameWon ? '🏆🎉' : '💀😢'}
          </div>
          
          <h2 style={{ 
            color: gameWon ? '#10b981' : '#ef4444', 
            fontSize: '26px', 
            marginBottom: '4px',
            fontWeight: 'bold'
          }}>
            {gameWon ? 'YOU WIN!' : 'GAME OVER'}
          </h2>
          
          <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '16px' }}>
            {playerName}
          </p>
          
          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '16px'
          }}>
            <h3 style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '10px', letterSpacing: '1px' }}>
              📊 YOUR SCORE
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {score.moves}
                </div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>VISITED</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {score.total}
                </div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>TOTAL</div>
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#334155',
              borderRadius: '10px',
              height: '6px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                width: `${percentage}%`,
                backgroundColor: gameWon ? '#10b981' : '#f59e0b',
                height: '100%',
                transition: 'width 0.5s ease'
              }} />
            </div>
            
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '12px' }}>
              {percentage}% COMPLETE
            </div>
            
            <div style={{ 
              marginTop: '12px', 
              paddingTop: '10px', 
              borderTop: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-around'
            }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>TIME</div>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {boardSize}x{boardSize}
                </div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>BOARD</div>
              </div>
            </div>
          </div>
          
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
            {gameWon 
              ? '✨ Amazing! You mastered the Knight\'s Tour!' 
              : `💪 ${score.moves} out of ${score.total} squares. Try again!`}
          </p>
          
          <button
            onClick={closePopup}
            style={{
              backgroundColor: gameWon ? '#10b981' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              fontSize: '15px',
              fontWeight: 'bold',
              borderRadius: '40px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.backgroundColor = gameWon ? '#059669' : '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = gameWon ? '#10b981' : '#3b82f6';
            }}
          >
            🔄 PLAY AGAIN
          </button>
          
          <p style={{ fontSize: '9px', color: '#64748b', marginTop: '10px', marginBottom: '0' }}>
            Tap outside to close
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      padding: '16px',
      fontFamily: "'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        border: '1px solid #334155'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px'
          }}>
            🐴 Knight's Tour
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Visit every square exactly once</p>
        </div>

        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '20px', 
          padding: '8px',
          backgroundColor: '#1e293b',
          borderRadius: '10px',
          fontSize: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ color: 'white' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px', marginRight: '4px' }}></span> 
            Current
          </div>
          <div style={{ color: 'white' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '3px', marginRight: '4px' }}></span> 
            Possible
          </div>
          <div style={{ color: 'white' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#8b5cf6', borderRadius: '3px', marginRight: '4px' }}></span> 
            Visited
          </div>
          <div style={{ color: 'white' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '3px', marginRight: '4px' }}></span> 
            Start
          </div>
        </div>
        
        {/* Backend Status */}
        <div style={{ 
          padding: '8px', 
          marginBottom: '16px', 
          borderRadius: '10px',
          backgroundColor: backendStatus === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${backendStatus === 'connected' ? '#10b981' : '#ef4444'}`,
          textAlign: 'center',
          fontSize: '13px'
        }}>
          <span style={{ color: backendStatus === 'connected' ? '#10b981' : '#ef4444' }}>
            {backendStatus === 'connected' ? '🔌 Connected' : '🔌 Not Connected'}
          </span>
        </div>
        
        {/* Player Name Input */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#cbd5e1', fontSize: '13px' }}>Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            disabled={gameStarted}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
              fontSize: '14px'
            }}
          />
        </div>
        
        {/* Board Size Selection */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#cbd5e1', fontSize: '13px' }}>Board Size</label>
          <select
            value={boardSize}
            onChange={(e) => {
              setBoardSize(Number(e.target.value));
              setSelectedStartPos(null);
            }}
            disabled={gameStarted}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
              fontSize: '14px'
            }}
          >
            <option value={8}>8 x 8 (Standard)</option>
            <option value={16}>16 x 16 (Challenging)</option>
          </select>
        </div>
        
        {/* Chess Board */}
        {renderBoard()}
        
        {/* Game Info */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          {selectedStartPos && !gameStarted && !gameFinished && (
            <p style={{ color: '#3b82f6', fontSize: '13px' }}>
              ⭐ Selected: <strong>{selectedStartPos}</strong>
            </p>
          )}
          {gameStarted && (
            <>
              <p style={{ color: '#cbd5e1', fontSize: '13px' }}>
                📍 Visited: <strong style={{ color: '#f59e0b' }}>{visitedSquares.length}</strong> / {boardSize * boardSize}
                {' | '}
                🎯 Position: <strong style={{ color: '#10b981' }}>{currentPosition}</strong>
              </p>
            </>
          )}
        </div>
        
        {/* Buttons */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          {!gameStarted && !gameFinished && (
            <button
              onClick={startGame}
              disabled={!selectedStartPos || backendStatus !== 'connected'}
              style={{
                padding: '12px 32px',
                backgroundColor: selectedStartPos && backendStatus === 'connected' ? '#f59e0b' : '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: selectedStartPos && backendStatus === 'connected' ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              🎮 START GAME
            </button>
          )}
          
          {gameFinished && (
            <button
              onClick={resetGame}
              style={{
                padding: '12px 32px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {gameWon ? '🏆 PLAY AGAIN' : '🔄 TRY AGAIN'}
            </button>
          )}
        </div>
        
        {/* Message */}
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          borderRadius: '10px',
          backgroundColor: '#1e293b',
          textAlign: 'center',
          color: '#cbd5e1',
          fontSize: '13px'
        }}>
          {message}
        </div>
      </div>
      
      {showPopup && <PopupModal />}
    </div>
  );
};

export default KnightsTourGame;