(function () {
  const viewer = document.querySelector("[data-process-viewer]");
  const triggers = Array.from(document.querySelectorAll("[data-media-kind]"));
  if (!viewer || !triggers.length) return;

  const panel = viewer.querySelector(".process-media-viewer-panel");
  const stage = viewer.querySelector("[data-viewer-stage]");
  const caption = viewer.querySelector("[data-viewer-caption]");
  const closeButton = viewer.querySelector(".process-media-viewer-close");
  const closeTargets = Array.from(viewer.querySelectorAll("[data-viewer-close]"));
  let returnFocus = null;

  function closeViewer() {
    const video = stage.querySelector("video");
    if (video) video.pause();
    stage.replaceChildren();
    caption.textContent = "";
    viewer.hidden = true;
    document.body.classList.remove("process-viewer-open");
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
    returnFocus = null;
  }

  function openViewer(trigger) {
    const kind = trigger.dataset.mediaKind;
    const source = trigger.dataset.mediaSrc;
    const label = trigger.dataset.mediaLabel || "";
    if (!source) return;

    returnFocus = trigger;
    stage.replaceChildren();

    if (kind === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = source;
      if (trigger.dataset.mediaPoster) video.poster = trigger.dataset.mediaPoster;
      video.setAttribute("aria-label", label);
      stage.append(video);
    } else {
      const image = document.createElement("img");
      image.src = source;
      image.alt = label;
      image.decoding = "async";
      stage.append(image);
    }

    caption.textContent = label;
    viewer.hidden = false;
    document.body.classList.add("process-viewer-open");
    closeButton.focus();
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      openViewer(trigger);
    });
  });

  closeTargets.forEach(function (target) {
    target.addEventListener("click", closeViewer);
  });

  document.addEventListener("keydown", function (event) {
    if (viewer.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeViewer();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      panel.querySelectorAll(
        'button:not([disabled]), video[controls], [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(function (element) {
      return !element.hidden;
    });
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
