import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), "utf8");
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

function walk(entry) {
  const path = resolve(root, entry);
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((item) => {
    const child = join(path, item.name);
    return item.isDirectory()
      ? walk(relative(root, child))
      : item.isFile() && item.name.endsWith(".html") ? [child] : [];
  });
}

const canonicalRoots = [
  "404.html", "index.html", "home", "products", "capabilities", "quality",
  "company", "customers", "guides", "rfq", "privacy", "en",
];
const canonicalFiles = [...new Set(canonicalRoots.flatMap(walk))].filter((file) => {
  const path = relative(root, file);
  return !path.startsWith("en/why-qunxin-");
});

for (const file of canonicalFiles) {
  const path = relative(root, file);
  const html = readFileSync(file, "utf8");
  const isEnglish = path.startsWith("en/");
  const navLabels = isEnglish
    ? ["Home", "Products", "Manufacturing", "Quality", "Company"]
    : ["首页", "产品目录", "制造能力", "质量体系", "公司概况"];
  const retiredNavLabels = isEnglish
    ? ["Products & Applications", "Manufacturing & Quality", "Long-term Partners"]
    : ["产品与应用", "制造与质量", "长期合作伙伴"];

  for (const label of navLabels) {
    expect(html.includes(`>${label}</a>`), `${path}: missing direct navigation label ${label}`);
  }
  for (const label of retiredNavLabels) {
    expect(!html.includes(`>${label}</a>`), `${path}: still contains retired navigation label ${label}`);
  }
  expect(!html.includes("nav-section-group"), `${path}: manufacturing and quality are still grouped`);
  expect(html.includes('class="footer-inquiry-area"'), `${path}: missing right-side footer inquiry area`);
  expect(html.includes('class="footer-inquiry-link"'), `${path}: missing footer inquiry link`);
  expect(html.includes('content="noindex,nofollow,noarchive"'), `${path}: missing review crawl isolation`);
}

for (const path of ["index.html", "home/index.html", "en/index.html", "en/home/index.html"]) {
  const html = read(path);
  expect(!html.includes('class="rfq-band" id="contact"'), `${path}: old Home knife-finder band remains`);
  expect(!html.includes('legacy-home-section reference-section'), `${path}: duplicate partner section remains`);
  expect(!html.includes('/customers/'), `${path}: partner subpage remains linked from Home`);
  expect(html.includes('home-logo-section'), `${path}: approved Home logo wall is missing`);
}

for (const path of ["products/index.html", "en/products/index.html"]) {
  const html = read(path);
  expect(!html.includes("product-directory-assist"), `${path}: uncertain-category block remains`);
  expect(!html.includes("暂不确定产品分类"), `${path}: Chinese uncertain-category copy remains`);
  expect(!html.includes("Not sure which category fits"), `${path}: English uncertain-category copy remains`);
}

for (const languagePath of ["index.html", "en/index.html"]) {
  const path = `full-style-preview/1/${languagePath}`;
  const html = read(path);
  expect(html.includes('data-full-preview="e"'), `${path}: restrained-minimal visual token is missing`);
  expect(html.includes('data-review-concept="1"'), `${path}: Concept 1 identity is missing`);
  expect(html.includes(languagePath.startsWith("en/") ? "Concept 1 · Restrained Minimal" : "1号方案 · 克制极简"), `${path}: Concept 1 title is missing`);
  expect(!html.includes("full-preview-switcher"), `${path}: legacy color switcher remains`);
  expect(!html.includes("nav-section-group"), `${path}: manufacturing and quality are still grouped`);
  expect(!html.includes('/customers/'), `${path}: partner subpage remains linked`);
}

for (const retired of ["a", "b", "c", "d", "e"]) {
  for (const languagePath of ["index.html", "en/index.html"]) {
    const path = `full-style-preview/${retired}/${languagePath}`;
    const html = read(path);
    const destination = languagePath.startsWith("en/")
      ? "/teamstar-review/full-style-preview/1/en/"
      : "/teamstar-review/full-style-preview/1/";
    expect(html.includes(destination), `${path}: does not redirect to Concept 1`);
    expect(html.includes("noindex,nofollow,noarchive"), `${path}: redirect is not crawl-isolated`);
  }
}

const runtime = read("full-style-preview/site-theme-preview.js");
expect(runtime.includes('const activeConcept = validConcept(conceptFromHome)'), "theme runtime: concept-aware Home destination missing");
expect(runtime.includes(': "1";'), "theme runtime: Concept 1 fallback missing");
expect(!runtime.includes("mountThemeSwitcher"), "theme runtime: legacy color switcher remains");
expect(runtime.includes('const keyboardAttribute = "data-keyboard-navigation"'), "theme runtime: keyboard navigation state missing");
expect(runtime.includes('if (event.key === "Tab")'), "theme runtime: skip link is not restricted to Tab navigation");

const themeCss = read("full-style-preview/site-theme-preview.css");
const homeCss = read("full-style-preview/full-style-preview.css");
expect(themeCss.includes(".footer-inquiry-area"), "subpage theme: footer inquiry positioning missing");
expect(homeCss.includes(".footer-inquiry-area"), "Concept 1 Home: footer inquiry positioning missing");
expect(themeCss.match(/--stp-switcher-height:\s*0px/g)?.length === 2, "subpage theme: retired switcher still offsets desktop or mobile sticky navigation");
expect(homeCss.includes("--fp-switcher-height: 0px"), "Concept 1 Home: retired switcher still offsets sticky navigation");
expect(themeCss.includes("--stp-title-section-size:"), "subpage theme: section-title token missing");
expect(themeCss.includes("--stp-title-subsection-size:"), "subpage theme: subsection-title token missing");
expect(themeCss.includes("--stp-title-panel-size:"), "subpage theme: panel-title token missing");
expect(themeCss.includes(".rfq-support-head h2"), "subpage theme: RFQ section title not normalized");
expect(themeCss.includes(".iso-certificate-copy h2"), "subpage theme: ISO section title not normalized");
expect(themeCss.includes(".content-grid > .content-block > h2"), "subpage theme: content-grid section title not normalized");
expect(themeCss.includes('[data-keyboard-navigation="true"]'), "subpage theme: keyboard-only skip-link selector missing");
expect(themeCss.includes(".skip-link:focus-visible"), "subpage theme: skip-link focus-visible state missing");
expect(homeCss.includes('[data-keyboard-navigation="true"]'), "Concept 1 Home: keyboard-only skip-link selector missing");
expect(homeCss.includes(".skip-link:focus-visible"), "Concept 1 Home: skip-link focus-visible state missing");

if (failures.length) {
  console.error(`Concept 1 verification failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Concept 1 verification passed across ${canonicalFiles.length} canonical review pages, the bilingual Home, and retired A-E routes.`);
