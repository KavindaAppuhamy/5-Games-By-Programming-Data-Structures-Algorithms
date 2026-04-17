import { useState } from 'react';

export default function MinCostResults({ result }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return null;

  return (
    <div className="mt-6 space-y-4">
      {/* Assignments Table */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-purple-300">📋 Task Assignments</h3>

        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-gray-800">
              <tr className="border-b border-gray-600">
                <th className="px-4 py-2 text-purple-300">Employee</th>
                <th className="px-4 py-2 text-purple-300">Task</th>
                <th className="px-4 py-2 text-purple-300">Cost</th>
              </tr>
            </thead>
            <tbody>
              {result.assignments && result.assignments.map((a, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800 transition">
                  <td className="px-4 py-2 font-semibold">Employee {a.agentIndex + 1}</td>
                  <td className="px-4 py-2 font-semibold">Task {a.taskIndex + 1}</td>
                  <td className="px-4 py-2 text-green-400 font-bold">${a.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total Cost:</span>
            <span className="text-2xl font-bold text-yellow-400">${result.totalCost}</span>
          </div>
        </div>
      </div>

      {/* Technical Details (Collapsible) */}
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-left flex items-center justify-between hover:bg-gray-800 p-2 rounded transition"
        >
          <span className="text-gray-400 font-semibold">
            {showDetails ? '▼' : '▶'} Technical Details
          </span>
        </button>

        {showDetails && (
          <div className="mt-4 space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Round ID:</span>
              <code className="bg-gray-800 px-2 py-1 rounded text-xs">{result.roundId}</code>
            </div>
            <div className="flex justify-between">
              <span>Number of Assignments:</span>
              <span className="font-mono">{result.n}</span>
            </div>
            <div className="flex justify-between">
              <span>Algorithm:</span>
              <span className="font-mono capitalize">{result.algorithm}</span>
            </div>
            <div className="flex justify-between">
              <span>Runtime:</span>
              <span className="font-mono text-blue-400">{result.runtimeMs}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Random Seed:</span>
              <code className="bg-gray-800 px-2 py-1 rounded text-xs">{result.seed}</code>
            </div>
            <div className="flex justify-between">
              <span>Timestamp:</span>
              <span className="font-mono text-xs">
                {new Date(result.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

