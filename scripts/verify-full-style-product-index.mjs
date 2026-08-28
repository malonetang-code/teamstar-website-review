import { readFileSync } from "node:fs";

const variants = ["a", "b", "c", "d"];
const pages = variants.flatMap((variant) => [
  `full-style-preview/${variant}/index.html`,
  `full-style-preview/${variant}/en/index.html`,
]);

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const section = html.match(
    /<section class="section home-product-section home-product-index" id="product-directory">([\s\S]*?)<\/section>/,
  );

  if (!section) throw new Error(`${page}: compact product index is missing`);
  if (!html.includes("/full-style-preview/product-index-compact.css")) {
    throw new Error(`${page}: compact product index stylesheet is missing`);
  }

  const content = section[1];
  const cards = content.match(/<article class="blade-card(?: product-pending-card)?">/g) ?? [];
  const links = content.match(/class="blade-card-link"/g) ?? [];
  const pending = content.match(/class="blade-card product-pending-card"/g) ?? [];

  if (cards.length !== 8) throw new Error(`${page}: expected 8 product entries, found ${cards.length}`);
  if (links.length !== 6) throw new Error(`${page}: expected 6 linked photographed entries, found ${links.length}`);
  if (pending.length !== 2) throw new Error(`${page}: expected 2 restrained photo placeholders, found ${pending.length}`);
  if (/资料补充中|实拍补充中|Product information and photography pending|Product photo pending/.test(content)) {
    throw new Error(`${page}: internal pending-status copy is visible in product index source`);
  }
}

const css = readFileSync("full-style-preview/product-index-compact.css", "utf8");
for (const required of [
  ".home-product-index > .container",
  "grid-template-columns: repeat(2, minmax(0, 1fr))",
  "@media (max-width: 639px)",
  "@media (prefers-reduced-motion: reduce)",
]) {
  if (!css.includes(required)) throw new Error(`compact product index CSS missing: ${required}`);
}

console.log("Compact full-style product index verification passed for A/B/C/D in Chinese and English.");
