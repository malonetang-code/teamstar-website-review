import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const slugs = [
  "woodworking-knives",
  "food-processing-knives",
  "plastic-crusher-blades",
  "paper-slitting-knives",
  "textile-cutting-knives",
  "custom-industrial-blades",
];
const expectedCounts = [9, 22, 3, 25, 14, 13];
const errors = [];

for (const [index, slug] of slugs.entries()) {
  for (const localePrefix of ["", "en/"]) {
    const file = `${localePrefix}products/${slug}/index.html`;
    const html = read(file);
    const count = (html.match(/class="application-case"/g) || []).length;
    if (count !== expectedCounts[index]) {
      errors.push(`${file}: expected ${expectedCounts[index]} application cases, found ${count}`);
    }
    if (!html.includes('id="similar-product-cases"')) {
      errors.push(`${file}: similar-product section missing`);
    }
    if (html.indexOf('id="similar-product-cases"') > html.indexOf("detail-proof")) {
      errors.push(`${file}: similar-product cases are not before category/application information`);
    }
    if (!html.includes('meta name="robots" content="noindex,nofollow,noarchive"')) {
      errors.push(`${file}: review robots safeguard missing`);
    }
  }
}

for (const file of ["index.html", "en/index.html", "products/index.html", "en/products/index.html"]) {
  const html = read(file);
  const cardLinks = (html.match(/class="product-card-hit-area"/g) || []).length;
  if (cardLinks !== 6) {
    errors.push(`${file}: expected 6 whole-card links, found ${cardLinks}`);
  }
}

const zhProducts = read("products/index.html");
if (
  !zhProducts.includes(
    "<p>产品按木工、食品、塑料回收、纸品分切、纺织服装及设备配套六类应用组织。</p>",
  )
) {
  errors.push("products/index.html: approved product-directory description missing");
}
if (!zhProducts.includes("<h2>按应用分类</h2>")) {
  errors.push("products/index.html: approved knife-category heading missing");
}
if (zhProducts.includes('id="product-photo-library"')) {
  errors.push("products/index.html: duplicate five-folder navigation still present");
}
if (read("en/products/index.html").includes('id="product-photo-library"')) {
  errors.push("en/products/index.html: duplicate five-folder navigation still present");
}

const allDetailHtml = slugs.flatMap((slug) => [
  read(`products/${slug}/index.html`),
  read(`en/products/${slug}/index.html`),
]);
const caseHrefs = allDetailHtml.flatMap((html) =>
  [...html.matchAll(/class="application-case"[\s\S]*?href=/g)].map((match) => match[0]),
);
const sourcePaths = allDetailHtml.flatMap((html) =>
  [...html.matchAll(/<a href="([^"]+)" class="application-case"/g)].map((match) => match[1]),
);
if (sourcePaths.length !== 172) {
  errors.push(`Expected 172 bilingual application-case placements, found ${sourcePaths.length}`);
}
const zhSourcePaths = slugs.flatMap((slug) =>
  [...read(`products/${slug}/index.html`).matchAll(/<a href="([^"]+)" class="application-case"/g)].map(
    (match) => match[1],
  ),
);
if (zhSourcePaths.length !== 86 || new Set(zhSourcePaths).size !== 86) {
  errors.push(
    `Chinese photo coverage must be 86/86 unique; found ${zhSourcePaths.length}/${new Set(zhSourcePaths).size}`,
  );
}

for (const file of ["rfq/index.html", "en/rfq/index.html"]) {
  const html = read(file);
  if (!html.includes('action="/teamstar-website-review/api/rfq"')) {
    errors.push(`${file}: RFQ action is not isolated under the static review-mirror path`);
  }
  if (/action="https?:\/\/(?:www\.)?teamstarmfg\.com/i.test(html)) {
    errors.push(`${file}: production RFQ endpoint detected`);
  }
}

if (caseHrefs.length !== 172) {
  errors.push(`Application-case anchor parsing mismatch: ${caseHrefs.length}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  "Unified taxonomy check passed: 6 linked cards, 12 category pages, 86/86 unique photographs per locale, approved customer-facing copy, legacy five-folder navigation removed, review safeguards retained.",
);
