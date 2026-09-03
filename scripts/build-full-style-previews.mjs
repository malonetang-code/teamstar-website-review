import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(projectRoot, "full-style-preview");
const selectedConcept = "1";
const activeConcepts = ["1", "2", "3"];
const visualTheme = "e";
const retiredSchemes = ["a", "b", "c", "d", "e"];
const baselineHeroVideo = "/teamstar-review/images/web/process-20260725/home-company-manufacturing-montage-20260730.mp4";
const previewHeroVideo = "/teamstar-review/full-style-preview/media/home-manufacturing-closeup-preview-20260828.mp4";
const themeScriptVersion = "20260903-concept1-hero-reveal-3";
const themeStylesVersion = "20260903-concept1-hero-reveal-1";
const homeStructureVersion = "20260901-concepts-123";
const concept1MotionVersion = "20260903-integrated-3";

const conceptLabels = {
  "1": { zh: "1号方案 · 克制极简", en: "Concept 1 · Restrained Minimal" },
  "2": { zh: "2号方案 · 明亮企业型", en: "Concept 2 · Bright Corporate" },
  "3": { zh: "3号方案 · 数字制造型", en: "Concept 3 · Digital Manufacturing" },
};

function readCurrentHome(path) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

function previewPath(scheme, language) {
  return `/teamstar-review/full-style-preview/${scheme}/${language === "en" ? "en/" : ""}`;
}

function productPanel(language) {
  const isEn = language === "en";
  const base = isEn ? "/teamstar-review/en/" : "/teamstar-review/";
  const products = isEn
    ? [
        ["woodworking-knives", "Woodworking Knives", "product-woodworking.jpg"],
        ["food-processing-knives", "Food Processing Knives", "product-food.jpg"],
        ["plastic-crusher-blades", "Recycling Knives", "product-recycling.jpg"],
        ["paper-slitting-knives", "Paper Slitting Knives", "product-paper.jpg"],
        ["textile-cutting-knives", "Textile Cutting Knives", "product-textile.jpg"],
        ["custom-industrial-blades", "Custom Machine Knives", "product-custom.jpg"],
      ]
    : [
        ["woodworking-knives", "木工刀具", "product-woodworking.jpg"],
        ["food-processing-knives", "食品加工刀具", "product-food.jpg"],
        ["plastic-crusher-blades", "塑料回收刀具", "product-recycling.jpg"],
        ["paper-slitting-knives", "纸品分切刀具", "product-paper.jpg"],
        ["textile-cutting-knives", "纺织服装刀具", "product-textile.jpg"],
        ["custom-industrial-blades", "异型配套刀具", "product-custom.jpg"],
      ];
  const intro = isEn
    ? ["PRODUCTS", "Six product categories", "Browse the current industrial knife range.", "View the product directory"]
    : ["", "六类产品", "查看现有工业刀具产品目录。", "查看产品目录"];
  const productMarkup = products.map(([slug, title, image]) => {
    const media = `<img src="/teamstar-review/assets/images/2w/${image}" width="180" height="135" alt="">`;
    return `<a class="fp-mega-product" href="${base}products/${slug}/">${media}<span><strong>${title}</strong></span></a>`;
  }).join("");
  const eyebrow = intro[0] ? `<small>${intro[0]}</small>` : "";
  return `<div class="fp-mega fp-mega-products" role="group" aria-label="${isEn ? "Products preview" : "产品预览"}"><div class="container fp-mega-inner"><div class="fp-mega-intro">${eyebrow}<strong>${intro[1]}</strong><p>${intro[2]}</p><a href="${base}products/">${intro[3]} <i aria-hidden="true">↗</i></a></div><div class="fp-mega-product-grid">${productMarkup}</div></div></div>`;
}

function companyPanel(language) {
  const isEn = language === "en";
  const base = isEn ? "/teamstar-review/en/" : "/teamstar-review/";
  const copy = isEn
    ? ["ABOUT TEAMSTAR", "Group knife manufacturing since 1978 and the Zhangzhou base", "See how Teamstar carries forward the group’s industrial knife manufacturing heritage, which began in Taiwan in 1978, through its current Zhangzhou operation.", "SINCE 1978", "Group knife manufacturing", "About Teamstar"]
    : ["", "始于 1978 年的集团制刀积累与漳州基地", "集团于 1978 年在台湾创立并开始制造工业刀具，群新工业在漳州承接这份制造积累。", "始于 1978", "集团刀具制造", "关于群新"];
  const eyebrow = copy[0] ? `<small>${copy[0]}</small>` : "";
  return `<div class="fp-mega fp-mega-about" role="group" aria-label="${isEn ? "About Teamstar preview" : "关于群新预览"}"><div class="container fp-mega-inner"><div class="fp-mega-intro">${eyebrow}<strong>${copy[1]}</strong><p>${copy[2]}</p><a href="${base}company/">${copy[5]} <i aria-hidden="true">↗</i></a></div><a class="fp-mega-about-visual" href="${base}company/"><img src="/teamstar-review/img/wH65hbd5BK-640.jpeg" width="960" height="640" alt=""><span><b>${copy[3]}</b><em>${copy[4]}</em></span></a></div></div>`;
}

function desktopNav(concept, language) {
  const isEn = language === "en";
  const base = isEn ? "/teamstar-review/en/" : "/teamstar-review/";
  const labels = isEn
    ? ["Home", "Products", "Manufacturing", "Quality", "Company"]
    : ["首页", "产品目录", "制造能力", "质量体系", "公司概况"];
  return `<nav aria-label="${isEn ? "Primary navigation" : "主要导航"}" class="desktop-nav fp-desktop-nav"><div class="fp-nav-item"><a class="fp-nav-link" href="${previewPath(concept, language)}" aria-current="page">${labels[0]}</a></div><div class="fp-nav-item"><a class="fp-nav-link" href="${base}products/">${labels[1]}</a>${productPanel(language)}</div><div class="fp-nav-item"><a class="fp-nav-link" href="${base}capabilities/">${labels[2]}</a></div><div class="fp-nav-item"><a class="fp-nav-link" href="${base}quality/">${labels[3]}</a></div><div class="fp-nav-item"><a class="fp-nav-link" href="${base}company/">${labels[4]}</a>${companyPanel(language)}</div></nav>`;
}

function mobileNav(concept, language) {
  const isEn = language === "en";
  const base = isEn ? "/teamstar-review/en/" : "/teamstar-review/";
  const labels = isEn
    ? ["Home", "Products", "Manufacturing", "Quality", "Company", "Talk to a Knife Expert"]
    : ["首页", "产品目录", "制造能力", "质量体系", "公司概况", "咨询刀具专家"];
  return `<nav aria-label="${isEn ? "Mobile navigation" : "移动端导航"}" class="mobile-menu" data-mobile-menu="" hidden="" id="mobile-menu"><div class="container mobile-menu-inner"><a href="${previewPath(concept, language)}">${labels[0]}</a><a href="${base}products/">${labels[1]}</a><a href="${base}capabilities/">${labels[2]}</a><a href="${base}quality/">${labels[3]}</a><a href="${base}company/">${labels[4]}</a><a href="${base}rfq/">${labels[5]}</a></div></nav>`;
}

function languageMenu(scheme, language) {
  const isEn = language === "en";
  const label = isEn ? "Language" : "多语言";
  const planned = isEn ? "Planned" : "筹备中";
  return `<details class="language-menu"><summary aria-label="${isEn ? "Choose language" : "English / 选择语言"}"><span>EN</span></summary><div class="language-menu-panel"><strong>${label}</strong><a href="${previewPath(scheme, "zh")}" hreflang="zh-CN"${isEn ? "" : ' aria-current="page"'}><span>简体中文</span><small>ZH</small></a><a href="${previewPath(scheme, "en")}" hreflang="en"${isEn ? ' aria-current="page"' : ""}><span>English</span><small>EN</small></a><span class="is-disabled" aria-disabled="true"><span>Français</span><small>${planned}</small></span><span class="is-disabled" aria-disabled="true"><span>Español</span><small>${planned}</small></span></div></details>`;
}

function refinedWhyQunxin(language) {
  const isEn = language === "en";
  const copy = isEn
    ? {
        title: "Why customers choose Qunxin",
        intro: "Group knife-making experience, in-house process control and flexible quantities support dependable long-term supply.",
        yearsValue: "40+<small>YEARS</small>",
        yearsTitle: "Knife-making experience",
        yearsBody: "More than four decades of accumulated manufacturing knowledge, process records and production experience.",
        processValue: "IN-HOUSE",
        processTitle: "Critical processes",
        processBody: "Important manufacturing stages are completed within our own facility for more direct quality control.",
        quantityUnit: "PIECE",
        quantityTitle: "Flexible custom quantities",
        quantityBody: "Single-piece trials can be quoted, with pricing confirmed after review of material, process and project requirements.",
      }
    : {
        title: "为什么选择群新",
        intro: "集团制刀积累、厂内过程控制与灵活数量，是支持长期合作的基础。",
        yearsValue: "40+<small>年</small>",
        yearsTitle: "制刀经验",
        yearsBody: "集团长期积累刀具制造资料、工艺经验和生产人员。",
        processValue: "关键工序",
        processTitle: "自主完成",
        processBody: "重要制造环节在厂内完成，质量控制更直接。",
        quantityUnit: "件起",
        quantityTitle: "灵活定制",
        quantityBody: "可接受单件试制，价格根据材料、工艺和项目要求评估。",
      };

  const eyebrow = isEn ? "<span>WHY QUNXIN</span>" : "";
  return `<section class="why-qunxin-section fp-why-refined-e" aria-labelledby="why-qunxin-title"><div class="container fp-why-e-shell"><header class="fp-why-e-heading">${eyebrow}<h2 id="why-qunxin-title">${copy.title}</h2><p>${copy.intro}</p></header><div class="fp-why-e-specs"><article><strong>${copy.yearsValue}</strong><h3>${copy.yearsTitle}</h3><p>${copy.yearsBody}</p></article><article><strong class="fp-why-e-text-value">${copy.processValue}</strong><h3>${copy.processTitle}</h3><p>${copy.processBody}</p></article><article><strong>1<small>${copy.quantityUnit}</small></strong><h3>${copy.quantityTitle}</h3><p>${copy.quantityBody}</p></article></div></div></section>`;
}

function conceptHeroExtra(concept, language) {
  const isEn = language === "en";
  if (concept === "2") {
    return `<div class="concept-hero-note"><span>${isEn ? "TEAMSTAR MANUFACTURING" : "群新工业制造"}</span><strong>${isEn ? "Industrial knives, made around the application" : "围绕实际应用制造工业刀具"}</strong></div>`;
  }
  if (concept === "3") {
    const base = isEn ? "/teamstar-review/en/" : "/teamstar-review/";
    const items = isEn
      ? [["01", "Custom machine knives"], ["02", "Textile cutting knives"], ["03", "Paper slitting knives"]]
      : [["01", "异型配套刀具"], ["02", "纺织服装刀具"], ["03", "纸品分切刀具"]];
    return `<aside class="concept-hero-panel" aria-label="${isEn ? "Featured product routes" : "重点产品入口"}"><span>${isEn ? "START WITH A PRODUCT" : "从产品开始"}</span>${items.map(([number, label]) => `<a href="${base}products/"><b>${number}</b><strong>${label}</strong><i aria-hidden="true">→</i></a>`).join("")}</aside>`;
  }
  return "";
}

function buildPage(concept, language) {
  const isEn = language === "en";
  const sourcePath = isEn ? "en/home/index.html" : "home/index.html";
  let html = readCurrentHome(sourcePath).replaceAll("/teamstar-website-review/", "/teamstar-review/");
  html = html.replaceAll(baselineHeroVideo, previewHeroVideo);
  if (concept !== "1") {
    // Concepts 2 and 3 use the real factory photograph as a full-bleed mobile
    // hero. The baseline's precomposed mobile poster contains large black
    // letterbox areas and is intentionally kept only for Concept 1.
    html = html.replace(/\s*<source media="\(max-width: 767px\)" srcset="[^"]+">/, "");
  }
  html = html.replace(
    /home-structure-4\.css\?v=[^"]+/,
    `home-structure-4.css?v=${homeStructureVersion}`,
  );
  html = html.replace(
    /site-theme-preview\.css\?v=[^"]+/,
    `site-theme-preview.css?v=${themeStylesVersion}`,
  );
  for (const removed of isEn
    ? [
        '<span class="eyebrow">MADE TO DRAWING OR SAMPLE</span>',
        '<p>For equipment makers and industrial users. Send a drawing, sample or cutting requirement for engineering review and quotation.</p>',
        '<p>Six industrial knife families are shown with current photography. Hand tool and cloth cutting machine materials are being added.</p>',
        '<p>Send us your inquiry or describe your issue</p>',
      ]
    : [
        '<span class="eyebrow">按图纸或样品定制</span>',
        '<p>按图纸、样品与实际工况确认制造方案</p>',
        '<p>六类工业刀具已有实拍；手工具和裁布机成品资料正在补充</p>',
        '<p>请发送询价或说明您的需求</p>',
      ]) {
    html = html.replace(removed, "");
  }
  const pageRoot = previewPath(concept, language);
  const titlePrefix = conceptLabels[concept][isEn ? "en" : "zh"];
  const stylesheetVersion = "20260901-concepts-123";

  html = html.replace(/<html lang="([^"]+)">/, `<html lang="$1" data-full-preview="${visualTheme}" data-review-concept="${concept}">`);
  html = html.replace(/<title>([^<]+)<\/title>/, `<title>${titlePrefix}｜$1</title>`);
  html = html.replace("</head>", `<link href="/teamstar-review/full-style-preview/full-style-preview.css?v=${stylesheetVersion}" rel="stylesheet">\n</head>`);
  if (concept === "1") {
    html = html.replace(
      "</head>",
      `<link href="/teamstar-review/full-style-preview/concept-1-motion.css?v=${concept1MotionVersion}" rel="stylesheet">\n</head>`,
    );
  }
  html = html.replace(/<body class="([^"]+)"/, `<body class="full-style-preview concept-${concept} $1"`);
  html = html.replace(/<nav\b(?=[^>]*class="desktop-nav")[^>]*>[\s\S]*?<\/nav>/, desktopNav(concept, language));
  html = html.replace(/<nav\b(?=[^>]*class="mobile-menu")[^>]*>[\s\S]*?<\/nav>/, mobileNav(concept, language));

  if (isEn) {
    html = html.replace('href="/teamstar-review/en/" class="brand"', `href="${pageRoot}" class="brand"`);
  } else {
    html = html.replace('href="/teamstar-review/" class="brand"', `href="${pageRoot}" class="brand"`);
  }
  html = html.replace(/<a href="\/teamstar-review\/(?:en\/)?" class="language-link"[^>]*>[^<]+<\/a>/, languageMenu(concept, language));

  html = html.replace(/<section class="why-qunxin-section"[\s\S]*?<\/section>/, refinedWhyQunxin(language));
  if (concept !== "1") {
    html = html.replace('<main id="main-content">', `<main id="main-content" class="concept-${concept}-architecture">`);
    html = html.replace(/(<div class="hero-copy">[\s\S]*?<\/div>)\s*<\/div>\s*<\/section>/, `$1${conceptHeroExtra(concept, language)}</div></section>`);
  }
  if (!html.includes("/full-style-preview/site-theme-preview.js")) {
    html = html.replace(
      "</body>",
      `<script defer src="/teamstar-review/full-style-preview/site-theme-preview.js?v=${themeScriptVersion}"></script>\n</body>`,
    );
  }
  if (concept === "1" && !html.includes("/full-style-preview/concept-1-motion.js")) {
    html = html.replace(
      "</body>",
      `<script defer src="/teamstar-review/full-style-preview/concept-1-motion.js?v=${concept1MotionVersion}"></script>\n</body>`,
    );
  }

  const outputPath = resolve(outputRoot, concept, isEn ? "en/index.html" : "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html);
}

function buildRetiredRedirect(scheme, language) {
  const isEn = language === "en";
  const destination = previewPath(selectedConcept, language);
  const title = isEn ? "Review style consolidated" : "评审风格已收敛";
  const message = isEn
    ? "This color preview has been retired. Opening the selected restrained minimal review."
    : "该配色方案已停止评审，正在打开已选定的克制极简版本。";
  const html = `<!doctype html><html lang="${isEn ? "en" : "zh-CN"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta http-equiv="refresh" content="0;url=${destination}"><title>${title}</title><link rel="canonical" href="https://www.teamstarmfg.com/${isEn ? "en/" : ""}"></head><body><p>${message}</p><p><a href="${destination}">${isEn ? "Continue" : "继续查看"}</a></p><script>location.replace(${JSON.stringify(destination)});</script></body></html>`;
  const outputPath = resolve(outputRoot, scheme, isEn ? "en/index.html" : "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html);
}

function buildReviewIndex() {
  const cards = activeConcepts.map((concept) => {
    const label = conceptLabels[concept].zh;
    const description = concept === "1"
      ? "克制的黑、白、灰与群新红，作为已确认的基准方案。"
      : concept === "2"
        ? "明亮天蓝与白色企业风格，强调清晰结构和真实制造图片。"
        : "深蓝数字制造风格，以图片冲击力、证明数字和重点色建立节奏。";
    return `<article><span>0${concept}</span><h2>${label}</h2><p>${description}</p><div><a href="/teamstar-review/full-style-preview/${concept}/">中文</a><a href="/teamstar-review/full-style-preview/${concept}/en/">English</a></div></article>`;
  }).join("");
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>群新官网视觉方案评审</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f4f5;color:#171a1d;font-family:"PingFang SC","Microsoft YaHei",sans-serif}.shell{width:min(1120px,calc(100% - 32px));margin:auto;padding:72px 0 88px}.head{max-width:720px;margin-bottom:42px}.head small{color:#d71920;font-size:12px;font-weight:700;letter-spacing:.12em}.head h1{margin:12px 0 14px;font-size:clamp(34px,5vw,58px);line-height:1.08}.head p{margin:0;color:#666c71;line-height:1.7}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}article{min-height:310px;padding:30px;display:flex;flex-direction:column;background:#fff;border-top:4px solid #171a1d}article:nth-child(2){border-color:#0b8fa8}article:nth-child(3){border-color:#0e6aed}article>span{color:#8b9094;font-size:12px;font-weight:700}h2{margin:34px 0 14px;font-size:25px}article p{margin:0;color:#666c71;font-size:14px;line-height:1.7}article div{margin-top:auto;padding-top:28px;display:flex;gap:9px}a{min-height:42px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:#171a1d;font-size:13px;font-weight:700;text-decoration:none}article:nth-child(2) a{background:#0b8fa8}article:nth-child(3) a{background:#0e6aed}@media(max-width:760px){.shell{padding-top:42px}.grid{grid-template-columns:1fr}article{min-height:250px}}</style></head><body><main class="shell"><header class="head"><small>LOCAL REVIEW</small><h1>群新官网视觉方案</h1><p>三个方案内容一致、视觉架构不同。请分别查看中文与英文页面，比较首页和子页的整体效果。</p></header><section class="grid">${cards}</section></main></body></html>`;
  writeFileSync(resolve(outputRoot, "index.html"), html);
}

for (const concept of activeConcepts) {
  buildPage(concept, "zh");
  buildPage(concept, "en");
}

buildReviewIndex();

for (const scheme of retiredSchemes) {
  buildRetiredRedirect(scheme, "zh");
  buildRetiredRedirect(scheme, "en");
}

console.log("Built bilingual Concepts 1-3, the local comparison index, and retired A-E color routes.");
