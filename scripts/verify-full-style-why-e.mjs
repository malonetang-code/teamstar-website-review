import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const styles = ["a", "b", "c", "d"];
const pages = styles.flatMap((style) => [
  [`full-style-preview/${style}/index.html`, "为什么选择群新", "关键工序", "1<small>件起</small>"],
  [`full-style-preview/${style}/en/index.html`, "Why customers choose Qunxin", "IN-HOUSE", "1<small>PIECE</small>"],
]);

for (const [relativePath, title, process, quantity] of pages) {
  const html = fs.readFileSync(path.join(root, relativePath), "utf8");
  for (const required of [
    'class="why-qunxin-section fp-why-refined-e"',
    'class="fp-why-e-specs"',
    title,
    process,
    quantity,
    "full-style-preview.css?v=20260828-3",
    'name="robots" content="noindex,nofollow,noarchive"',
  ]) {
    if (!html.includes(required)) {
      throw new Error(`${relativePath} is missing ${required}`);
    }
  }

  if ((html.match(/fp-why-refined-e/g) || []).length !== 1) {
    throw new Error(`${relativePath} must contain exactly one refined E section`);
  }
}

const css = fs.readFileSync(path.join(root, "full-style-preview/full-style-preview.css"), "utf8");
for (const required of [
  'html[data-full-preview="d"] body.full-style-preview .why-qunxin-section.fp-why-refined-e',
  "grid-template-columns: repeat(3, minmax(0, 1fr))",
  "grid-template-columns: 112px minmax(0, 1fr)",
  "@media (max-width: 767px)",
  "@media (prefers-reduced-motion: reduce)",
]) {
  if (!css.includes(required)) {
    throw new Error(`full-style-preview.css is missing ${required}`);
  }
}

const buildScript = fs.readFileSync(path.join(root, "scripts/build-full-style-previews.mjs"), "utf8");
for (const required of [
  'const baseline = "teamstar-current-review-baseline-2026-08-27^{}"',
  "refinedWhyQunxin(language)",
  'const stylesheetVersion = "20260828-3"',
]) {
  if (!buildScript.includes(required)) {
    throw new Error(`build-full-style-previews.mjs is missing ${required}`);
  }
}

console.log("Full-style Why Qunxin E verification passed for A/B/C/D in Chinese and English.");
