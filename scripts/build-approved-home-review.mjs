import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const approvedCommit = "2a3705438a6a0309f32a4ea512c2a19889ab0ca2";
const productionRelease = "20260731-3a";
const reviewRelease = "20260803-2";

function approvedFile(relativePath) {
  return execFileSync(
    "git",
    ["-C", root, "show", `${approvedCommit}:${relativePath}`],
    { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  );
}

function removeSectionContaining(html, marker) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Approved Home marker is missing: ${marker}`);

  const sectionStart = html.lastIndexOf("<section", markerIndex);
  const sectionEnd = html.indexOf("</section>", markerIndex);
  if (sectionStart === -1 || sectionEnd === -1) {
    throw new Error(`Unable to resolve the section containing: ${marker}`);
  }

  return `${html.slice(0, sectionStart)}${html.slice(sectionEnd + "</section>".length)}`;
}

function buildHome(sourcePath, inquiryMarker) {
  let html = approvedFile(sourcePath);
  html = html
    .replaceAll(
      "/teamstar-website-review/en/home/",
      "/teamstar-website-review/en/",
    )
    .replaceAll(
      "/teamstar-website-review/home/",
      "/teamstar-website-review/",
    )
    .replace(/\?v=[A-Za-z0-9._-]+/g, `?v=${productionRelease}`);
  html = removeSectionContaining(html, inquiryMarker);
  html = html.replace(/[ \t]+$/gm, "");
  html = html.replace(
    "</head>",
    `<meta name="teamstar-review-baseline" content="${productionRelease}"><link href="/teamstar-website-review/assets/css/home-reference-marquee.css?v=${reviewRelease}" rel="stylesheet"></head>`,
  );
  html = html.replace(
    "</body>",
    `<script defer src="/teamstar-website-review/assets/js/home-reference-marquee.js?v=${reviewRelease}"></script></body>`,
  );
  return html;
}

const zhHome = buildHome("home/index.html", "三种询价方式");
const enHome = buildHome("en/home/index.html", "Three Ways to Start");

for (const [relativePath, html] of [
  ["index.html", zhHome],
  ["home/index.html", zhHome],
  ["en/index.html", enHome],
  ["en/home/index.html", enHome],
]) {
  fs.writeFileSync(path.join(root, relativePath), html);
}

console.log(
  JSON.stringify(
    {
      approvedCommit,
      productionRelease,
      reviewRelease,
      pages: 4,
    },
    null,
    2,
  ),
);
