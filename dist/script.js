(() => {
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero-stage');
  const video = document.querySelector('#hero-video');
  if (!hero || !stage || !video) return;

  // Na rolagem da hero, a abertura sobe e esmaece sobre o retrato.
  let ticking = false;
  const updateScroll = () => {
    const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / travel));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const openingOpacity = Math.min(1, Math.max(0, (0.43 - progress) / 0.2));
      stage.style.setProperty('--opening-opacity', openingOpacity.toFixed(3));
      stage.style.setProperty('--opening-y', `${Math.round(-progress * 100)}px`);
      stage.style.setProperty('--photo-scale', (1 + progress * 0.02).toFixed(3));
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

  // O vídeo será conectado aqui quando Ana Clara enviar o arquivo final.
  // A reprodução desacelerada mantém movimento contínuo durante a rolagem.
  video.addEventListener('loadeddata', () => {
    video.classList.add('is-ready');
    video.playbackRate = 0.78;
    video.play().catch(() => {});
  });
})();
