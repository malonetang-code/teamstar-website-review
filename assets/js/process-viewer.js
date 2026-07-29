(function () {
  const viewer = document.querySelector("[data-process-viewer]");
  const triggers = Array.from(document.querySelectorAll("[data-media-kind]"));
  if (!viewer || !triggers.length) return;

  const panel = viewer.querySelector(".process-media-viewer-panel");
  const stage = viewer.querySelector("[data-viewer-stage]");
  const caption = viewer.querySelector("[data-viewer-caption]");
  const closeButton = viewer.querySelector(".process-media-viewer-close");
  const closeTargets = Array.from(viewer.querySelectorAll("[data-viewer-close]"));
  const videoTriggers = triggers.filter(function (trigger) {
    return trigger.dataset.mediaKind === "video";
  });
  const hoverPreviewQuery = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  );
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let returnFocus = null;
  let activePreview = null;
  let keyboardInput = false;
  let suppressFocusPreview = false;

  function canPointerPreview() {
    return hoverPreviewQuery.matches && !reducedMotionQuery.matches;
  }

  function canFocusPreview() {
    return !reducedMotionQuery.matches;
  }

  function stopPreview() {
    if (!activePreview) return;

    const preview = activePreview;
    activePreview = null;
    preview.trigger.classList.remove("is-preview-playing");
    preview.video.pause();
    try {
      preview.video.currentTime = 0;
    } catch (_error) {
      // The media may not have loaded enough to seek yet.
    }
  }

  function getPreviewVideo(trigger) {
    let video = trigger.querySelector(".process-media-hover-preview");
    if (video) return video;

    video = document.createElement("video");
    video.className = "process-media-hover-preview";
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.controls = false;
    video.preload = "none";
    video.tabIndex = -1;
    video.setAttribute("aria-hidden", "true");
    video.setAttribute("playsinline", "");
    trigger.prepend(video);
    return video;
  }

  function startPreview(trigger, interaction) {
    const allowed =
      interaction === "focus" ? canFocusPreview() : canPointerPreview();
    if (!allowed || !viewer.hidden) return;
    if (activePreview && activePreview.trigger === trigger) return;

    stopPreview();
    const video = getPreviewVideo(trigger);
    const source = trigger.dataset.mediaSrc;
    if (!source) return;

    if (!video.getAttribute("src")) video.src = source;
    video.muted = true;
    video.defaultMuted = true;
    activePreview = { trigger: trigger, video: video };

    const playPromise = video.play();
    if (!playPromise) return;
    playPromise
      .then(function () {
        if (!activePreview || activePreview.video !== video) {
          video.pause();
          return;
        }
        trigger.classList.add("is-preview-playing");
      })
      .catch(function () {
        if (activePreview && activePreview.video === video) stopPreview();
      });
  }

  function closeViewer() {
    const video = stage.querySelector("video");
    if (video) video.pause();
    stage.replaceChildren();
    caption.textContent = "";
    viewer.hidden = true;
    document.body.classList.remove("process-viewer-open");
    if (returnFocus && document.contains(returnFocus)) {
      suppressFocusPreview = true;
      returnFocus.focus();
      suppressFocusPreview = false;
    }
    returnFocus = null;
  }

  function openViewer(trigger) {
    stopPreview();
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

  videoTriggers.forEach(function (trigger) {
    trigger.addEventListener("pointerenter", function () {
      startPreview(trigger, "pointer");
    });
    trigger.addEventListener("pointerleave", function () {
      if (activePreview && activePreview.trigger === trigger) stopPreview();
    });
    trigger.addEventListener("pointercancel", function () {
      if (activePreview && activePreview.trigger === trigger) stopPreview();
    });
    trigger.addEventListener("focus", function () {
      if (suppressFocusPreview) return;
      if (keyboardInput || trigger.matches(":focus-visible")) {
        startPreview(trigger, "focus");
      }
    });
    trigger.addEventListener("blur", function () {
      if (activePreview && activePreview.trigger === trigger) stopPreview();
    });
  });

  closeTargets.forEach(function (target) {
    target.addEventListener("click", closeViewer);
  });

  document.addEventListener(
    "keydown",
    function () {
      keyboardInput = true;
    },
    true,
  );

  document.addEventListener(
    "pointerdown",
    function () {
      keyboardInput = false;
    },
    true,
  );

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopPreview();
  });
  window.addEventListener("blur", stopPreview);
  hoverPreviewQuery.addEventListener("change", stopPreview);
  reducedMotionQuery.addEventListener("change", stopPreview);

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
