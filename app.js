import { ensureAuth, getAuth, getTelegramContext, initializeTelegram } from './auth.js';
import { API_BASE, depositFunds, fetchBalance, fetchGames, fetchLaunchToken, fetchTransactions, fetchUser, startGameSession, withdrawFunds } from './api.js';
import { renderGames } from './games.js';
import { renderTransactions, renderWallet } from './wallet.js';

const elements = {
  gamesGrid: document.getElementById('gamesGrid'),
  gamesCount: document.getElementById('gamesCount'),
  gamesNotice: document.getElementById('gamesNotice'),
  refresh: document.getElementById('refreshButton'),
  toast: document.getElementById('toast'),
  invite: document.getElementById('inviteButton'),
  depositAmount: document.getElementById('depositAmount'),
  depositMethod: document.getElementById('depositMethod'),
  depositReference: document.getElementById('depositReference'),
  withdrawAmount: document.getElementById('withdrawAmount'),
  withdrawMethod: document.getElementById('withdrawMethod'),
  withdrawReference: document.getElementById('withdrawReference'),
  depositButton: document.getElementById('depositButton'),
  withdrawButton: document.getElementById('withdrawButton'),
  historyRefresh: document.getElementById('historyRefreshButton'),
  previousTransactions: document.getElementById('previousTransactionsButton'),
  nextTransactions: document.getElementById('nextTransactionsButton'),
};

let transactionPage = 1;

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

const renderProfile = ({ user, telegramId }) => {
  const username = user?.username || 'Player';
  const id = telegramId || '--';
  document.getElementById('profileAvatar').textContent = username[0].toUpperCase();
  document.getElementById('profileUsername').textContent = username;
  document.getElementById('profileTelegramId').textContent = `Telegram ID ${id}`;
  document.getElementById('profileUsernameDetail').textContent = username;
  document.getElementById('profileTelegramDetail').textContent = id;
};

const shareInvite = () => {
  const appUrl = 'https://telegram-mini-app-n9ee.onrender.com';
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent('Join me on Telegram Games!')}`;
  if (window.Telegram?.WebApp?.openTelegramLink) window.Telegram.WebApp.openTelegramLink(shareUrl);
  else window.open(shareUrl, '_blank', 'noopener,noreferrer');
};

const openGame = async (game, url, user, balance, session) => {
  await startGameSession(game.id, session.userId).catch(() => {});
  const launch = await fetchLaunchToken(game.id, { user, balance });
  if (!launch.token || !launch.launch) throw new Error('Secure game launch is unavailable right now.');
  url.searchParams.set('token', launch.token);
  url.searchParams.set('launch', launch.launch);
  window.location.assign(url.toString());
};

const setRefreshing = (isRefreshing) => {
  elements.refresh.classList.toggle('is-refreshing', isRefreshing);
  elements.refresh.disabled = isRefreshing;
};

const readAmount = (input) => {
  const amount = Number(input.value);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter a valid amount greater than zero.');
  return amount;
};

const runMoneyAction = async (action, input, methodInput, referenceInput, button, successMessage) => {
  try {
    const session = getAuth();
    button.disabled = true;
    const reference = referenceInput.value.trim();
    if (!reference) throw new Error('Enter the payment reference or receiving account.');
    await action(session.userId, { amount: readAmount(input), method: methodInput.value, reference });
    input.value = '';
    referenceInput.value = '';
    toast(successMessage);
    await loadApp();
  } catch (error) {
    toast(error.message || 'The wallet action failed.');
  } finally {
    button.disabled = false;
  }
};

const loadApp = async (requestedTransactionPage = transactionPage) => {
  transactionPage = Math.max(requestedTransactionPage, 1);
  setRefreshing(true);
  elements.gamesNotice.classList.add('hidden');
  elements.gamesGrid.innerHTML = '<div class="loading-state">Loading games...</div>';
  document.getElementById('transactionList').innerHTML = '<div class="loading-state">Loading account history...</div>';
  try {
    const auth = await ensureAuth(API_BASE);
    const session = getAuth();
    const telegramUser = getTelegramContext().user;
    const userId = session.userId;

    if (!userId) throw new Error('Your account session is incomplete. Please reopen the Mini App from Telegram.');

    const [gamesResult, userResult, balanceResult, transactionsResult] = await Promise.all([
      fetchGames(),
      fetchUser(userId),
      fetchBalance(userId),
      fetchTransactions(userId, transactionPage),
    ]);
    const games = Array.isArray(gamesResult.games) ? gamesResult.games : [];
    const user = userResult.user || {};
    renderGames(elements.gamesGrid, games, (game, url) => openGame(game, url, user, balanceResult.balance, session), toast);
    elements.gamesCount.textContent = `${games.length} active`;
    renderWallet({ user, balance: balanceResult.balance, telegramId: telegramUser?.id || session.telegramId });
    renderProfile({ user, telegramId: telegramUser?.id || session.telegramId });
    renderTransactions(transactionsResult.transactions || [], transactionsResult.pagination || { page: transactionPage });
  } catch (error) {
    elements.gamesGrid.innerHTML = '<div class="empty-state">We could not load the games.</div>';
    showNotice(error.message || 'Please try again.');
    document.getElementById('playerStatus').textContent = 'Connection needs attention';
  } finally {
    setRefreshing(false);
  }
};

document.querySelectorAll('.view-tab').forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
elements.refresh.addEventListener('click', () => loadApp());
elements.invite.addEventListener('click', shareInvite);
elements.depositButton.addEventListener('click', () => runMoneyAction(depositFunds, elements.depositAmount, elements.depositMethod, elements.depositReference, elements.depositButton, 'Deposit request submitted for review.'));
elements.withdrawButton.addEventListener('click', () => runMoneyAction(withdrawFunds, elements.withdrawAmount, elements.withdrawMethod, elements.withdrawReference, elements.withdrawButton, 'Withdrawal request submitted for review.'));
elements.historyRefresh.addEventListener('click', () => loadApp());
elements.previousTransactions.addEventListener('click', () => loadApp(transactionPage - 1));
elements.nextTransactions.addEventListener('click', () => loadApp(transactionPage + 1));
initializeTelegram();
loadApp();
