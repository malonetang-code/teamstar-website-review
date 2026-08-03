(() => {
  const marquee = document.querySelector(".reference-section .logo-wall");
  if (!marquee) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const originalItems = Array.from(marquee.children);
  let duplicateItems = [];

  const clearDuplicates = () => {
    duplicateItems.forEach((item) => item.remove());
    duplicateItems = [];
    marquee.classList.remove("is-home-marquee");
  };

  const configureMarquee = () => {
    clearDuplicates();
    if (reducedMotion.matches) return;

    const fragment = document.createDocumentFragment();
    duplicateItems = originalItems.map((item) => {
      const duplicate = item.cloneNode(true);
      duplicate.setAttribute("aria-hidden", "true");
      duplicate.querySelectorAll("img").forEach((image) => {
        image.alt = "";
      });
      fragment.append(duplicate);
      return duplicate;
    });

    marquee.append(fragment);
    marquee.classList.add("is-home-marquee");
  };

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", configureMarquee);
  } else {
    reducedMotion.addListener(configureMarquee);
  }

  configureMarquee();
})();
