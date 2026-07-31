(() => {
  const video = document.querySelector("[data-home-video]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 768px)");

  const syncPlayback = () => {
    if (!video) return;
    if (reducedMotion.matches || !desktop.matches) {
      video.pause();
      video.currentTime = 0;
      return;
    }
    video.play().catch(() => {
      // The real manufacturing poster remains visible if autoplay is blocked.
    });
  };

  reducedMotion.addEventListener("change", syncPlayback);
  desktop.addEventListener("change", syncPlayback);
  document.addEventListener("visibilitychange", () => {
    if (!video) return;
    if (document.hidden) video.pause();
    else syncPlayback();
  });
  syncPlayback();

  const revealPlan = [
    [".section-head", "up"],
    [".blade-grid", "up"],
    [".evidence-home-item--manufacturing", "left"],
    [".evidence-home-item--quality", "right"],
    [".reference-section .logo-wall", "up"],
    [".rfq-band-grid", "up"],
  ];

  const revealItems = [];
  revealPlan.forEach(([selector, direction]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (!element.dataset.homeReveal) {
        element.dataset.homeReveal = direction;
      }
      element.style.setProperty("--home-delay", `${Math.min(index, 5) * 70}ms`);
      revealItems.push(element);
    });
  });
  document.querySelectorAll("[data-home-reveal]").forEach((element) => {
    if (!revealItems.includes(element)) revealItems.push(element);
  });

  let revealObserver;
  const teardownReveal = () => {
    revealObserver?.disconnect();
    revealObserver = undefined;
    document.documentElement.classList.remove("has-home-motion");
    revealItems.forEach((element) => element.classList.add("is-home-revealed"));
  };

  const setupReveal = () => {
    if (
      reducedMotion.matches ||
      !desktop.matches ||
      !("IntersectionObserver" in window)
    ) {
      teardownReveal();
      return;
    }
    revealItems.forEach((element) => element.classList.remove("is-home-revealed"));
    document.documentElement.classList.add("has-home-motion");
    revealObserver?.disconnect();
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-home-revealed");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    revealItems.forEach((element) => revealObserver.observe(element));
  };

  const logoTrack = document.querySelector(".reference-section .logo-wall");
  let logoClones = [];
  const teardownLogoMarquee = () => {
    logoTrack?.classList.remove("is-home-marquee");
    logoClones.forEach((element) => element.remove());
    logoClones = [];
  };
  const setupLogoMarquee = () => {
    teardownLogoMarquee();
    if (!logoTrack || reducedMotion.matches || !desktop.matches) return;
    const originals = Array.from(logoTrack.children);
    logoClones = originals.map((element) => {
      const clone = element.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a, button").forEach((interactive) => {
        interactive.setAttribute("tabindex", "-1");
      });
      logoTrack.appendChild(clone);
      return clone;
    });
    logoTrack.classList.add("is-home-marquee");
  };

  const syncExperience = () => {
    setupReveal();
    setupLogoMarquee();
  };

  reducedMotion.addEventListener("change", syncExperience);
  desktop.addEventListener("change", syncExperience);
  syncExperience();
})();
