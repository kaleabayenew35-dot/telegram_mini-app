import { getAuth } from './auth.js';

export const API_BASE = (window.__SYSTEM_BACKEND_URL__ || 'https://system-backend-1u5m.onrender.com').replace(/\/$/, '');

const request = async (path, options = {}) => {
  const auth = getAuth();
  const headers = new Headers(options.headers || {});
  if (auth.token) headers.set('Authorization', `Bearer ${auth.token}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
};

export const fetchGames = () => request('/api/games');
export const startGameSession = (gameId, userId) => request(`/api/games/${encodeURIComponent(gameId)}/start`, {
  method: 'POST',
  body: JSON.stringify({ user_id: userId }),
});
export const fetchLaunchToken = (gameId, { user, balance }) => {
  const params = new URLSearchParams({
    phone: user?.phone_number || '',
    username: user?.username || '',
    balance: Number(balance?.balance ?? 0).toFixed(2),
  });
  return request(`/api/admin/games/game-tokens/launch/${encodeURIComponent(gameId)}?${params}`);
};
export const fetchUser = (userId) => request(`/api/users/${encodeURIComponent(userId)}`);
export const fetchBalance = (userId) => request(`/api/users/${encodeURIComponent(userId)}/balance`);
export const fetchTransactions = (userId, page = 1) => request(`/api/users/${encodeURIComponent(userId)}/transactions?page=${page}`);
const makeClientReference = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

export const depositFunds = (userId, { amount, method, reference }) => request(`/api/admin/games/users/${encodeURIComponent(userId)}/request-deposit`, {
  method: 'POST',
  body: JSON.stringify({ amount, method, transaction_id: makeClientReference('DEP'), transaction_number: reference }),
});
export const withdrawFunds = (userId, { amount, method, reference }) => request(`/api/admin/games/users/${encodeURIComponent(userId)}/request-withdraw`, {
  method: 'POST',
  body: JSON.stringify({ amount, method, transaction_id: makeClientReference('WDR'), transaction_number: reference }),
});
