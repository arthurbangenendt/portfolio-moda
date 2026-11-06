(() => {
  // Sem movimento reduzido: a página fica estática e todo o conteúdo já aparece visível.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('anim');

  const clamp = (v) => Math.min(1, Math.max(0, v));

  // Hero: a foto abre como uma cortina e o título sobe linha por linha.
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-loaded')));

  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero-stage');
  const media = document.querySelector('.hero-media');

  // O retrato acompanha o mouse de leve, como uma câmera de editorial.
  if (media && window.matchMedia('(pointer: fine)').matches) {
    stage.addEventListener('pointermove', (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      media.style.setProperty('--mx', `${(-x * 18).toFixed(1)}px`);
      media.style.setProperty('--my', `${(-y * 12).toFixed(1)}px`);
    });
    stage.addEventListener('pointerleave', () => {
      media.style.setProperty('--mx', '0px');
      media.style.setProperty('--my', '0px');
    });
  }

  // Sobre: título revelado ao entrar na tela, etiqueta e costura entram junto com a foto.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('[data-lines], .about-photo-frame').forEach((el) => observer.observe(el));

  // O texto da biografia é dividido em palavras, que acendem conforme a rolagem.
  const words = [];
  const wordBlock = document.querySelector('[data-words]');
  if (wordBlock) {
    wordBlock.querySelectorAll('p').forEach((p) => {
      p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
      words.push(...p.querySelectorAll('.w'));
    });
  }

  const about = document.querySelector('.about-section');
  const ghost = document.querySelector('.about-ghost span');
  const frame = document.querySelector('.about-photo-frame');
  const photo = frame && frame.querySelector('img');
  const svg = frame && frame.querySelector('.about-stitch');
  const stitchLine = svg && svg.querySelector('.stitch-line');
  const stitchMask = svg && svg.querySelector('.stitch-mask');

  // A costura pontilhada é desenhada em pixels reais para o tracejado não deformar.
  const sizeStitch = () => {
    if (!svg) return;
    const w = svg.clientWidth;
    const h = svg.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    [stitchLine, stitchMask].forEach((rect) => {
      rect.setAttribute('x', 1);
      rect.setAttribute('y', 1);
      rect.setAttribute('width', Math.max(0, w - 2));
      rect.setAttribute('height', Math.max(0, h - 2));
    });
  };

  let lit = -1;
  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;

    if (hero) {
      const travel = Math.max(1, hero.offsetHeight - vh);
      const p = clamp(-hero.getBoundingClientRect().top / travel);
      stage.style.setProperty('--hero-p', p.toFixed(3));
    }

    if (about && ghost) {
      const r = about.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh + r.height));
      ghost.style.transform = `translate3d(${(-p * 35).toFixed(2)}%,0,0)`;
    }

    if (wordBlock && words.length) {
      const r = wordBlock.getBoundingClientRect();
      const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.12));
      const next = Math.round(p * words.length);
      if (next !== lit) {
        words.forEach((w, i) => w.classList.toggle('on', i < next));
        lit = next;
      }
    }

    if (frame) {
      const r = frame.getBoundingClientRect();
      const reveal = clamp((vh - r.top) / (vh * 0.7));
      const pass = clamp((vh - r.top) / (vh + r.height));
      frame.style.setProperty('--reveal', reveal.toFixed(3));
      if (photo) photo.style.transform = `translate3d(0,${((pass - 0.5) * -60).toFixed(1)}px,0) scale(${(1.18 - reveal * 0.1).toFixed(3)})`;
      if (stitchMask) stitchMask.style.strokeDashoffset = (1 - clamp((reveal - 0.35) / 0.65)).toFixed(3);
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', () => {
    sizeStitch();
    update();
  });
  sizeStitch();
  update();
})();

// Revelações no scroll para as outras telas e para as páginas de projeto.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('anim');
  const all = (selector) => [...document.querySelectorAll(selector)];

  // Títulos: cada linha (separada por <br>) sobe de dentro de uma máscara.
  all('.process-lead h2, .work-index h2, .project-lead h2, .ecos-cover-copy h2, .ecos-quote, .otimismo-statement p, .sunday-quote p, .page-next strong').forEach((el) => {
    if (el.querySelector('.line')) return;
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((part) => `<span class="line"><span>${part.trim()}</span></span>`).join('');
    el.setAttribute('data-lines', '');
  });

  // Textos e blocos sobem e aparecem em sequência dentro do mesmo grupo.
  const fades = all([
    '.project-number', '.project-lead > p', '.process-lead > p', '.process-steps > div',
    '.photo figcaption', '.ecos-cover-copy > p', '.ecos-concept-body > *', '.ecos-tags li', '.ecos-activation > div',
    '.sunday-story-copy p', '.sunday-quote cite', '.otimismo-half', '.otimismo-body p', '.otimismo-columns > div',
    '.otimismo-board-copy > *', '.otimismo-croquis figcaption', '.project-credits', '.page-end-foot', '.reveal-corners',
  ].join(','));
  fades.forEach((el) => {
    const group = [...el.parentElement.children].filter((sib) => fades.includes(sib));
    el.style.setProperty('--d', `${(group.indexOf(el) * 0.09).toFixed(2)}s`);
    el.setAttribute('data-fade', '');
  });
  all('.reveal-row').forEach((row) => row.setAttribute('data-fade', ''));

  // Fotos são reveladas de baixo para cima, como um tecido sendo puxado.
  all('.photo-window, .ecos-cover > img, .otimismo-croquis > img, .otimismo-refs img').forEach((el, i) => {
    el.setAttribute('data-unveil', '');
    if (el.closest('.otimismo-refs')) el.style.setProperty('--d', `${(i % 4) * 0.1}s`);
  });
  all('.otimismo-palette li').forEach((li, i) => {
    li.setAttribute('data-grow', '');
    li.style.setProperty('--d', `${i * 0.08}s`);
  });
  all('.section-kicker').forEach((el) => el.setAttribute('data-rule', ''));

  // Elementos recortados (clip-path) contam como invisíveis para o observer, então observamos
  // um elemento-pai sem recorte e marcamos o elemento de verdade quando ele entra na tela.
  const targets = new Map();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      (targets.get(entry.target) || []).forEach((el) => el.classList.add('is-visible'));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  all('[data-lines], [data-fade], [data-unveil], [data-grow], [data-rule]').forEach((el) => {
    const watch = el.matches('[data-unveil], [data-grow]') ? el.parentElement : el;
    if (!targets.has(watch)) targets.set(watch, []);
    targets.get(watch).push(el);
    observer.observe(watch);
  });

  // Processo: uma fita métrica atravessa a tela e corre com a rolagem.
  const tape = document.querySelector('.tape');
  const track = tape && tape.querySelector('.tape-track');
  if (!track) return;
  track.innerHTML = Array.from({ length: 150 }, (_, i) => `<span>${i}</span>`).join('');
  let ticking = false;
  const move = () => {
    const r = tape.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
    track.style.transform = `translate3d(${(-p * Math.max(0, track.scrollWidth - tape.clientWidth) * 0.55).toFixed(1)}px,0,0)`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(move);
    }
  }, { passive: true });
  window.addEventListener('resize', move);
  move();
})();
