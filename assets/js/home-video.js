(() => {
  const video = document.querySelector("[data-home-video]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 768px)");
  const hero = document.querySelector("[data-home-hero]");
  const heroPanels = Array.from(
    hero?.querySelectorAll("[data-hero-panel]") ?? [],
  );
  const heroTriggers = Array.from(
    hero?.querySelectorAll("[data-hero-trigger]") ?? [],
  );
  const previousButton = hero?.querySelector("[data-hero-prev]");
  const nextButton = hero?.querySelector("[data-hero-next]");
  const autoplayButton = hero?.querySelector("[data-hero-autoplay]");
  const currentLabel = hero?.querySelector("[data-hero-current]");
  const pauseIcon = hero?.querySelector("[data-hero-pause-icon]");
  const playIcon = hero?.querySelector("[data-hero-play-icon]");
  const autoplayInterval = 8000;
  let activeHeroPanel = 0;
  let autoplayTimer;
  let userPaused = false;
  let temporarilyPaused = false;

  const syncPlayback = () => {
    if (!video) return;
    if (reducedMotion.matches || !desktop.matches || activeHeroPanel !== 0) {
      video.pause();
      video.currentTime = 0;
      return;
    }
    video.play().catch(() => {
      // The real manufacturing poster remains visible if autoplay is blocked.
    });
  };

  const canAutoplay = () =>
    heroPanels.length > 1 &&
    !reducedMotion.matches &&
    !userPaused &&
    !temporarilyPaused &&
    !document.hidden;

  const syncAutoplayState = () => {
    const isPlaying = canAutoplay();
    hero?.classList.toggle("is-autoplaying", isPlaying);
    hero?.classList.toggle("is-temporarily-paused", temporarilyPaused);
    if (!autoplayButton) return;
    autoplayButton.disabled = reducedMotion.matches;
    autoplayButton.setAttribute(
      "aria-label",
      isPlaying
        ? document.documentElement.lang === "zh-CN"
          ? "暂停自动播放"
          : "Pause automatic slides"
        : document.documentElement.lang === "zh-CN"
          ? "继续自动播放"
          : "Resume automatic slides",
    );
    if (pauseIcon) pauseIcon.hidden = !isPlaying;
    if (playIcon) playIcon.hidden = isPlaying;
  };

  const clearAutoplay = () => {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = undefined;
  };

  const scheduleAutoplay = () => {
    clearAutoplay();
    syncAutoplayState();
    if (!canAutoplay()) return;
    autoplayTimer = window.setTimeout(() => {
      activateHeroPanel((activeHeroPanel + 1) % heroPanels.length);
    }, autoplayInterval);
  };

  const activateHeroPanel = (index, moveFocus = false) => {
    if (!heroPanels[index] || !heroTriggers[index]) return;
    activeHeroPanel = index;
    heroPanels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === activeHeroPanel;
      panel.classList.toggle("is-active", isActive);
      panel.setAttribute("aria-hidden", String(!isActive));
    });
    heroTriggers.forEach((trigger, triggerIndex) => {
      const isActive = triggerIndex === activeHeroPanel;
      trigger.classList.toggle("is-active", isActive);
      trigger.setAttribute("aria-selected", String(isActive));
      trigger.tabIndex = isActive ? 0 : -1;
    });
    if (currentLabel) {
      currentLabel.textContent = String(activeHeroPanel + 1).padStart(2, "0");
    }
    if (moveFocus) heroTriggers[index].focus();
    syncPlayback();
    scheduleAutoplay();
  };

  const pauseForUser = () => {
    userPaused = true;
    scheduleAutoplay();
  };

  heroTriggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      pauseForUser();
      activateHeroPanel(index);
    });
    trigger.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        return;
      }
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + heroTriggers.length) % heroTriggers.length;
      } else if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % heroTriggers.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = heroTriggers.length - 1;
      }
      pauseForUser();
      activateHeroPanel(nextIndex, true);
    });
  });

  previousButton?.addEventListener("click", () => {
    pauseForUser();
    activateHeroPanel(
      (activeHeroPanel - 1 + heroPanels.length) % heroPanels.length,
    );
  });

  nextButton?.addEventListener("click", () => {
    pauseForUser();
    activateHeroPanel((activeHeroPanel + 1) % heroPanels.length);
  });

  autoplayButton?.addEventListener("click", () => {
    if (reducedMotion.matches) return;
    userPaused = !userPaused;
    temporarilyPaused = false;
    scheduleAutoplay();
  });

  hero?.addEventListener("mouseenter", () => {
    temporarilyPaused = true;
    scheduleAutoplay();
  });

  hero?.addEventListener("mouseleave", () => {
    temporarilyPaused = false;
    scheduleAutoplay();
  });

  hero?.addEventListener("focusin", () => {
    temporarilyPaused = true;
    scheduleAutoplay();
  });

  hero?.addEventListener("focusout", () => {
    window.setTimeout(() => {
      temporarilyPaused = Boolean(hero?.contains(document.activeElement));
      scheduleAutoplay();
    }, 0);
  });

  hero?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") pauseForUser();
  });

  const syncHeroExperience = () => {
    syncPlayback();
    scheduleAutoplay();
  };

  reducedMotion.addEventListener("change", syncHeroExperience);
  desktop.addEventListener("change", syncPlayback);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) video?.pause();
    syncHeroExperience();
  });
  activateHeroPanel(0);

  const revealPlan = [
    [".section-head", "up"],
    [".who-copy", "left"],
    [".who-facility", "right"],
    [".proof-band", "up"],
    [".value-card", "up"],
    [".assurance-steps", "up"],
    [".blade-grid", "up"],
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
