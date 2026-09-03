(() => {
  const root = document.documentElement;
  if (root.dataset.reviewConcept !== "1" || !document.body.classList.contains("page-home")) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isEnglish = root.lang.toLowerCase().startsWith("en");
  const heroCopy = document.querySelector(".hero-copy");
  const revealTargets = [
    heroCopy,
    document.querySelector(".home-logo-heading"),
    document.querySelector(".fp-why-e-heading"),
    ...document.querySelectorAll(".fp-why-e-specs article"),
    document.querySelector(".home-product-section .section-head"),
    document.querySelector(".home-product-section .blade-grid"),
  ].filter(Boolean);

  revealTargets.forEach((element, index) => {
    element.classList.add("c1-reveal");
    if (element.matches(".fp-why-e-specs article")) {
      const position = Array.from(element.parentElement.children).indexOf(element);
      element.style.setProperty("--c1-reveal-delay", `${position * 70}ms`);
    } else if (index > 0) {
      element.style.setProperty("--c1-reveal-delay", "40ms");
    }
  });

  const heroMedia = document.querySelector(".home-video-media");
  heroMedia?.classList.add("c1-image-wipe");

  const logoWall = document.querySelector(".home-logo-section .logo-wall");
  if (logoWall && !logoWall.parentElement.classList.contains("c1-logo-viewport")) {
    const viewport = document.createElement("div");
    viewport.className = "c1-logo-viewport";
    logoWall.before(viewport);
    viewport.append(logoWall);
  }

  document.querySelectorAll(".home-product-section .blade-body").forEach((body) => {
    if (body.querySelector(".c1-product-cue")) return;
    const cue = document.createElement("span");
    cue.className = "c1-product-cue";
    cue.setAttribute("aria-hidden", "true");
    cue.textContent = isEnglish ? "VIEW PRODUCT" : "查看产品";
    body.prepend(cue);
  });

  const countTarget = document.querySelector(".fp-why-e-specs article:first-child > strong");
  const countTextNode = countTarget
    ? Array.from(countTarget.childNodes).find((node) => node.nodeType === Node.TEXT_NODE)
    : null;
  let countFrame = 0;
  let countHasRun = false;

  const finishCount = () => {
    cancelAnimationFrame(countFrame);
    if (countTextNode) countTextNode.nodeValue = "40+";
  };

  const runCount = () => {
    if (!countTextNode || countHasRun) return;
    countHasRun = true;
    if (reducedMotion.matches) {
      finishCount();
      return;
    }
    const start = performance.now();
    const duration = 900;
    countTextNode.nodeValue = "0+";
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      countTextNode.nodeValue = `${Math.round(40 * eased)}+`;
      if (progress < 1) countFrame = requestAnimationFrame(tick);
    };
    countFrame = requestAnimationFrame(tick);
  };

  const showEverything = () => {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    heroMedia?.classList.add("is-visible");
    finishCount();
  };

  if (reducedMotion.matches) {
    showEverything();
    root.classList.add("c1-motion-ready");
    return;
  }

  root.classList.add("c1-motion-ready");
  requestAnimationFrame(() => {
    heroMedia?.classList.add("is-visible");
    heroCopy?.classList.add("is-visible");
  });

  if (!("IntersectionObserver" in window)) {
    showEverything();
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: .16, rootMargin: "0px 0px -6%" });
  revealTargets
    .filter((element) => element !== heroCopy)
    .forEach((element) => revealObserver.observe(element));

  if (countTarget) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCount();
        observer.unobserve(entry.target);
      });
    }, { threshold: .55 });
    countObserver.observe(countTarget);
  }

  const onMotionPreferenceChange = () => {
    if (reducedMotion.matches) showEverything();
  };
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", onMotionPreferenceChange);
  } else {
    reducedMotion.addListener(onMotionPreferenceChange);
  }
})();
