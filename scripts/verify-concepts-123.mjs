import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), "utf8");
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

for (const concept of ["1", "2", "3"]) {
  for (const languagePath of ["index.html", "en/index.html"]) {
    const path = `full-style-preview/${concept}/${languagePath}`;
    const html = read(path);
    expect(html.includes(`data-review-concept="${concept}"`), `${path}: concept identity missing`);
    expect(html.includes(`class="full-style-preview concept-${concept}`), `${path}: concept body class missing`);
    expect(html.includes("noindex,nofollow,noarchive"), `${path}: crawl isolation missing`);
    expect(html.includes(`/full-style-preview/${concept}/`), `${path}: matching Home or language route missing`);
    expect(html.includes("home-logo-section"), `${path}: logo section missing`);
    expect(html.includes("fp-why-refined-e"), `${path}: Why Qunxin section missing`);
    expect((html.match(/<article class="blade-card">/g) || []).length === 6, `${path}: expected six product entries`);
  }
}

for (const languagePath of ["index.html", "en/index.html"]) {
  const concept1 = read(`full-style-preview/1/${languagePath}`);
  const concept2 = read(`full-style-preview/2/${languagePath}`);
  const concept3 = read(`full-style-preview/3/${languagePath}`);
  expect(concept1.includes("concept-1-motion.css"), `Concept 1 ${languagePath}: integrated motion CSS missing`);
  expect(concept1.includes("concept-1-motion.js"), `Concept 1 ${languagePath}: integrated motion JS missing`);
  expect(concept2.includes('class="concept-2-architecture"'), `Concept 2 ${languagePath}: architecture root missing`);
  expect(concept2.includes('class="concept-hero-note"'), `Concept 2 ${languagePath}: editorial hero structure missing`);
  expect(concept3.includes('class="concept-3-architecture"'), `Concept 3 ${languagePath}: architecture root missing`);
  expect(concept3.includes('class="concept-hero-panel"'), `Concept 3 ${languagePath}: conversion hero panel missing`);
  expect(!concept2.includes("concept-1-motion"), `Concept 2 ${languagePath}: Concept 1 motion leaked`);
  expect(!concept3.includes("concept-1-motion"), `Concept 3 ${languagePath}: Concept 1 motion leaked`);
}

const hub = read("full-style-preview/index.html");
for (const concept of ["1", "2", "3"]) {
  expect(hub.includes(`/full-style-preview/${concept}/`), `comparison index: Concept ${concept} link missing`);
}
expect(hub.includes("noindex,nofollow,noarchive"), "comparison index: crawl isolation missing");

const runtime = read("full-style-preview/site-theme-preview.js");
expect(runtime.includes('["1", "2", "3"].includes(value)'), "runtime: valid concept set missing");
expect(runtime.includes('query.get("concept")'), "runtime: concept query missing");
expect(runtime.includes('url.searchParams.set("concept", activeConcept)'), "runtime: concept link propagation missing");
expect(runtime.includes('url.searchParams.delete("concept")'), "runtime: Concept 1 compatibility cleanup missing");

const homeCss = read("full-style-preview/full-style-preview.css");
const siteCss = read("full-style-preview/site-theme-preview.css");
for (const concept of ["2", "3"]) {
  expect(homeCss.includes(`data-review-concept="${concept}"`), `Home CSS: Concept ${concept} rules missing`);
  expect(siteCss.includes(`data-review-concept="${concept}"`), `subpage CSS: Concept ${concept} rules missing`);
}
expect(homeCss.includes("Source Sans 3"), "Home CSS: Concept 2 typography missing");
expect(homeCss.includes("Poppins"), "Home CSS: Concept 3 heading typography missing");
expect(siteCss.includes("Source Sans 3"), "subpage CSS: Concept 2 typography missing");
expect(siteCss.includes("Poppins"), "subpage CSS: Concept 3 heading typography missing");
expect(homeCss.includes("architecture reset"), "Home CSS: architecture reset rules missing");
expect(siteCss.includes("Full-site architecture differentiation"), "subpage CSS: differentiated layout rules missing");

if (failures.length) {
  console.error(`Concept 1-3 verification failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Concept 1-3 structural verification passed for the bilingual Homes, comparison index, theme runtime and full-site CSS.");
