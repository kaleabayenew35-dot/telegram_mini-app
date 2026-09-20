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
export const fetchUser = (userId) => request(`/api/users/${encodeURIComponent(userId)}`);
export const fetchBalance = (userId) => request(`/api/users/${encodeURIComponent(userId)}/balance`);
