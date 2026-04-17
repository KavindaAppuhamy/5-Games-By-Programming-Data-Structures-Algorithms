import { useState, useEffect } from 'react';
import { fetchHistory } from '../../../api/mincost';

export default function MinCostHistory({ playerName }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [page]);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory(page, 20);
      setHistory(data.content || []);
    } catch (e) {
      setError(e.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 rounded text-center">
        <p className="text-gray-400">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900 border border-red-500 rounded">
        <p className="text-red-200">Error: {error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-6 bg-gray-900 rounded text-center">
        <p className="text-gray-400">No game history yet. Play some rounds!</p>
      </div>
    );
  }

  // Group by algorithm and calculate stats
  const hungarianRounds = history.filter(r => r.algorithm === 'hungarian');
  const greedyRounds = history.filter(r => r.algorithm === 'greedy');
  const bothRounds = history.filter(r => r.algorithm === 'both');

  const avgTime = (rounds) => {
    if (rounds.length === 0) return 0;
    return (rounds.reduce((sum, r) => sum + r.runtimeMs, 0) / rounds.length).toFixed(2);
  };

  const avgCost = (rounds) => {
    if (rounds.length === 0) return 0;
    return Math.round(rounds.reduce((sum, r) => sum + r.totalCost, 0) / rounds.length);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hungarianRounds.length > 0 && (
          <div className="bg-purple-900 p-4 rounded border border-purple-500">
            <h3 className="text-lg font-bold text-purple-300 mb-2">Hungarian Algorithm</h3>
            <p className="text-sm text-gray-400">Rounds: <span className="text-purple-400 font-bold">{hungarianRounds.length}</span></p>
            <p className="text-sm text-gray-400">Avg Time: <span className="text-blue-400 font-bold">{avgTime(hungarianRounds)}ms</span></p>
            <p className="text-sm text-gray-400">Avg Cost: <span className="text-green-400 font-bold">${avgCost(hungarianRounds)}</span></p>
          </div>
        )}
        {greedyRounds.length > 0 && (
          <div className="bg-blue-900 p-4 rounded border border-blue-500">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Greedy Algorithm</h3>
            <p className="text-sm text-gray-400">Rounds: <span className="text-blue-400 font-bold">{greedyRounds.length}</span></p>
            <p className="text-sm text-gray-400">Avg Time: <span className="text-blue-400 font-bold">{avgTime(greedyRounds)}ms</span></p>
            <p className="text-sm text-gray-400">Avg Cost: <span className="text-green-400 font-bold">${avgCost(greedyRounds)}</span></p>
          </div>
        )}
        {bothRounds.length > 0 && (
          <div className="bg-green-900 p-4 rounded border border-green-500">
            <h3 className="text-lg font-bold text-green-300 mb-2">Comparison Rounds</h3>
            <p className="text-sm text-gray-400">Rounds: <span className="text-green-400 font-bold">{bothRounds.length}</span></p>
            <p className="text-sm text-gray-400">Total: <span className="text-green-400 font-bold">{hungarianRounds.length + greedyRounds.length + bothRounds.length}</span></p>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-gray-900 rounded overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Round</th>
              <th className="px-4 py-3">N</th>
              <th className="px-4 py-3">Algorithm</th>
              <th className="px-4 py-3">Total Cost</th>
              <th className="px-4 py-3">Runtime (ms)</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((round, idx) => (
              <tr key={round.id} className="border-b border-gray-700 hover:bg-gray-800 transition">
                <td className="px-4 py-3 font-semibold text-cyan-400">{round.playerName || 'Anonymous'}</td>
                <td className="px-4 py-3 text-gray-400">#{idx + 1}</td>
                <td className="px-4 py-3 font-semibold">{round.n}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      round.algorithm === 'hungarian'
                        ? 'bg-purple-600 text-purple-100'
                        : round.algorithm === 'greedy'
                        ? 'bg-blue-600 text-blue-100'
                        : 'bg-green-600 text-green-100'
                    }`}
                  >
                    {round.algorithm?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-green-400 font-bold">${round.totalCost}</td>
                <td className="px-4 py-3 text-blue-400 font-bold">{round.runtimeMs}ms</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(round.createdAt).toLocaleDateString()} {new Date(round.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded font-semibold transition"
        >
          ← Previous
        </button>
        <span className="px-4 py-2 text-gray-400">Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={history.length < 20}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded font-semibold transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

