import { useGame, GAME_PHASE } from './hooks/useGame';
import SetupScreen from "./components/SetupScreen";
import PlayScreen from "./components/PlayScreen";
import ResultScreen from "./components/ResultScreen";
import LeaderboardScreen from "./components/LeaderboardScreen";

export default function SnakeLadder() {
  const {
    phase, boardSize, setBoardSize,
    playerName, setPlayerName,
    gameData, result, leaderboard,
    loading, elapsedSeconds,
    startGame, submitAnswer, fetchLeaderboard, resetGame,
  } = useGame();

  return (
    <>
      {phase === GAME_PHASE.SETUP && (
        <SetupScreen
          playerName={playerName}
          setPlayerName={setPlayerName}
          boardSize={boardSize}
          setBoardSize={setBoardSize}
          onStart={startGame}
          loading={loading}
        />
      )}

      {phase === GAME_PHASE.PLAYING && gameData && (
        <PlayScreen
          gameData={gameData}
          playerName={playerName}
          elapsedSeconds={elapsedSeconds}
          onSubmit={submitAnswer}
          loading={loading}
        />
      )}

      {phase === GAME_PHASE.RESULT && result && (
        <ResultScreen
          result={result}
          onPlayAgain={resetGame}
          onLeaderboard={fetchLeaderboard}
        />
      )}

      {phase === GAME_PHASE.LEADERBOARD && (
        <LeaderboardScreen
          leaderboard={leaderboard}
          loading={loading}
          onPlayAgain={resetGame}
        />
      )}
    </>
  );
}