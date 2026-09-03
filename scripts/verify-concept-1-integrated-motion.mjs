import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

const cssPath = "full-style-preview/concept-1-motion.css";
const jsPath = "full-style-preview/concept-1-motion.js";
const themeCssPath = "full-style-preview/site-theme-preview.css";
const themeJsPath = "full-style-preview/site-theme-preview.js";
expect(existsSync(resolve(root, cssPath)), "Concept 1 motion CSS missing");
expect(existsSync(resolve(root, jsPath)), "Concept 1 motion JS missing");
expect(existsSync(resolve(root, themeCssPath)), "Theme preview CSS missing");
expect(existsSync(resolve(root, themeJsPath)), "Theme preview JS missing");

const css = read(cssPath);
const js = read(jsPath);
const themeCss = read(themeCssPath);
const themeJs = read(themeJsPath);
for (const marker of [
  "c1-reveal",
  "c1-logo-viewport",
  "scale(1.03)",
  "c1-product-cue",
  "c1-image-wipe",
]) {
  expect(css.includes(marker) || js.includes(marker), `integrated effect marker missing: ${marker}`);
}
expect(css.includes("scale(1.06)"), "individual logo hover zoom missing");
expect(css.includes("prefers-reduced-motion: reduce"), "reduced-motion CSS missing");
expect(js.includes('matchMedia("(prefers-reduced-motion: reduce)")'), "reduced-motion JS missing");
expect(js.includes("IntersectionObserver"), "viewport-triggered motion missing");
expect(js.includes("runCount"), "40+ count-up missing");
expect(js.includes("const duration = 1800;"), "40+ count-up duration should be 1800ms");
expect(themeJs.includes("mountConceptOnePageHeroReveal"), "Concept 1 subpage hero reveal missing");
expect(themeJs.includes('addEventListener("pageshow"'), "Subpage hero reveal does not handle cached page re-entry");
expect(themeJs.includes("event.persisted"), "Subpage hero reveal does not detect back/forward cache restoration");
expect(themeCss.includes("c1-page-hero-media-wipe"), "Concept 1 subpage hero reveal CSS missing");
expect(themeCss.includes("prefers-reduced-motion: reduce"), "Subpage hero reduced-motion CSS missing");

for (const languagePath of ["index.html", "en/index.html"]) {
  const html = read(`full-style-preview/1/${languagePath}`);
  expect(html.includes("concept-1-motion.css"), `Concept 1 ${languagePath}: motion CSS not injected`);
  expect(html.includes("concept-1-motion.js"), `Concept 1 ${languagePath}: motion JS not injected`);
  expect(html.includes("noindex,nofollow,noarchive"), `Concept 1 ${languagePath}: review isolation missing`);
}

for (const concept of ["2", "3"]) {
  for (const languagePath of ["index.html", "en/index.html"]) {
    const html = read(`full-style-preview/${concept}/${languagePath}`);
    expect(!html.includes("concept-1-motion.css"), `Concept ${concept} ${languagePath}: Concept 1 CSS leaked`);
    expect(!html.includes("concept-1-motion.js"), `Concept ${concept} ${languagePath}: Concept 1 JS leaked`);
  }
}

for (const sourcePath of ["home/index.html", "en/home/index.html"]) {
  const html = read(sourcePath);
  expect(!html.includes("concept-1-motion"), `${sourcePath}: local effect leaked into canonical Home source`);
}

console.log("Concept 1 integrated motion verified: five effects, bilingual injection, reduced motion and preview-only isolation.");
