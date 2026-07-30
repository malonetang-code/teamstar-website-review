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
  if (!html.includes("site-2v.css?v=20260730-2v")) {
    errors.push(`${file}: 2v base stylesheet missing`);
  }
  if (!html.includes("site-2v-overrides.css?v=20260730-2v")) {
    errors.push(`${file}: 2v visual stylesheet missing`);
  }
  if (!html.includes("redesign-2v")) {
    errors.push(`${file}: 2v body marker missing`);
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
      "<span>按图、按样定制</span><span>工业机械刀具</span>",
      "我们制造的刀具",
      "三种方式开始询价",
      "从材料到刃口",
      "可核验的制造与质量能力",
    ],
  ],
  [
    "en/index.html",
    [
      "<span>Custom Industrial</span><span>Machine Knives</span>",
      "Industrial Knives We Manufacture",
      "Start With What You Have",
      "From Material to Cutting Edge",
      "Manufacturing Evidence You Can Review",
    ],
  ],
];

const selectedStems = [
  "crotKizX0J",
  "mZaq84W78n",
  "kDD9SWMj0H",
  "W8YmneBOMh",
  "47jYn3TWma",
  "TTtdzuoFgG",
];

for (const [file, phrases] of homeChecks) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if ((html.match(/class="blade-card"/g) || []).length !== 6) {
    errors.push(`${file}: expected six home product cards`);
  }
  for (const phrase of phrases) {
    if (!html.includes(phrase)) errors.push(`${file}: missing concise copy: ${phrase}`);
  }
  for (const stem of selectedStems) {
    if (!html.includes(stem)) errors.push(`${file}: selected product image missing: ${stem}`);
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
  for (const stem of selectedStems) {
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

const css = fs.readFileSync(
  path.join(root, "assets/css/site-2v-overrides.css"),
  "utf8",
);
for (const required of [
  ".blade-media img",
  "object-fit: contain",
  ".logo-item img",
  "filter: none",
  ".process-evidence-media video",
]) {
  if (!css.includes(required)) errors.push(`2v CSS missing rule: ${required}`);
}
if (/grayscale\s*\(/.test(css)) {
  errors.push("2v CSS must not grayscale the logo wall");
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
if (!build.includes("Version: 20260730-2v")) {
  errors.push("REVIEW_BUILD.txt: 2v version missing");
}
if (!build.includes("Production status: NOT DEPLOYED")) {
  errors.push("REVIEW_BUILD.txt: production boundary missing");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `2v redesign check passed: ${htmlFiles.length} HTML files, concise bilingual core copy, six matched product images, colour logos, uncropped process media`,
);
