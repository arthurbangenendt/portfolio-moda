// Flores secas e girassóis caindo pela página inicial inteira (as páginas de projeto não carregam este arquivo).
// São recortes de fotos reais (assets/queda/): giram, balançam com o "vento" e fogem do mouse (ou do dedo).
// O canvas fica fixo sobre a tela, mas não captura cliques: links e rolagem continuam funcionando.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'leaf-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');

  // Cada foto vira um bitmap já decodificado, que o navegador desenha mais rápido a cada quadro.
  const load = (name) => {
    const sprite = { bitmap: null, ratio: 1 };
    const img = new Image();
    img.src = `assets/queda/${name}.webp`;
    img.decode()
      .then(() => createImageBitmap(img))
      .then((bitmap) => { sprite.bitmap = bitmap; sprite.ratio = bitmap.height / bitmap.width; })
      .catch(() => {});
    return sprite;
  };
  const SUNFLOWER = load('girassol');
  const DRIED = ['flor-creme', 'flor-creme-aberta', 'flor-bordo', 'flor-coral', 'flor-roxa', 'flor-roxa-clara', 'flor-rosa', 'flor-rosa-pequena'].map(load);

  let w = 0, h = 0, dpr = 1;
  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const makeItem = (initial) => {
    const flower = Math.random() < 0.28;
    return {
      flower,
      x: rand(-0.05, 1.05) * w,
      // Na abertura, tudo entra em cascata; depois, renasce logo acima da tela.
      y: initial ? -rand(20, h * 0.8) : -rand(40, 140),
      vx: rand(-0.5, 0.5),
      vy: rand(1, 2),
      size: flower ? rand(64, 112) : rand(44, 92),
      rot: rand(0, Math.PI * 2),
      vrot: flower ? rand(-0.03, 0.03) : rand(-0.025, 0.025),
      flip: rand(0, Math.PI * 2),
      vflip: flower ? rand(0.012, 0.03) : rand(0.018, 0.045),
      sway: rand(0.4, 1.1),
      phase: rand(0, Math.PI * 2),
      // Velocidade de queda (px por quadro a 60 fps). Girassóis são um pouco mais pesados.
      fall: flower ? rand(1.9, 2.8) : rand(1.5, 2.6),
      img: flower ? SUNFLOWER : DRIED[(Math.random() * DRIED.length) | 0],
    };
  };

  let items = [];
  const populate = () => {
    const count = Math.round(Math.min(26, Math.max(10, (w * h) / 70000)));
    items = Array.from({ length: count }, () => makeItem(true));
  };

  // Ponteiro: posição e velocidade suavizada, em coordenadas da tela.
  const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, at: 0 };
  const onMove = (event) => {
    if (pointer.at) {
      pointer.vx = pointer.vx * 0.5 + (event.clientX - pointer.x) * 0.5;
      pointer.vy = pointer.vy * 0.5 + (event.clientY - pointer.y) * 0.5;
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.at = performance.now();
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onMove, { passive: true });

  // Ao rolar a página, as peças acompanham um pouco o movimento, como se o ar fosse empurrado.
  let lastScroll = window.scrollY;
  let scrollPush = 0;
  window.addEventListener('scroll', () => {
    scrollPush += (window.scrollY - lastScroll) * 0.012;
    lastScroll = window.scrollY;
  }, { passive: true });

  const RADIUS = 150;
  const step = (item, dt, t) => {
    const dx = item.x - pointer.x;
    const dy = item.y - pointer.y;
    const dist = Math.hypot(dx, dy);
    if (dist < RADIUS && dist > 0.001) {
      const force = 1 - dist / RADIUS;
      // O "sopro" do movimento perde força aos poucos depois que o mouse para.
      const fresh = Math.max(0, 1 - (performance.now() - pointer.at) / 250);
      const ease = force * force;
      // Empurra para longe do cursor e acompanha o sopro, de forma suave.
      const ax = ((dx / dist) * 0.35 + pointer.vx * 0.05 * fresh) * ease;
      const ay = ((dy / dist) * 0.25 + pointer.vy * 0.05 * fresh) * ease;
      item.vx += ax * dt;
      item.vy += ay * dt;
      // O empurrão fora do centro faz a peça girar para o lado certo.
      item.vrot += ((dx * ay - dy * ax) / (dist * 900)) * dt;
      item.vflip += 0.004 * ease * dt;
    }

    // Queda com resistência do ar: a velocidade busca um limite e a peça balança de um lado para o outro.
    item.vy += (item.fall - item.vy) * 0.03 * dt;
    item.vx += Math.sin(t * 0.0012 * item.sway + item.phase) * (item.flower ? 0.025 : 0.04) * dt;
    item.vx *= Math.pow(0.975, dt);
    item.vrot *= Math.pow(0.99, dt);
    item.vflip += ((item.flower ? 0.025 : 0.04) - item.vflip) * 0.01 * dt;

    item.vx = Math.max(-9, Math.min(9, item.vx));
    item.vy = Math.max(-6, Math.min(9, item.vy));
    item.vrot = Math.max(-0.06, Math.min(0.06, item.vrot));
    item.x += item.vx * dt;
    item.y += item.vy * dt - scrollPush * dt;
    item.rot += (item.vrot + item.vx * 0.004) * dt;
    item.flip += item.vflip * dt;

    if (item.y > h + 80 || item.x < -140 || item.x > w + 140 || item.y < -h) Object.assign(item, makeItem(false));
  };

  const draw = (item) => {
    const { bitmap, ratio } = item.img;
    if (!bitmap) return;
    // O tombo em 3D é um achatamento contínuo no eixo x (de 55% a 100%), sem espelhar de repente.
    const tilt = 0.775 + 0.225 * Math.cos(item.flip);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(item.x * dpr, item.y * dpr);
    ctx.rotate(item.rot);
    ctx.scale(tilt * dpr, dpr);
    ctx.drawImage(bitmap, -item.size / 2, (-item.size * ratio) / 2, item.size, item.size * ratio);
  };

  let running = false;
  let last = 0;
  const frame = (t) => {
    if (!running) return;
    const dt = Math.min(3, (t - (last || t)) / 16.67);
    last = t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = 'high';
    for (const item of items) {
      step(item, dt, t);
      draw(item);
    }
    scrollPush *= Math.pow(0.93, dt);
    requestAnimationFrame(frame);
  };
  const start = () => {
    if (running) return;
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  };
  const stop = () => { running = false; };

  resize();
  populate();
  window.addEventListener('resize', () => {
    const oldW = w, oldH = h;
    resize();
    items.forEach((item) => { item.x *= w / (oldW || w); item.y *= h / (oldH || h); });
  });

  // Pausa quando a aba não está visível.
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if (!document.hidden) start();
})();
