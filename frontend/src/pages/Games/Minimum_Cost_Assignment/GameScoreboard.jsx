export default function GameScoreboard({ score, round, wonRounds }) {
  const winRate = round > 0 ? Math.round((wonRounds / round) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-4 rounded-lg border-2 border-purple-500 shadow-lg">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-300">Score:</span>
          <span className="text-2xl font-bold text-yellow-400">{score}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-300">Round:</span>
          <span className="text-xl font-bold text-purple-300">{round}/20</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-300">Won:</span>
          <span className="text-lg font-bold text-green-400">{wonRounds}/{round}</span>
        </div>
        {round > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-300">Win Rate:</span>
            <span className="text-lg font-bold text-blue-400">{winRate}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

