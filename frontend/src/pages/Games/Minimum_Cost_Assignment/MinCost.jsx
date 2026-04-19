import { useMemo, useState } from 'react';
import MinCostControls from './MinCostControls';
import MinCostResults from './MinCostResults';
import MinCostHistory from './MinCostHistory';
import GameScoreboard from './GameScoreboard';
import GameChallenge from './GameChallenge';
import { solveMinCost, fetchPlayerStatus } from '../../../api/mincost';

const PLAYER_NAME_KEY = 'mincost_player_name';

function getStoredPlayerName() {
  try {
    return (localStorage.getItem(PLAYER_NAME_KEY) || '').trim();
  } catch {
    return '';
  }
}

function setStoredPlayerName(name) {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  } catch {
    // ignore storage errors
  }
}

export default function MinCost() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [roundCount, setRoundCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [playerName, setPlayerName] = useState(() => getStoredPlayerName());
  const [gameStarted, setGameStarted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [roundsWon, setRoundsWon] = useState(0);
  const [gameMode, setGameMode] = useState('challenge');
  const [playerGuess, setPlayerGuess] = useState('');
  const [roundComplete, setRoundComplete] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [playerStatus, setPlayerStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [pendingStartStatus, setPendingStartStatus] = useState(null);

  const trimmedPlayerName = useMemo(() => (playerName || '').trim(), [playerName]);
  const remainingRounds = Math.max(0, 20 - roundCount);

  async function refreshPlayerStatus(name) {
    const clean = (name || '').trim();
    if (!clean) {
      setPlayerStatus(null);
      return { playerName: '', roundsPlayed: 0, remainingRounds: 20, status: 'new' };
    }

    setStatusLoading(true);
    try {
      const status = await fetchPlayerStatus(clean);
      setPlayerStatus(status);
      return status;
    } catch (e) {
      setError(e.message || String(e));
      return null;
    } finally {
      setStatusLoading(false);
    }
  }

  async function run(payload) {
    setLoading(true);
    setError(null);
    setResult(null);
    setPlayerGuess('');
    setRoundComplete(false);
    setRoundResult(null);

    const activeName = trimmedPlayerName || getStoredPlayerName();

    if (!activeName) {
      setError('Please enter your name to continue.');
      setLoading(false);
      return;
    }

    try {
      const requestPayload = {
        ...payload,
        playerName: activeName,
        persist: true,
      };

      setStoredPlayerName(activeName);
      setPlayerName(activeName);

      const res = await solveMinCost(requestPayload);
      if (!res?.roundId) {
        throw new Error('Round was not saved. Please try again.');
      }
      setResult(res);

      if (gameMode !== 'challenge') {
        scoreRound(res, null);
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleGuessSubmit(guess) {
    if (!result) return;
    const guessNum = parseInt(guess);
    scoreRound(result, guessNum);
  }

  function scoreRound(res, guessNum) {
    const optimalCost = res.totalCost;
    let points = 0;
    let won = false;

    if (gameMode === 'challenge' && guessNum !== null) {
      const diff = Math.abs(guessNum - optimalCost);
      const tolerance = Math.ceil(optimalCost * 0.15);

      if (diff === 0) {
        points = 50;
        won = true;
      } else if (diff <= tolerance) {
        points = 30;
        won = true;
      } else {
        points = Math.max(10, 30 - Math.floor(diff / 10));
        won = false;
      }
    } else if (gameMode === 'auto') {
      if (res.algorithm === 'hungarian') {
        points = Math.max(20, Math.floor(50 - res.runtimeMs));
      } else if (res.algorithm === 'greedy') {
        points = Math.max(15, Math.floor(40 - res.runtimeMs));
      } else {
        points = 35;
      }
      won = points > 20;
    }

    setTotalScore((prev) => prev + points);
    setRoundsWon((prev) => (won ? prev + 1 : prev));
    setRoundCount((prev) => prev + 1);
    setRoundComplete(true);
    setRoundResult({
      won,
      points,
      message: won ? `🎉 YOU WON! +${points} Points!` : `💔 Try again... +${points} Consolation Points`,
    });
  }

  function nextRound() {
    if (roundCount >= 20) return;
    setResult(null);
    setRoundResult(null);
    setRoundComplete(false);
    setPlayerGuess('');
  }

  async function startGame(forceContinue = false) {
    const clean = trimmedPlayerName;
    if (!clean) {
      setError('Please enter your name to start');
      return;
    }

    const status = pendingStartStatus || (await refreshPlayerStatus(clean));
    if (!status) return;

    if (status.status === 'completed') {
      setError('This player name already completed 20 rounds. Please enter a new name to start a new game.');
      setPendingStartStatus(null);
      return;
    }

    if (status.status === 'active' && !forceContinue) {
      setPendingStartStatus(status);
      setError(null);
      return;
    }

    setPendingStartStatus(null);
    setStoredPlayerName(clean);
    setPlayerName(clean);
    setGameStarted(true);
    setRoundCount(status.roundsPlayed || 0);
    setResult(null);
    setTotalScore(0);
    setRoundsWon(0);
    setError(null);
  }

  function resetGame() {
    const locked = getStoredPlayerName() || trimmedPlayerName;

    setGameStarted(false);
    setRoundCount(0);
    setResult(null);
    setPlayerName(locked);
    setError(null);
    setTotalScore(0);
    setRoundsWon(0);
    setPlayerGuess('');
    setRoundComplete(false);
    setRoundResult(null);
    setPlayerStatus(null);
    setPendingStartStatus(null);
  }

  function continueWithExistingName() {
    startGame(true);
  }

  function useDifferentName() {
    setPendingStartStatus(null);
    setError(null);
    setPlayerStatus(null);
  }

  if (gameStarted && roundCount >= 20) {
    const winRate = Math.round((roundsWon / 20) * 100);
    const rank = totalScore > 800 ? '🏆 Champion!' : totalScore > 600 ? '⭐ Expert' : totalScore > 400 ? '🎯 Skilled' : '🎮 Beginner';

    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-black via-purple-900 to-black text-white flex items-center justify-center">
        <div className="max-w-2xl w-full bg-gradient-to-r from-yellow-900 to-orange-900 p-12 rounded-lg shadow-2xl border-4 border-yellow-500 text-center">
          <h1 className="text-5xl font-bold mb-4">🎉 GAME OVER!</h1>
          <p className="text-2xl mb-8 text-yellow-200">
            Final Score: <span className="font-bold text-yellow-300">{totalScore}</span>
          </p>

          <div className="space-y-4 mb-8">
            <p className="text-xl">
              Rounds Won: <span className="font-bold text-green-400">{roundsWon}/20</span> ({winRate}%)
            </p>
            <p className="text-2xl font-bold text-orange-300">{rank}</p>
            <p className="text-gray-200">Average Points per Round: {Math.round(totalScore / 20)}</p>
          </div>

          <button
            onClick={resetGame}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded font-bold text-lg transition transform hover:scale-105"
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-black via-purple-900 to-black text-white flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg shadow-2xl border border-purple-500">
          <h1 className="text-4xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            🎮 Minimum Cost Assignment
          </h1>
          <p className="text-gray-400 text-center mb-6 text-sm">
            Play 20 rounds per player name. Existing names can continue until 20 rounds are complete.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Enter Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setPendingStartStatus(null);
              }}
              placeholder="Your name..."
              className="w-full p-3 bg-gray-800 border border-purple-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
              onKeyDown={(e) => e.key === 'Enter' && startGame(false)}
            />
          </div>

          <div className="mb-4 p-4 bg-gray-800 rounded border border-gray-700 text-sm text-gray-300">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="font-bold text-cyan-400">
                {statusLoading ? 'Checking...' : playerStatus ? playerStatus.status : 'Not checked'}
              </span>
            </div>
            {playerStatus && (
              <>
                <div className="mt-2 flex items-center justify-between">
                  <span>Rounds played</span>
                  <span>{playerStatus.roundsPlayed}/20</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span>Rounds remaining</span>
                  <span className="text-green-400 font-bold">{playerStatus.remainingRounds}</span>
                </div>
              </>
            )}
          </div>

          {pendingStartStatus?.status === 'active' && (
            <div className="mb-4 p-4 bg-yellow-900 border border-yellow-500 rounded text-yellow-100 text-sm">
              <p className="font-semibold mb-2">This name already exists.</p>
              <p>
                It has {pendingStartStatus.roundsPlayed} rounds played and {pendingStartStatus.remainingRounds} rounds remaining.
              </p>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={continueWithExistingName}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold text-white"
                >
                  Continue with this name
                </button>
                <button
                  type="button"
                  onClick={useDifferentName}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold text-white"
                >
                  Use different name
                </button>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-700">
            <p className="text-sm font-semibold mb-3">Select Game Mode:</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="challenge"
                  checked={gameMode === 'challenge'}
                  onChange={(e) => setGameMode(e.target.value)}
                />
                <span>🎯 Challenge Mode (Guess the optimal cost)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="auto"
                  checked={gameMode === 'auto'}
                  onChange={(e) => setGameMode(e.target.value)}
                />
                <span>⚡ Auto Mode (Beat the algorithm)</span>
              </label>
            </div>
          </div>

          <button
            onClick={() => startGame(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded font-bold text-lg transition transform hover:scale-105"
          >
            ▶️ Start Game
          </button>

          {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-black via-purple-900 to-black text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            🎮 Minimum Cost Assignment
          </h1>
          <p className="text-gray-400 mt-1">
            Player: <span className="text-purple-400 font-bold">{trimmedPlayerName}</span> | Mode:{' '}
            <span className="text-yellow-400 font-bold">{gameMode === 'challenge' ? '🎯 Challenge' : '⚡ Auto'}</span>
            {' '}| Remaining Rounds: <span className="text-green-400 font-bold">{remainingRounds}</span>
          </p>
        </div>
        <GameScoreboard score={totalScore} round={roundCount} wonRounds={roundsWon} />
      </div>

      <div className="mb-6 bg-gray-800 h-3 rounded overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
          style={{ width: `${Math.min((roundCount / 20) * 100, 100)}%` }}
        ></div>
      </div>

      {showHistory ? (
        <MinCostHistory
          key={trimmedPlayerName || 'no-player'}
          playerName={trimmedPlayerName}
          onClose={() => setShowHistory(false)}
        />
      ) : (
        <>
          {result && gameMode === 'challenge' && !roundComplete && (
            <GameChallenge
              result={result}
              playerGuess={playerGuess}
              onGuessChange={setPlayerGuess}
              onSubmit={handleGuessSubmit}
              loading={loading}
            />
          )}

          {!result && !roundComplete && <MinCostControls onRun={run} />}

          {loading && (
            <div className="mt-6 p-6 bg-blue-900 border border-blue-500 rounded text-center animate-pulse">
              <p className="text-lg font-semibold">⏳ Running algorithms... please wait</p>
            </div>
          )}

          {error && <div className="mt-6 p-4 bg-red-900 border border-red-500 rounded text-red-200">{error}</div>}

          {roundComplete && roundResult && (
            <div
              className={`mt-6 p-6 rounded-lg border-2 text-center animate-bounce ${
                roundResult.won
                  ? 'bg-gradient-to-r from-green-900 to-emerald-900 border-green-500'
                  : 'bg-gradient-to-r from-orange-900 to-yellow-900 border-orange-500'
              }`}
            >
              <h2 className={`text-3xl font-bold mb-2 ${roundResult.won ? 'text-green-300' : 'text-orange-300'}`}>
                {roundResult.message}
              </h2>
              <p className="text-xl font-semibold text-gray-200 mb-4">
                Round {roundCount}/20 - Score: +{roundResult.points}
              </p>
              {result && (
                <p className="text-gray-300 mb-4">
                  Optimal Cost: <span className="font-bold text-yellow-400">${result.totalCost}</span> | Algorithm:{' '}
                  <span className="font-bold capitalize">{result.algorithm}</span> | Time:{' '}
                  <span className="font-bold text-blue-400">{result.runtimeMs}ms</span>
                </p>
              )}
              {roundCount < 20 && (
                <button
                  onClick={nextRound}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded font-bold text-lg transition transform hover:scale-105"
                >
                  ➡️ Next Round
                </button>
              )}
            </div>
          )}

          {result && !roundComplete && gameMode !== 'challenge' && <MinCostResults result={result} />}

          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition"
            >
              📊 {showHistory ? 'Hide' : 'View'} History
            </button>
            {roundCount > 0 && !roundComplete && (
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
              >
                🔄 Quit Game
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
