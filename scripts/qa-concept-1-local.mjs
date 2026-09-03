import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/malone/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:8089";
const output = process.env.QA_OUTPUT || "/tmp/teamstar-concept-1-local-qa";
const failures = [];
const routes = [
  "/products/",
  "/capabilities/",
  "/quality/",
  "/company/",
  "/rfq/",
  "/en/products/",
  "/en/capabilities/",
  "/en/quality/",
  "/en/company/",
  "/en/rfq/",
];
const viewports = [
  { name: "desktop", width: 1440, height: 960 },
  { name: "mobile", width: 390, height: 844 },
];

const sameOrigin = (url) => {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
};

const scrollAndAudit = async (page) => page.evaluate(async () => {
  const step = Math.max(320, Math.floor(innerHeight * 0.75));
  for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
    scrollTo(0, top);
    await new Promise((resolve) => setTimeout(resolve, 90));
  }
  await new Promise((resolve) => setTimeout(resolve, 700));
  scrollTo(0, 0);
  await new Promise((resolve) => setTimeout(resolve, 180));

  const images = [...document.images];
  const videos = [...document.querySelectorAll("video")];
  const bodyFont = getComputedStyle(document.body).fontFamily;
  return {
    bodyFont,
    brokenImages: images
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
    imageCount: images.length,
    loadedImages: images.filter((image) => image.complete && image.naturalWidth > 0).length,
    overflow: document.documentElement.scrollWidth - innerWidth,
    robots: document.querySelector('meta[name="robots"]')?.content || "",
    title: document.title,
    visibleH1: Boolean(document.querySelector("h1")?.getBoundingClientRect().height),
    videos: videos.map((video) => ({
      error: video.error?.message || "",
      height: video.videoHeight,
      readyState: video.readyState,
      source: video.currentSrc || video.src,
      width: video.videoWidth,
    })),
  };
});

await import("node:fs/promises").then(({ mkdir }) => mkdir(output, { recursive: true }));
const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  let current = viewport.name;

  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`${current}: console ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText || "unknown";
    if (error !== "net::ERR_ABORTED" && sameOrigin(request.url())) {
      failures.push(`${current}: request failed ${request.url()} ${error}`);
    }
  });
  page.on("response", (response) => {
    if (sameOrigin(response.url()) && response.status() >= 400) {
      failures.push(`${current}: HTTP ${response.status()} ${response.url()}`);
    }
  });

  const home = `${origin}/teamstar-review/full-style-preview/1/?qa=local-${viewport.name}`;
  current = `${viewport.name}: actual navigation`;
  await page.goto(home, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(250);

  for (const suffix of ["/capabilities/", "/quality/", "/company/"]) {
    if (viewport.name === "mobile") {
      await page.locator("[data-menu-button]").click();
      await page.locator(`#mobile-menu a[href*="${suffix}"]`).click();
    } else {
      await page.locator(`.desktop-nav a[href*="${suffix}"]`).first().click();
    }
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(220);
    if (!page.url().includes(suffix)) failures.push(`${current}: did not reach ${suffix}`);
    const heroReveal = await page.evaluate(() => ({
      mounted: Boolean(document.querySelector(".page-hero > picture.c1-page-hero-media-wipe")),
      visible: Boolean(document.querySelector(".page-hero > picture.c1-page-hero-media-wipe.is-visible")),
    }));
    if (!heroReveal.mounted || !heroReveal.visible) failures.push(`${current}: subpage hero reveal missing at ${suffix}`);
  }

  for (const route of routes) {
    current = `${viewport.name}:${route}`;
    const response = await page.goto(`${origin}/teamstar-review${route}?style=e&qa=local`, {
      waitUntil: "domcontentloaded",
    });
    if (!response || response.status() !== 200) {
      failures.push(`${current}: page HTTP ${response?.status() ?? "none"}`);
      continue;
    }
    await page.waitForTimeout(220);
    const audit = await scrollAndAudit(page);
    if (!audit.visibleH1) failures.push(`${current}: visible H1 missing`);
    if (audit.overflow > 1) failures.push(`${current}: horizontal overflow ${audit.overflow}px`);
    if (audit.brokenImages.length) failures.push(`${current}: broken images ${audit.brokenImages.join(", ")}`);
    if (/Times New Roman|^serif$/i.test(audit.bodyFont.trim())) failures.push(`${current}: site stylesheet did not apply (${audit.bodyFont})`);
    if (!audit.robots.includes("noindex") || !audit.robots.includes("nofollow") || !audit.robots.includes("noarchive")) {
      failures.push(`${current}: review robots isolation missing`);
    }
    for (const video of audit.videos) {
      if (video.error) failures.push(`${current}: video failed ${video.source} ${video.error}`);
    }

    if (["/capabilities/", "/quality/", "/company/", "/en/capabilities/", "/en/quality/", "/en/company/"].includes(route)) {
      const slug = route.replace(/^\//, "").replaceAll("/", "-");
      await page.screenshot({
        fullPage: true,
        path: path.join(output, `${viewport.name}-${slug}.png`),
      });
    }
  }

  await context.close();
}

const reducedContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(`${origin}/teamstar-review/quality/?style=e&qa=reduced-motion`, {
  waitUntil: "domcontentloaded",
});
await reducedPage.waitForTimeout(220);
const reducedAudit = await reducedPage.evaluate(() => {
  const media = document.querySelector(".page-hero > picture.c1-page-hero-media-wipe");
  const style = media ? getComputedStyle(media) : null;
  return {
    mounted: Boolean(media),
    visible: media?.classList.contains("is-visible") || false,
    transitionDuration: style?.transitionDuration || "",
  };
});
if (!reducedAudit.mounted || !reducedAudit.visible || reducedAudit.transitionDuration !== "0s") {
  failures.push(`reduced-motion: subpage hero should render immediately without transition (${JSON.stringify(reducedAudit)})`);
}
await reducedContext.close();

const replayContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const replayPage = await replayContext.newPage();
await replayPage.goto(`${origin}/teamstar-review/company/?style=e&qa=replay`, {
  waitUntil: "domcontentloaded",
});
await replayPage.waitForTimeout(900);
const replayAudit = await replayPage.evaluate(async () => {
  const media = document.querySelector(".page-hero > picture.c1-page-hero-media-wipe");
  const before = Number(media?.dataset.c1RevealRuns || "0");
  window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
  await new Promise((resolve) => setTimeout(resolve, 40));
  const during = media ? getComputedStyle(media).clipPath : "";
  await new Promise((resolve) => setTimeout(resolve, 900));
  return {
    after: Number(media?.dataset.c1RevealRuns || "0"),
    before,
    during,
    final: media ? getComputedStyle(media).clipPath : "",
  };
});
if (replayAudit.after !== replayAudit.before + 1 || replayAudit.during === "inset(0px)" || replayAudit.final !== "inset(0px)") {
  failures.push(`cached re-entry: subpage hero did not replay cleanly (${JSON.stringify(replayAudit)})`);
}
await replayContext.close();

await browser.close();

if (failures.length) {
  console.error(`Concept 1 local QA failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Concept 1 local QA passed: actual navigation plus ${routes.length * viewports.length} bilingual desktop/mobile page checks.`);
console.log(`Screenshots: ${output}`);
