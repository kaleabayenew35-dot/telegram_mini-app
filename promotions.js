const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export const renderPromotions = (track, controls, promotions, onNotice) => {
  const items = promotions.length ? promotions : [{
    title: 'Choose your next match.',
    button_text: 'Browse games',
    button_url: '#gamesView',
    image_data: '',
    fallback: true,
  }];

  track.innerHTML = items.map((promotion, index) => `
    <article class="promotion-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
      ${promotion.image_data ? `<img class="promotion-image" src="${promotion.image_data}" alt="">` : '<div class="promotion-mark" aria-hidden="true">+</div>'}
      <div class="promotion-copy">
        <h2>${escapeHtml(promotion.title)}</h2>
        ${promotion.fallback ? '<p>Jump into a game, find a room, and keep your rewards in one place.</p>' : ''}
        <button class="promotion-button" type="button" data-promotion-url="${escapeHtml(promotion.button_url || '')}">${escapeHtml(promotion.button_text)}</button>
      </div>
    </article>
  `).join('');

  controls.innerHTML = items.map((_, index) => `<button type="button" class="promotion-dot ${index === 0 ? 'active' : ''}" data-slide-target="${index}" aria-label="Promotion ${index + 1}"></button>`).join('');

  const activate = (index) => {
    track.querySelectorAll('.promotion-slide').forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === index));
    controls.querySelectorAll('.promotion-dot').forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
  };

  controls.querySelectorAll('.promotion-dot').forEach((dot) => dot.addEventListener('click', () => activate(Number(dot.dataset.slideTarget))));
  track.querySelectorAll('.promotion-button').forEach((button) => button.addEventListener('click', () => {
    const url = button.dataset.promotionUrl;
    if (url === '#gamesView') document.querySelector('[data-view="games"]')?.click();
    else if (url) window.location.assign(url);
    else onNotice('This promotion does not have a link yet.');
  }));

  return { activate };
};