import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pages = [
  path.join(root, "why-qunxin-preview/index.html"),
  path.join(root, "en/why-qunxin-preview/index.html"),
];

const expectedAssets = [
  "assets/css/why-qunxin-preview.css",
  "assets/js/why-qunxin-preview.js",
  "img/wH65hbd5BK-1920.webp",
  "images/web/process-20260725/05-precision-grinding.jpg",
  "images/web/process-20260725/05-precision-grinding.mp4",
  "assets/images/2w/product-custom.jpg",
  "full-style-preview/media/home-manufacturing-closeup-preview-20260828.mp4",
];

for (const asset of expectedAssets) {
  if (!fs.existsSync(path.join(root, asset))) throw new Error(`Missing asset: ${asset}`);
}

for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  const assertions = [
    ['name="robots" content="noindex,nofollow,noarchive"', "noindex isolation"],
    ['data-preview-panel="a"', "variant A"],
    ['data-preview-panel="b"', "variant B"],
    ['data-preview-panel="c"', "variant C"],
    ['data-style-link="a"', "A selector"],
    ['data-style-link="b"', "B selector"],
    ['data-style-link="c"', "C selector"],
    ['data-media-toggle', "video controls"],
    ['data-proof-tab="process"', "accessible proof tabs"],
  ];
  for (const [needle, label] of assertions) {
    if (!html.includes(needle)) throw new Error(`${path.relative(root, page)} missing ${label}`);
  }
}

const zh = fs.readFileSync(pages[0], "utf8");
for (const phrase of [
  "集团刀具制造积累",
  "持续积累的工艺资料与经验团队，为稳定制造和长期供货提供基础。",
  "重要制造环节在厂内完成，质量控制更直接。",
  "从单件试制到批量供货，根据实际需求安排。",
]) {
  if ((zh.match(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length !== 3) {
    throw new Error(`Chinese copy must appear identically in all three variants: ${phrase}`);
  }
}

const en = fs.readFileSync(pages[1], "utf8");
for (const phrase of [
  "Group manufacturing heritage",
  "Established process records and experienced production teams support consistent manufacturing and long-term supply.",
  "Important manufacturing stages are completed within our own facility for more direct quality control.",
  "From one-off trials to repeat production, quantities are arranged around the actual requirement.",
]) {
  if ((en.match(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length !== 3) {
    throw new Error(`English copy must appear identically in all three variants: ${phrase}`);
  }
}

const css = fs.readFileSync(path.join(root, "assets/css/why-qunxin-preview.css"), "utf8");
if (!css.includes("@media (prefers-reduced-motion: reduce)")) throw new Error("Reduced-motion CSS missing");
if (!css.includes("@media (max-width: 767px)")) throw new Error("Mobile layout missing");

const js = fs.readFileSync(path.join(root, "assets/js/why-qunxin-preview.js"), "utf8");
if (!js.includes("prefers-reduced-motion: reduce")) throw new Error("Reduced-motion JS missing");
if (!js.includes("ArrowRight")) throw new Error("Keyboard tab navigation missing");

console.log("Why Qunxin preview verification passed.");
