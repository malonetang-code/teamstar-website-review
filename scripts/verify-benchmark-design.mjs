import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "20260730-2u";
const errors = [];

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git") continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(target)));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(target);
  }
  return files;
}

const files = await htmlFiles(root);
if (files.length !== 48) {
  errors.push(`Expected 48 HTML files, found ${files.length}`);
}

for (const file of files) {
  const html = await readFile(file, "utf8");
  const relative = path.relative(root, file);
  if (!html.includes(`benchmark.css?v=${version}`)) {
    errors.push(`${relative}: benchmark stylesheet missing`);
  }
  if (!html.includes("benchmark-york-yishi")) {
    errors.push(`${relative}: benchmark body class missing`);
  }
  if (!html.includes('meta name="robots" content="noindex,nofollow,noarchive"')) {
    errors.push(`${relative}: review robots boundary missing`);
  }
}

for (const [relative, h1, routeTitle, proofLabel] of [
  [
    "index.html",
    "按图、按样制造工业机械刀具",
    "从现有资料开始",
    "图纸 / 样品 / 工况",
  ],
  [
    path.join("en", "index.html"),
    "Industrial Machine Knives Made to Drawing or Sample",
    "Start With What You Have",
    "Drawing / sample / application",
  ],
]) {
  const html = await readFile(path.join(root, relative), "utf8");
  const h1Text = html
    .match(/<h1>([\s\S]*?)<\/h1>/)?.[1]
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const normalizedH1 =
    relative === "index.html" ? h1Text?.replaceAll(" ", "") : h1Text;
  if (normalizedH1 !== h1) {
    errors.push(`${relative}: benchmark H1 missing`);
  }
  const mediaCount = (html.match(/benchmark-card-media/g) || []).length;
  if (mediaCount !== 6) {
    errors.push(`${relative}: expected 6 category images, found ${mediaCount}`);
  }
  if (!html.includes("benchmark-hero-picture")) {
    errors.push(`${relative}: product-first hero missing`);
  }
  if (!html.includes(`<h2>${routeTitle}</h2>`)) {
    errors.push(`${relative}: concise RFQ section title missing`);
  }
  if (!html.includes(`<span>${proofLabel}</span>`)) {
    errors.push(`${relative}: RFQ proof label missing`);
  }
}

for (const relative of [
  path.join("products", "index.html"),
  path.join("en", "products", "index.html"),
]) {
  const html = await readFile(path.join(root, relative), "utf8");
  const mediaCount = (html.match(/benchmark-card-media/g) || []).length;
  if (mediaCount !== 6) {
    errors.push(`${relative}: expected 6 category images, found ${mediaCount}`);
  }
}

for (const asset of [
  path.join("assets", "css", "benchmark.css"),
  path.join("img", "iSsU_nnhav-1440.jpeg"),
  path.join("img", "crotKizX0J-640.jpeg"),
  path.join("img", "mZaq84W78n-640.jpeg"),
  path.join("img", "VJT2x-HfAY-640.jpeg"),
  path.join("img", "W8YmneBOMh-640.jpeg"),
  path.join("img", "47jYn3TWma-640.jpeg"),
  path.join("img", "TTtdzuoFgG-640.jpeg"),
]) {
  try {
    await access(path.join(root, asset));
  } catch {
    errors.push(`Missing asset: ${asset}`);
  }
}

const build = await readFile(path.join(root, "REVIEW_BUILD.txt"), "utf8");
if (!build.includes(`Version: ${version}`)) {
  errors.push("REVIEW_BUILD.txt version mismatch");
}
if (!build.includes("Production status: NOT DEPLOYED")) {
  errors.push("REVIEW_BUILD.txt production boundary missing");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Verified ${version}: ${files.length} HTML files, bilingual product-first homepages, 24 category image references, review boundaries intact`,
);
