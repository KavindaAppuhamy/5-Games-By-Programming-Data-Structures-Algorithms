const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081';

export async function solveMinCost(payload) {
  const res = await fetch(`${BASE}/api/mincost/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Request failed');
  }
  return res.json();
}

export async function fetchHistory(page = 0, size = 20) {
  const res = await fetch(`${BASE}/api/mincost/history?page=${page}&size=${size}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

