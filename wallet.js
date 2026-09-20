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
