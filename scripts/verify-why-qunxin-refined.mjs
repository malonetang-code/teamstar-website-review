import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pages = [
  path.join(root, "why-qunxin-refined/index.html"),
  path.join(root, "en/why-qunxin-refined/index.html"),
];

for (const asset of [
  "assets/css/why-qunxin-refined.css",
  "assets/js/why-qunxin-refined.js",
  "images/web/process-20260725/05-precision-grinding.jpg",
  "img/wH65hbd5BK-1920.webp",
]) {
  if (!fs.existsSync(path.join(root, asset))) throw new Error(`Missing asset: ${asset}`);
}

for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  for (const [needle, label] of [
    ['name="robots" content="noindex,nofollow,noarchive"', "noindex isolation"],
    ['data-preview-panel="e"', "variant E"],
    ['data-preview-panel="f"', "variant F"],
    ['data-preview-panel="g"', "variant G"],
    ['data-style-link="e"', "E selector"],
    ['data-style-link="f"', "F selector"],
    ['data-style-link="g"', "G selector"],
  ]) {
    if (!html.includes(needle)) throw new Error(`${path.relative(root, page)} missing ${label}`);
  }
}

const css = fs.readFileSync(path.join(root, "assets/css/why-qunxin-refined.css"), "utf8");
if (!css.includes("@media (max-width: 767px)")) throw new Error("Mobile layout missing");
if (!css.includes("@media (prefers-reduced-motion: reduce)")) throw new Error("Reduced motion support missing");
if (/font-size:\s*(?:[5-9][0-9]|[1-9][0-9]{2,})px/.test(css)) throw new Error("Oversized fixed typography found");

const js = fs.readFileSync(path.join(root, "assets/js/why-qunxin-refined.js"), "utf8");
if (!js.includes('new Set(["e", "f", "g"])')) throw new Error("Expected E/F/G switcher missing");

console.log("Why Qunxin refined preview verification passed.");
