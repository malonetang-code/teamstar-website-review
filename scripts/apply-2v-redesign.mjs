import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "20260730-2v";
const base = "/teamstar-website-review";

const products = {
  zh: [
    {
      stem: "crotKizX0J",
      slug: "woodworking-knives",
      name: "木工刀具",
      alt: "木工机械刀具实拍",
      summary: "用于刨切、指接、裁板及家具生产设备",
    },
    {
      stem: "mZaq84W78n",
      slug: "food-processing-knives",
      name: "食品加工刀具",
      alt: "食品加工机械刀具实拍",
      summary: "用于肉类、食品分切和包装前处理设备",
    },
    {
      stem: "kDD9SWMj0H",
      slug: "plastic-crusher-blades",
      name: "塑料回收刀具",
      alt: "塑料回收机械刀具实拍",
      summary: "用于粉碎机、破碎机、造粒机及回收线",
    },
    {
      stem: "W8YmneBOMh",
      slug: "paper-slitting-knives",
      name: "纸品分切刀具",
      alt: "纸品分切机械刀具实拍",
      summary: "用于纸张、纸板和卷材的分切、修边与裁切",
    },
    {
      stem: "47jYn3TWma",
      slug: "textile-cutting-knives",
      name: "纺织服装刀具",
      alt: "纺织服装机械刀具实拍",
      summary: "用于裁床、圆刀机、缝纫和自动裁剪设备",
    },
    {
      stem: "TTtdzuoFgG",
      slug: "custom-industrial-blades",
      name: "异型及配套刀具",
      alt: "异型工业机械刀具实拍",
      summary: "按图纸或样品制造非标刀具和设备配套件",
    },
  ],
  en: [
    {
      stem: "crotKizX0J",
      slug: "woodworking-knives",
      name: "Woodworking Knives",
      alt: "Woodworking machine knife",
      summary: "For planing, finger-jointing, panel and furniture equipment",
    },
    {
      stem: "mZaq84W78n",
      slug: "food-processing-knives",
      name: "Food Processing Knives",
      alt: "Food processing machine knife",
      summary: "For slicing, portioning and pre-packaging equipment",
    },
    {
      stem: "kDD9SWMj0H",
      slug: "plastic-crusher-blades",
      name: "Plastic Recycling Knives",
      alt: "Plastic recycling machine knife",
      summary: "For crushers, granulators and recycling lines",
    },
    {
      stem: "W8YmneBOMh",
      slug: "paper-slitting-knives",
      name: "Paper Converting Knives",
      alt: "Paper converting machine knife",
      summary: "For slitting, trimming and cutting paper, board and web materials",
    },
    {
      stem: "47jYn3TWma",
      slug: "textile-cutting-knives",
      name: "Textile Cutting Knives",
      alt: "Textile cutting machine knife",
      summary: "For cutting tables, rotary cutters and sewing equipment",
    },
    {
      stem: "TTtdzuoFgG",
      slug: "custom-industrial-blades",
      name: "Custom Machine Knives",
      alt: "Custom industrial machine knife",
      summary: "Made to drawing or sample for non-standard equipment",
    },
  ],
};

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

function extractBalancedDiv(html, marker) {
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`Could not find ${marker}`);

  const token = /<div\b|<\/div>/g;
  token.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = token.exec(html))) {
    depth += match[0] === "</div>" ? -1 : 1;
    if (depth === 0) return html.slice(start, token.lastIndex);
  }
  throw new Error(`Could not balance ${marker}`);
}

function productPicture(item, className = "") {
  const sizes =
    "(min-width: 1080px) 30vw, (min-width: 600px) 48vw, 100vw";
  return `<picture><source srcset="${base}/img/${item.stem}-320.avif 320w, ${base}/img/${item.stem}-640.avif 640w, ${base}/img/${item.stem}-960.avif 960w" type="image/avif" sizes="${sizes}"><source srcset="${base}/img/${item.stem}-320.webp 320w, ${base}/img/${item.stem}-640.webp 640w, ${base}/img/${item.stem}-960.webp 960w" type="image/webp" sizes="${sizes}"><img alt="${item.alt}" class="${className}" decoding="async" height="720" loading="lazy" sizes="${sizes}" src="${base}/img/${item.stem}-640.jpeg" srcset="${base}/img/${item.stem}-320.jpeg 320w, ${base}/img/${item.stem}-640.jpeg 640w, ${base}/img/${item.stem}-960.jpeg 960w" width="960"></picture>`;
}

function heroPicture() {
  return `<picture class="home-hero-picture"><source srcset="${base}/img/iSsU_nnhav-640.avif 640w, ${base}/img/iSsU_nnhav-960.avif 960w, ${base}/img/iSsU_nnhav-1440.avif 1440w, ${base}/img/iSsU_nnhav-1920.avif 1920w" type="image/avif" sizes="100vw"><source srcset="${base}/img/iSsU_nnhav-640.webp 640w, ${base}/img/iSsU_nnhav-960.webp 960w, ${base}/img/iSsU_nnhav-1440.webp 1440w, ${base}/img/iSsU_nnhav-1920.webp 1920w" type="image/webp" sizes="100vw"><img alt="" class="hero-media" decoding="async" fetchpriority="high" height="1080" loading="eager" sizes="100vw" src="${base}/img/iSsU_nnhav-1440.jpeg" srcset="${base}/img/iSsU_nnhav-640.jpeg 640w, ${base}/img/iSsU_nnhav-960.jpeg 960w, ${base}/img/iSsU_nnhav-1440.jpeg 1440w, ${base}/img/iSsU_nnhav-1920.jpeg 1920w" width="1920"></picture>`;
}

function factoryPicture(alt) {
  return `<picture><source srcset="${base}/img/6-6uVLfQnG-640.avif 640w, ${base}/img/6-6uVLfQnG-960.avif 960w, ${base}/img/6-6uVLfQnG-1440.avif 1440w" type="image/avif" sizes="(min-width: 768px) 50vw, 100vw"><source srcset="${base}/img/6-6uVLfQnG-640.webp 640w, ${base}/img/6-6uVLfQnG-960.webp 960w, ${base}/img/6-6uVLfQnG-1440.webp 1440w" type="image/webp" sizes="(min-width: 768px) 50vw, 100vw"><img alt="${alt}" decoding="async" height="810" loading="lazy" src="${base}/img/6-6uVLfQnG-960.jpeg" width="1440"></picture>`;
}

function bladeCards(language) {
  const prefix = language === "en" ? `${base}/en/products` : `${base}/products`;
  return products[language]
    .map(
      (item, index) => `
        <article class="blade-card">
          <a class="blade-card-link" href="${prefix}/${item.slug}/" aria-label="${item.name}"></a>
          <figure class="blade-media">${productPicture(item)}</figure>
          <div class="blade-body">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${item.name}</h3>
            <p>${item.summary}</p>
          </div>
        </article>`,
    )
    .join("");
}

function homeMain(language, logoWall) {
  const en = language === "en";
  const home = en ? `${base}/en` : base;
  const productsUrl = `${home}/products/`;
  const capabilitiesUrl = `${home}/capabilities/`;
  const qualityUrl = `${home}/quality/`;
  const companyUrl = `${home}/company/`;
  const customersUrl = `${home}/customers/`;
  const rfqUrl = `${home}/rfq/`;

  const copy = en
    ? {
        eyebrow: "CUSTOM INDUSTRIAL MACHINE KNIVES",
        h1: "<span>Custom Industrial</span><span>Machine Knives</span>",
        intro:
          "Share a drawing, sample or cutting requirement. Our engineering team reviews geometry, material, process and quantity before quoting.",
        primary: "Send an RFQ",
        secondary: "View Knife Categories",
        facts: [
          ["40+", "Years of group experience"],
          ["ISO", "9001:2015 quality system"],
          ["6", "Application groups"],
          ["3", "Ways to start an RFQ"],
        ],
        productsEyebrow: "PRODUCTS",
        productsTitle: "Industrial Knives We Manufacture",
        productsIntro:
          "Choose the closest application. Every category can be made to drawing or sample.",
        allProducts: "View All Products",
        routesEyebrow: "START AN RFQ",
        routesTitle: "Start With What You Have",
        routesIntro:
          "A complete drawing is helpful, but it is not required to begin.",
        routes: [
          ["01", "Drawing", "Dimensions, tolerances, material and quantity"],
          ["02", "Sample", "An old knife or clear photographs from several angles"],
          ["03", "Application", "Machine, material being cut and the current problem"],
        ],
        routeButton: "Prepare RFQ Information",
        processEyebrow: "MANUFACTURING",
        processTitle: "From Material to Cutting Edge",
        processIntro:
          "The manufacturing route follows the blade design and agreed inspection requirements.",
        stages: [
          ["01", "Material and heat treatment"],
          ["02", "Machining and precision grinding"],
          ["03", "In-process and final inspection"],
          ["04", "Edge protection and packing"],
        ],
        processButton: "View Manufacturing Process",
        proofEyebrow: "PRODUCTION AND QUALITY",
        proofTitle: "Manufacturing Evidence You Can Review",
        qualityTitle: "Inspection",
        qualityText:
          "Material, dimensions, hardness and edge condition are checked against the drawing and acceptance criteria.",
        factoryTitle: "Zhangzhou Base",
        factoryText:
          "The Zhangzhou base manufactures and inspects industrial machine knives. All site photographs show the actual facility.",
        qualityButton: "View Quality Control",
        companyButton: "View Company",
        customersEyebrow: "REFERENCES",
        customersTitle: "Brand and Equipment References",
        customersIntro:
          "Reference logos are shown in their original brand colours.",
        customersButton: "View References",
        ctaEyebrow: "RFQ",
        ctaTitle: "Send a Drawing, Sample or Application",
        ctaText:
          "We review the available information and identify what is still needed for quotation.",
        ctaButton: "Start an RFQ",
      }
    : {
        eyebrow: "CUSTOM INDUSTRIAL MACHINE KNIVES",
        h1: "<span>按图、按样定制</span><span>工业机械刀具</span>",
        intro:
          "提供图纸、样品或切割要求。工程团队确认刀型、材料、工艺和数量后报价。",
        primary: "提交询价资料",
        secondary: "查看刀具分类",
        facts: [
          ["40+", "集团刀具行业经验"],
          ["ISO", "9001:2015 质量体系"],
          ["6", "六类应用产品"],
          ["3", "三种询价方式"],
        ],
        productsEyebrow: "PRODUCTS",
        productsTitle: "我们制造的刀具",
        productsIntro: "选择最接近的应用类别，均可按图纸或样品定制。",
        allProducts: "查看全部产品",
        routesEyebrow: "START AN RFQ",
        routesTitle: "三种方式开始询价",
        routesIntro: "完整图纸有助于评估，但不是开始询价的必要条件。",
        routes: [
          ["01", "提交图纸", "尺寸、公差、材料和数量"],
          ["02", "提供样品", "旧刀实物或多个角度的清晰照片"],
          ["03", "说明工况", "设备、切割材料和当前问题"],
        ],
        routeButton: "准备询价资料",
        processEyebrow: "MANUFACTURING",
        processTitle: "从材料到刃口",
        processIntro: "制造路线依据刀具结构和双方确认的检验要求制定。",
        stages: [
          ["01", "材料确认与热处理"],
          ["02", "机加工与精密研磨"],
          ["03", "过程检验与最终检验"],
          ["04", "刃口防护与包装"],
        ],
        processButton: "查看制造工序",
        proofEyebrow: "PRODUCTION AND QUALITY",
        proofTitle: "可核验的制造与质量能力",
        qualityTitle: "检测能力",
        qualityText:
          "按图纸与验收要求，确认材料、尺寸、硬度和刃口状态。",
        factoryTitle: "漳州生产基地",
        factoryText:
          "漳州基地承担工业机械刀具制造与检验，页面照片均为厂区实景。",
        qualityButton: "查看质量控制",
        companyButton: "查看公司",
        customersEyebrow: "REFERENCES",
        customersTitle: "合作品牌与设备参考",
        customersIntro: "参考标识保留原品牌颜色，不作灰度处理。",
        customersButton: "查看合作参考",
        ctaEyebrow: "RFQ",
        ctaTitle: "提交图纸、样品或工况",
        ctaText: "我们根据现有资料确认制造条件和报价所需信息。",
        ctaButton: "开始询价",
      };

  return `<main id="main-content">
    <section class="home-hero">
      ${heroPicture()}
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="eyebrow">${copy.eyebrow}</span>
          <h1>${copy.h1}</h1>
          <p>${copy.intro}</p>
          <div class="hero-actions">
            <a href="${rfqUrl}" class="button button-accent">${copy.primary}</a>
            <a href="#product-directory" class="button button-outline">${copy.secondary}</a>
          </div>
        </div>
      </div>
      <div class="proof-rail">
        <div class="container proof-rail-grid">
          ${copy.facts
            .map(
              ([value, label]) =>
                `<div class="proof-rail-item"><strong>${value}</strong><span>${label}</span></div>`,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section" id="product-directory">
      <div class="container">
        <div class="section-head section-head-compact">
          <div><span class="eyebrow">${copy.productsEyebrow}</span><h2>${copy.productsTitle}</h2></div>
          <p>${copy.productsIntro}</p>
        </div>
        <div class="blade-grid">${bladeCards(language)}</div>
        <div class="section-actions"><a href="${productsUrl}" class="text-link">${copy.allProducts}<span aria-hidden="true">→</span></a></div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container">
        <div class="section-head section-head-compact">
          <div><span class="eyebrow">${copy.routesEyebrow}</span><h2>${copy.routesTitle}</h2></div>
          <p>${copy.routesIntro}</p>
        </div>
        <div class="start-grid">
          ${copy.routes
            .map(
              ([number, title, text]) =>
                `<a href="${rfqUrl}" class="start-item"><b>${number}</b><h3>${title}</h3><p>${text}</p><span aria-hidden="true">→</span></a>`,
            )
            .join("")}
        </div>
        <div class="section-actions"><a href="${rfqUrl}" class="button button-dark">${copy.routeButton}</a></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head section-head-compact">
          <div><span class="eyebrow">${copy.processEyebrow}</span><h2>${copy.processTitle}</h2></div>
          <p>${copy.processIntro}</p>
        </div>
        <div class="manufacturing-layout">
          <figure class="manufacturing-feature">
            <img alt="${en ? "Machining at the Zhangzhou manufacturing base" : "漳州生产基地机加工现场"}" decoding="async" height="720" loading="lazy" src="${base}/images/web/process-20260725/04-machining.jpg" width="1280">
          </figure>
          <div class="manufacturing-stages">
            ${copy.stages
              .map(
                ([number, title]) =>
                  `<div class="manufacturing-stage"><b>${number}</b><span>${title}</span></div>`,
              )
              .join("")}
            <a href="${capabilitiesUrl}" class="text-link">${copy.processButton}<span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container">
        <div class="section-head section-head-compact">
          <div><span class="eyebrow">${copy.proofEyebrow}</span><h2>${copy.proofTitle}</h2></div>
        </div>
        <div class="evidence-grid">
          <article class="evidence-card">
            <figure><img alt="${en ? "KEYENCE image measurement system" : "基恩士影像测量设备"}" decoding="async" height="480" loading="lazy" src="${base}/img/DjfribI31j-720.jpeg" width="720"></figure>
            <div><h3>${copy.qualityTitle}</h3><p>${copy.qualityText}</p><a href="${qualityUrl}" class="text-link">${copy.qualityButton}<span aria-hidden="true">→</span></a></div>
          </article>
          <article class="evidence-card">
            <figure>${factoryPicture(en ? "Teamstar Zhangzhou manufacturing base" : "群新工业漳州生产基地")}</figure>
            <div><h3>${copy.factoryTitle}</h3><p>${copy.factoryText}</p><a href="${companyUrl}" class="text-link">${copy.companyButton}<span aria-hidden="true">→</span></a></div>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head section-head-compact">
          <div><span class="eyebrow">${copy.customersEyebrow}</span><h2>${copy.customersTitle}</h2></div>
          <p>${copy.customersIntro}</p>
        </div>
        ${logoWall}
        <div class="section-actions"><a href="${customersUrl}" class="text-link">${copy.customersButton}<span aria-hidden="true">→</span></a></div>
      </div>
    </section>

    <section class="rfq-band">
      <div class="container rfq-band-grid">
        <div><span class="eyebrow">${copy.ctaEyebrow}</span><h2>${copy.ctaTitle}</h2></div>
        <p>${copy.ctaText}</p>
        <a href="${rfqUrl}" class="button button-accent">${copy.ctaButton}</a>
      </div>
    </section>
  </main>`;
}

function addCatalogMedia(html, language) {
  if (html.includes("catalog-card-media")) return html;
  let index = 0;
  return html.replace(
    /<article class="product-card product-card-no-media">([\s\S]*?<div class="product-card-body">)/g,
    (match, rest) => {
      const item = products[language][index];
      if (!item || index >= products[language].length) return match;
      index += 1;
      return `<article class="product-card"><figure class="product-image catalog-card-media">${productPicture(item)}</figure>${rest}`;
    },
  );
}

function simplifyCatalogCards(html, language) {
  let index = 0;
  html = html.replace(
    /<dl class="product-card-specs">[\s\S]*?<\/dl>/g,
    (match) => {
      const item = products[language][index];
      if (!item || index >= products[language].length) return match;
      index += 1;
      return `<p class="product-card-summary">${item.summary}</p>`;
    },
  );

  index = 0;
  html = html.replace(
    /(<h3><a href="[^"]+">)[\s\S]*?(<\/a><\/h3>)/g,
    (match, opening, closing) => {
      const item = products[language][index];
      if (!item || index >= products[language].length) return match;
      index += 1;
      return `${opening}${item.name}${closing}`;
    },
  );

  return html.replace(
    language === "en" ? /View products and RFQ details/g : /查看产品与询价资料/g,
    language === "en" ? "View Products" : "查看产品",
  );
}

function replaceAll(html, replacements) {
  for (const [before, after] of replacements) {
    html = html.split(before).join(after);
  }
  return html;
}

const coreCopy = {
  "products/index.html": [
    ["<h1>工业机械刀具产品分类</h1>", "<h1>工业机械刀具</h1>"],
    [
      "产品按木工、食品、塑料回收、纸品分切、纺织服装及设备配套六类应用组织。",
      "六类应用产品，均可按图纸或样品定制。",
    ],
    ["<h2>按应用分类</h2>", "<h2>六类产品</h2>"],
    ["<h2>制造评估关注要点</h2>", "<h2>工程评估要点</h2>"],
  ],
  "capabilities/index.html": [
    ["<h1>工业刀具制造与检测能力</h1>", "<h1>工业刀具制造能力</h1>"],
    [
      "从材料确认、刀坯成形到热处理、机加工、研磨和检验，工艺路线依据刀具结构、图纸与使用条件制定。",
      "材料确认、成形、热处理、机加工、精密研磨、检验和包装。",
    ],
    ["<h2>核心制造与检测能力</h2>", "<h2>制造与检测</h2>"],
    ["<h2>八道制造与质量控制工序</h2>", "<h2>八道制造工序</h2>"],
    ["<h2>漳州基地制造现场</h2>", "<h2>漳州制造现场</h2>"],
  ],
  "quality/index.html": [
    ["<h1>制造全过程质量控制</h1>", "<h1>工业刀具质量控制</h1>"],
    [
      "质量控制贯穿材料确认、制造过程和成品放行，检验项目依据确认版图纸与验收要求制定。",
      "按图纸与验收要求，确认材料、尺寸、硬度、刃口和表面状态。",
    ],
    ["<h2>质量控制流程</h2>", "<h2>质量控制</h2>"],
    [
      "<h2>依据图纸与工艺路线确定检验项目</h2>",
      "<h2>检验项目</h2>",
    ],
    [
      "<h2>材料、硬度、几何与表面检测设备</h2>",
      "<h2>检测设备</h2>",
    ],
  ],
  "company/index.html": [
    ["<h1>群新工业漳州生产基地</h1>", "<h1>群新工业</h1>"],
    [
      "群新工业（漳州）有限公司成立于 2024 年，是伟群制刀工业集团成员企业，开展工业机械刀具的制造与销售业务。",
      "伟群制刀工业集团成员企业，漳州生产基地专注工业机械刀具制造。",
    ],
    ["<h2>集团制造体系</h2>", "<h2>集团与基地</h2>"],
  ],
  "customers/index.html": [
    ["<h1>合作品牌与工业应用参考</h1>", "<h1>合作与应用参考</h1>"],
    [
      "项目通常从设备、被处理材料和现有刀具问题开始，经刀具方案确认与样品验证后进入批量制造。",
      "服务设备制造商、品牌企业和工业用户。具体项目以双方确认资料为准。",
    ],
    ["<h2>项目协作流程</h2>", "<h2>项目协作</h2>"],
  ],
  "rfq/index.html": [
    ["<h1>工业机械刀具技术询价</h1>", "<h1>提交刀具询价</h1>"],
    [
      "图纸、实物样品、旧刀照片或设备工况均可作为询价起点；工程团队收到资料后进行制造可行性与报价评估。",
      "上传图纸不是必选项。图纸、样品照片或工况说明均可作为询价起点。",
    ],
    ["<h2>可以提交的项目资料</h2>", "<h2>可提交的资料</h2>"],
    ["<h2>填写现有项目资料</h2>", "<h2>填写询价资料</h2>"],
    [
      '<h2 id="rfq-guide-title">可以提交的项目资料</h2>',
      '<h2 id="rfq-guide-title">可提交的资料</h2>',
    ],
    ["木工与家具制造刀具</option>", "木工刀具</option>"],
    ["食品机械用刀</option>", "食品加工刀具</option>"],
    ["塑料粉碎与造粒刀具</option>", "塑料回收刀具</option>"],
    ["纸品分切与裁切刀具</option>", "纸品分切刀具</option>"],
    ["纺织与服装裁切刀具</option>", "纺织服装刀具</option>"],
    ["异型与设备配套刀具</option>", "异型及配套刀具</option>"],
    ["发送至 info@teamstarmfg.com", "发送至 rd01@teamstarmfg.com"],
    [
      'href="mailto:info@teamstarmfg.com" class="button button-accent" data-rfq-email=""',
      'href="mailto:rd01@teamstarmfg.com" class="button button-accent" data-rfq-email=""',
    ],
  ],
  "en/products/index.html": [
    [
      "<h1>Industrial machine knives by application</h1>",
      "<h1>Industrial Machine Knives</h1>",
    ],
    [
      "Products are organised into six application groups: woodworking, food processing, plastics recycling, paper converting, textile and machine-specific blades.",
      "Six application groups, all made to drawing or sample.",
    ],
    ["<h2>Categories by application</h2>", "<h2>Six Product Groups</h2>"],
    [
      "<h2>What engineering review considers</h2>",
      "<h2>Engineering Review</h2>",
    ],
  ],
  "en/capabilities/index.html": [
    [
      "<h1>Industrial knife manufacturing and inspection capabilities</h1>",
      "<h1>Industrial Knife Manufacturing</h1>",
    ],
    [
      "From material verification and blank shaping to heat treatment, machining, grinding and inspection, the route is defined around the blade, drawing and application.",
      "Material review, shaping, heat treatment, machining, precision grinding, inspection and packing.",
    ],
    [
      "<h2>Core manufacturing and inspection capabilities</h2>",
      "<h2>Manufacturing and Inspection</h2>",
    ],
    [
      "<h2>Eight manufacturing and control stages</h2>",
      "<h2>Eight Manufacturing Stages</h2>",
    ],
    [
      "<h2>Manufacturing floor at the Zhangzhou base</h2>",
      "<h2>Zhangzhou Manufacturing Floor</h2>",
    ],
  ],
  "en/quality/index.html": [
    [
      "<h1>Quality control throughout manufacturing</h1>",
      "<h1>Industrial Knife Quality Control</h1>",
    ],
    [
      "Quality control covers material verification, manufacturing and final release, with inspection defined by the approved drawing and acceptance criteria.",
      "Material, dimensions, hardness, edge and surface condition are checked against the drawing and acceptance criteria.",
    ],
    [
      "<h2>Manufacturing quality control process</h2>",
      "<h2>Quality Control</h2>",
    ],
    [
      "<h2>Inspection follows the drawing and process route</h2>",
      "<h2>Inspection Scope</h2>",
    ],
    [
      "<h2>Inspection equipment for material, hardness, geometry and surface control</h2>",
      "<h2>Inspection Equipment</h2>",
    ],
  ],
  "en/company/index.html": [
    [
      "<h1>Qunxin Industrial Zhangzhou manufacturing base</h1>",
      "<h1>Qunxin Industrial</h1>",
    ],
    [
      "Qunxin Industrial was established in Zhangzhou in 2024 as a member of Wei Qun Cutting Tools Group, manufacturing and selling industrial machine knives.",
      "A Wei Qun Cutting Tools Group company focused on industrial machine knife manufacturing in Zhangzhou.",
    ],
    ["<h2>Group manufacturing network</h2>", "<h2>Group and Base</h2>"],
  ],
  "en/customers/index.html": [
    [
      "<h1>Brand and industrial application references</h1>",
      "<h1>Customer and Application References</h1>",
    ],
    [
      "Projects usually begin with the machine, processed material and current blade issue, then move through blade approval, sample validation and series production.",
      "We work with equipment makers, brands and industrial users. Each project follows the information agreed by both parties.",
    ],
    [
      "<h2>Project review and delivery process</h2>",
      "<h2>Project Collaboration</h2>",
    ],
  ],
  "en/rfq/index.html": [
    [
      "<h1>Technical RFQ for industrial machine knives</h1>",
      "<h1>Send a Knife RFQ</h1>",
    ],
    [
      "A drawing, physical sample, old-blade photograph or documented machine application can each start an enquiry. Our engineering team then reviews manufacturability and quotation requirements.",
      "A drawing is helpful, but not required. Start with a sample photograph or application details.",
    ],
    ["<h2>Project information you can send</h2>", "<h2>What You Can Send</h2>"],
    [
      "<h2>Enter the project information available</h2>",
      "<h2>Enter RFQ Information</h2>",
    ],
    [
      '<h2 id="rfq-guide-title">Project information you can send</h2>',
      '<h2 id="rfq-guide-title">What You Can Send</h2>',
    ],
    ["Woodworking and Furniture Machine Knives</option>", "Woodworking Knives</option>"],
    ["Food Processing Machine Knives</option>", "Food Processing Knives</option>"],
    ["Plastic Crusher and Granulator Knives</option>", "Plastic Recycling Knives</option>"],
    ["Paper Slitting and Cutting Knives</option>", "Paper Converting Knives</option>"],
    ["Textile and Apparel Cutting Knives</option>", "Textile Cutting Knives</option>"],
    ["Custom and Machine-specific Blades</option>", "Custom Machine Knives</option>"],
    ["send it to info@teamstarmfg.com", "send it to rd01@teamstarmfg.com"],
    [
      "send them later to info@teamstarmfg.com with the RFQ reference",
      "send them later to rd01@teamstarmfg.com with the RFQ reference",
    ],
    [
      'href="mailto:info@teamstarmfg.com" class="button button-accent" data-rfq-email=""',
      'href="mailto:rd01@teamstarmfg.com" class="button button-accent" data-rfq-email=""',
    ],
  ],
};

const commonCopy = [
  ["<h2>提交图纸、样品或工况资料</h2>", "<h2>提交询价资料</h2>"],
  [
    "工程团队将根据现有资料核对刀具结构、制造可行性及报价所需的补充信息。",
    "提供图纸、样品或工况，我们据此确认制造与报价条件。",
  ],
  ["<h2>Send your drawing, sample or application details</h2>", "<h2>Send an RFQ</h2>"],
  [
    "Our engineering team reviews the available information, confirms manufacturability and identifies the details still required for quotation.",
    "Send a drawing, sample or application. We confirm manufacturing and quotation requirements.",
  ],
];

for (const file of await htmlFiles(root)) {
  let html = await readFile(file, "utf8");
  const relative = path.relative(root, file);
  const language = relative.startsWith(`en${path.sep}`) ? "en" : "zh";

  html = html.replace(
    /\/assets\/css\/site\.css\?v=[^"]+/,
    `/assets/css/site-2v.css?v=${version}`,
  );
  if (!html.includes("site-2v-overrides.css")) {
    html = html.replace(
      "</head>",
      ` <link href="${base}/assets/css/site-2v-overrides.css?v=${version}" rel="stylesheet"></head>`,
    );
  }
  html = html.replace(
    /<body class="([^"]*)">/,
    (_match, classes) =>
      `<body class="${classes.includes("redesign-2v") ? classes : `${classes} redesign-2v`}">`,
  );
  html = html.replace(
    /(<a href="[^"]+" class="brand"[^>]*>)\s*<picture>[\s\S]*?<\/picture>\s*(<span>)/,
    "$1 $2",
  );

  if (relative === "index.html" || relative === path.join("en", "index.html")) {
    const logoWall = extractBalancedDiv(html, '<div class="logo-wall">');
    html = html.replace(
      /<main id="main-content">[\s\S]*?<\/main>/,
      homeMain(language, logoWall),
    );
  } else {
    html = replaceAll(html, commonCopy);
    html = replaceAll(html, coreCopy[relative] || []);
    if (
      relative === path.join("products", "index.html") ||
      relative === path.join("en", "products", "index.html")
    ) {
      html = addCatalogMedia(html, language);
      html = simplifyCatalogCards(html, language);
    }
  }

  await writeFile(file, html);
}

await writeFile(
  path.join(root, "REVIEW_BUILD.txt"),
  [
    "Teamstar Website Review Mirror",
    `Version: ${version}`,
    "Direction: concise B2B copy, unified real photography, one visual system",
    "Production status: NOT DEPLOYED",
    "",
  ].join("\n"),
);

console.log(`Applied ${version} redesign to ${await htmlFiles(root).then((files) => files.length)} HTML files`);
