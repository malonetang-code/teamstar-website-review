(() => {
  const root = document.documentElement;
  const validTheme = (value) => /^[a-e]$/.test(value || "");
  const query = new URLSearchParams(window.location.search);
  const themeFromHome = root.dataset.fullPreview;
  const themeFromQuery = query.get("style");
  const theme = validTheme(themeFromHome)
    ? themeFromHome
    : validTheme(themeFromQuery)
      ? themeFromQuery
      : "";

  if (!theme) return;

  const isEnglish = root.lang.toLowerCase().startsWith("en");
  const reviewPrefixes = ["/teamstar-review/", "/teamstar-website-review/"];
  const homeForTheme = (nextTheme = theme) =>
    `/teamstar-review/full-style-preview/${nextTheme}/${isEnglish ? "en/" : ""}`;

  if (!validTheme(themeFromHome)) {
    root.dataset.siteThemePreview = theme;
    document.body.classList.add("site-theme-preview-active");
  }

  mountProductHeroSample();

  propagateThemeLinks();

  if (!validTheme(themeFromHome)) {
    mountThemeSwitcher();
  }

  function mountThemeSwitcher() {
    if (document.querySelector(".site-theme-preview-switcher")) return;

    const labels = isEnglish
      ? {
          title: "Full-site style review",
          home: "Theme home",
          themes: [
            ["a", "Industrial black"],
            ["b", "Precision white"],
            ["c", "Editorial"],
            ["d", "European warm"],
            ["e", "Restrained minimal"],
          ],
        }
      : {
          title: "全站风格对比",
          home: "返回主题首页",
          themes: [
            ["a", "强工业黑白"],
            ["b", "精密白底"],
            ["c", "工业编辑式"],
            ["d", "现代欧式"],
            ["e", "克制极简"],
          ],
        };

    const switcher = document.createElement("aside");
    switcher.className = "site-theme-preview-switcher";
    switcher.setAttribute("aria-label", labels.title);

    const title = document.createElement("strong");
    title.textContent = labels.title;
    switcher.append(title);

    const navigation = document.createElement("nav");
    labels.themes.forEach(([key, label]) => {
      const link = document.createElement("a");
      const url = new URL(window.location.href);
      url.pathname = normalizeReviewPath(url.pathname);
      url.searchParams.set("style", key);
      link.href = `${url.pathname}${url.search}${url.hash}`;
      if (key === theme) link.setAttribute("aria-current", "page");

      const keyLabel = document.createElement("b");
      keyLabel.textContent = key.toUpperCase();
      const text = document.createElement("span");
      text.textContent = label;
      link.append(keyLabel, text);
      navigation.append(link);
    });
    switcher.append(navigation);

    const home = document.createElement("a");
    home.className = "site-theme-home-link";
    home.href = homeForTheme();
    home.textContent = labels.home;
    switcher.append(home);

    document.body.prepend(switcher);
  }

  function mountProductHeroSample() {
    const isProductDirectory = /^\/(?:teamstar-review|teamstar-website-review)\/(?:en\/)?products\/$/.test(
      window.location.pathname,
    );
    if (query.get("hero") !== "real-photo" || !isProductDirectory) return;

    const hero = document.querySelector(".page-hero");
    const picture = hero?.querySelector(":scope > picture");
    const image = picture?.querySelector("img");
    if (!hero || !picture || !image) return;

    document.body.classList.add("product-hero-photo-sample");
    picture.querySelectorAll("source").forEach((source) => source.remove());
    image.removeAttribute("srcset");
    image.removeAttribute("sizes");
    image.src = "/teamstar-review/full-style-preview/media/product-hero-laser-sample.jpg";
    image.width = 1920;
    image.height = 1080;
    image.alt = "";
    image.decoding = "async";
    image.fetchPriority = "high";

    const label = document.createElement("span");
    label.className = "product-hero-sample-label";
    label.textContent = isEnglish ? "PRODUCT HERO · LOCAL REVIEW" : "产品首图 · 本地样图";
    hero.append(label);
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
        url.pathname = `/teamstar-review/full-style-preview/${theme}/${targetIsEnglish ? "en/" : ""}`;
        url.search = "";
      } else {
        url.pathname = normalizeReviewPath(url.pathname);
        url.searchParams.set("style", theme);
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
