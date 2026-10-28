(() => {
  const body = document.body;
  const lang = body.dataset.language;
  const select = document.querySelector('#language');
  select.addEventListener('change', () => {
    try { localStorage.setItem('machi-site-language', select.value); } catch (_) {}
    const current = new URL(location.href);
    const path = current.pathname.endsWith('/') ? current.pathname : current.pathname.replace(/index\.html$/, '');
    const base = path.replace(/(?:ja|zh-Hans|zh-Hant-TW|zh-Hant-HK|en)\/$/, '');
    location.assign(base + select.value + '/' + location.hash);
  });
  const copy = JSON.parse(document.querySelector('#screen-copy').textContent);
  const tabs = [...document.querySelectorAll('[data-screen]')];
  const img = document.querySelector('#hero-screen');
  let request = 0;
  const choose = (button) => {
    const turn = ++request;
    const index = tabs.indexOf(button);
    tabs.forEach(t => { const on = t === button; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    document.querySelector('#screen-view').setAttribute('aria-labelledby', button.id);
    const src = body.dataset.assets + 'screens/' + lang + '-' + button.dataset.screen + '.jpg';
    const candidate = new Image();
    candidate.onload = () => {
      if (turn !== request) return;
      img.src = src;
      img.alt = copy.alt + ' — ' + copy.tabs[index];
      img.classList.remove('screen-switching');
      requestAnimationFrame(() => img.classList.add('screen-switching'));
      document.querySelector('#screen-caption').textContent = copy.captions[index];
    };
    candidate.src = src;
  };
  tabs.forEach((button,index) => {
    button.addEventListener('click', () => choose(button));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault(); tabs[next].focus(); choose(tabs[next]);
    });
  });
  // Preload the remaining small product images after the initial page has loaded.
  window.addEventListener('load', () => { tabs.slice(1).forEach(t => { const p = new Image(); p.src = body.dataset.assets + 'screens/' + lang + '-' + t.dataset.screen + '.jpg'; }); });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js');
    const observer = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pending'); observer.unobserve(e.target); } }); }, {threshold:0.08});
    document.querySelectorAll('.reveal').forEach(el => { if(el.getBoundingClientRect().top > innerHeight) el.classList.add('pending'); observer.observe(el); });
  }
})();
