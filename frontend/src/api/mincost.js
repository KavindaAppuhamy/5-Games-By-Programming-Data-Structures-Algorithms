const BASE =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8081';

export async function solveMinCost(payload) {
  const res = await fetch(`${BASE}/api/mincost/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Request failed');
  }

  return res.json();
}

function normalizePlayerName(name) {
  return String(name || '').trim();
}

export async function fetchHistory(page = 0, size = 20, playerName) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const cleanName = normalizePlayerName(playerName);
  if (cleanName) {
    params.set('playerName', cleanName);
  }

  const url = `${BASE}/api/mincost/history?${params.toString()}`;
  console.log('Fetching history from:', url);

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch history: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchPlayerStatus(playerName) {
  const cleanName = normalizePlayerName(playerName);
  if (!cleanName) {
    return { playerName: '', roundsPlayed: 0, remainingRounds: 20, status: 'new' };
  }

  const res = await fetch(`${BASE}/api/mincost/player-status?playerName=${encodeURIComponent(cleanName)}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch player status: ${res.statusText}`);
  }

  return res.json();
}
