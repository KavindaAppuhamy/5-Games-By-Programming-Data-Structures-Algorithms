import { useState, useEffect, useMemo } from 'react';
import { fetchHistory } from '../../../api/mincost';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function MinCostHistory({ playerName, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState('my'); // 'my' | 'all'

  const trimmedPlayerName = useMemo(() => (playerName || '').trim(), [playerName]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      // Early exit if My Data mode but no player name
      if (mode === 'my' && !trimmedPlayerName) {
        setLoading(false);
        setHistory([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Pass playerName only if in 'my' mode, otherwise pass undefined for all players
        const queryPlayerName = mode === 'my' ? trimmedPlayerName : undefined;
        console.log('Loading history with mode:', mode, 'playerName:', queryPlayerName);

        const data = await fetchHistory(page, 20, queryPlayerName);
        if (!cancelled) {
          let records = Array.isArray(data?.content) ? data.content : [];

          // Client-side filter: enforce My Data mode shows only current player
          if (mode === 'my' && trimmedPlayerName) {
            records = records.filter((row) =>
              (row.playerName || '').trim().toLowerCase() === trimmedPlayerName.toLowerCase()
            );

            // Small fallback: if filtered page is empty, re-check a slightly larger recent page from all players.
            // This protects against temporary API/page mismatches while keeping the fast path intact.
            if (records.length === 0) {
              const fallback = await fetchHistory(0, 100, undefined);
              const fallbackRows = Array.isArray(fallback?.content) ? fallback.content : [];
              records = fallbackRows.filter((row) =>
                (row.playerName || '').trim().toLowerCase() === trimmedPlayerName.toLowerCase()
              );
            }
          }

          setHistory(records);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load history');
          setHistory([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [page, mode, trimmedPlayerName]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setPage(0);
    setError(null);
    setHistory([]);
  }

  const hungarianRounds = history.filter((r) => r.algorithm === 'hungarian');
  const greedyRounds = history.filter((r) => r.algorithm === 'greedy');
  const bothRounds = history.filter((r) => r.algorithm === 'both');

  const avgTimeValue = (rounds) => {
    if (rounds.length === 0) return 0;
    return Number((rounds.reduce((sum, r) => sum + (r.runtimeMs || 0), 0) / rounds.length).toFixed(2));
  };

  const avgCostValue = (rounds) => {
    if (rounds.length === 0) return 0;
    return Number((rounds.reduce((sum, r) => sum + (r.totalCost || 0), 0) / rounds.length).toFixed(2));
  };

  const runtimeLineData = useMemo(() => {
    const rounds = history
      .filter((r) => r.algorithm === 'hungarian' || r.algorithm === 'greedy')
      .slice(0, 20);

    return rounds.map((round, idx) => ({
      round: idx + 1,
      hungarian: round.algorithm === 'hungarian' ? round.runtimeMs : null,
      greedy: round.algorithm === 'greedy' ? round.runtimeMs : null,
    }));
  }, [history]);

  const avgRuntimeBarData = useMemo(
    () => [
      { algorithm: 'Hungarian', runtimeMs: avgTimeValue(hungarianRounds) },
      { algorithm: 'Greedy', runtimeMs: avgTimeValue(greedyRounds) },
    ],
    [hungarianRounds, greedyRounds]
  );

  const avgCostBarData = useMemo(
    () => [
      { algorithm: 'Hungarian', totalCost: avgCostValue(hungarianRounds) },
      { algorithm: 'Greedy', totalCost: avgCostValue(greedyRounds) },
    ],
    [hungarianRounds, greedyRounds]
  );

  function getModeLabel() {
    if (mode === 'my') {
      return trimmedPlayerName ? `My Data (${trimmedPlayerName})` : 'My Data';
    }
    return 'All Players';
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition flex items-center gap-2"
        >
          ← Back to Game
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => switchMode('my')}
          className={`px-4 py-2 rounded font-semibold transition ${
            mode === 'my' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          👤 My Data
        </button>
        <button
          onClick={() => switchMode('all')}
          className={`px-4 py-2 rounded font-semibold transition ${
            mode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          🌐 All Players
        </button>
      </div>

      {/* Current Mode Display */}
      <div className="text-center text-sm text-gray-400">
        Showing: <span className="font-bold text-cyan-400">{getModeLabel()}</span>
      </div>

      {/* Notifications and Loading State */}
      {mode === 'my' && !trimmedPlayerName ? (
        <div className="p-6 bg-yellow-900 border border-yellow-500 rounded text-yellow-100 text-center">
          Please enter your name first, then open <span className="font-bold">My Data</span> to see your history.
        </div>
      ) : loading ? (
        <div className="p-6 bg-gray-900 rounded text-center">
          <p className="text-gray-400">Loading history...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-900 border border-red-500 rounded">
          <p className="text-red-200">Error: {error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="p-6 bg-gray-900 rounded text-center">
          <p className="text-gray-400">
            {mode === 'my'
              ? `No history found for "${trimmedPlayerName}". Play some rounds with this name first!`
              : 'No game history yet. Play some rounds!'}
          </p>
        </div>
      ) : (
        <>
          {/* Algorithm Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hungarianRounds.length > 0 && (
              <div className="bg-purple-900 p-4 rounded border border-purple-500">
                <h3 className="text-lg font-bold text-purple-300 mb-2">Hungarian Algorithm</h3>
                <p className="text-sm text-gray-400">
                  Rounds: <span className="text-purple-400 font-bold">{hungarianRounds.length}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Avg Time: <span className="text-blue-400 font-bold">{avgTimeValue(hungarianRounds)}ms</span>
                </p>
                <p className="text-sm text-gray-400">
                  Avg Cost: <span className="text-green-400 font-bold">${avgCostValue(hungarianRounds)}</span>
                </p>
              </div>
            )}

            {greedyRounds.length > 0 && (
              <div className="bg-blue-900 p-4 rounded border border-blue-500">
                <h3 className="text-lg font-bold text-blue-300 mb-2">Greedy Algorithm</h3>
                <p className="text-sm text-gray-400">
                  Rounds: <span className="text-blue-400 font-bold">{greedyRounds.length}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Avg Time: <span className="text-blue-400 font-bold">{avgTimeValue(greedyRounds)}ms</span>
                </p>
                <p className="text-sm text-gray-400">
                  Avg Cost: <span className="text-green-400 font-bold">${avgCostValue(greedyRounds)}</span>
                </p>
              </div>
            )}

            {bothRounds.length > 0 && (
              <div className="bg-green-900 p-4 rounded border border-green-500">
                <h3 className="text-lg font-bold text-green-300 mb-2">Comparison Rounds</h3>
                <p className="text-sm text-gray-400">
                  Rounds: <span className="text-green-400 font-bold">{bothRounds.length}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Total:{' '}
                  <span className="text-green-400 font-bold">
                    {hungarianRounds.length + greedyRounds.length + bothRounds.length}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Charts and Tables Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Runtime Line Chart */}
            {runtimeLineData.length > 0 && (
              <div className="bg-gray-900 rounded p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">📈 Runtime by Round (up to 20)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={runtimeLineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="round" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hungarian" stroke="#d946ef" name="Hungarian" connectNulls />
                    <Line type="monotone" dataKey="greedy" stroke="#2563eb" name="Greedy" connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Average Runtime Bar Chart */}
            <div className="bg-gray-900 rounded p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">⏱️ Average Runtime by Algorithm</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avgRuntimeBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="algorithm" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="runtimeMs" fill="#60a5fa" name="Runtime (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Average Cost Bar Chart */}
            <div className="bg-gray-900 rounded p-6 border border-gray-700 xl:col-span-2">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">💰 Average Total Cost by Algorithm</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avgCostBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="algorithm" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCost" fill="#34d399" name="Average Total Cost" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed History Table */}
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
                  <tr
                    key={round.id || `${round.playerName}-${idx}`}
                    className="border-b border-gray-700 hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-3 font-semibold text-cyan-400">{round.playerName || 'Anonymous'}</td>
                    <td className="px-4 py-3 text-gray-400">#{idx + 1 + page * 20}</td>
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
                        {String(round.algorithm || '').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-green-400 font-bold">${round.totalCost}</td>
                    <td className="px-4 py-3 text-blue-400 font-bold">{round.runtimeMs}ms</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {round.createdAt ? new Date(round.createdAt).toLocaleDateString() : '-'}{' '}
                      {round.createdAt ? new Date(round.createdAt).toLocaleTimeString() : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
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
        </>
      )}
    </div>
  );
}
