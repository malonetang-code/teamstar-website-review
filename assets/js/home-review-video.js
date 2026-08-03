(() => {
  document.body.classList.add("page-home-video");

  const setup = () => {
    const video = document.querySelector("[data-home-video]");
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 768px)");

    const syncPlayback = () => {
      if (reducedMotion.matches || !desktop.matches) {
        video.pause();
        video.currentTime = 0;
        return;
      }
      video.play().catch(() => {
        // Keep the verified manufacturing poster visible if autoplay is blocked.
      });
    };

    reducedMotion.addEventListener("change", syncPlayback);
    desktop.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else syncPlayback();
    });
    syncPlayback();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
