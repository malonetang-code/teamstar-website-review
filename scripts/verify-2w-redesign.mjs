import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function walk(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.name.endsWith(".html") ? [path.relative(root, absolute)] : [];
  });
}

function text(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const htmlFiles = walk();
if (htmlFiles.length !== 48) {
  errors.push(`Expected 48 HTML files, found ${htmlFiles.length}`);
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (html.includes("info@teamstarmfg.com")) {
    errors.push(`${file}: retired general mailbox remains`);
  }
  if (
    html.includes("18150707007") ||
    html.includes("181-5070-7007") ||
    html.includes("tel:+8618150707007")
  ) {
    errors.push(`${file}: retired phone number remains`);
  }
  if (!html.includes("ga01@teamstarmfg.com")) {
    errors.push(`${file}: general administration mailbox missing`);
  }
  if (!html.includes("site-base.css?v=20260730-2w")) {
    errors.push(`${file}: shared base stylesheet missing`);
  }
  if (!html.includes("site-2w.css?v=20260730-2w")) {
    errors.push(`${file}: 2w visual stylesheet missing`);
  }
  if (!html.includes("redesign-2w")) {
    errors.push(`${file}: 2w body marker missing`);
  }
  if (html.includes("benchmark.css") || html.includes("benchmark-york-yishi")) {
    errors.push(`${file}: rejected 2u design remains`);
  }
  if (/<a href="[^"]+" class="brand"[^>]*>\s*<picture>/.test(html)) {
    errors.push(`${file}: temporary photograph remains in the brand mark`);
  }
  if (!html.includes('name="robots" content="noindex,nofollow,noarchive"')) {
    errors.push(`${file}: review-mirror robots protection missing`);
  }
  for (const match of html.matchAll(
    /\/teamstar-website-review\/([^"'(),?\s]+)/g,
  )) {
    const reference = decodeURIComponent(match[1]);
    if (
      /\.(?:avif|css|gif|jpe?g|js|json|mp4|png|svg|webmanifest|webp|woff2)$/i.test(
        reference,
      ) &&
      !fs.existsSync(path.join(root, reference))
    ) {
      errors.push(`${file}: missing local asset ${reference}`);
    }
  }
  for (const match of html.matchAll(/<(h1|h2|h3)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    const heading = text(match[2]);
    if (/[。！？.!?]$/.test(heading)) {
      errors.push(`${file}: heading has terminal punctuation: ${heading}`);
    }
  }
}

const homeChecks = [
  [
    "index.html",
    [
      "工业机械刀具制造",
      "工业刀具产品",
      "三种询价方式",
      "从图纸到成品",
      "真实工厂与检测现场",
    ],
  ],
  [
    "en/index.html",
    [
      "Industrial Machine Knife Manufacturing",
      "Industrial Knife Products",
      "Three Ways to Start",
      "From Drawing to Finished Knife",
      "Real Manufacturing and Inspection",
    ],
  ],
];

const selectedCatalogStems = [
  "crotKizX0J",
  "mZaq84W78n",
  "kDD9SWMj0H",
  "W8YmneBOMh",
  "47jYn3TWma",
  "TTtdzuoFgG",
];

const selectedHomeImages = [
  "product-woodworking",
  "product-food",
  "product-recycling",
  "product-paper",
  "product-textile",
  "product-custom",
];

for (const [file, phrases] of homeChecks) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if ((html.match(/class="blade-card"/g) || []).length !== 6) {
    errors.push(`${file}: expected six home product cards`);
  }
  for (const phrase of phrases) {
    if (!html.includes(phrase)) errors.push(`${file}: missing concise copy: ${phrase}`);
  }
  if (html.includes("proof-rail")) {
    errors.push(`${file}: rejected home metric rail remains`);
  }
  for (const image of selectedHomeImages) {
    if (!html.includes(image)) errors.push(`${file}: processed product image missing: ${image}`);
  }
}

for (const file of ["products/index.html", "en/products/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if ((html.match(/catalog-card-media/g) || []).length !== 6) {
    errors.push(`${file}: expected six product index photographs`);
  }
  if ((html.match(/class="product-card-summary"/g) || []).length !== 6) {
    errors.push(`${file}: expected six concise product summaries`);
  }
  for (const stem of selectedCatalogStems) {
    if (!html.includes(stem)) errors.push(`${file}: selected catalog image missing: ${stem}`);
  }
}

for (const file of ["rfq/index.html", "en/rfq/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (!html.includes('mailto:rd01@teamstarmfg.com')) {
    errors.push(`${file}: sales attachment email missing`);
  }
  const handoff =
    file.startsWith("en/")
      ? "send them later to rd01@teamstarmfg.com"
      : "发送至 rd01@teamstarmfg.com";
  if (!html.includes(handoff)) {
    errors.push(`${file}: sales attachment handoff copy missing`);
  }
}

for (const file of [
  "rfq/custom-industrial-knife-drawing-checklist/index.html",
  "en/rfq/custom-industrial-knife-drawing-checklist/index.html",
]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (!html.includes("rd01@teamstarmfg.com")) {
    errors.push(`${file}: sales attachment email missing from guide`);
  }
}

const css = fs.readFileSync(
  path.join(root, "assets/css/site-2w.css"),
  "utf8",
);
for (const required of [
  ".home-hero::after",
  "display: none",
  ".blade-media img",
  "object-fit: contain",
  ".logo-item img",
  "filter: none",
  ".process-evidence-media video",
]) {
  if (!css.includes(required)) errors.push(`2w CSS missing rule: ${required}`);
}
if (/grayscale\s*\(/.test(css)) {
  errors.push("2w CSS must not grayscale the logo wall");
}

for (const image of [
  "hero-desktop.webp",
  "hero-mobile.webp",
  ...selectedHomeImages.flatMap((name) => [`${name}.webp`, `${name}.jpg`]),
]) {
  if (!fs.existsSync(path.join(root, "assets/images/2w", image))) {
    errors.push(`2w visual asset missing: ${image}`);
  }
}

for (const file of ["index.html", "en/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const match of html.matchAll(
    /(?:src|href)="\/teamstar-website-review\/([^"#?]+)"/g,
  )) {
    const reference = decodeURIComponent(match[1]);
    if (
      reference.endsWith("/") ||
      reference.startsWith("en/") ||
      reference.startsWith("products/") ||
      reference.startsWith("capabilities/") ||
      reference.startsWith("quality/") ||
      reference.startsWith("company/") ||
      reference.startsWith("customers/") ||
      reference.startsWith("rfq/")
    ) {
      continue;
    }
    if (!fs.existsSync(path.join(root, reference))) {
      errors.push(`${file}: missing asset ${reference}`);
    }
  }
}

const build = fs.readFileSync(path.join(root, "REVIEW_BUILD.txt"), "utf8");
if (!build.includes("Version: 20260730-2x")) {
  errors.push("REVIEW_BUILD.txt: 2x version missing");
}
if (!build.includes("Production status: NOT DEPLOYED")) {
  errors.push("REVIEW_BUILD.txt: production boundary missing");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `2w redesign check passed: ${htmlFiles.length} HTML files, concise bilingual core copy, six matched product images, colour logos, uncropped process media`,
);
