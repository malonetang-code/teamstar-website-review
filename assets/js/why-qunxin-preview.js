(() => {
  const body = document.body;
  const styleLinks = Array.from(document.querySelectorAll("[data-style-link]"));
  const panels = Array.from(document.querySelectorAll("[data-preview-panel]"));
  const languageLink = document.querySelector("[data-language-link]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const allowedStyles = new Set(["a", "b", "c", "d"]);

  function selectedStyle() {
    const value = new URLSearchParams(window.location.search).get("style");
    return allowedStyles.has(value) ? value : "a";
  }

  function setToggleState(button, video) {
    if (!button || !video) return;
    const paused = video.paused;
    const isEnglish = document.documentElement.lang === "en";
    button.querySelector("[data-pause-icon]").hidden = paused;
    button.querySelector("[data-play-icon]").hidden = !paused;
    button.querySelector("span").textContent = paused ? (isEnglish ? "Play" : "播放") : (isEnglish ? "Pause" : "暂停");
    button.setAttribute("aria-label", paused ? (isEnglish ? "Play video" : "播放视频") : (isEnglish ? "Pause video" : "暂停视频"));
  }

  function pauseAllVideos(except) {
    document.querySelectorAll("video").forEach((video) => {
      if (video !== except) video.pause();
    });
  }

  function playIfAllowed(video) {
    if (!video || reducedMotion.matches) return;
    video.play().catch(() => {});
  }

  function syncVideoForStyle(style) {
    pauseAllVideos();
    document.querySelectorAll("[data-media-toggle]").forEach((button) => {
      if (!button.closest(`[data-preview-panel="${style}"]`)) return;
      const panel = button.closest("[data-preview-panel]");
      const video = panel.querySelector(style === "a" ? ".why-a-frame:not([hidden]) video" : "[data-stage-video]");
      if (video) {
        button.hidden = false;
        playIfAllowed(video);
        window.setTimeout(() => setToggleState(button, video), 0);
      } else {
        button.hidden = true;
      }
    });
  }

  function showStyle(style, updateHistory = false) {
    body.classList.toggle("is-style-d", style === "d");

    panels.forEach((panel) => {
      const active = panel.dataset.previewPanel === style;
      panel.hidden = !active;
      panel.setAttribute("aria-hidden", String(!active));
    });

    styleLinks.forEach((link) => {
      const active = link.dataset.styleLink === style;
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    if (languageLink) {
      const url = new URL(languageLink.href);
      url.searchParams.set("style", style);
      languageLink.href = `${url.pathname}${url.search}`;
    }

    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set("style", style);
      window.history.pushState({ style }, "", url);
    }

    syncVideoForStyle(style);
    if (style === "c") observeChapters();
  }

  styleLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showStyle(link.dataset.styleLink, true);
      const target = link.dataset.styleLink === "d"
        ? document.querySelector('[data-preview-panel="d"]')
        : document.querySelector(".why-review-intro");
      target?.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    });
  });

  window.addEventListener("popstate", () => showStyle(selectedStyle()));

  const proofTabs = Array.from(document.querySelectorAll("[data-proof-tab]"));
  const proofFrames = Array.from(document.querySelectorAll("[data-proof-media]"));

  function activateProof(name, focus = false) {
    proofTabs.forEach((tab) => {
      const active = tab.dataset.proofTab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });

    proofFrames.forEach((frame) => {
      const active = frame.dataset.proofMedia === name;
      const video = frame.querySelector("video");
      frame.hidden = !active;
      frame.classList.toggle("is-active", active);
      frame.classList.remove("is-entering");
      if (active) {
        requestAnimationFrame(() => frame.classList.add("is-entering"));
        if (video) playIfAllowed(video);
      } else if (video) {
        video.pause();
      }
    });

    syncVideoForStyle("a");
  }

  proofTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateProof(tab.dataset.proofTab));
    tab.addEventListener("keydown", (event) => {
      if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let target = index;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") target = (index + 1) % proofTabs.length;
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") target = (index - 1 + proofTabs.length) % proofTabs.length;
      if (event.key === "Home") target = 0;
      if (event.key === "End") target = proofTabs.length - 1;
      activateProof(proofTabs[target].dataset.proofTab, true);
    });
  });

  document.querySelectorAll("[data-media-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.closest("[data-preview-panel]");
      const video = panel.querySelector(panel.dataset.previewPanel === "a" ? ".why-a-frame:not([hidden]) video" : "[data-stage-video]");
      if (!video) return;
      if (video.paused) video.play().catch(() => {});
      else video.pause();
      window.setTimeout(() => setToggleState(button, video), 0);
    });
  });

  let chapterObserver;
  function observeChapters() {
    const chapters = Array.from(document.querySelectorAll("[data-chapter]"));
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      chapters.forEach((chapter) => chapter.classList.add("is-visible"));
      return;
    }

    body.classList.add("is-motion-ready");
    if (chapterObserver) chapterObserver.disconnect();
    chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          chapterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.22, rootMargin: "0px 0px -8%" });
    chapters.forEach((chapter) => chapterObserver.observe(chapter));
  }

  reducedMotion.addEventListener?.("change", () => {
    if (reducedMotion.matches) pauseAllVideos();
    else syncVideoForStyle(selectedStyle());
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseAllVideos();
    else syncVideoForStyle(selectedStyle());
  });

  showStyle(selectedStyle());
})();
