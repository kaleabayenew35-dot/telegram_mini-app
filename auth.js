const AUTH_KEY = 'telegramMiniAppAuth';

const telegram = window.Telegram?.WebApp || null;

const getTelegramUser = () => telegram?.initDataUnsafe?.user || null;

const readStoredAuth = () => {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_KEY) || '{}');
  } catch {
    return {};
  }
};

const storeAuth = (auth) => {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  return auth;
};

const readJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export const getAuth = () => readStoredAuth();
export const getTelegramContext = () => ({
  user: getTelegramUser(),
  initData: telegram?.initData || '',
});

export const initializeTelegram = () => {
  telegram?.ready();
  telegram?.expand();
  telegram?.setHeaderColor?.('#101820');
  telegram?.setBackgroundColor?.('#f4f1ea');
};

export const ensureAuth = async (apiBase) => {
  const params = new URLSearchParams(window.location.search);
  const queryToken = params.get('token');
  const queryLaunch = params.get('launch');
  const stored = readStoredAuth();

  // A game launch URL may contain a game token, which is not the system JWT.
  // Only accept a query token as API auth when it has a JWT userId claim.
  const queryPayload = queryToken ? readJwtPayload(queryToken) : null;
  if (queryPayload?.userId) {
    return storeAuth({ ...stored, token: queryToken, userId: queryPayload.userId, launch: queryLaunch || stored.launch });
  }
  if (stored.token && readJwtPayload(stored.token)?.userId) return { ...stored, launch: queryLaunch || stored.launch };

  const telegramUser = getTelegramUser();
  if (!telegramUser?.id) {
    throw new Error('Open this app from Telegram to sign in.');
  }

  const response = await fetch(`${apiBase}/api/users/auto-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id: String(telegramUser.id) }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.token) {
    throw new Error(payload.error || 'Could not sign in with Telegram.');
  }

  return storeAuth({
    token: payload.token,
    userId: payload.userId,
    username: payload.username,
    telegramId: String(telegramUser.id),
    launch: queryLaunch || stored.launch,
  });
};
