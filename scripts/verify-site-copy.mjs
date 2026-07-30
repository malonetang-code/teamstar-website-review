import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function walkHtml(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkHtml(absolute);
    return entry.name.endsWith(".html") ? [path.relative(root, absolute)] : [];
  });
}

function plainText(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const htmlFiles = walkHtml();
const forbidden = [
  "原文件夹名称与文件名仅作为来源标签保留",
  "来源标签：",
  "过往相似产品实拍案例",
  "当前生产环境",
  "原文件夹",
  "原始文件夹",
  "原文件名",
  "文件夹",
  "reassigned to the current six application categories",
  "Source label:",
  "Previous similar-product photo cases",
  "current Zhangzhou manufacturing environment",
  "original source folder",
  "source-folder",
  "filename order",
];

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const phrase of forbidden) {
    if (html.includes(phrase)) errors.push(`${file}: outdated or internal phrase remains: ${phrase}`);
  }

  for (const match of html.matchAll(/<(h1|h2|h3)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    const heading = plainText(match[2]);
    if (
      /[。！？.!?]$/.test(heading) &&
      heading !== "Custom Industrial Blades, Built to Your Requirements."
    ) {
      errors.push(`${file}: heading has terminal punctuation: ${heading}`);
    }
  }
}

const productSlugs = [
  "woodworking-knives",
  "food-processing-knives",
  "plastic-crusher-blades",
  "paper-slitting-knives",
  "textile-cutting-knives",
  "custom-industrial-blades",
];

let zhPhotos = 0;
let enPhotos = 0;
for (const slug of productSlugs) {
  const zh = fs.readFileSync(path.join(root, `products/${slug}/index.html`), "utf8");
  const en = fs.readFileSync(path.join(root, `en/products/${slug}/index.html`), "utf8");
  zhPhotos += (zh.match(/class="application-case"/g) || []).length;
  enPhotos += (en.match(/class="application-case"/g) || []).length;
  if (!zh.includes("<h2>代表性产品实拍</h2>")) {
    errors.push(`${slug}: Chinese representative-photo heading missing`);
  }
  if (!en.includes("<h2>Representative product photographs</h2>")) {
    errors.push(`${slug}: English representative-photo heading missing`);
  }
}

if (zhPhotos !== 86 || enPhotos !== 86) {
  errors.push(`Expected 86 product photographs per locale, found ${zhPhotos}/${enPhotos}`);
}

const build = fs.readFileSync(path.join(root, "REVIEW_BUILD.txt"), "utf8");
if (!build.includes("Version: 20260730-2y")) {
  errors.push("REVIEW_BUILD.txt: expected version 20260730-2y");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Site copy check passed: ${htmlFiles.length} HTML files, approved brand-heading punctuation preserved, internal source labels removed, ${zhPhotos}/${enPhotos} product photographs retained`,
);
