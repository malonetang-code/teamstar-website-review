import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "20260729-2r";

const sourceFolders = {
  packaging: {
    zh: "包装类刀片",
    en: "Packaging blades",
    path: "packaging-blades",
    page: "products/gallery/packaging-blades/index.html",
  },
  industrial: {
    zh: "工业机械用刀",
    en: "Industrial machine knives",
    path: "industrial-machine-knives",
    page: "products/gallery/industrial-machine-knives/index.html",
  },
  woodworking: {
    zh: "木工机械刀片",
    en: "Woodworking machine blades",
    path: "woodworking-machine-blades",
    page: "products/gallery/woodworking-machine-blades/index.html",
  },
  sewing: {
    zh: "缝纫类刀片",
    en: "Sewing blades",
    path: "sewing-blades",
    page: "products/gallery/sewing-blades/index.html",
  },
  food: {
    zh: "食品刀片",
    en: "Food blades",
    path: "food-blades",
    page: "products/gallery/food-blades/index.html",
  },
};

const sequence = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, index) => index + start);

const categories = [
  {
    slug: "woodworking-knives",
    zhTitle: "木工与家具制造刀具",
    enTitle: "Woodworking and furniture machine knives",
    assignments: [{ source: "woodworking", indexes: sequence(1, 9) }],
  },
  {
    slug: "food-processing-knives",
    zhTitle: "食品机械用刀",
    enTitle: "Food processing machine knives",
    assignments: [{ source: "food", indexes: sequence(1, 22) }],
  },
  {
    slug: "plastic-crusher-blades",
    zhTitle: "塑料粉碎与造粒刀具",
    enTitle: "Plastic crusher and granulator knives",
    assignments: [{ source: "industrial", indexes: [6, 14, 19] }],
  },
  {
    slug: "paper-slitting-knives",
    zhTitle: "纸品分切与裁切刀具",
    enTitle: "Paper slitting and cutting knives",
    assignments: [
      {
        source: "packaging",
        indexes: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      },
      { source: "industrial", indexes: [1, 2, 5, 15, 16, 17] },
    ],
  },
  {
    slug: "textile-cutting-knives",
    zhTitle: "纺织与服装裁切刀具",
    enTitle: "Textile and apparel cutting knives",
    assignments: [{ source: "sewing", indexes: sequence(1, 14) }],
  },
  {
    slug: "custom-industrial-blades",
    zhTitle: "异型与设备配套刀具",
    enTitle: "Custom and machine-specific blades",
    assignments: [
      { source: "packaging", indexes: [7, 21, 22] },
      { source: "industrial", indexes: [3, 4, 7, 8, 9, 10, 11, 12, 13, 18] },
    ],
  },
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, contents) {
  fs.writeFileSync(path.join(root, relativePath), contents);
}

function parseSourceItems(sourceKey) {
  const source = sourceFolders[sourceKey];
  const html = read(source.page);
  const pattern =
    /<a href="([^"]*\/images\/web\/product-library-20260722\/[^"]+)" class="photo-gallery-item"[^>]*>[\s\S]*?<\/a>/g;
  const matches = [...html.matchAll(pattern)];

  if (matches.length === 0) {
    throw new Error(`No gallery items found in ${source.page}`);
  }

  return matches.map((match, index) => {
    const picture = match[0].match(/<picture>[\s\S]*?<\/picture>/)?.[0];
    if (!picture) {
      throw new Error(`Missing picture for ${source.page} item ${index + 1}`);
    }
    return {
      source: sourceKey,
      sourceIndex: index + 1,
      href: match[1],
      filename: decodeURIComponent(path.basename(match[1])),
      picture,
    };
  });
}

const sourceItems = Object.fromEntries(
  Object.keys(sourceFolders).map((key) => [key, parseSourceItems(key)]),
);

function assignedItems(category) {
  return category.assignments.flatMap(({ source, indexes }) =>
    indexes.map((index) => {
      const item = sourceItems[source][index - 1];
      if (!item) {
        throw new Error(`Missing ${source} source item ${index}`);
      }
      return item;
    }),
  );
}

function renderCase(item, displayIndex, locale, categoryTitle) {
  const source = sourceFolders[item.source];
  const number = String(displayIndex + 1).padStart(2, "0");
  const alt =
    locale === "zh"
      ? `${categoryTitle}过往相似产品实拍案例 ${number}`
      : `${categoryTitle} previous similar-product case ${number}`;
  const picture = item.picture
    .replace(/alt="[^"]*"/, `alt="${alt}"`)
    .replace(/loading="eager"/, displayIndex < 4 ? `loading="eager"` : `loading="lazy"`);
  const caseLabel = locale === "zh" ? `实拍案例 ${number}` : `Previous case ${number}`;
  const sourceLabel =
    locale === "zh"
      ? `来源标签：${source.zh} / ${item.filename}`
      : `Source label: ${source.en} / ${item.filename}`;

  return `<a href="${item.href}" class="application-case" aria-label="${alt}" rel="noopener" target="_blank">${picture}<span class="application-case-copy"><strong>${caseLabel}</strong><small>${sourceLabel}</small></span></a>`;
}

function renderCaseSection(category, locale) {
  const items = assignedItems(category);
  const title = locale === "zh" ? category.zhTitle : category.enTitle;
  const sourceLabels = category.assignments
    .map(({ source }) => sourceFolders[source][locale])
    .filter((label, index, all) => all.indexOf(label) === index);
  const eyebrow = locale === "zh" ? "REAL PRODUCT CASES" : "REAL PRODUCT CASES";
  const heading = locale === "zh" ? "过往相似产品实拍案例" : "Previous similar-product photo cases";
  const intro =
    locale === "zh"
      ? "以下均为真实过往产品照片，已按当前六类应用归入本页。原文件夹名称与文件名仅作为来源标签保留；具体适配仍需依据图纸、样品、设备与工况确认。"
      : "These are real photographs of previous products, reassigned to the current six application categories. Original folder names and filenames are retained only as source labels; exact suitability still requires drawings, samples, machine information and operating conditions.";
  const countLabel = locale === "zh" ? `${items.length} 张真实照片` : `${items.length} real photographs`;
  const sourceLabel =
    locale === "zh"
      ? `来源文件夹：${sourceLabels.join("、")}`
      : `Source folders: ${sourceLabels.join(", ")}`;
  const cases = items.map((item, index) => renderCase(item, index, locale, title)).join(" ");

  return `<section class="section application-cases" id="similar-product-cases"><div class="container"><div class="section-head application-cases-head"><div><span class="eyebrow">${eyebrow}</span><h2>${heading}</h2></div><p>${intro}</p></div><div class="application-case-summary"><strong>${countLabel}</strong><span>${sourceLabel}</span></div><div class="application-case-grid">${cases}</div></div></section>`;
}

function insertAfterHero(html, section) {
  if (html.includes('id="similar-product-cases"')) {
    return html;
  }
  const match = html.match(/<main id="main-content"> <section class="page-hero"[\s\S]*?<\/section>/);
  if (!match) {
    throw new Error("Unable to locate product detail hero");
  }
  return html.replace(match[0], `${match[0]} ${section}`);
}

function removeLegacyPhotoNavigation(html) {
  return html.replace(
    / <section class="section" id="product-photo-library">[\s\S]*?<\/section>/,
    "",
  );
}

function addCardHitAreas(html, locale) {
  return html.replace(
    /<article class="product-card([^"]*)">([\s\S]*?)<\/article>/g,
    (whole, classSuffix, body) => {
      if (body.includes("product-card-hit-area")) {
        return whole;
      }
      const href = body.match(
        /href="(\/teamstar-website-review\/(?:en\/)?products\/(?!gallery\/)[^"]+\/)"/,
      )?.[1];
      const heading = body
        .match(/<h3>([\s\S]*?)<\/h3>/)?.[1]
        ?.replace(/<[^>]+>/g, "")
        .trim();
      if (!href || !heading) {
        throw new Error("Unable to resolve product card destination");
      }
      const label = locale === "zh" ? `打开${heading}分类页` : `Open ${heading} category page`;
      return `<article class="product-card${classSuffix}"><a href="${href}" class="product-card-hit-area" aria-label="${label}"></a>${body}</article>`;
    },
  );
}

function updateChineseProductsIndex(html) {
  return removeLegacyPhotoNavigation(
    html
      .replace(
        /<p>产品按行业、设备与典型应用分类。制造评估以图纸、实物样品、设备型号和工况资料为依据。<\/p>/,
        "<p>产品按行业、设备与典型类型分类。</p>",
      )
      .replace("<h2>选择最接近的设备与应用</h2>", "<h2>刀具分类</h2>")
      .replace(
        /<\/div> <p>(?:请先选择最接近的分类；进入详情页后可按图纸、实物样品或工况资料启动询价。|启动询价无需先确定准确分类。请选择最接近的设备类型和被处理材料，再提交现有图纸、样品或工况资料。)<\/p> <\/div>/,
        "</div> </div>",
      ),
  );
}

function updateEnglishProductsIndex(html) {
  return removeLegacyPhotoNavigation(
    html
      .replace(
        /<p>Products are classified by industry, equipment and typical application\. Manufacturing review is based on drawings, physical samples, machine information and operating requirements\.<\/p>/,
        "<p>Products are classified by industry, equipment and typical type.</p>",
      )
      .replace("<h2>Choose the closest equipment application</h2>", "<h2>Knife categories</h2>")
      .replace(
        /<\/div> <p>(?:Select the closest category first; each detail page then provides drawing, sample and application-based RFQ paths\.|You do not need to identify the exact category before starting an RFQ\. Choose the nearest equipment type and processed material, then submit the drawings, sample or application information currently available\.)<\/p> <\/div>/,
        "</div> </div>",
      ),
  );
}

for (const category of categories) {
  const zhPath = `products/${category.slug}/index.html`;
  const enPath = `en/products/${category.slug}/index.html`;
  write(zhPath, insertAfterHero(read(zhPath), renderCaseSection(category, "zh")));
  write(enPath, insertAfterHero(read(enPath), renderCaseSection(category, "en")));
}

write("products/index.html", addCardHitAreas(updateChineseProductsIndex(read("products/index.html")), "zh"));
write(
  "en/products/index.html",
  addCardHitAreas(updateEnglishProductsIndex(read("en/products/index.html")), "en"),
);
write("index.html", addCardHitAreas(read("index.html"), "zh"));
write("en/index.html", addCardHitAreas(read("en/index.html"), "en"));

const extraCss =
  '.product-card{position:relative}.product-card-hit-area{position:absolute;inset:0;z-index:1;cursor:pointer}.product-card h3 a,.product-card .text-link{position:relative;z-index:2}.product-card:has(.product-card-hit-area):focus-within{outline:3px solid var(--accent);outline-offset:3px}.application-cases{border-top:4px solid var(--accent);background:#f7f8f6}.application-cases-head{margin-bottom:22px}.application-case-summary{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 20px;margin-bottom:18px;padding:14px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);font-size:12px}.application-case-summary strong{color:var(--accent)}.application-case-summary span{color:var(--muted)}.application-case-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.application-case{min-width:0;overflow:hidden;border:1px solid var(--line);background:#fff;color:var(--ink);transition:border-color 180ms,box-shadow 180ms}.application-case:hover{border-color:var(--accent);box-shadow:0 8px 22px rgba(16,24,29,.09)}.application-case:focus-visible{outline:3px solid var(--accent);outline-offset:2px}.application-case picture{display:block;aspect-ratio:4/3;background:#dfe4e2}.application-case img{width:100%;height:100%;display:block;object-fit:contain}.application-case-copy{min-width:0;display:block;padding:11px 12px}.application-case-copy strong,.application-case-copy small{display:block}.application-case-copy strong{font-size:12px}.application-case-copy small{margin-top:4px;overflow-wrap:anywhere;color:var(--muted);font-size:9px;line-height:1.4}@media (min-width:600px){.application-case-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (min-width:1080px){.application-case-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}';
const cssPath = "assets/css/site.css";
let css = read(cssPath);
if (!css.includes(".application-case-grid{")) {
  css = `${css}\n${extraCss}\n`;
  write(cssPath, css);
}

const changedHtmlPaths = [
  "index.html",
  "en/index.html",
  "products/index.html",
  "en/products/index.html",
  ...categories.flatMap(({ slug }) => [
    `products/${slug}/index.html`,
    `en/products/${slug}/index.html`,
  ]),
];
for (const htmlPath of changedHtmlPaths) {
  const html = read(htmlPath);
  write(
    htmlPath,
    html.replace(/v=20260729-2q/g, `v=${version}`).replace(/[ \t]+$/gm, ""),
  );
}

write(
  "REVIEW_BUILD.txt",
  `Teamstar website review mirror\nVersion: ${version}\nBase path: /teamstar-website-review/\nProduction form submission: disabled in this static review mirror\n`,
);

const assigned = categories.flatMap((category) =>
  assignedItems(category).map((item) => `${item.source}/${item.sourceIndex}`),
);
const expected = Object.values(sourceItems).reduce((total, items) => total + items.length, 0);
if (assigned.length !== expected || new Set(assigned).size !== expected) {
  throw new Error(
    `Photo assignment coverage failed: assigned=${assigned.length}, unique=${new Set(assigned).size}, expected=${expected}`,
  );
}

console.log(
  `Unified six-category taxonomy written: ${categories.length} categories, ${assigned.length}/${expected} unique real photographs, version ${version}.`,
);
