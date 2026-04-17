import { useState } from 'react';

export default function MinCostControls({ onRun }) {
  const [n, setN] = useState(50);
  const [randomN, setRandomN] = useState(true);
  const [minCost, setMinCost] = useState(20);
  const [maxCost, setMaxCost] = useState(200);
  const [algorithm, setAlgorithm] = useState('hungarian');
  const [persist, setPersist] = useState(true);

  function handleRun() {
    const payload = {
      n: randomN ? undefined : Number(n),
      minCost: Number(minCost),
      maxCost: Number(maxCost),
      algorithm: algorithm,
      persist: persist,
    };
    onRun(payload);
  }

  return (
    <div className="bg-gray-900 p-4 rounded shadow">
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={randomN} onChange={e => setRandomN(e.target.checked)} /> Random N (50-100)
        </label>
        {!randomN && (
          <label>
            N: <input type="number" value={n} min={1} max={100} onChange={e => setN(e.target.value)} className="ml-2 p-1 rounded bg-gray-800" />
          </label>
        )}

        <label>
          Min Cost: <input type="number" value={minCost} onChange={e => setMinCost(e.target.value)} className="ml-2 p-1 rounded bg-gray-800" />
        </label>
        <label>
          Max Cost: <input type="number" value={maxCost} onChange={e => setMaxCost(e.target.value)} className="ml-2 p-1 rounded bg-gray-800" />
        </label>

        <label>
          Algorithm:
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} className="ml-2 p-1 rounded bg-gray-800">
            <option value="hungarian">Hungarian (optimal)</option>
            <option value="greedy">Greedy (fast)</option>
            <option value="both">Both (compare)</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={persist} onChange={e => setPersist(e.target.checked)} /> Persist
        </label>

        <button onClick={handleRun} className="ml-auto bg-purple-600 px-4 py-2 rounded">Run</button>
      </div>
    </div>
  );
}

