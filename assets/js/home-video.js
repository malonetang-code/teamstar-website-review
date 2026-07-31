(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 768px)");

  const revealPlan = [
    [".york-about-gallery", "left"],
    [".york-about-copy", "right"],
    [".heritage-lead", "left"],
    [".heritage-timeline", "right"],
    [".york-section-intro", "up"],
    [".blade-card", "up"],
    [".industries-grid > div", "left"],
    [".industry-list", "right"],
    [".proof-editorial-copy", "left"],
    [".proof-editorial-media", "right"],
  ];

  const revealItems = [];
  revealPlan.forEach(([selector, direction]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (!element.dataset.homeReveal) {
        element.dataset.homeReveal = direction;
      }
      element.style.setProperty("--home-delay", `${Math.min(index, 4) * 55}ms`);
      revealItems.push(element);
    });
  });

  document.querySelectorAll("[data-home-reveal]").forEach((element) => {
    if (!revealItems.includes(element)) revealItems.push(element);
  });

  let observer;

  const showAll = () => {
    observer?.disconnect();
    observer = undefined;
    document.documentElement.classList.remove("has-home-motion");
    revealItems.forEach((element) => element.classList.add("is-home-revealed"));
  };

  const setupReveal = () => {
    if (
      reducedMotion.matches ||
      !desktop.matches ||
      !("IntersectionObserver" in window)
    ) {
      showAll();
      return;
    }

    observer?.disconnect();
    document.documentElement.classList.add("has-home-motion");
    revealItems.forEach((element) => element.classList.remove("is-home-revealed"));
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-home-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    revealItems.forEach((element) => observer.observe(element));
  };

  reducedMotion.addEventListener("change", setupReveal);
  desktop.addEventListener("change", setupReveal);
  setupReveal();
})();
