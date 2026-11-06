// Índice de trabalhos: com o mouse, um cartão com a foto do projeto segue o cursor, a linha se
// preenche de marrom e o título rola para a versão em itálico. No toque, cada linha abre direto.
(() => {
  const reveal = document.querySelector('[data-reveal]');
  if (!reveal) return;
  const list = reveal.querySelector('.reveal-list');
  const rows = [...reveal.querySelectorAll('.reveal-row')];
  const hint = reveal.querySelector('[data-reveal-hint]');
  const clock = reveal.querySelector('[data-reveal-clock]');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hintText = fine ? 'Passe o mouse para ver' : 'Toque para abrir';
  hint.textContent = hintText;

  // O título ganha uma cópia em itálico logo abaixo, que sobe no lugar do original.
  rows.forEach((row) => {
    const title = row.querySelector('.reveal-title');
    const text = title.textContent;
    title.innerHTML = `<span class="roll"><span>${text}</span><span aria-hidden="true">${text}</span></span>`;
  });

  let active = null;
  const card = document.createElement('div');
  card.className = 'work-preview';
  card.setAttribute('aria-hidden', 'true');
  const badge = document.createElement('span');
  badge.className = 'work-preview-badge';
  card.append(badge);
  if (fine) {
    document.body.append(card);
    rows.forEach((row) => { new Image().src = row.dataset.image; });
  }

  // Cada troca de projeto entra por cima da anterior, revelada de baixo para cima.
  const showImage = (row) => {
    const layer = document.createElement('div');
    layer.className = `work-preview-img${row.dataset.fit === 'contain' ? ' is-contain' : ''}`;
    layer.style.backgroundImage = `url("${row.dataset.image}")`;
    if (row.dataset.pos) layer.style.backgroundPosition = row.dataset.pos;
    card.insertBefore(layer, badge);
    requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('is-in')));
    const layers = card.querySelectorAll('.work-preview-img');
    if (layers.length > 3) layers[0].remove();
    badge.textContent = `${row.querySelector('.reveal-n').textContent} / ${row.querySelector('.reveal-cat').textContent}`;
  };

  const activate = (row) => {
    if (row === active) return;
    if (active) active.classList.remove('is-active');
    active = row;
    row.classList.add('is-active');
    reveal.classList.add('has-active');
    if (fine) {
      showImage(row);
      card.classList.add('is-shown');
    }
    hint.textContent = 'Clique para abrir ↗';
  };

  const deactivate = () => {
    if (!active) return;
    active.classList.remove('is-active');
    active = null;
    reveal.classList.remove('has-active');
    card.classList.remove('is-shown');
    hint.textContent = hintText;
  };

  // O cartão persegue o cursor com atraso e inclina conforme a velocidade, como tecido no ar.
  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  let raf = null;
  const loop = () => {
    x += (tx - x) * 0.13;
    y += (ty - y) * 0.13;
    const tilt = still ? 0 : Math.max(-9, Math.min(9, (tx - x) * 0.05));
    card.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) rotate(${tilt.toFixed(2)}deg)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : null;
  };
  if (fine) {
    list.addEventListener('mouseenter', (event) => {
      x = tx = event.clientX;
      y = ty = event.clientY;
      loop();
    });
    list.addEventListener('mousemove', (event) => {
      tx = event.clientX;
      ty = event.clientY;
      if (still) { x = tx; y = ty; }
      if (!raf) raf = requestAnimationFrame(loop);
    });
    rows.forEach((row) => row.addEventListener('mouseenter', () => activate(row)));
    list.addEventListener('mouseleave', deactivate);
  }
  rows.forEach((row) => row.addEventListener('focus', () => {
    // Pelo teclado, o cartão aparece ao lado da linha focada.
    if (fine && !list.matches(':hover')) {
      const r = row.getBoundingClientRect();
      x = tx = r.right - card.offsetWidth * 0.7;
      y = ty = r.top + r.height / 2;
      loop();
    }
    activate(row);
  }));
  reveal.addEventListener('focusout', (event) => { if (!reveal.contains(event.relatedTarget)) deactivate(); });

  const time = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  const updateClock = () => {
    const [h, m] = time.format(new Date()).split(':');
    clock.innerHTML = `${h}<b>:</b>${m} SP`;
  };
  updateClock();
  setInterval(updateClock, 15000);
})();
