import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "20260730-2u";

const productImages = {
  zh: [
    ["crotKizX0J", "木工与家具制造刀具实拍"],
    ["mZaq84W78n", "食品机械用刀实拍"],
    ["VJT2x-HfAY", "塑料粉碎与造粒刀具实拍"],
    ["W8YmneBOMh", "纸品分切与裁切刀具实拍"],
    ["47jYn3TWma", "纺织与服装裁切刀具实拍"],
    ["TTtdzuoFgG", "异型与设备配套刀具实拍"],
  ],
  en: [
    ["crotKizX0J", "Woodworking machine knife"],
    ["mZaq84W78n", "Food processing machine knife"],
    ["VJT2x-HfAY", "Plastic recycling blade"],
    ["W8YmneBOMh", "Paper converting knife"],
    ["47jYn3TWma", "Textile cutting knife"],
    ["TTtdzuoFgG", "Custom industrial blade"],
  ],
};

const homeCopy = {
  zh: {
    eyebrow: "INDUSTRIAL MACHINE KNIVES / MADE TO SPEC",
    h1: "按图、按样制造工业机械刀具",
    intro:
      "面向设备制造商、品牌企业与工业用户。提交图纸、实物样品或设备工况，由工程团队确认刀具结构、材料、制造路线与报价条件。",
    primary: "提交图纸或样品",
    secondary: "浏览产品分类",
    productTitle: "按应用选择刀具",
    productIntro:
      "从设备与被处理材料出发，选择最接近的刀具类别。暂不确定分类时，可直接提交现有资料。",
    routeTitle: "从现有资料开始",
    routeIntro: "图纸、实物样品或设备工况，任一种都可以作为项目评估的起点。",
    systemTitle: "从材料确认到最终检验",
    systemIntro:
      "制造路线围绕刀具结构与验收要求制定，覆盖材料确认、刀坯成形、热处理、机加工、精密研磨和检测。",
    qualityTitle: "材料、尺寸与硬度检验",
    factoryTitle: "真实的生产基地与制造现场",
  },
  en: {
    eyebrow: "INDUSTRIAL MACHINE KNIVES / MADE TO SPEC",
    h1: "Industrial Machine Knives Made to Drawing or Sample",
    intro:
      "For OEMs, brands and industrial users. Share a drawing, physical sample or application details; our engineering team reviews blade geometry, material, manufacturing route and quotation requirements.",
    primary: "Send a Drawing or Sample",
    secondary: "Browse Blade Categories",
    productTitle: "Find the Right Blade by Application",
    productIntro:
      "Start with the machine and material being cut. Select the closest blade category, or send the information already available.",
    routeTitle: "Start With What You Have",
    routeIntro:
      "A drawing, physical sample or application details can each begin the technical review.",
    systemTitle: "From Material Review to Final Inspection",
    systemIntro:
      "The manufacturing route is defined around blade geometry and acceptance requirements, from material review and heat treatment to machining, precision grinding and inspection.",
    qualityTitle: "Material, Dimension and Hardness Inspection",
    factoryTitle: "Our Manufacturing Base and Production Floor",
  },
};

function homeH1(language) {
  return language === "zh"
    ? "<h1><span>按图、按样制造</span><span>工业机械刀具</span></h1>"
    : "<h1><span>Industrial Machine Knives</span> <span>Made to Drawing or Sample</span></h1>";
}

async function htmlFiles(directory) {
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

function replaceOnce(html, before, after, label) {
  if (!html.includes(before)) {
    throw new Error(`Could not find ${label}`);
  }
  return html.replace(before, after);
}

function productMedia([stem, alt]) {
  return ` <figure class="benchmark-card-media"> <picture><source srcset="/teamstar-website-review/img/${stem}-320.avif 320w, /teamstar-website-review/img/${stem}-640.avif 640w, /teamstar-website-review/img/${stem}-960.avif 960w" type="image/avif" sizes="(min-width: 1080px) 32vw, (min-width: 600px) 48vw, 100vw"><source srcset="/teamstar-website-review/img/${stem}-320.webp 320w, /teamstar-website-review/img/${stem}-640.webp 640w, /teamstar-website-review/img/${stem}-960.webp 960w" type="image/webp" sizes="(min-width: 1080px) 32vw, (min-width: 600px) 48vw, 100vw"><img alt="${alt}" decoding="async" height="720" loading="lazy" src="/teamstar-website-review/img/${stem}-640.jpeg" width="960" srcset="/teamstar-website-review/img/${stem}-320.jpeg 320w, /teamstar-website-review/img/${stem}-640.jpeg 640w, /teamstar-website-review/img/${stem}-960.jpeg 960w" sizes="(min-width: 1080px) 32vw, (min-width: 600px) 48vw, 100vw"></picture></figure>`;
}

function addProductMedia(html, language) {
  if (html.includes("benchmark-card-media")) return html;
  let index = 0;
  return html.replace(
    /(<article class="product-card product-card-no-media">[\s\S]*?<\/a>) <div class="product-card-body">/g,
    (match, opening) => {
      const image = productImages[language][index];
      if (!image || index >= 6) return match;
      index += 1;
      return `${opening}${productMedia(image)} <div class="product-card-body">`;
    },
  );
}

function replaceHomeHero(html) {
  const picture = `<picture class="benchmark-hero-picture"><source srcset="/teamstar-website-review/img/iSsU_nnhav-640.avif 640w, /teamstar-website-review/img/iSsU_nnhav-960.avif 960w, /teamstar-website-review/img/iSsU_nnhav-1440.avif 1440w, /teamstar-website-review/img/iSsU_nnhav-1920.avif 1920w" type="image/avif" sizes="100vw"><source srcset="/teamstar-website-review/img/iSsU_nnhav-640.webp 640w, /teamstar-website-review/img/iSsU_nnhav-960.webp 960w, /teamstar-website-review/img/iSsU_nnhav-1440.webp 1440w, /teamstar-website-review/img/iSsU_nnhav-1920.webp 1920w" type="image/webp" sizes="100vw"><img alt="" class="hero-media" decoding="async" fetchpriority="high" height="1080" loading="eager" sizes="100vw" src="/teamstar-website-review/img/iSsU_nnhav-1440.jpeg" srcset="/teamstar-website-review/img/iSsU_nnhav-640.jpeg 640w, /teamstar-website-review/img/iSsU_nnhav-960.jpeg 960w, /teamstar-website-review/img/iSsU_nnhav-1440.jpeg 1440w, /teamstar-website-review/img/iSsU_nnhav-1920.jpeg 1920w" width="1920"></picture>`;
  const expression =
    /(<section class="home-hero">)\s*<picture>[\s\S]*?<\/picture>\s*(<div class="container hero-inner">)/;
  if (!expression.test(html)) {
    throw new Error("Could not find home hero picture");
  }
  return html.replace(expression, `$1 ${picture} $2`);
}

function updateHome(html, language) {
  const copy = homeCopy[language];
  html = html.replace(`<h1>${copy.h1}</h1>`, homeH1(language));
  if (language === "zh") {
    html = html.replace(
      "<h2>三种项目资料入口</h2>",
      `<h2>${copy.routeTitle}</h2>`,
    );
    html = html.replace(
      "<strong>3</strong><span>从现有资料开始</span>",
      "<strong>3</strong><span>图纸 / 样品 / 工况</span>",
    );
  } else {
    html = html.replace(
      "<h2>Three ways to start an RFQ</h2>",
      `<h2>${copy.routeTitle}</h2>`,
    );
    html = html.replace(
      /<strong>3<\/strong>\s*<span>(?:Start With What You Have|Technical review entry paths)<\/span>/,
      "<strong>3</strong><span>Drawing / sample / application</span>",
    );
  }
  if (
    html.includes("benchmark-card-media") &&
    html.includes(language === "en" ? "<h1>Custom industrial machine knives</h1>" : "<h1>定制工业机械刀具</h1>")
  ) {
    html = html.replace(
      language === "en"
        ? "<h1>Custom industrial machine knives</h1>"
        : "<h1>定制工业机械刀具</h1>",
      homeH1(language),
    );
  }
  if (
    html.includes(homeH1(language)) &&
    html.includes("benchmark-card-media")
  ) {
    return html;
  }
  html = replaceHomeHero(html);
  const replacements =
    language === "zh"
      ? [
          ["CUSTOM INDUSTRIAL MACHINE KNIVES / 01", copy.eyebrow],
          ["<h1>定制工业机械刀具</h1>", homeH1(language)],
          [
            "根据图纸、实物样品或设备工况制造工业机械刀具。工程团队评估刀具结构、被处理材料、制造工艺、数量与验收要求，并据此提供报价。",
            copy.intro,
          ],
          ["提交项目资料", copy.primary],
          ["按应用查找产品", copy.secondary],
          ["工业机械刀具产品分类", copy.productTitle],
          [
            "按设备应用和被处理材料选择最接近的产品类别；无法确定分类时，可直接提交现有资料。",
            copy.productIntro,
          ],
          ["三种项目资料入口", copy.routeTitle],
          ["图纸、实物样品或设备工况均可作为技术询价的起点。", copy.routeIntro],
          ["制造工艺与质量控制", copy.systemTitle],
          [
            "从材料确认、刀坯成形到热处理、机加工、精密研磨和检测，工艺路线围绕刀具结构与验收要求制定。",
            copy.systemIntro,
          ],
          ["制造全过程质量控制", copy.qualityTitle],
          ["集团制造体系与漳州生产基地", copy.factoryTitle],
        ]
      : [
          ["CUSTOM INDUSTRIAL MACHINE KNIVES / 01", copy.eyebrow],
          [
            "<h1>Custom industrial machine knives</h1>",
            homeH1(language),
          ],
          [
            "Industrial machine knives manufactured from drawings, physical samples or documented machine applications. Our engineering team reviews blade geometry, processed material, manufacturing route, quantity and acceptance criteria before preparing a quotation.",
            copy.intro,
          ],
          ["Send project information", copy.primary],
          ["Find products by application", copy.secondary],
          ["Industrial machine knives by application", copy.productTitle],
          [
            "Choose the closest product category by machine application and processed material, or send the information available if the category is unclear.",
            copy.productIntro,
          ],
          ["Three ways to start an RFQ", copy.routeTitle],
          [
            "A drawing, physical sample or documented machine application can each start a technical RFQ.",
            copy.routeIntro,
          ],
          ["Manufacturing processes and quality controls", copy.systemTitle],
          [
            "From material verification and blank shaping to heat treatment, machining, precision grinding and inspection, the manufacturing route follows blade geometry and acceptance criteria.",
            copy.systemIntro,
          ],
          ["Quality control throughout manufacturing", copy.qualityTitle],
          [
            "Group manufacturing experience and the Zhangzhou production base",
            copy.factoryTitle,
          ],
        ];

  for (const [before, after] of replacements) {
    html = replaceOnce(html, before, after, `home copy: ${before}`);
  }
  return addProductMedia(html, language);
}

for (const file of await htmlFiles(root)) {
  let html = await readFile(file, "utf8");
  const relative = path.relative(root, file);
  const language = relative.startsWith(`en${path.sep}`) ? "en" : "zh";

  if (!html.includes("benchmark.css")) {
    html = html.replace(
      "</head>",
      ` <link href="/teamstar-website-review/assets/css/benchmark.css?v=${version}" rel="stylesheet"></head>`,
    );
  }

  if (!html.includes("benchmark-york-yishi")) {
    html = html.replace(
      /<body class="([^"]*)">/,
      (_match, classes) =>
        `<body class="${classes} benchmark-york-yishi">`,
    );
  }

  if (relative === "index.html" || relative === path.join("en", "index.html")) {
    html = updateHome(html, language);
  } else if (
    relative === path.join("products", "index.html") ||
    relative === path.join("en", "products", "index.html")
  ) {
    html = addProductMedia(html, language);
  }

  await writeFile(file, html);
}

await writeFile(
  path.join(root, "REVIEW_BUILD.txt"),
  [
    "Teamstar Website Review Mirror",
    `Version: ${version}`,
    "Direction: York restraint + Yishi RFQ clarity",
    "Production status: NOT DEPLOYED",
    "",
  ].join("\n"),
);

console.log(`Applied ${version} benchmark design to review mirror`);
