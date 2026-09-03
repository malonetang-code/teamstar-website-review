import { createRequire } from "node:module";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/malone/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"
);

const root = process.cwd();
const origin = process.env.QA_ORIGIN || "http://127.0.0.1:8089";
const base = "/teamstar-website-review";
const output = "/tmp/teamstar-concepts-123-qa";
const failures = [];
const canonicalRoots = [
  "404.html", "index.html", "home", "products", "capabilities", "quality",
  "company", "customers", "guides", "rfq", "privacy", "en",
];
const representativeRoutes = [
  "/home/", "/products/", "/capabilities/", "/quality/", "/company/", "/rfq/",
  "/en/home/", "/en/products/", "/en/capabilities/", "/en/quality/", "/en/company/", "/en/rfq/",
];

async function walk(entry) {
  const absolute = path.resolve(root, entry);
  const stat = await import("node:fs/promises").then(({ stat }) => stat(absolute));
  if (!stat.isDirectory()) return [absolute];
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const item of entries) {
    const child = path.join(absolute, item.name);
    if (item.isDirectory()) files.push(...(await walk(path.relative(root, child))));
    if (item.isFile() && item.name.endsWith(".html")) files.push(child);
  }
  return files;
}

function routeFor(file) {
  const relative = path.relative(root, file);
  if (relative === "index.html") return `${base}/`;
  if (relative.endsWith("/index.html")) return `${base}/${relative.slice(0, -"index.html".length)}`;
  return `${base}/${relative}`;
}

function conceptUrl(route, concept) {
  const url = new URL(`${origin}${route}`);
  url.searchParams.set("style", "e");
  url.searchParams.set("concept", concept);
  url.searchParams.set("rev", "concepts-123");
  return url.href;
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const page = await context.newPage();
let currentRoute = "";
page.on("console", (message) => {
  if (message.type() === "error") failures.push(`${currentRoute}: console ${message.text()}`);
});
page.on("requestfailed", (request) => {
  if (request.failure()?.errorText !== "net::ERR_ABORTED" && !request.url().includes("fonts.googleapis.com") && !request.url().includes("fonts.gstatic.com")) {
    failures.push(`${currentRoute}: request failed ${request.url()} ${request.failure()?.errorText || ""}`);
  }
});

const canonicalFiles = [...new Set((await Promise.all(canonicalRoots.map(walk))).flat())].filter((file) => !path.relative(root, file).startsWith("en/why-qunxin-"));
for (const concept of ["2", "3"]) {
  for (const file of canonicalFiles) {
    const route = routeFor(file);
    currentRoute = `${route}?concept=${concept}`;
    const response = await page.goto(conceptUrl(route, concept), { waitUntil: "domcontentloaded" });
    if (!response || response.status() !== 200) failures.push(`${currentRoute}: HTTP ${response?.status() ?? "none"}`);
    const audit = await page.evaluate((expectedConcept) => {
      const internalLinks = [...document.querySelectorAll("a[href]")].filter((link) => {
        const url = new URL(link.href, location.href);
        return url.origin === location.origin && url.pathname.startsWith("/teamstar-website-review/") && !url.pathname.includes("/full-style-preview/") && !url.pathname.startsWith("/teamstar-website-review/images/") && !url.pathname.startsWith("/teamstar-website-review/img/") && !url.pathname.startsWith("/teamstar-website-review/assets/");
      });
      return {
        concept: document.documentElement.dataset.reviewConcept,
        theme: document.documentElement.dataset.siteThemePreview,
        active: document.body.classList.contains("site-theme-preview-active"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        missingConceptLinks: internalLinks.filter((link) => new URL(link.href).searchParams.get("concept") !== expectedConcept).length,
        brokenLoadedImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
        robots: document.querySelector('meta[name="robots"]')?.content || "",
      };
    }, concept);
    if (audit.concept !== concept || audit.theme !== "e" || !audit.active) failures.push(`${currentRoute}: concept runtime not active`);
    if (audit.overflow > 1) failures.push(`${currentRoute}: desktop horizontal overflow ${audit.overflow}px`);
    if (audit.missingConceptLinks) failures.push(`${currentRoute}: ${audit.missingConceptLinks} internal links lost concept`);
    if (audit.brokenLoadedImages) failures.push(`${currentRoute}: ${audit.brokenLoadedImages} broken loaded images`);
    if (!audit.robots.includes("noindex") || !audit.robots.includes("nofollow") || !audit.robots.includes("noarchive")) failures.push(`${currentRoute}: review robots isolation missing`);
  }

  for (const route of representativeRoutes) {
    for (const viewport of [
      { name: "desktop", width: 1440, height: 960 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "mobile", width: 390, height: 844 },
    ]) {
      currentRoute = `${route}?concept=${concept}@${viewport.name}`;
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const reviewUrl = route === "/home/"
        ? `${origin}${base}/full-style-preview/${concept}/?rev=concepts-123`
        : route === "/en/home/"
          ? `${origin}${base}/full-style-preview/${concept}/en/?rev=concepts-123`
          : conceptUrl(`${base}${route}`, concept);
      await page.goto(reviewUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(350);
      const audit = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        headerTop: Math.round(document.querySelector(".site-header")?.getBoundingClientRect().top ?? -1),
        hasVisibleH1: Boolean(document.querySelector("h1") && getComputedStyle(document.querySelector("h1")).visibility !== "hidden"),
      }));
      if (audit.overflow > 1) failures.push(`${currentRoute}: horizontal overflow ${audit.overflow}px`);
      if (!audit.hasVisibleH1) failures.push(`${currentRoute}: visible H1 missing`);
      const slug = route.replace(/^\//, "").replaceAll("/", "-") || "root";
      await page.screenshot({ path: path.join(output, `concept-${concept}-${slug}-${viewport.name}.png`) });
    }
  }
}

await browser.close();

if (failures.length) {
  console.error(`Concept browser QA failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Concept browser QA passed: ${canonicalFiles.length * 2} full-site desktop routes and ${representativeRoutes.length * 2 * 3} representative responsive views.`);
console.log(`Screenshots: ${output}`);
