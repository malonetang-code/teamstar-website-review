import { createRequire } from "node:module";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/malone/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"
);

const root = process.cwd();
const origin = process.env.QA_ORIGIN || "http://127.0.0.1:8095";
const base = "/teamstar-website-review";
const output = "/tmp/teamstar-2w-qa";
const errors = [];

async function loadLazyMedia(page) {
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((image) => {
      image.loading = "eager";
    });
    const step = Math.max(500, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    await Promise.all(
      images.map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            })
      )
    );
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
}

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git") continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(target)));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(target);
  }
  return files;
}

function routeFor(file) {
  const relative = path.relative(root, file);
  if (relative === "index.html") return `${base}/`;
  if (relative.endsWith("/index.html")) {
    return `${base}/${relative.slice(0, -"index.html".length)}`;
  }
  return `${base}/${relative}`;
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("requestfailed", (request) => {
  const errorText = request.failure()?.errorText || "";
  if (errorText !== "net::ERR_ABORTED") {
    errors.push(`request failed: ${request.url()} ${errorText}`);
  }
});

for (const file of await htmlFiles(root)) {
  const route = routeFor(file);
  const response = await page.goto(`${origin}${route}`, {
    waitUntil: "domcontentloaded",
  });
  if (!response || response.status() !== 200) {
    errors.push(`${route}: HTTP ${response?.status() ?? "no response"}`);
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 1) errors.push(`${route}: desktop horizontal overflow ${overflow}px`);
}

for (const language of ["", "en/"]) {
  const route = `${base}/${language}`;
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
  const desktop = await page.evaluate(() => {
    const left = (selector) =>
      Math.round(document.querySelector(selector)?.getBoundingClientRect().left ?? -1);
    const cards = [...document.querySelectorAll(".blade-card")];
    const cardSizes = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return [Math.round(rect.width), Math.round(rect.height)];
    });
    return {
      body: document.body.className,
      h1: document.querySelector("h1")?.textContent.trim(),
      cards: cards.length,
      cardSizes,
      heroLeft: left(".hero-inner"),
      productsLeft: left("#product-directory .container"),
      partnerLeft: left(".partner-layout"),
      rfqLeft: left(".rfq-paths"),
      processLeft: left(".process-steps"),
      logos: document.querySelectorAll(".logo-item").length,
    };
  });
  if (!desktop.body.includes("redesign-2w")) errors.push(`${route}: missing 2w body marker`);
  if (desktop.cards !== 6) errors.push(`${route}: expected 6 product cards`);
  if (desktop.logos !== 10) errors.push(`${route}: expected 10 reference logos`);
  const lefts = [
    desktop.heroLeft,
    desktop.productsLeft,
    desktop.partnerLeft,
    desktop.rfqLeft,
    desktop.processLeft,
  ];
  if (Math.max(...lefts) - Math.min(...lefts) > 1) {
    errors.push(`${route}: container alignment mismatch ${lefts.join(",")}`);
  }
  const firstRow = desktop.cardSizes.slice(0, 3);
  if (new Set(firstRow.map((size) => size.join("x"))).size !== 1) {
    errors.push(`${route}: desktop product cards are not equal ${JSON.stringify(firstRow)}`);
  }
  await loadLazyMedia(page);
  await page.screenshot({
    path: path.join(
      output,
      language ? "home-en-desktop-viewport.png" : "home-zh-desktop-viewport.png"
    ),
  });
  await page.screenshot({
    path: path.join(output, language ? "home-en-desktop.png" : "home-zh-desktop.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
  const tablet = await page.evaluate(() => ({
    overflow:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    heroBottom: Math.round(document.querySelector(".home-hero").getBoundingClientRect().bottom),
    titleBottom: Math.round(document.querySelector(".hero-copy h1").getBoundingClientRect().bottom),
    introBottom: Math.round(document.querySelector(".hero-copy p").getBoundingClientRect().bottom),
    firstProductTop: Math.round(
      document.querySelector(".home-hero-picture .hero-media").getBoundingClientRect().top
    ),
  }));
  if (tablet.overflow > 1) errors.push(`${route}: tablet horizontal overflow ${tablet.overflow}px`);
  await page.screenshot({
    path: path.join(output, language ? "home-en-tablet.png" : "home-zh-tablet.png"),
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
  const mobile = await page.evaluate(() => ({
    overflow:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    cards: document.querySelectorAll(".blade-card").length,
    buttons: [...document.querySelectorAll(".hero-actions .button")].map((button) => {
      const rect = button.getBoundingClientRect();
      return [Math.round(rect.width), Math.round(rect.height)];
    }),
  }));
  if (mobile.overflow > 1) errors.push(`${route}: mobile horizontal overflow ${mobile.overflow}px`);
  if (mobile.cards !== 6) errors.push(`${route}: mobile product cards missing`);
  if (mobile.buttons.some(([, height]) => height < 44)) {
    errors.push(`${route}: mobile hero target below 44px`);
  }
  await loadLazyMedia(page);
  await page.screenshot({
    path: path.join(
      output,
      language ? "home-en-mobile-viewport.png" : "home-zh-mobile-viewport.png"
    ),
  });
  await page.screenshot({
    path: path.join(output, language ? "home-en-mobile.png" : "home-zh-mobile.png"),
    fullPage: true,
  });
  const menu = page.locator("[data-menu-button]");
  await menu.click();
  if ((await menu.getAttribute("aria-expanded")) !== "true") {
    errors.push(`${route}: mobile menu did not open`);
  }
  await menu.click();
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${origin}${base}/`, { waitUntil: "networkidle" });
const narrowOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);
await page.setViewportSize({ width: 320, height: 800 });
await page.reload({ waitUntil: "networkidle" });
const smallestOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);
if (narrowOverflow > 1 || smallestOverflow > 1) {
  errors.push(`home narrow overflow 390:${narrowOverflow} 320:${smallestOverflow}`);
}
await loadLazyMedia(page);
await page.screenshot({
  path: path.join(output, "home-zh-320.png"),
  fullPage: true,
});

await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(`${origin}${base}/capabilities/`, { waitUntil: "networkidle" });
const processMedia = await page.evaluate(() => ({
  videos: document.querySelectorAll('[data-media-kind="video"]').length,
  images: document.querySelectorAll(".process-evidence-media img").length,
  fits: [
    ...document.querySelectorAll(
      ".process-media-preview, .process-evidence-detail img"
    ),
  ].map((element) => getComputedStyle(element).objectFit),
}));
if (processMedia.videos < 8) errors.push(`capabilities: expected at least 8 process videos`);
if (processMedia.fits.some((fit) => fit !== "contain")) {
  errors.push(`capabilities: process media is cropped ${processMedia.fits.join(",")}`);
}
await page.screenshot({
  path: path.join(output, "capabilities-desktop.png"),
  fullPage: true,
});

await page.goto(`${origin}${base}/rfq/`, { waitUntil: "networkidle" });
const upload = await page.evaluate(() => {
  const input = document.querySelector('input[type="file"]');
  return {
    found: Boolean(input),
    required: input?.required ?? null,
    recipient: document.body.textContent.includes("rd01@teamstarmfg.com"),
  };
});
if (!upload.found) errors.push("rfq: file input missing");
if (upload.required) errors.push("rfq: file input must be optional");
if (!upload.recipient) errors.push("rfq: rd01 handoff address missing");
await page.screenshot({
  path: path.join(output, "rfq-desktop.png"),
  fullPage: true,
});

await browser.close();

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("2w browser QA passed");
