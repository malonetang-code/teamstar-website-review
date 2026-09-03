import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pageRoots = [
  "404.html",
  "index.html",
  "home",
  "products",
  "capabilities",
  "quality",
  "company",
  "customers",
  "guides",
  "rfq",
  "privacy",
  "en",
];
const assetVersion = "20260901-concepts-123";

function walk(path) {
  const absolute = resolve(projectRoot, path);
  if (!statSync(absolute).isDirectory()) return [absolute];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = join(absolute, entry.name);
    if (entry.isDirectory()) return walk(relative(projectRoot, child));
    return entry.isFile() && entry.name.endsWith(".html") ? [child] : [];
  });
}

const htmlFiles = [...new Set(pageRoots.flatMap(walk))];

function pageGroup(relativePath) {
  const path = relativePath.replace(/^en\//, "");
  if (path === "index.html" || path.startsWith("home/")) return "home";
  if (path.startsWith("products/")) return "products";
  if (path.startsWith("capabilities/")) return "capabilities";
  if (path.startsWith("quality/")) return "quality";
  if (path.startsWith("company/")) return "company";
  if (path.startsWith("customers/")) return "customers";
  return "";
}

function currentAttribute(active) {
  return active ? ' aria-current="page"' : "";
}

function desktopNavigation(isEnglish, group) {
  const base = isEnglish ? "/teamstar-website-review/en/" : "/teamstar-website-review/";
  const labels = isEnglish
    ? {
        aria: "Primary navigation",
        home: "Home",
        products: "Products",
        capabilities: "Manufacturing",
        quality: "Quality",
        company: "Company",
      }
    : {
        aria: "主要导航",
        home: "首页",
        products: "产品目录",
        capabilities: "制造能力",
        quality: "质量体系",
        company: "公司概况",
      };
  return `<nav class="desktop-nav" aria-label="${labels.aria}"> <a href="${base}home/"${currentAttribute(group === "home")}>${labels.home}</a> <a href="${base}products/"${currentAttribute(group === "products")}>${labels.products}</a> <a href="${base}capabilities/"${currentAttribute(group === "capabilities")}>${labels.capabilities}</a> <a href="${base}quality/"${currentAttribute(group === "quality")}>${labels.quality}</a> <a href="${base}company/"${currentAttribute(group === "company")}>${labels.company}</a> </nav>`;
}

function mobileNavigation(isEnglish, group) {
  const base = isEnglish ? "/teamstar-website-review/en/" : "/teamstar-website-review/";
  const labels = isEnglish
    ? {
        aria: "Mobile navigation",
        home: "Home",
        products: "Products",
        capabilities: "Manufacturing",
        quality: "Quality",
        company: "Company",
        rfq: "Talk to a Knife Expert",
      }
    : {
        aria: "移动端导航",
        home: "首页",
        products: "产品目录",
        capabilities: "制造能力",
        quality: "质量体系",
        company: "公司概况",
        rfq: "咨询刀具专家",
      };
  return `<nav aria-label="${labels.aria}" class="mobile-menu" data-mobile-menu="" hidden="" id="mobile-menu"> <div class="container mobile-menu-inner"> <a href="${base}home/"${currentAttribute(group === "home")}>${labels.home}</a> <a href="${base}products/"${currentAttribute(group === "products")}>${labels.products}</a> <a href="${base}capabilities/"${currentAttribute(group === "capabilities")}>${labels.capabilities}</a> <a href="${base}quality/"${currentAttribute(group === "quality")}>${labels.quality}</a> <a href="${base}company/"${currentAttribute(group === "company")}>${labels.company}</a> <a href="${base}rfq/">${labels.rfq}</a> </div> </nav>`;
}

function transformCommon(relativePath, html) {
  const isEnglish = relativePath.startsWith("en/");
  const group = pageGroup(relativePath);
  const base = isEnglish ? "/teamstar-website-review/en/" : "/teamstar-website-review/";
  const brand = isEnglish
    ? "<span><strong>TEAMSTAR MFG.</strong><small>群新工业</small></span>"
    : "<span><strong>群新工业</strong><small>TEAMSTAR MFG.</small></span>";

  html = html.replace(
    /(<a\b[^>]*class="brand"[^>]*>)[\s\S]*?(<\/a>)/,
    `$1 ${brand} $2`,
  );
  html = html.replace(
    /<nav\b[^>]*class="desktop-nav"[^>]*>[\s\S]*?<\/nav>/,
    desktopNavigation(isEnglish, group),
  );
  html = html.replace(
    /<nav\b[^>]*class="mobile-menu"[^>]*>[\s\S]*?<\/nav>/,
    mobileNavigation(isEnglish, group),
  );

  const isHome = ["index.html", "home/index.html", "en/index.html", "en/home/index.html"].includes(relativePath);
  if (!isHome) {
    html = html.replace(/\s*<section class="[^"]*\brfq-band\b[^"]*"[^>]*>[\s\S]*?<\/section>/g, "");
  }

  html = html.replace(/<div class="footer-brand">[\s\S]*?<\/div>/, (block) => {
    const paragraph = block.match(/<p>[\s\S]*?<\/p>/)?.[0] || "";
    return `<div class="footer-brand"> <strong>TEAMSTAR MANUFACTURING</strong> ${paragraph} </div>`;
  });
  html = html.replace(
    /<div class="container footer-grid">([\s\S]*?)<\/div>\s*<div class="container footer-bottom">/,
    (_match, columns) => {
      const label = isEnglish ? "Talk to a Knife Expert" : "咨询刀具专家";
      const cleanedColumns = columns.replace(/\s*<div class="footer-inquiry-area">[\s\S]*?<\/div>/g, "");
      return `<div class="container footer-grid">${cleanedColumns}<div class="footer-inquiry-area"><a class="footer-inquiry-link" href="${base}rfq/">${label}<span aria-hidden="true">→</span></a></div></div> <div class="container footer-bottom">`;
    },
  );
  html = html.replace(
    new RegExp(`<a href="${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}rfq/">(?:获取报价|Request a Quote)<\\/a>\\s*`, "g"),
    "",
  );

  html = html
    .replace(/site-2w\.css\?v=[^"\s]+/g, `site-2w.css?v=${assetVersion}`)
    .replace(/home-structure-4\.css\?v=[^"\s]+/g, `home-structure-4.css?v=${assetVersion}`)
    .replace(/process-viewer\.css\?v=[^"\s]+/g, `process-viewer.css?v=${assetVersion}`)
    .replace(/site-theme-preview\.css\?v=[^"\s]+/g, `site-theme-preview.css?v=${assetVersion}`)
    .replace(/site-theme-preview\.js\?v=[^"\s]+/g, `site-theme-preview.js?v=${assetVersion}`);

  // Chinese pages should not use decorative English micro-labels. Keep formal
  // product, instrument and certification names in their ordinary text nodes.
  if (!isEnglish) {
    html = html
      .replace(/\s*<span class="eyebrow">(?=[^<]*[A-Za-z])(?=[^<]*<\/span>)(?![^<]*[\u3400-\u9fff])[^<]*<\/span>/g, "")
      .replace(/<b>(\d{2})\s*\/\s*[A-Z][A-Z -]*<\/b>/g, "<b>$1</b>");
  }
  return html;
}

function transformHome(html, isEnglish) {
  const match = html.match(/<section class="section home-product-section"[\s\S]*?<\/section>/);
  if (!match) throw new Error("Home product section not found");
  let section = match[0];
  section = isEnglish
    ? section.replace(
        /<span class="eyebrow">Products &amp; Applications<\/span>\s*<h2>Industrial Knives, Hand Tools and Cloth Cutting Machines<\/h2>/,
        "<h2>Products</h2>",
      )
    : section.replace(
        /<span class="eyebrow">产品与应用<\/span>\s*<h2>工业刀具、手工具与裁布设备<\/h2>/,
        "<h2>产品目录</h2>",
      );
  section = section.replace(/(<div class="blade-body">)\s*<span>0[1-6]<\/span>/g, "$1");
  section = section.replace(/\s*<article class="blade-card product-pending-card">[\s\S]*?<\/article>/g, "");
  const cardCount = (section.match(/<article class="blade-card">/g) || []).length;
  if (cardCount !== 6) throw new Error(`Expected 6 Home product cards, found ${cardCount}`);
  html = html.replace(match[0], section);
  html = html
    .replace(/\s*<section class="section legacy-home-section reference-section">[\s\S]*?<\/section>/, "")
    .replace(/\s*<section class="rfq-band" id="contact">[\s\S]*?<\/section>/, "");
  return html;
}

function transformProductDirectory(html) {
  return html.replace(/\s*<div class="product-directory-assist">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, " </div> </section>");
}

function transformCapabilities(html, isEnglish) {
  if (isEnglish) {
    html = html
      .replace('<span class="eyebrow">ENGINEERING SYSTEM</span><h2>Manufacturing &amp; Inspection</h2>', '<span class="eyebrow">CORE CAPABILITIES</span><h2>Manufacturing Capabilities</h2>')
      .replace("Blade blank shaping, heat treatment and downstream grinding are coordinated around the selected material, blade structure and application requirements.", "Blade blanks are formed and heat-treated to suit the selected material, geometry and subsequent machining.")
      .replace("Straight knives, circular knives, saw blades and profiled components are machined and ground with focus on mounting interfaces, blade geometry and batch repeatability.", "Holes, profiles, faces and cutting edges are machined and ground to the confirmed drawing.")
      .replace('<h2 id="process-evidence-title">Manufacturing and Quality Control</h2>', '<h2 id="process-evidence-title">Main Manufacturing Processes</h2>');
  } else {
    html = html
      .replace('<span class="eyebrow">ENGINEERING SYSTEM</span><h2>制造与检测</h2>', '<h2>制造能力</h2>')
      .replace("根据材料、刀具结构和使用要求衔接刀坯成形、热处理与后续研磨。", "根据刀具材料和结构完成刀坯成形与热处理，为后续精加工做好准备。")
      .replace("针对直刃刀、圆刀、锯片及异型件，重点控制安装接口、刀具几何与批次重复性。", "完成孔位、轮廓、平面和刃口加工，使刀具符合已确认的图纸要求。")
      .replace('<h2 id="process-evidence-title">制造与质量控制工序</h2>', '<h2 id="process-evidence-title">主要制造工序</h2>');
  }

  const listMatch = html.match(/<div class="capability-list">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/);
  if (!listMatch) throw new Error("Capability card list not found");
  let list = listMatch[0];
  const cards = list.match(/<article class="capability-card">[\s\S]*?<\/article>/g) || [];
  if (cards.length !== 3) throw new Error(`Expected 3 capability cards, found ${cards.length}`);
  const packagingCard = isEnglish
    ? '<article class="capability-card"> <picture><img alt="Protective packaging for finished industrial knives" decoding="async" height="1202" src="/teamstar-website-review/images/web/process-20260725/08-edge-protection-full.jpg" width="1600" loading="lazy"></picture> <div class="capability-card-body"> <span class="eyebrow">03 / PACKAGING</span> <h3>Protective Packaging</h3> <p>Rust prevention, cutting-edge protection and packing are arranged for the blade geometry and shipment.</p> <a href="#process-protective-packaging" class="text-link">View process<span aria-hidden="true">→</span></a> </div> </article>'
    : '<article class="capability-card"> <picture><img alt="工业刀具包装前的刃口防护" decoding="async" height="1202" src="/teamstar-website-review/images/web/process-20260725/08-edge-protection-full.jpg" width="1600" loading="lazy"></picture> <div class="capability-card-body"> <h3>包装防护</h3> <p>根据刀具形状和运输方式安排防锈、刃口保护与包装。</p> <a href="#process-protective-packaging" class="text-link">查看工序<span aria-hidden="true">→</span></a> </div> </article>';
  list = list.replace(cards[2], packagingCard);
  html = html.replace(listMatch[0], list);

  html = html
    .replace(/\s*<li class="process-evidence-row" id="process-in-process-inspection">[\s\S]*?<\/li>/, "")
    .replace(/\s*<li class="process-evidence-row" id="process-final-inspection">[\s\S]*?<\/li>/, "")
    .replace(/(<li class="process-evidence-row" id="process-protective-packaging">[\s\S]*?<span class="process-evidence-number">)08(<\/span>)/, "$106$2");
  return html;
}

function transformQuality(html, isEnglish) {
  if (isEnglish) {
    return html
      .replace(/(<h2>Quality Control<\/h2>\s*<\/div>)\s*<p>[\s\S]*?<\/p>/, "$1<p>Key quality control processes are shown below.</p>")
      .replace(/(<h2>Inspection Scope<\/h2>\s*<\/div>)\s*<p>[\s\S]*?<\/p>/, "$1<p>Key inspection items are shown below.</p>");
  }
  return html
    .replace(/(<h2>质量控制<\/h2>\s*<\/div>)\s*<p>[\s\S]*?<\/p>/, "$1<p>主要质量控制过程展示</p>")
    .replace(/(<h2>检验项目<\/h2>\s*<\/div>)\s*<p>[\s\S]*?<\/p>/, "$1<p>主要检验项目展示</p>");
}

let changed = 0;
for (const absolutePath of htmlFiles) {
  const relativePath = relative(projectRoot, absolutePath);
  const isEnglish = relativePath.startsWith("en/");
  let html = readFileSync(absolutePath, "utf8");
  const original = html;
  html = transformCommon(relativePath, html);
  if (["index.html", "home/index.html", "en/index.html", "en/home/index.html"].includes(relativePath)) {
    html = transformHome(html, isEnglish);
  }
  if (["products/index.html", "en/products/index.html"].includes(relativePath)) {
    html = transformProductDirectory(html);
  }
  if (["capabilities/index.html", "en/capabilities/index.html"].includes(relativePath)) {
    html = transformCapabilities(html, isEnglish);
  }
  if (["quality/index.html", "en/quality/index.html"].includes(relativePath)) {
    html = transformQuality(html, isEnglish);
  }
  if (html !== original) {
    writeFileSync(absolutePath, html);
    changed += 1;
  }
}

console.log(`Updated ${changed} canonical review HTML files.`);
