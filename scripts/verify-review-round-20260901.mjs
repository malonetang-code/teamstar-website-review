import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const roots = [
  "404.html", "index.html", "home", "products", "capabilities", "quality",
  "company", "customers", "guides", "rfq", "privacy", "en",
];

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

const files = [...new Set(roots.flatMap(walk))].filter((file) => {
  const rel = relative(root, file);
  return !rel.startsWith("en/why-qunxin-");
});
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

for (const file of files) {
  const rel = relative(root, file);
  const html = readFileSync(file, "utf8");
  const en = rel.startsWith("en/");
  const brand = en
    ? "<span><strong>TEAMSTAR MFG.</strong><small>群新工业</small></span>"
    : "<span><strong>群新工业</strong><small>TEAMSTAR MFG.</small></span>";
  const navLabels = en
    ? ["Home", "Products", "Manufacturing", "Quality", "Company"]
    : ["首页", "产品目录", "制造能力", "质量体系", "公司概况"];

  expect(html.includes(brand), `${rel}: header brand order`);
  for (const label of navLabels) expect(html.includes(`>${label}</a>`), `${rel}: missing nav ${label}`);
  expect(html.includes('class="footer-inquiry-link"'), `${rel}: footer inquiry entry`);
  expect(html.includes('content="noindex,nofollow,noarchive"'), `${rel}: review robots isolation`);

  const isHome = ["index.html", "home/index.html", "en/index.html", "en/home/index.html"].includes(rel);
  expect(isHome || !/class="[^"]*\brfq-band\b/.test(html), `${rel}: repeated in-page RFQ band`);

  if (!en) {
    expect(!/<span class="eyebrow">(?=[^<]*[A-Za-z])(?![^<]*[\u3400-\u9fff])[^<]*<\/span>/.test(html), `${rel}: decorative English eyebrow`);
    expect(!/<b>\d{2}\s*\/\s*[A-Z]/.test(html), `${rel}: English process micro-label`);
  }
}

for (const rel of ["index.html", "home/index.html", "en/index.html", "en/home/index.html"]) {
  const html = readFileSync(resolve(root, rel), "utf8");
  const section = html.match(/<section class="section home-product-section"[\s\S]*?<\/section>/)?.[0] || "";
  expect((section.match(/<article class="blade-card">/g) || []).length === 6, `${rel}: exactly six Home product cards`);
  expect(!section.includes("product-pending-card"), `${rel}: no pending Home products`);
  expect(!/<div class="blade-body">\s*<span>0[1-8]<\/span>/.test(section), `${rel}: no Home product numbers`);
  expect(section.includes(rel.startsWith("en/") ? "<h2>Products</h2>" : "<h2>产品目录</h2>"), `${rel}: concise Home product title`);
}

for (const style of ["1", "2", "3"]) {
  for (const lang of ["", "en/"]) {
    const rel = `full-style-preview/${style}/${lang}index.html`;
    const html = readFileSync(resolve(root, rel), "utf8");
    const section = html.match(/<section class="section home-product-section"[\s\S]*?<\/section>/)?.[0] || "";
    expect((section.match(/<article class="blade-card">/g) || []).length === 6, `${rel}: exactly six concept product cards`);
    expect(!section.includes("product-pending-card"), `${rel}: no pending preview products`);
    expect(!/<div class="blade-body">\s*<span>0[1-8]<\/span>/.test(section), `${rel}: no preview product numbers`);
  }
}

for (const style of ["a", "b", "c", "d", "e"]) {
  for (const lang of ["", "en/"]) {
    const rel = `full-style-preview/${style}/${lang}index.html`;
    const html = readFileSync(resolve(root, rel), "utf8");
    expect(html.includes("/full-style-preview/1/"), `${rel}: retired color route redirects to Concept 1`);
  }
}

const capabilityZh = readFileSync(resolve(root, "capabilities/index.html"), "utf8");
const capabilityEn = readFileSync(resolve(root, "en/capabilities/index.html"), "utf8");
for (const [rel, html, title] of [
  ["capabilities/index.html", capabilityZh, "主要制造工序"],
  ["en/capabilities/index.html", capabilityEn, "Main Manufacturing Processes"],
]) {
  expect(html.includes(`<h2 id="process-evidence-title">${title}</h2>`), `${rel}: manufacturing process title`);
  expect((html.match(/class="process-evidence-row"/g) || []).length === 6, `${rel}: six manufacturing rows`);
  expect(!html.includes('id="process-in-process-inspection"') && !html.includes('id="process-final-inspection"'), `${rel}: inspection detail moved out`);
  expect(html.includes('id="process-protective-packaging"'), `${rel}: packaging protection retained`);
}

const qualityZh = readFileSync(resolve(root, "quality/index.html"), "utf8");
const qualityEn = readFileSync(resolve(root, "en/quality/index.html"), "utf8");
expect(qualityZh.includes("主要质量控制过程展示"), "quality/index.html: concise control intro");
expect(qualityZh.includes("主要检验项目展示"), "quality/index.html: concise inspection intro");
expect(qualityEn.includes("Key quality control processes are shown below."), "en/quality/index.html: concise control intro");
expect(qualityEn.includes("Key inspection items are shown below."), "en/quality/index.html: concise inspection intro");

if (failures.length) {
  console.error(`Review-round verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Review-round verification passed for ${files.length} canonical pages, 6 concept previews, and 10 retired color redirects.`);
