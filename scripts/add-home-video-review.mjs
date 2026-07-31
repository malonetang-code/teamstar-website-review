import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const base = "/teamstar-website-review";
const styleVersion = "20260730-2y-home-video";

async function htmlFiles(directory = root) {
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

function videoHome(source, english) {
  const staticImage = `${base}/images/web/process-20260725/home-company-manufacturing-montage-20260730-poster.jpg`;
  const mobileImage = `${base}/images/web/process-20260725/home-company-manufacturing-montage-20260730-poster-mobile.jpg`;
  const video = `${base}/images/web/process-20260725/home-company-manufacturing-montage-20260730.mp4`;
  let html = source
    .replace(
      '<body class="page-home redesign-2w">',
      '<body class="page-home page-home-video redesign-2w">',
    )
    .replace(
      '<section class="home-hero">',
      '<section class="home-hero home-video-hero">',
    )
    .replace(
      /<picture class="home-hero-picture">[\s\S]*?<\/picture>/,
      `<div class="home-video-media" aria-hidden="true">
      <picture class="home-video-poster">
        <source media="(max-width: 767px)" srcset="${mobileImage}">
        <img src="${staticImage}" width="1536" height="720" loading="eager" fetchpriority="high" decoding="async" alt="">
      </picture>
      <video class="home-video" muted loop playsinline preload="none" poster="${staticImage}" data-home-video>
        <source src="${video}" type="video/mp4">
      </video>
    </div>`,
    )
    .replace(
      "</body>",
      `<script defer src="${base}/assets/js/home-video.js?v=${styleVersion}"></script> </body>`,
    )
    .replace(
      /(<div class="footer-brand">\s*<strong>TEAMSTAR MANUFACTURING<\/strong>\s*<p>)[\s\S]*?(<\/p>)/,
      (_, open, close) =>
        `${open}${
          english
            ? "Engineered for Your Needs. Trusted for Precision."
            : "因需而制，以准致信。"
        }${close}`,
    );

  if (english) {
    html = html.replace(
      `href="${base}/" class="language-link"`,
      `href="${base}/home/" class="language-link"`,
    );
  } else {
    html = html.replace(
      `href="${base}/en/" class="language-link"`,
      `href="${base}/en/home/" class="language-link"`,
    );
  }
  return html;
}

const zhSource = await readFile(path.join(root, "index.html"), "utf8");
const enSource = await readFile(path.join(root, "en/index.html"), "utf8");
await mkdir(path.join(root, "home"), { recursive: true });
await mkdir(path.join(root, "en/home"), { recursive: true });
await writeFile(path.join(root, "home/index.html"), videoHome(zhSource, false));
await writeFile(path.join(root, "en/home/index.html"), videoHome(enSource, true));

for (const file of await htmlFiles()) {
  let html = await readFile(file, "utf8");
  const english = path.relative(root, file).startsWith("en/");
  const href = english ? `${base}/en/home/` : `${base}/home/`;
  const label = english ? "Home" : "首页";
  const anchor = `<a href="${href}">${label}</a>`;

  html = html.replace(
    /(<nav\b[^>]*class="desktop-nav"[^>]*>)([\s\S]*?)(<\/nav>)/,
    (_, open, content, close) =>
      `${open} ${anchor} ${content.replaceAll(anchor, "").trimStart()}${close}`,
  );
  html = html.replace(
    /(<div\b[^>]*class="container mobile-menu-inner"[^>]*>)([\s\S]*?)(<\/div>)/,
    (_, open, content, close) =>
      `${open} ${anchor} ${content.replaceAll(anchor, "").trimStart()}${close}`,
  );
  html = html.replace(
    /site-2w\.css\?v=[^"]+/g,
    `site-2w.css?v=${styleVersion}`,
  );
  await writeFile(file, html);
}

console.log("Added bilingual video Home review routes and navigation");
