import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const errors = [];
const css = read("assets/css/process-viewer.css");

const fullFrameRules = [
  /\.process-media-trigger img,[\s\S]*?object-fit:\s*contain;/,
  /\.process-media-hover-preview\s*\{[\s\S]*?object-fit:\s*contain;/,
  /\.process-media-trigger \.process-media-hover-preview\s*\{[\s\S]*?object-fit:\s*contain;/,
  /\.process-media-trigger-detail img\s*\{[\s\S]*?object-fit:\s*contain;/,
  /\.process-media-viewer-stage img,[\s\S]*?object-fit:\s*contain;/,
];

for (const rule of fullFrameRules) {
  if (!rule.test(css)) errors.push(`Missing full-frame CSS rule: ${rule}`);
}

for (const file of ["capabilities/index.html", "en/capabilities/index.html"]) {
  const html = read(file);
  const isEnglish = file.startsWith("en/");
  const rows = (html.match(/class="process-evidence-row"/g) || []).length;
  const triggers = (html.match(/class="process-media-trigger/g) || []).length;
  const videos = (html.match(/data-media-kind="video"/g) || []).length;
  const images = (html.match(/data-media-kind="image"/g) || []).length;
  const processCopy = [
    ...html.matchAll(/class="process-evidence-copy"[\s\S]*?<p>(.*?)<\/p>/g),
  ].map((match) => match[1].replace(/<[^>]+>/g, "").trim());
  const endPunctuation = isEnglish ? /[.!?]$/ : /[。！？]$/;

  if (rows !== 8) errors.push(`${file}: expected 8 process rows, found ${rows}`);
  if (triggers !== 21) errors.push(`${file}: expected 21 media triggers, found ${triggers}`);
  if (videos !== 9 || images !== 12) {
    errors.push(`${file}: expected 9 video and 12 image triggers, found ${videos}/${images}`);
  }
  if (processCopy.length !== 8) {
    errors.push(`${file}: expected 8 process descriptions, found ${processCopy.length}`);
  }
  for (const text of processCopy) {
    if (!endPunctuation.test(text)) errors.push(`${file}: body copy lacks terminal punctuation: ${text}`);
  }
  if (!html.includes(`process-viewer.css?v=20260730-2s`)) {
    errors.push(`${file}: current process viewer stylesheet version missing`);
  }
  for (const asset of [
    "03-heat-treatment-002.mp4",
    "03-heat-treatment-002-cover.jpg",
    "03-heat-treatment-operation-010-full.jpg",
  ]) {
    if (!html.includes(asset)) {
      errors.push(`${file}: updated heat-treatment asset missing: ${asset}`);
    }
  }
  if (
    html.includes("03-heat-treatment.mp4") ||
    html.includes("03-heat-treatment-loading-full.jpg")
  ) {
    errors.push(`${file}: superseded heat-treatment asset remains`);
  }
  if (!html.includes('meta name="robots" content="noindex,nofollow,noarchive"')) {
    errors.push(`${file}: review robots safeguard missing`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  "Process review check passed: complete-frame thumbnails, 8 bilingual stages, 21 media triggers and punctuated body copy",
);
