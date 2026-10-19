// Folhas secas e girassóis caindo pela página inicial inteira (as páginas de projeto não carregam este arquivo).
// Eles giram, balançam com o "vento" e fogem do mouse (ou do dedo).
// O canvas fica fixo sobre a tela, mas não captura cliques: links e rolagem continuam funcionando.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'leaf-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');

  // Amarelos e marrons da paleta do site, do mais claro ao mais seco.
  const COLORS = ['#f2cf68', '#e9b52c', '#d9952a', '#c8a24a', '#b5762f', '#8a5a2b', '#6e4a2c'];

  // Formas de folha em tamanho unitário: ponta em y = -0.5, cabo em y = +0.5.
  const leafPath = (width, bend) => {
    const p = new Path2D();
    p.moveTo(0, -0.5);
    p.bezierCurveTo(width, -0.25 + bend, width * 0.85, 0.28, 0, 0.42);
    p.bezierCurveTo(-width * 0.85, 0.28 - bend, -width, -0.25, 0, -0.5);
    return p;
  };
  const SHAPES = [leafPath(0.3, 0), leafPath(0.42, 0.04), leafPath(0.24, -0.05)];
  const RIB = new Path2D('M0 -0.46 L0 0.56');

  // Girassol desenhado uma vez numa imagem; depois é só redimensionar e girar a cada quadro.
  // O que o faz parecer girassol: miolo grande e escuro com sementes em espiral,
  // pétalas finas e pontudas em duas camadas e sépalas verdes aparecendo entre elas.
  const SUN = 256;
  const sunflower = document.createElement('canvas');
  sunflower.width = sunflower.height = SUN;
  (() => {
    const g = sunflower.getContext('2d');
    const R = SUN / 2 - 4;
    g.translate(SUN / 2, SUN / 2);
    const jitter = (amount) => 1 + (Math.random() - 0.5) * amount;

    // Pétala em forma de lente ao longo do eixo x, de r0 (base) até r1 (ponta).
    const petal = (angle, r0, r1, width, colors) => {
      g.save();
      g.rotate(angle);
      const grad = g.createLinearGradient(r0, 0, r1, 0);
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(r0, 0);
      g.quadraticCurveTo((r0 + r1) * 0.48, width, r1, 0);
      g.quadraticCurveTo((r0 + r1) * 0.48, -width, r0, 0);
      g.fill();
      // Nervura central, bem sutil.
      g.strokeStyle = 'rgba(150, 80, 10, 0.35)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(r0, 0);
      g.lineTo(r1 * 0.92, 0);
      g.stroke();
      g.restore();
    };

    // Sépalas verdes, atrás de tudo.
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + 0.1;
      petal(a, R * 0.3, R * 0.97 * jitter(0.08), R * 0.13, ['#3f5a1f', '#5f7a2e', '#7c9440']);
    }
    // Pétalas de trás (mais escuras) e da frente (mais claras), intercaladas.
    const back = 24;
    for (let i = 0; i < back; i++) {
      const a = (i / back) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
      petal(a, R * 0.32, R * 0.96 * jitter(0.08), R * 0.135, ['#b8621a', '#e39a1c', '#f2b51f']);
    }
    for (let i = 0; i < back; i++) {
      const a = ((i + 0.5) / back) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
      petal(a, R * 0.34, R * 0.88 * jitter(0.12), R * 0.125, ['#d9821c', '#f5bd25', '#fbd64a']);
    }

    // Miolo: disco escuro com borda mais clara.
    const disc = R * 0.44;
    const discGrad = g.createRadialGradient(0, 0, 0, 0, 0, disc);
    discGrad.addColorStop(0, '#4a4319');
    discGrad.addColorStop(0.25, '#3a2510');
    discGrad.addColorStop(0.85, '#2a180a');
    discGrad.addColorStop(1, '#6b4316');
    g.fillStyle = discGrad;
    g.beginPath();
    g.arc(0, 0, disc, 0, Math.PI * 2);
    g.fill();

    // Sementes em espiral de Fibonacci (o desenho típico do girassol).
    const seeds = 300;
    for (let i = 1; i < seeds; i++) {
      const t = i / seeds;
      const r = disc * 0.96 * Math.sqrt(t);
      const a = i * 2.39996323;
      const size = 0.9 + t * 1.9;
      g.fillStyle = t > 0.82 ? 'rgba(150, 95, 30, 0.9)' : i % 2 ? 'rgba(20, 11, 4, 0.85)' : 'rgba(95, 60, 22, 0.8)';
      g.beginPath();
      g.arc(Math.cos(a) * r, Math.sin(a) * r, size, 0, Math.PI * 2);
      g.fill();
    }
  })();

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
      size: flower ? rand(48, 88) : rand(30, 66),
      rot: rand(0, Math.PI * 2),
      vrot: flower ? rand(-0.03, 0.03) : rand(-0.025, 0.025),
      flip: rand(0, Math.PI * 2),
      vflip: flower ? rand(0.015, 0.035) : rand(0.025, 0.065),
      sway: rand(0.4, 1.1),
      phase: rand(0, Math.PI * 2),
      // Velocidade de queda (px por quadro a 60 fps). Girassóis são um pouco mais pesados.
      fall: flower ? rand(1.9, 2.8) : rand(1.5, 2.6),
      color: COLORS[(Math.random() * COLORS.length) | 0],
      shape: SHAPES[(Math.random() * SHAPES.length) | 0],
    };
  };

  let items = [];
  const populate = () => {
    const count = Math.round(Math.min(36, Math.max(14, (w * h) / 55000)));
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
    scrollPush += (window.scrollY - lastScroll) * 0.04;
    lastScroll = window.scrollY;
  }, { passive: true });

  const RADIUS = 150;
  const step = (item, dt, t) => {
    const dx = item.x - pointer.x;
    const dy = item.y - pointer.y;
    const dist = Math.hypot(dx, dy);
    if (dist < RADIUS && dist > 0.001) {
      const force = 1 - dist / RADIUS;
      const fresh = performance.now() - pointer.at < 120 ? 1 : 0;
      // Empurra para longe do cursor e acompanha o "sopro" do movimento.
      item.vx += ((dx / dist) * 0.55 + pointer.vx * 0.08 * fresh) * force * dt;
      item.vy += ((dy / dist) * 0.4 + pointer.vy * 0.08 * fresh) * force * dt;
      item.vrot += (Math.random() - 0.5) * 0.04 * force * dt;
      item.vflip += 0.01 * force * dt;
    }

    // Queda com resistência do ar: a velocidade busca um limite e a peça balança de um lado para o outro.
    item.vy += (item.fall - item.vy) * 0.03 * dt;
    item.vx += Math.sin(t * 0.0012 * item.sway + item.phase) * (item.flower ? 0.025 : 0.04) * dt;
    item.vx *= Math.pow(0.975, dt);
    item.vrot *= Math.pow(0.99, dt);
    item.vflip += ((item.flower ? 0.025 : 0.04) - item.vflip) * 0.01 * dt;

    item.x += item.vx * dt;
    item.y += item.vy * dt - scrollPush * dt;
    item.rot += (item.vrot + item.vx * 0.004) * dt;
    item.flip += item.vflip * dt;

    if (item.y > h + 80 || item.x < -140 || item.x > w + 140 || item.y < -h) Object.assign(item, makeItem(false));
  };

  const draw = (item) => {
    // O cosseno do "flip" achata a peça no eixo x, como se ela tombasse em 3D.
    const turn = Math.cos(item.flip);
    const squash = Math.abs(turn) < 0.08 ? 0.08 * Math.sign(turn || 1) : turn;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot);
    if (item.flower) {
      // O girassol tomba menos que a folha, para continuar reconhecível.
      ctx.scale(item.size * (0.45 + 0.55 * Math.abs(squash)), item.size);
      ctx.drawImage(sunflower, -0.5, -0.5, 1, 1);
    } else {
      ctx.scale(item.size * squash, item.size);
      ctx.fillStyle = item.color;
      ctx.fill(item.shape);
      if (turn < 0) {
        // Verso da folha, um pouco mais escuro.
        ctx.fillStyle = 'rgba(42, 25, 14, 0.3)';
        ctx.fill(item.shape);
      }
      ctx.lineWidth = 0.045;
      ctx.strokeStyle = 'rgba(42, 25, 14, 0.45)';
      ctx.stroke(RIB);
    }
    ctx.restore();
  };

  let running = false;
  let last = 0;
  const frame = (t) => {
    if (!running) return;
    const dt = Math.min(3, (t - (last || t)) / 16.67);
    last = t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 0.95;
    for (const item of items) {
      step(item, dt, t);
      draw(item);
    }
    scrollPush *= Math.pow(0.85, dt);
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
