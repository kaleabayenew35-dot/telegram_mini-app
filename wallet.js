export const renderWallet = ({ user, balance, telegramId }) => {
  const amount = Number(balance?.balance ?? 0).toFixed(2);
  document.getElementById('balanceValue').textContent = `${amount} ETB`;
  document.getElementById('walletBalance').textContent = `${amount} ETB`;
  document.getElementById('walletUsername').textContent = user?.username || '--';
  document.getElementById('telegramId').textContent = telegramId || '--';
  document.getElementById('playerName').textContent = user?.username || 'Player';
  document.getElementById('playerStatus').textContent = 'Account connected';
  document.getElementById('avatar').textContent = (user?.username || 'P')[0].toUpperCase();
};

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export const renderTransactions = (transactions = [], pagination = {}) => {
  const list = document.getElementById('transactionList');
  const pageLabel = document.getElementById('transactionPageLabel');
  const previousButton = document.getElementById('previousTransactionsButton');
  const nextButton = document.getElementById('nextTransactionsButton');
  pageLabel.textContent = `Page ${pagination.page || 1}`;
  previousButton.disabled = !pagination.hasPrevious;
  nextButton.disabled = !pagination.hasNext;

  if (!transactions.length) {
    list.innerHTML = '<div class="empty-history">No account transactions yet.</div>';
    return;
  }

  list.innerHTML = transactions.map((transaction) => {
    const isDeposit = transaction.type === 'deposit';
    const status = String(transaction.status || 'pending').toLowerCase();
    const statusLabel = status === 'done' ? 'Completed' : status === 'rejected' ? 'Rejected' : 'Pending';
    const amount = `${isDeposit ? '+' : '-'}${Number(transaction.amount || 0).toFixed(2)} ETB`;
    return `<article class="transaction-row">
      <div class="transaction-symbol ${isDeposit ? 'deposit' : 'withdraw'}">${isDeposit ? '+' : '-'}</div>
      <div class="transaction-copy"><strong>${isDeposit ? 'Deposit' : 'Withdrawal'}</strong><span>${escapeHtml(transaction.note || transaction.method || 'Account activity')}</span><small>${formatDate(transaction.created_at)}</small></div>
      <div class="transaction-amount ${isDeposit ? 'deposit-text' : ''}"><strong>${amount}</strong><span class="status status-${status}">${statusLabel}</span></div>
    </article>`;
  }).join('');

};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
