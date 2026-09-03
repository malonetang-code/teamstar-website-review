(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function showRevealItems(root = document) {
    root.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
  }

  function hideThenShow(elements, className = "is-visible") {
    elements.forEach((element) => element.classList.remove(className));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      elements.forEach((element) => element.classList.add(className));
    }));
  }

  const revealDemo = document.querySelector('[data-demo="reveal"]');
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  const wipeDemo = document.querySelector('[data-demo="image-wipe"]');
  const wipe = document.querySelector("[data-image-wipe]");
  const countDemo = document.querySelector('[data-demo="count"]');
  const countValue = document.querySelector("[data-count-value]");
  let countFrame = 0;

  function runCount() {
    if (!countValue) return;
    cancelAnimationFrame(countFrame);
    if (reducedMotion.matches) {
      countValue.textContent = "40";
      return;
    }
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      countValue.textContent = String(Math.round(40 * eased));
      if (progress < 1) countFrame = requestAnimationFrame(tick);
    };
    countValue.textContent = "0";
    countFrame = requestAnimationFrame(tick);
  }

  if (reducedMotion.matches) {
    showRevealItems();
    wipe?.classList.add("is-visible");
    runCount();
  } else {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target === revealDemo) showRevealItems(revealDemo);
        if (entry.target === wipeDemo) wipe?.classList.add("is-visible");
        if (entry.target === countDemo) runCount();
        activeObserver.unobserve(entry.target);
      });
    }, { threshold: .28 });
    [revealDemo, wipeDemo, countDemo].forEach((element) => element && observer.observe(element));
  }

  document.querySelectorAll("[data-replay]").forEach((button) => {
    button.addEventListener("click", () => {
      if (reducedMotion.matches) return;
      const demo = button.dataset.replay;
      if (demo === "reveal") hideThenShow(revealItems);
      if (demo === "image-wipe" && wipe) hideThenShow([wipe]);
      if (demo === "count") runCount();
    });
  });

  const logoViewport = document.querySelector("[data-logo-viewport]");
  const logoButton = document.querySelector("[data-toggle-logos]");
  logoButton?.addEventListener("click", () => {
    const paused = logoViewport?.classList.toggle("is-paused") ?? false;
    logoButton.setAttribute("aria-pressed", String(paused));
    logoButton.textContent = paused ? "继续" : "暂停";
  });
})();
