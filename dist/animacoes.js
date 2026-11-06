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
