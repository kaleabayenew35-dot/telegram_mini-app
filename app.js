import { ensureAuth, getAuth, getTelegramContext, initializeTelegram } from './auth.js';
import { API_BASE, fetchBalance, fetchGames, fetchUser } from './api.js';
import { renderGames } from './games.js';
import { renderWallet } from './wallet.js';

const elements = {
  gamesGrid: document.getElementById('gamesGrid'),
  gamesCount: document.getElementById('gamesCount'),
  gamesNotice: document.getElementById('gamesNotice'),
  refresh: document.getElementById('refreshButton'),
  toast: document.getElementById('toast'),
};

const showNotice = (message) => {
  elements.gamesNotice.textContent = message;
  elements.gamesNotice.classList.remove('hidden');
};

const toast = (message) => {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  window.setTimeout(() => elements.toast.classList.remove('visible'), 2800);
};

const setView = (view) => {
  document.querySelectorAll('.view-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === view));
  document.querySelectorAll('.view').forEach((section) => section.classList.toggle('active', section.id === `${view}View`));
};

const loadApp = async () => {
  elements.gamesNotice.classList.add('hidden');
  elements.gamesGrid.innerHTML = '<div class="loading-state">Loading games...</div>';
  try {
    const auth = await ensureAuth(API_BASE);
    const session = getAuth();
    const telegramUser = getTelegramContext().user;
    const userId = session.userId;

    if (!userId) throw new Error('Your account session is incomplete. Please reopen the Mini App from Telegram.');

    const [gamesResult, userResult, balanceResult] = await Promise.all([
      fetchGames(),
      fetchUser(userId),
      fetchBalance(userId),
    ]);
    const games = Array.isArray(gamesResult.games) ? gamesResult.games : [];
    const user = userResult.user || {};
    renderGames(elements.gamesGrid, games, auth, toast);
    elements.gamesCount.textContent = `${games.length} active`;
    renderWallet({ user, balance: balanceResult.balance, telegramId: telegramUser?.id || session.telegramId });
  } catch (error) {
    elements.gamesGrid.innerHTML = '<div class="empty-state">We could not load the games.</div>';
    showNotice(error.message || 'Please try again.');
    document.getElementById('playerStatus').textContent = 'Connection needs attention';
  }
};

document.querySelectorAll('.view-tab').forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
elements.refresh.addEventListener('click', () => loadApp());
initializeTelegram();
loadApp();
