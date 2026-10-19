// Índice de trabalhos: passar o mouse, focar com o teclado ou tocar mostra a foto do projeto
// por trás da lista e embaralha o texto da linha. No toque, o primeiro toque mostra e o segundo abre.
(() => {
  const reveal = document.querySelector('[data-reveal]');
  if (!reveal) return;
  const section = reveal.closest('section');
  const rows = [...reveal.querySelectorAll('.reveal-row')];
  const hint = reveal.querySelector('[data-reveal-hint]');
  const clock = reveal.querySelector('[data-reveal-clock]');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none)').matches;
  const hintText = touch ? 'Toque para ver, toque de novo para abrir' : 'Passe o mouse para ver';
  hint.textContent = hintText;

  const bg = document.createElement('div');
  bg.className = 'reveal-bg';
  bg.setAttribute('aria-hidden', 'true');
  const bgBlur = document.createElement('div');
  bgBlur.className = 'reveal-bg-blur';
  const bgImg = document.createElement('div');
  bgImg.className = 'reveal-bg-img';
  bg.append(bgBlur, bgImg);
  section.prepend(bg);

  rows.forEach((row) => { new Image().src = row.dataset.image; });

  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·';
  const scramble = (el) => {
    const text = el.dataset.text ??= el.textContent;
    if (still) return;
    cancelAnimationFrame(el._raf);
    const start = performance.now();
    const duration = 650;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const fixed = Math.floor(text.length * Math.max(0, (t - 0.25) / 0.75));
      el.textContent = [...text].map((c, i) => (i < fixed || c === ' ' ? c : CHARS[(Math.random() * CHARS.length) | 0])).join('');
      if (t < 1) el._raf = requestAnimationFrame(tick);
    };
    el._raf = requestAnimationFrame(tick);
  };
  const restore = (row) => row.querySelectorAll('[data-scramble]').forEach((el) => {
    cancelAnimationFrame(el._raf);
    if (el.dataset.text) el.textContent = el.dataset.text;
  });

  let active = null;
  let idleTimer;
  const setIdle = (on) => reveal.classList.toggle('is-idle', on && !still);
  const armIdle = () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => !active && setIdle(true), 4000); };

  const activate = (row) => {
    setIdle(false);
    clearTimeout(idleTimer);
    if (row === active) return;
    if (active) { active.classList.remove('is-active'); restore(active); }
    active = row;
    row.classList.add('is-active');
    reveal.classList.add('has-active');
    section.classList.add('is-revealing');
    const contain = row.dataset.fit === 'contain';
    bg.classList.toggle('is-contain', contain);
    // Recomeça o zoom de entrada a cada troca de projeto.
    bgImg.style.transition = 'none';
    bgImg.style.transform = still ? 'none' : 'scale(1.18)';
    bgImg.style.backgroundImage = `url("${row.dataset.image}")`;
    bgBlur.style.backgroundImage = contain ? bgImg.style.backgroundImage : '';
    bgImg.style.backgroundPosition = contain ? '' : row.dataset.pos || 'center';
    requestAnimationFrame(() => requestAnimationFrame(() => { bgImg.style.transition = ''; bgImg.style.transform = ''; }));
    row.querySelectorAll('[data-scramble]').forEach(scramble);
    hint.textContent = touch ? 'Toque de novo para abrir ↗' : 'Clique para abrir ↗';
  };

  const deactivate = () => {
    if (!active) return;
    active.classList.remove('is-active');
    restore(active);
    active = null;
    reveal.classList.remove('has-active');
    section.classList.remove('is-revealing');
    hint.textContent = hintText;
    armIdle();
  };

  rows.forEach((row) => {
    row.addEventListener('mouseenter', () => activate(row));
    row.addEventListener('focus', () => activate(row));
    row.addEventListener('click', (event) => {
      if (touch && row !== active) {
        event.preventDefault();
        activate(row);
      }
    });
  });
  reveal.querySelector('.reveal-list').addEventListener('mouseleave', deactivate);
  reveal.addEventListener('focusout', (event) => { if (!reveal.contains(event.relatedTarget)) deactivate(); });
  document.addEventListener('click', (event) => { if (touch && !reveal.contains(event.target)) deactivate(); });

  // Só anima enquanto a seção está na tela.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) armIdle();
    else { clearTimeout(idleTimer); setIdle(false); }
  }).observe(reveal);

  const time = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  const updateClock = () => {
    const [h, m] = time.format(new Date()).split(':');
    clock.innerHTML = `${h}<b>:</b>${m} SP`;
  };
  updateClock();
  setInterval(updateClock, 15000);
})();
