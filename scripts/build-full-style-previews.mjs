import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseline = "teamstar-current-review-baseline-2026-08-27^{}";
const outputRoot = resolve(projectRoot, "full-style-preview");
const schemes = ["a", "b", "c", "d", "e"];
const baselineHeroVideo = "/teamstar-review/images/web/process-20260725/home-company-manufacturing-montage-20260730.mp4";
const previewHeroVideo = "/teamstar-review/full-style-preview/media/home-manufacturing-closeup-preview-20260828.mp4";

const schemeNames = {
  zh: { a: "强工业黑白", b: "精密白底", c: "工业编辑式", d: "现代欧式", e: "克制极简" },
  en: { a: "Industrial Black", b: "Precision White", c: "Editorial Industrial", d: "European Modern", e: "Restrained Minimal" },
};

function readBaseline(path) {
  return execFileSync("git", ["show", `${baseline}:${path}`], {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
}

function previewPath(scheme, language) {
  return `/teamstar-review/full-style-preview/${scheme}/${language === "en" ? "en/" : ""}`;
}

function switcherMarkup(scheme, language) {
  const isEn = language === "en";
  const label = isEn ? "Current review baseline · Full Home" : "现行镜像基准版 · 完整首页";
  const original = isEn ? "/teamstar-review/en/home/" : "/teamstar-review/home/";
  const originalText = isEn ? "Baseline" : "原版";
  const links = schemes.map((item) => {
    const current = item === scheme ? ' aria-current="page"' : "";
    return `<a href="${previewPath(item, language)}"${current}><b>${item.toUpperCase()}</b><span>${schemeNames[language][item]}</span></a>`;
  }).join("");

  return `<aside class="full-preview-switcher" aria-label="${isEn ? "Full-page style comparison" : "完整页面风格对比"}"><strong>${label}</strong><nav>${links}</nav><div><a href="${original}">${originalText}</a></div></aside>`;
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
        [null, "Hand Tools", null],
        [null, "Cloth Cutting Machines", null],
      ]
    : [
        ["woodworking-knives", "木工刀具", "product-woodworking.jpg"],
        ["food-processing-knives", "食品加工刀具", "product-food.jpg"],
        ["plastic-crusher-blades", "塑料回收刀具", "product-recycling.jpg"],
        ["paper-slitting-knives", "纸品分切刀具", "product-paper.jpg"],
        ["textile-cutting-knives", "纺织服装刀具", "product-textile.jpg"],
        ["custom-industrial-blades", "异型配套刀具", "product-custom.jpg"],
        [null, "手工具", null],
        [null, "裁布机成品", null],
      ];
  const intro = isEn
    ? ["PRODUCTS & APPLICATIONS", "Eight product directions", "Browse six established industrial knife families and two categories now being expanded.", "View the product directory", "In preparation"]
    : ["PRODUCTS & APPLICATIONS", "八个产品方向", "六类工业刀具已有实拍，手工具和裁布机成品资料正在补充。", "查看产品目录", "资料补充中"];
  const productMarkup = products.map(([slug, title, image], index) => {
    const number = String(index + 1).padStart(2, "0");
    const media = image
      ? `<img src="/teamstar-review/assets/images/2w/${image}" width="180" height="135" alt="">`
      : `<span class="fp-mega-product-number" aria-hidden="true">${number}</span>`;
    const body = `${media}<span><strong>${title}</strong>${slug ? "" : `<small>${intro[4]}</small>`}</span>`;
    return slug
      ? `<a class="fp-mega-product" href="${base}products/${slug}/">${body}</a>`
      : `<div class="fp-mega-product is-pending" aria-label="${title} · ${intro[4]}">${body}</div>`;
  }).join("");
  return `<div class="fp-mega fp-mega-products" role="group" aria-label="${isEn ? "Products preview" : "产品预览"}"><div class="container fp-mega-inner"><div class="fp-mega-intro"><small>${intro[0]}</small><strong>${intro[1]}</strong><p>${intro[2]}</p><a href="${base}products/">${intro[3]} <i aria-hidden="true">↗</i></a></div><div class="fp-mega-product-grid">${productMarkup}</div></div></div>`;
}

function companyPanel(language) {
  const isEn = language === "en";
  const base = isEn ? "/teamstar-review/en/" : "/teamstar-review/";
  const copy = isEn
    ? ["ABOUT TEAMSTAR", "Group knife manufacturing since 1978 and the Zhangzhou base", "See how Teamstar carries forward the group’s industrial knife manufacturing heritage, which began in Taiwan in 1978, through its current Zhangzhou operation.", "SINCE 1978", "Group knife manufacturing", "About Teamstar"]
    : ["ABOUT TEAMSTAR", "始于 1978 年的集团制刀积累与漳州基地", "集团于 1978 年在台湾创立并开始制造工业刀具，群新工业在漳州承接这份制造积累。", "始于 1978", "集团刀具制造", "关于群新"];
  return `<div class="fp-mega fp-mega-about" role="group" aria-label="${isEn ? "About Teamstar preview" : "关于群新预览"}"><div class="container fp-mega-inner"><div class="fp-mega-intro"><small>${copy[0]}</small><strong>${copy[1]}</strong><p>${copy[2]}</p><a href="${base}company/">${copy[5]} <i aria-hidden="true">↗</i></a></div><a class="fp-mega-about-visual" href="${base}company/"><img src="/teamstar-review/img/wH65hbd5BK-640.jpeg" width="960" height="640" alt=""><span><b>${copy[3]}</b><em>${copy[4]}</em></span></a></div></div>`;
}

function manufacturingPanel(language) {
  const isEn = language === "en";
  const base = isEn ? "/teamstar-review/en/" : "/teamstar-review/";
  const copy = isEn
    ? ["MANUFACTURING & QUALITY", "See how the work is made and checked", "Manufacturing capability and quality assurance remain separate, complete sections.", "Manufacturing Capabilities", "Core processes and factory evidence", "Quality Assurance", "Inspection scope and quality control"]
    : ["MANUFACTURING & QUALITY", "查看制造能力与质量保证", "制造能力和质量保证保留为两个完整子页，分别呈现。", "制造能力", "主要工序与工厂实景", "质量保证", "检验范围与质量控制"];
  return `<div class="fp-mega fp-mega-manufacturing" role="group" aria-label="${isEn ? "Manufacturing and quality preview" : "制造与质量预览"}"><div class="container fp-mega-inner"><div class="fp-mega-intro"><small>${copy[0]}</small><strong>${copy[1]}</strong><p>${copy[2]}</p></div><div class="fp-mega-twin"><a class="fp-mega-feature" href="${base}capabilities/"><img src="/teamstar-review/images/web/process-20260725/05-precision-grinding.jpg" width="640" height="360" alt=""><span><b>${copy[3]}</b><em>${copy[4]}</em></span></a><a class="fp-mega-feature" href="${base}quality/"><img src="/teamstar-review/images/web/process-20260725/06-optical-inspection.jpg" width="640" height="360" alt=""><span><b>${copy[5]}</b><em>${copy[6]}</em></span></a></div></div></div>`;
}

function contactPanel(language) {
  const isEn = language === "en";
  const base = isEn ? "/teamstar-review/en/" : "/teamstar-review/";
  const copy = isEn
    ? ["START A CONVERSATION", "Talk to a knife expert", "Share the drawing, product photo or existing knife information with our sales and technical team.", "Sales & technical enquiries", "Open contact options"]
    : ["START A CONVERSATION", "与刀具专家讨论您的项目", "发送图纸、产品照片或现有刀具资料，与销售和技术团队直接沟通。", "业务与技术咨询", "查看联系入口"];
  return `<div class="fp-mega fp-mega-contact" role="group" aria-label="${isEn ? "Contact preview" : "联系预览"}"><div class="container fp-mega-inner"><div class="fp-mega-intro"><small>${copy[0]}</small><strong>${copy[1]}</strong><p>${copy[2]}</p></div><div class="fp-mega-contact-details"><span>${copy[3]}</span><a href="mailto:rd01@teamstarmfg.com">rd01@teamstarmfg.com</a><a class="button button-accent" href="${base}rfq/">${copy[4]}</a></div></div></div>`;
}

function desktopNav(scheme, language) {
  const isEn = language === "en";
  const base = isEn ? "/teamstar-review/en/" : "/teamstar-review/";
  const labels = isEn
    ? ["Home", "Products & Applications", "Manufacturing & Quality", "About Us", "Contact"]
    : ["首页", "产品与应用", "制造与质量", "关于我们", "联系我们"];
  return `<nav aria-label="${isEn ? "Primary navigation" : "主要导航"}" class="desktop-nav fp-desktop-nav"><div class="fp-nav-item"><a class="fp-nav-link" href="${previewPath(scheme, language)}" aria-current="page">${labels[0]}</a></div><div class="fp-nav-item"><a class="fp-nav-link" href="${base}products/">${labels[1]}</a>${productPanel(language)}</div><div class="fp-nav-item"><a class="fp-nav-link" href="${base}capabilities/">${labels[2]}</a>${manufacturingPanel(language)}</div><div class="fp-nav-item"><a class="fp-nav-link" href="${base}company/">${labels[3]}</a>${companyPanel(language)}</div><div class="fp-nav-item"><a class="fp-nav-link" href="#contact">${labels[4]}</a>${contactPanel(language)}</div></nav>`;
}

function mobileNav(scheme, language) {
  const isEn = language === "en";
  const base = isEn ? "/teamstar-review/en/" : "/teamstar-review/";
  const labels = isEn
    ? ["Home", "Products & Applications", "Manufacturing Capabilities", "Quality Assurance", "About Us", "Contact", "Talk to a Knife Expert"]
    : ["首页", "产品与应用", "制造能力", "质量保证", "关于我们", "联系我们", "咨询刀具专家"];
  return `<nav aria-label="${isEn ? "Mobile navigation" : "移动端导航"}" class="mobile-menu" data-mobile-menu="" hidden="" id="mobile-menu"><div class="container mobile-menu-inner"><a href="${previewPath(scheme, language)}">${labels[0]}</a><a href="${base}products/">${labels[1]}</a><a href="${base}capabilities/">${labels[2]}</a><a href="${base}quality/">${labels[3]}</a><a href="${base}company/">${labels[4]}</a><a href="#contact">${labels[5]}</a><a href="${base}rfq/">${labels[6]}</a></div></nav>`;
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
        intro: "Group knife-making experience, the Zhangzhou manufacturing site, in-house process control and flexible quantities support dependable long-term supply.",
        yearsValue: "1978",
        yearsTitle: "Group knife manufacturing since 1978",
        yearsBody: "The group was founded in Taiwan in 1978 and has manufactured industrial knives since then, building process knowledge over time.",
        processValue: "IN-HOUSE",
        processTitle: "Critical processes",
        processBody: "Important manufacturing stages are completed within our own facility for more direct quality control.",
        spaceTitle: "Zhangzhou manufacturing site",
        spaceBody: "More than 10,000 m² of manufacturing space.",
        quantityUnit: "PIECE",
        quantityTitle: "Flexible custom quantities",
        quantityBody: "Single-piece trials can be quoted, with pricing confirmed after review of material, process and project requirements.",
      }
    : {
        title: "为什么选择群新",
        intro: "集团制刀积累、漳州生产基地、厂内过程控制与灵活数量，是支持长期合作的基础。",
        yearsValue: "1978",
        yearsTitle: "集团刀具制造积累",
        yearsBody: "集团于 1978 年在台湾创立，并开始制造工业刀具，持续积累工艺资料与生产经验。",
        processValue: "关键工序",
        processTitle: "自主完成",
        processBody: "重要制造环节在厂内完成，质量控制更直接。",
        spaceTitle: "漳州生产厂房",
        spaceBody: "漳州基地生产厂房超过 10,000 平方米。",
        quantityUnit: "件起",
        quantityTitle: "灵活定制",
        quantityBody: "可接受单件试制，价格根据材料、工艺和项目要求评估。",
      };

  return `<section class="why-qunxin-section fp-why-refined-e" aria-labelledby="why-qunxin-title"><div class="container fp-why-e-shell"><header class="fp-why-e-heading"><span>WHY QUNXIN</span><h2 id="why-qunxin-title">${copy.title}</h2><p>${copy.intro}</p></header><div class="fp-why-e-specs"><article><strong>${copy.yearsValue}</strong><h3>${copy.yearsTitle}</h3><p>${copy.yearsBody}</p></article><article><strong class="fp-why-e-text-value">${copy.processValue}</strong><h3>${copy.processTitle}</h3><p>${copy.processBody}</p></article><article><strong>1<small>${copy.quantityUnit}</small></strong><h3>${copy.quantityTitle}</h3><p>${copy.quantityBody}</p></article><article><strong>10,000+<small>m²</small></strong><h3>${copy.spaceTitle}</h3><p>${copy.spaceBody}</p></article></div></div></section>`;
}

function buildPage(scheme, language) {
  const isEn = language === "en";
  const sourcePath = isEn ? "en/home/index.html" : "home/index.html";
  let html = readBaseline(sourcePath).replaceAll("/teamstar-website-review/", "/teamstar-review/");
  html = html.replaceAll(baselineHeroVideo, previewHeroVideo);
  const pageRoot = previewPath(scheme, language);
  const titlePrefix = isEn ? `${scheme.toUpperCase()} Full Home Preview` : `${scheme.toUpperCase()} 完整首页预览`;
  const stylesheetVersion = "20260828-4";

  html = html.replace(/<html lang="([^"]+)">/, `<html lang="$1" data-full-preview="${scheme}">`);
  html = html.replace(/<title>([^<]+)<\/title>/, `<title>${titlePrefix}｜$1</title>`);
  html = html.replace("</head>", `<link href="/teamstar-review/full-style-preview/full-style-preview.css?v=${stylesheetVersion}" rel="stylesheet">\n</head>`);
  html = html.replace(/<body class="([^"]+)"/, `<body class="full-style-preview $1"`);
  html = html.replace(/(<body[^>]*>)/, `$1${switcherMarkup(scheme, language)}`);
  html = html.replace(/<nav aria-label="(?:主要导航|Primary navigation)" class="desktop-nav">[\s\S]*?<\/nav>/, desktopNav(scheme, language));
  html = html.replace(/<nav aria-label="(?:移动端导航|Mobile navigation)" class="mobile-menu"[\s\S]*?<\/nav>/, mobileNav(scheme, language));

  if (isEn) {
    html = html.replace('href="/teamstar-review/en/" class="brand"', `href="${pageRoot}" class="brand"`);
  } else {
    html = html.replace('href="/teamstar-review/" class="brand"', `href="${pageRoot}" class="brand"`);
  }
  html = html.replace(/<a href="\/teamstar-review\/(?:en\/)?" class="language-link"[^>]*>[^<]+<\/a>/, languageMenu(scheme, language));

  html = html.replace(/<section class="why-qunxin-section"[\s\S]*?<\/section>/, refinedWhyQunxin(language));

  const outputPath = resolve(outputRoot, scheme, isEn ? "en/index.html" : "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html);
}

for (const scheme of schemes) {
  rmSync(resolve(outputRoot, scheme), { recursive: true, force: true });
  buildPage(scheme, "zh");
  buildPage(scheme, "en");
}

console.log(`Built ${schemes.length * 2} full Home previews from ${baseline}`);
