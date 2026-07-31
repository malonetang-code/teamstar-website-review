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
if (htmlFiles.length !== 50) {
  errors.push(`Expected 50 HTML files, found ${htmlFiles.length}`);
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
  if (!html.includes("rd01@teamstarmfg.com")) {
    errors.push(`${file}: sales mailbox missing`);
  }
  const isEnglish = file.startsWith("en/");
  const footerContact = isEnglish
    ? [
        "<strong>Contact</strong>",
        "General enquiries: ga01@teamstarmfg.com",
        "Sales enquiries: rd01@teamstarmfg.com",
      ]
    : [
        "<strong>联系方式</strong>",
        "一般咨询：ga01@teamstarmfg.com",
        "销售咨询：rd01@teamstarmfg.com",
      ];
  for (const expected of footerContact) {
    if (!html.includes(expected)) {
      errors.push(`${file}: footer contact label missing: ${expected}`);
    }
  }
  if (
    html.includes("<strong>总务与一般咨询</strong>") ||
    html.includes("<strong>General Administration</strong>")
  ) {
    errors.push(`${file}: superseded footer contact heading remains`);
  }
  if (!html.includes("site-base.css?v=20260730-2w")) {
    errors.push(`${file}: shared base stylesheet missing`);
  }
  if (!html.includes("site-2w.css?v=20260730-2y-home-video")) {
    errors.push(`${file}: 2w visual stylesheet missing`);
  }
  const isIndependentHome =
    file === "home/index.html" || file === "en/home/index.html";
  if (
    (!isIndependentHome && !html.includes("redesign-2w")) ||
    (isIndependentHome && !html.includes('class="page-home york-home"'))
  ) {
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
    if (
      /[。！？.!?]$/.test(heading) &&
      heading !== "因需而制，以准致信。" &&
      heading !== "Engineered for Your Needs. Trusted for Precision."
    ) {
      errors.push(`${file}: heading has terminal punctuation: ${heading}`);
    }
  }
}

const homeChecks = [
  [
    "index.html",
    [
      "因需而制，以准致信。",
      "按图纸、样品与实际工况确认制造方案",
      "工业刀具产品",
      "三种询价方式",
      "从图纸到成品",
      "真实工厂与检测现场",
    ],
  ],
  [
    "en/index.html",
    [
      "Engineered for Your Needs. Trusted for Precision.",
      "Industrial Knife Products",
      "Three Ways to Start",
      "From Drawing to Finished Knife",
      "Real Manufacturing and Inspection",
    ],
  ],
  [
    "home/index.html",
    [
      "为设备制造真正合适的刀具",
      "已公开的合作客户与设备品牌参考",
      "从工业刀具经验，到漳州制造现场",
      "这段行业积累属于伟群制刀工业集团",
      "深圳生产基地成立",
      "漳州群新工业成立",
      "六类工业机械刀具，面向不同设备与应用",
      "真实制造现场，配合适用的检验依据",
      "rd01@teamstarmfg.com",
    ],
  ],
  [
    "en/home/index.html",
    [
      "Industrial knives made for the machine, material, and cut",
      "Published customer and equipment references",
      "Industrial knife heritage, connected to manufacturing in Zhangzhou",
      "The heritage belongs to Wei Qun Cutting Tools Group",
      "Shenzhen production base established",
      "Qunxin Industrial established in Zhangzhou",
      "Six industrial knife families for different machines and applications",
      "A real manufacturing site, with inspection matched to the blade",
      "rd01@teamstarmfg.com",
    ],
  ],
];

const videoHomeFooterChecks = [
  ["home/index.html", "因需而制，以准致信。"],
  ["en/home/index.html", "Engineered for Your Needs. Trusted for Precision."],
];

for (const [file, expected] of videoHomeFooterChecks) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const footerDescription = html.match(
    /<div class="footer-brand">\s*<strong>TEAMSTAR MANUFACTURING<\/strong>\s*<p>([\s\S]*?)<\/p>/,
  )?.[1];
  if (text(footerDescription || "") !== expected) {
    errors.push(`${file}: expected final bilingual footer slogan`);
  }
}

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

for (const file of ["home/index.html", "en/home/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const required of [
    "data-york-home",
    "york-home-hero",
    "home-company-manufacturing-montage-20260730-poster.jpg",
    "home-trust-band",
    "york-about-section",
    "york-heritage-section",
    "york-products-section",
    "york-industries-section",
    "york-proof-section",
    "home-3b.css?v=20260731-4a",
    "home-video.js?v=20260731-4a",
    'name="robots" content="noindex,nofollow,noarchive"',
  ]) {
    if (!html.includes(required)) {
      errors.push(`${file}: York-inspired Home requirement missing: ${required}`);
    }
  }
  for (const removed of [
    "data-hero-panel",
    "data-hero-trigger",
    "data-hero-prev",
    "data-hero-next",
    "data-hero-autoplay",
    "hero-controls",
    "hero-selector",
    "proof-band",
    "proof-status",
    "value-card-grid",
    "assurance-steps",
    "Draft data",
    "XX,000",
  ]) {
    if (html.includes(removed)) {
      errors.push(`${file}: superseded Home element remains: ${removed}`);
    }
  }
  if ((html.match(/class="york-home-hero"/g) || []).length !== 1) {
    errors.push(`${file}: expected one non-carousel hero`);
  }
  if ((html.match(/class="button button-accent"/g) || []).length !== 1) {
    errors.push(`${file}: expected one final highlighted RFQ entry`);
  }
  if (!html.includes("06-optical-inspection-full.jpg")) {
    errors.push(`${file}: optical-inspection evidence image missing`);
  }
}

const yorkHomeCss = fs.readFileSync(
  path.join(root, "assets/css/home-3b.css"),
  "utf8",
);
for (const required of [
  ".york-home-hero",
  ".home-trust-band",
  ".york-about-grid",
  ".york-heritage-grid",
  ".product-story-grid",
  ".york-industries-section",
  ".proof-editorial-grid",
  "@media (prefers-reduced-motion: reduce)",
]) {
  if (!yorkHomeCss.includes(required)) {
    errors.push(`York-inspired Home CSS missing rule: ${required}`);
  }
}
for (const removed of [
  ".hero-controls",
  ".hero-selector",
  ".proof-band",
  ".value-card-grid",
  ".assurance-steps",
  "@keyframes home-hero-progress",
]) {
  if (yorkHomeCss.includes(removed)) {
    errors.push(`Home CSS still contains superseded rule: ${removed}`);
  }
}

const yorkHomeJs = fs.readFileSync(
  path.join(root, "assets/js/home-video.js"),
  "utf8",
);
for (const required of [
  "prefers-reduced-motion: reduce",
  "IntersectionObserver",
  "data-home-reveal",
  "is-home-revealed",
]) {
  if (!yorkHomeJs.includes(required)) {
    errors.push(`York-inspired Home JS missing behavior: ${required}`);
  }
}
for (const removed of [
  "autoplayInterval",
  "data-hero",
  "data-home-video",
  "logoClones",
]) {
  if (yorkHomeJs.includes(removed)) {
    errors.push(`Home JS still contains superseded behavior: ${removed}`);
  }
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const expected = file.startsWith("en/")
    ? '<a href="/teamstar-website-review/en/home/">Home</a>'
    : '<a href="/teamstar-website-review/home/">首页</a>';
  if ((html.match(new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length !== 2) {
    errors.push(`${file}: expected exactly one Home entry in each navigation`);
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
  ".has-home-motion [data-home-reveal]",
  "@keyframes home-logo-drift",
  "@media (prefers-reduced-motion: reduce)",
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
if (!build.includes("Version: 20260730-2y")) {
  errors.push("REVIEW_BUILD.txt: 2y version missing");
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
