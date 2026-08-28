(() => {
  const links = Array.from(document.querySelectorAll("[data-style-link]"));
  const panels = Array.from(document.querySelectorAll("[data-preview-panel]"));
  const languageLink = document.querySelector("[data-language-link]");
  const allowed = new Set(["e", "f", "g"]);

  function selectedStyle() {
    const value = new URLSearchParams(window.location.search).get("style");
    return allowed.has(value) ? value : "e";
  }

  function showStyle(style, updateHistory = false) {
    panels.forEach((panel) => {
      const active = panel.dataset.previewPanel === style;
      panel.hidden = !active;
      panel.setAttribute("aria-hidden", String(!active));
    });

    links.forEach((link) => {
      if (link.dataset.styleLink === style) link.setAttribute("aria-current", "page");
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
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showStyle(link.dataset.styleLink, true);
      document.querySelector("#refined-stage")?.scrollIntoView({ block: "start" });
    });
  });

  window.addEventListener("popstate", () => showStyle(selectedStyle()));
  showStyle(selectedStyle());
})();
