(() => {
  const marquee = document.querySelector(".reference-section .logo-wall");
  if (!marquee) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const originalItems = Array.from(marquee.children);
  let duplicateItems = [];
  let configurationId = 0;

  const clearDuplicates = () => {
    duplicateItems.forEach((item) => item.remove());
    duplicateItems = [];
    marquee.classList.remove("is-home-marquee");
  };

  const configureMarquee = async () => {
    const currentConfiguration = ++configurationId;
    clearDuplicates();
    if (reducedMotion.matches) return;

    const originalImages = originalItems.flatMap((item) =>
      Array.from(item.querySelectorAll("img")),
    );
    originalImages.forEach((image) => {
      image.loading = "eager";
    });
    await Promise.allSettled(
      originalImages.map((image) =>
        typeof image.decode === "function" ? image.decode() : Promise.resolve(),
      ),
    );
    if (currentConfiguration !== configurationId || reducedMotion.matches) return;

    const fragment = document.createDocumentFragment();
    duplicateItems = originalItems.map((item) => {
      const duplicate = item.cloneNode(true);
      duplicate.setAttribute("aria-hidden", "true");
      duplicate.querySelectorAll("img").forEach((image) => {
        image.alt = "";
        image.loading = "eager";
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
