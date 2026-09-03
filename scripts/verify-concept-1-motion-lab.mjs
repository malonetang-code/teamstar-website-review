import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const html = readFileSync(resolve(root, "full-style-preview/1-motion-lab/index.html"), "utf8");
const css = readFileSync(resolve(root, "full-style-preview/1-motion-lab/motion-lab.css"), "utf8");
const js = readFileSync(resolve(root, "full-style-preview/1-motion-lab/motion-lab.js"), "utf8");

const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

expect(html.includes("noindex,nofollow,noarchive"), "motion lab must remain noindex");
expect((html.match(/id="effect-/g) || []).length === 5, "motion lab must contain five isolated effects");
expect(html.includes("本页为本地效果实验"), "local-only disclosure missing");
expect(css.includes("prefers-reduced-motion: reduce"), "reduced-motion CSS missing");
expect(js.includes('matchMedia("(prefers-reduced-motion: reduce)")'), "reduced-motion JS missing");
expect(js.includes("IntersectionObserver"), "viewport-triggered animation missing");

for (const source of [...html.matchAll(/(?:src|href)="(\/teamstar-review\/[^"?#]+)/g)].map((match) => match[1])) {
  const relative = source.replace(/^\/teamstar-review\//, "");
  expect(existsSync(resolve(root, relative)), `missing local asset: ${source}`);
}

console.log("Concept 1 motion lab verified: five isolated effects, assets, local isolation and reduced motion.");
