import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const styles = ["a", "b", "c", "d", "e"];
const pages = styles.flatMap((style) => [
  [`full-style-preview/${style}/index.html`, "为什么选择群新", "40+<small>年</small>", "制刀经验", "关键工序", "1<small>件起</small>", "可接受单件试制，价格根据材料、工艺和项目要求评估。"],
  [`full-style-preview/${style}/en/index.html`, "Why customers choose Qunxin", "40+<small>YEARS</small>", "Knife-making experience", "IN-HOUSE", "1<small>PIECE</small>", "Single-piece trials can be quoted, with pricing confirmed after review of material, process and project requirements."],
]);

for (const [relativePath, title, experience, experienceTitle, process, quantity, quantityBody] of pages) {
  const html = fs.readFileSync(path.join(root, relativePath), "utf8");
  for (const required of [
    'class="why-qunxin-section fp-why-refined-e"',
    'class="fp-why-e-specs"',
    title,
    experience,
    experienceTitle,
    process,
    quantity,
    quantityBody,
    "full-style-preview.css?v=20260901-nav-content-1",
    'name="robots" content="noindex,nofollow,noarchive"',
  ]) {
    if (!html.includes(required)) {
      throw new Error(`${relativePath} is missing ${required}`);
    }
  }

  if ((html.match(/fp-why-refined-e/g) || []).length !== 1) {
    throw new Error(`${relativePath} must contain exactly one refined E section`);
  }
  const section = html.match(/<section class="why-qunxin-section fp-why-refined-e"[\s\S]*?<\/section>/)?.[0] || "";
  if ((section.match(/<article>/g) || []).length !== 3) {
    throw new Error(`${relativePath} must contain exactly three Why Qunxin proof points`);
  }
  if (/10,000|manufacturing space|生产厂房/.test(section)) {
    throw new Error(`${relativePath} still contains the removed facility-area proof point`);
  }
  if (/<strong>1978<\/strong><h3>/.test(html)) {
    throw new Error(`${relativePath} contains the superseded 1978 proof point`);
  }
}

const css = fs.readFileSync(path.join(root, "full-style-preview/full-style-preview.css"), "utf8");
for (const required of [
  'html[data-full-preview="d"] body.full-style-preview .why-qunxin-section.fp-why-refined-e',
  'html[data-full-preview="e"] body.full-style-preview .why-qunxin-section.fp-why-refined-e',
  'html[data-full-preview="e"] body.full-style-preview .home-product-section',
  'html[data-full-preview="e"] body.full-style-preview .rfq-band',
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
  "readCurrentHome(sourcePath)",
  "refinedWhyQunxin(language)",
  'const stylesheetVersion = "20260901-nav-content-1"',
]) {
  if (!buildScript.includes(required)) {
    throw new Error(`build-full-style-previews.mjs is missing ${required}`);
  }
}

console.log("Full-style Why Qunxin E verification passed for A/B/C/D/E in Chinese and English.");
