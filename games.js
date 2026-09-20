const icons = {
  dama: 'D', bingo: 'B', ludo: 'L', flappy: 'F', snake: 'S', tetris: 'T',
};

const getIcon = (name) => icons[String(name || '').toLowerCase()] || 'G';

const cleanUrl = (value) => {
  if (!value) return null;
  try {
    const url = new URL(String(value).trim());
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.hostname === 'example.com' || url.pathname.includes('your_bot_name')) return null;
    return url.toString();
  } catch {
    return null;
  }
};

const baseGameUrl = (game) => {
  const url = cleanUrl(game.mini_app_url) || cleanUrl(game.game_url);
  if (!url) return null;
  return new URL(url);
};

export const renderGames = (container, games, onPlay, onNotice) => {
  container.replaceChildren();
  if (!games.length) {
    container.innerHTML = '<div class="empty-state">No active games are available right now.</div>';
    return;
  }

  games.forEach((game) => {
    const card = document.createElement('article');
    card.className = 'game-card';
    const url = baseGameUrl(game);
    const minimum = Number(game.min_players || 1);
    const maximum = Number(game.max_players || minimum);
    card.innerHTML = `
      <div class="game-icon">${getIcon(game.name)}</div>
      <div class="game-card-copy">
        <h3>${escapeHtml(game.name || 'Game')}</h3>
        <p>${escapeHtml(game.description || 'Ready for a new challenge?')}</p>
        <span class="player-range">${minimum}-${maximum} players</span>
      </div>
      <button class="play-button" type="button" ${url ? '' : 'disabled'}>${url ? 'Play' : 'Soon'}</button>
    `;
    card.querySelector('.play-button').addEventListener('click', async (event) => {
      if (!url) {
        onNotice('This game does not have a launch URL yet.');
        return;
      }
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = 'Opening...';
      try {
        await onPlay(game, url);
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Play';
        onNotice(error.message || 'Could not open this game.');
      }
    });
    container.appendChild(card);
  });
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
