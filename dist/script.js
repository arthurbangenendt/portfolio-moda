(() => {
  const hero = document.querySelector('.hero');
  const media = document.querySelector('.hero-media');
  const video = document.querySelector('#hero-video');
  const bio = document.querySelector('.bio-story');
  const bioStage = document.querySelector('.bio-stage');
  if (!hero || !media || !video) return;

  let ticking = false;
  const updateScroll = () => {
    const maxTravel = Math.max(1, hero.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / maxTravel));
    media.style.setProperty('--scroll-progress', progress.toFixed(3));

    if (bio && bioStage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const bioTravel = Math.max(1, bio.offsetHeight - window.innerHeight);
      const bioProgress = Math.min(1, Math.max(0, -bio.getBoundingClientRect().top / bioTravel));
      const copyOpacity = Math.min(1, Math.max(0, (bioProgress - 0.13) / 0.24));
      bioStage.style.setProperty('--bio-title-y', `${Math.round(80 - bioProgress * 180)}px`);
      bioStage.style.setProperty('--bio-copy-y', `${Math.round(95 - bioProgress * 115)}px`);
      bioStage.style.setProperty('--bio-photo-scale', (1.06 + bioProgress * 0.11).toFixed(3));
      bioStage.style.setProperty('--bio-copy-opacity', copyOpacity.toFixed(3));
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
