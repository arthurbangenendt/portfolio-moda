(() => {
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero-stage');
  const video = document.querySelector('#hero-video');
  if (!hero || !stage || !video) return;

  let ticking = false;
  const updateScroll = () => {
    const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / travel));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const openingOpacity = Math.min(1, Math.max(0, (0.43 - progress) / 0.2));
      const visionOpacity = Math.min(1, Math.max(0, (progress - 0.32) / 0.22));
      stage.style.setProperty('--opening-opacity', openingOpacity.toFixed(3));
      stage.style.setProperty('--vision-opacity', visionOpacity.toFixed(3));
      stage.style.setProperty('--opening-y', `${Math.round(-progress * 100)}px`);
      stage.style.setProperty('--vision-y', `${Math.round(110 - progress * 150)}px`);
      stage.style.setProperty('--photo-scale', (1.04 + progress * 0.08).toFixed(3));
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();

  document.querySelectorAll('a[href="#visao"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
      window.scrollTo({ top: hero.offsetTop + travel * 0.62, behavior: 'smooth' });
    });
  });

  // O vídeo será conectado aqui quando Ana Clara enviar o arquivo final.
  // A reprodução desacelerada mantém movimento contínuo durante a rolagem.
  video.addEventListener('loadeddata', () => {
    video.classList.add('is-ready');
    video.playbackRate = 0.78;
    video.play().catch(() => {});
  });
})();
