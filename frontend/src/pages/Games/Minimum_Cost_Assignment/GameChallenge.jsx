import { useState } from 'react';

export default function GameChallenge({ result, playerGuess, onGuessChange, onSubmit, loading }) {
  const [error, setError] = useState('');

  function handleSubmit() {
    const guess = parseInt(playerGuess);
    if (isNaN(guess)) {
      setError('Please enter a valid number');
      return;
    }
    if (guess <= 0) {
      setError('Cost must be greater than 0');
      return;
    }
    setError('');
    onSubmit(playerGuess);
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Challenge Card */}
      <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-8 rounded-lg border-2 border-cyan-500 shadow-lg">
        <h2 className="text-3xl font-bold mb-4 text-cyan-300">🎯 CHALLENGE TIME!</h2>

        <div className="bg-gray-800 p-6 rounded mb-6 border border-cyan-400">
          <p className="text-gray-200 mb-2">
            <span className="text-lg">Employees/Tasks:</span>
            <span className="text-2xl font-bold text-yellow-400 ml-2">{result.n}</span>
          </p>
          <p className="text-gray-200">
            <span className="text-lg">Cost Range:</span>
            <span className="text-lg font-bold text-green-400 ml-2">$20 - $200</span>
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded mb-6 border border-gray-700">
          <p className="text-gray-300 text-center mb-4 text-lg">
            Can you guess the minimum total cost to assign all {result.n} tasks optimally?
          </p>
          <p className="text-gray-400 text-center text-sm">
            💡 Tip: The cost is between ${result.n * 20} and ${result.n * 200}
          </p>
        </div>

        {/* Input Field */}
        <div className="mb-6">
          <label className="block text-gray-300 font-semibold mb-2">Your Guess ($):</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={playerGuess}
              onChange={(e) => {
                onGuessChange(e.target.value);
                setError('');
              }}
              placeholder={`Enter your guess (e.g., ${Math.round(result.n * 50)})`}
              className="flex-1 p-4 bg-gray-800 border-2 border-cyan-500 rounded text-white text-lg placeholder-gray-500 focus:outline-none focus:border-cyan-300"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !playerGuess}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 rounded font-bold text-lg transition transform hover:scale-105"
            >
              {loading ? '⏳ Checking...' : '✓ Submit Guess'}
            </button>
          </div>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>

        {/* Scoring Rules */}
        <div className="bg-gray-800 p-4 rounded border border-gray-600">
          <p className="text-sm font-semibold text-gray-300 mb-2">📊 Scoring Rules:</p>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>✅ Perfect Guess (exact): <span className="text-green-400 font-bold">+50 Points</span></li>
            <li>✅ Good Guess (within ±15%): <span className="text-green-400 font-bold">+30 Points</span></li>
            <li>⚠️ Close Guess (within ±30%): <span className="text-yellow-400 font-bold">+20 Points</span></li>
            <li>❌ Far Guess: <span className="text-orange-400 font-bold">+10 Points</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

