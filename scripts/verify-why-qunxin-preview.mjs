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
    ['data-preview-panel="d"', "variant D"],
    ['data-style-link="a"', "A selector"],
    ['data-style-link="b"', "B selector"],
    ['data-style-link="c"', "C selector"],
    ['data-style-link="d"', "D selector"],
    ['data-media-toggle', "video controls"],
    ['data-proof-tab="process"', "accessible proof tabs"],
    ["1978", "confirmed group foundation year"],
  ];
  for (const [needle, label] of assertions) {
    if (!html.includes(needle)) throw new Error(`${path.relative(root, page)} missing ${label}`);
  }
}

const zh = fs.readFileSync(pages[0], "utf8");
for (const phrase of [
  "集团刀具制造积累",
  "集团于 1978 年在台湾创立，并开始制造工业刀具，持续积累工艺资料与生产经验。",
  "重要制造环节在厂内完成，质量控制更直接。",
  "可接受单件试制，价格根据材料、工艺和项目要求评估。",
]) {
  if ((zh.match(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length !== 4) {
    throw new Error(`Chinese copy must appear identically in all four variants: ${phrase}`);
  }
}

const en = fs.readFileSync(pages[1], "utf8");
for (const phrase of [
  "Group knife manufacturing since 1978",
  "The group was founded in Taiwan in 1978 and has manufactured industrial knives since then, building process knowledge and production experience over time.",
  "Important manufacturing stages are completed within our own facility for more direct quality control.",
  "Single-piece trials can be quoted, with pricing confirmed after review of material, process and project requirements.",
]) {
  if ((en.match(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length !== 4) {
    throw new Error(`English copy must appear identically in all four variants: ${phrase}`);
  }
}

for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  if (/40(?:<sup>\+<\/sup>|\+|余年)/.test(html)) {
    throw new Error(`${path.relative(root, page)} contains the superseded 40+ claim`);
  }
}

const css = fs.readFileSync(path.join(root, "assets/css/why-qunxin-preview.css"), "utf8");
if (!css.includes("@media (prefers-reduced-motion: reduce)")) throw new Error("Reduced-motion CSS missing");
if (!css.includes("@media (max-width: 767px)")) throw new Error("Mobile layout missing");

const js = fs.readFileSync(path.join(root, "assets/js/why-qunxin-preview.js"), "utf8");
if (!js.includes("prefers-reduced-motion: reduce")) throw new Error("Reduced-motion JS missing");
if (!js.includes("ArrowRight")) throw new Error("Keyboard tab navigation missing");

console.log("Why Qunxin preview verification passed.");
