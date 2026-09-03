(() => {
  const root = document.documentElement;
  // The color review has concluded. E is now the single active visual system.
  const validTheme = (value) => value === "e";
  const validConcept = (value) => ["1", "2", "3"].includes(value);
  const query = new URLSearchParams(window.location.search);
  const themeFromHome = root.dataset.fullPreview;
  const themeFromQuery = query.get("style");
  const themeStorageKey = "teamstar-review-theme";
  let themeFromSession = "";
  try {
    themeFromSession = window.sessionStorage.getItem(themeStorageKey) || "";
  } catch (_error) {
    // The review still works when storage is disabled.
  }
  const theme = validTheme(themeFromHome)
    ? themeFromHome
    : validTheme(themeFromQuery)
      ? themeFromQuery
      : validTheme(themeFromSession)
        ? themeFromSession
        : "e";
  const conceptStorageKey = "teamstar-review-concept";
  const conceptFromHome = root.dataset.reviewConcept;
  const conceptFromQuery = query.get("concept");
  let conceptFromSession = "";
  try {
    conceptFromSession = window.sessionStorage.getItem(conceptStorageKey) || "";
  } catch (_error) {
    // The review still works when storage is disabled.
  }
  const activeConcept = validConcept(conceptFromHome)
    ? conceptFromHome
    : validConcept(conceptFromQuery)
      ? conceptFromQuery
      : validConcept(conceptFromSession)
        ? conceptFromSession
        : "1";
  const isEnglish = root.lang.toLowerCase().startsWith("en");

  root.dataset.reviewConcept = activeConcept;
  try {
    window.sessionStorage.setItem(conceptStorageKey, activeConcept);
  } catch (_error) {
    // Storage is only a convenience for review navigation.
  }

  // Browsers may restore focus to the first link after a reload. Keep the
  // skip link available to keyboard users, but reveal it only after an actual
  // Tab key press so ordinary page loads never show it as part of the design.
  mountKeyboardNavigationMode();

  // The selected real product-hero photo is part of the product page itself,
  // not only of the A-E theme switcher. Mount it before the theme-only exit so
  // direct product-directory visits retain the approved banner image.
  mountProductHeroSample();
  cleanChineseInterfaceLabels();

  if (!theme) return;

  try {
    window.sessionStorage.setItem(themeStorageKey, theme);
  } catch (_error) {
    // Storage is only a convenience for review navigation.
  }

  if (!validTheme(themeFromHome) && !validTheme(themeFromQuery)) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("style", theme);
    window.history.replaceState(null, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  }

  const reviewPrefixes = ["/teamstar-review/", "/teamstar-website-review/"];

  if (!validTheme(themeFromHome)) {
    root.dataset.siteThemePreview = theme;
    document.body.classList.add("site-theme-preview-active");
  }

  mountLanguageMenu();

  propagateThemeLinks();

  mountConceptOnePageHeroReveal();

  function mountKeyboardNavigationMode() {
    const keyboardAttribute = "data-keyboard-navigation";
    const skipLink = document.querySelector(".skip-link");

    root.removeAttribute(keyboardAttribute);

    if (document.activeElement === skipLink) {
      skipLink.blur();
    }

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Tab") {
          root.setAttribute(keyboardAttribute, "true");
        }
      },
      true,
    );

    document.addEventListener(
      "pointerdown",
      () => {
        root.removeAttribute(keyboardAttribute);
      },
      true,
    );

    window.addEventListener("blur", () => {
      root.removeAttribute(keyboardAttribute);
    });
  }

  function cleanChineseInterfaceLabels() {
    if (isEnglish) return;

    const containsLatinText = (element) => /[A-Za-z]/.test(element.textContent || "");

    document.querySelectorAll(".eyebrow").forEach((label) => {
      if (containsLatinText(label)) label.remove();
    });

    document
      .querySelectorAll(
        ".guide-route-label, .fp-why-e-heading > span, .fp-mega-intro > small",
      )
      .forEach((label) => {
        if (containsLatinText(label)) label.remove();
      });

    document
      .querySelectorAll(".quality-flow-step > b, .inspection-scope > b")
      .forEach((label) => {
        const match = (label.textContent || "").trim().match(/^(\d{2})\s*\/\s*[A-Za-z]/);
        if (match) label.textContent = match[1];
      });

    const emailLabel = document.querySelector('label[for="rfq-email"]');
    if (emailLabel && /^Email\s*/.test(emailLabel.textContent || "")) {
      const textNode = Array.from(emailLabel.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE,
      );
      if (textNode) textNode.nodeValue = "电子邮箱";
    }

    const errorCode = document.querySelector(".error-code");
    if (errorCode && /NOT FOUND/i.test(errorCode.textContent || "")) {
      errorCode.textContent = "404";
    }
  }

  function mountProductHeroSample() {
    const isProductDirectory = /^\/(?:teamstar-review|teamstar-website-review)\/(?:en\/)?products\/$/.test(
      window.location.pathname,
    );
    const samples = {
      "real-photo": {
        src: "/teamstar-review/full-style-preview/media/product-hero-laser-sample.jpg",
        width: 1920,
        height: 1080,
        label: isEnglish ? "PRODUCT HERO · LOCAL REVIEW" : "产品首图 · 本地样图",
      },
      "surface-inspection": {
        src: "/teamstar-review/images/web/process-20260725/06-surface-inspection-full.jpg",
        width: 1600,
        height: 1202,
        label: isEnglish ? "BLADE SURFACE INSPECTION" : "刀具表面检测",
      },
      "finished-blades": {
        src: "/teamstar-review/images/web/process-20260725/08-edge-protection-full.jpg",
        width: 1600,
        height: 1202,
        label: isEnglish ? "PHOTO C · FINISHED BLADES" : "照片 C · 成品刀具排列",
      },
    };
    const sampleKey = query.get("hero") || "surface-inspection";
    const sample = samples[sampleKey];
    if (!sample || !isProductDirectory) return;

    const hero = document.querySelector(".page-hero");
    const picture = hero?.querySelector(":scope > picture");
    const image = picture?.querySelector("img");
    if (!hero || !picture || !image) return;

    document.body.classList.add("product-hero-photo-sample");
    document.body.dataset.productHeroSample = sampleKey;
    picture.querySelectorAll("source").forEach((source) => source.remove());
    image.removeAttribute("srcset");
    image.removeAttribute("sizes");
    image.src = sample.src;
    image.width = sample.width;
    image.height = sample.height;
    image.alt = "";
    image.decoding = "async";
    image.fetchPriority = "high";

    const label = document.createElement("span");
    label.className = "product-hero-sample-label";
    label.textContent = sample.label;
    hero.append(label);
  }

  function mountConceptOnePageHeroReveal() {
    if (activeConcept !== "1" || document.body.classList.contains("page-home")) return;

    const media = document.querySelector(".page-hero > picture");
    if (!media) return;

    media.classList.add("c1-page-hero-media-wipe");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      media.classList.add("is-visible");
      return;
    }

    root.classList.add("c1-subpage-motion-ready");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => media.classList.add("is-visible"));
    });
  }

  function mountLanguageMenu() {
    const existingMenu = document.querySelector(".language-menu");
    if (existingMenu) {
      enhanceLanguageMenuTrigger(existingMenu);
      return;
    }

    const legacyLink = document.querySelector(".nav-actions > .language-link");
    if (!legacyLink) return;

    const normalizedPath = normalizeReviewPath(window.location.pathname);
    const relativePath = normalizedPath
      .replace(/^\/teamstar-review\//, "")
      .replace(/^en\//, "");
    const languageUrl = (language) => {
      const url = new URL(window.location.href);
      url.pathname = `/teamstar-review/${language === "en" ? "en/" : ""}${relativePath}`;
      url.searchParams.set("style", theme);
      if (activeConcept === "1") url.searchParams.delete("concept");
      else url.searchParams.set("concept", activeConcept);
      return `${url.pathname}${url.search}${url.hash}`;
    };

    const labels = isEnglish
      ? { aria: "Choose language", title: "Language", planned: "Planned" }
      : { aria: "English / 选择语言", title: "多语言", planned: "筹备中" };

    const menu = document.createElement("details");
    menu.className = "language-menu";

    const summary = document.createElement("summary");
    summary.setAttribute("aria-label", labels.aria);
    const triggerLabel = document.createElement("span");
    triggerLabel.className = "language-menu-code";
    triggerLabel.textContent = "EN";
    summary.append(triggerLabel);

    const panel = document.createElement("div");
    panel.className = "language-menu-panel";
    const title = document.createElement("strong");
    title.textContent = labels.title;
    panel.append(title);

    const addLanguage = ({ href, label, code, current = false }) => {
      const link = document.createElement("a");
      link.href = href;
      link.hreflang = code === "ZH" ? "zh-CN" : "en";
      if (current) link.setAttribute("aria-current", "page");
      const name = document.createElement("span");
      name.textContent = label;
      const abbreviation = document.createElement("small");
      abbreviation.textContent = code;
      link.append(name, abbreviation);
      panel.append(link);
    };

    const addPlannedLanguage = (label) => {
      const option = document.createElement("span");
      option.className = "is-disabled";
      option.setAttribute("aria-disabled", "true");
      const name = document.createElement("span");
      name.textContent = label;
      const status = document.createElement("small");
      status.textContent = labels.planned;
      option.append(name, status);
      panel.append(option);
    };

    addLanguage({ href: languageUrl("zh"), label: "简体中文", code: "ZH", current: !isEnglish });
    addLanguage({ href: languageUrl("en"), label: "English", code: "EN", current: isEnglish });
    addPlannedLanguage("Français");
    addPlannedLanguage("Español");

    menu.append(summary, panel);
    enhanceLanguageMenuTrigger(menu);
    legacyLink.replaceWith(menu);

    menu.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !menu.open) return;
      menu.open = false;
      summary.focus();
    });
    document.addEventListener("click", (event) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }

  function enhanceLanguageMenuTrigger(menu) {
    const summary = menu.querySelector("summary");
    if (!summary || summary.querySelector(".language-menu-icon")) return;

    const code = summary.querySelector("span") || document.createElement("span");
    code.className = "language-menu-code";
    code.textContent = "EN";

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.classList.add("language-menu-icon");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>';

    const hint = document.createElement("span");
    hint.className = "language-menu-hint";
    hint.textContent = isEnglish ? "LANG" : "语言";

    summary.replaceChildren(icon, hint, code);
  }

  function propagateThemeLinks() {
    document.querySelectorAll("a[href]").forEach((link) => {
      if (link.closest(".site-theme-preview-switcher")) return;
      const rawHref = link.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#")) return;
      if (/^(mailto:|tel:|javascript:)/i.test(rawHref)) return;

      let url;
      try {
        url = new URL(rawHref, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      const prefix = reviewPrefixes.find((candidate) => url.pathname.startsWith(candidate));
      if (!prefix) return;

      const relativePath = url.pathname.slice(prefix.length);
      if (/^(assets|images|img|api)\//.test(relativePath)) return;
      if (relativePath.startsWith("full-style-preview/")) return;

      if (isLanguageHome(relativePath)) {
        const targetIsEnglish = relativePath === "en/" || relativePath === "en/home/";
        url.pathname = `/teamstar-review/full-style-preview/${activeConcept}/${targetIsEnglish ? "en/" : ""}`;
        url.search = "";
      } else {
        url.pathname = normalizeReviewPath(url.pathname);
        url.searchParams.set("style", theme);
        if (activeConcept === "1") url.searchParams.delete("concept");
        else url.searchParams.set("concept", activeConcept);
      }

      link.href = `${url.pathname}${url.search}${url.hash}`;
      link.dataset.themeLinkUpdated = "true";
    });
  }

  function normalizeReviewPath(pathname) {
    return pathname.replace(/^\/teamstar-website-review\//, "/teamstar-review/");
  }

  function isLanguageHome(relativePath) {
    return ["", "index.html", "home/", "en/", "en/home/"].includes(relativePath);
  }
})();
