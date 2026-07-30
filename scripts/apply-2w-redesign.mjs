import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const base = "/teamstar-website-review";

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

function logoWall(html) {
  const match = html.match(
    /(<div class="logo-wall">[\s\S]*?<\/div>)\s*<div class="section-actions">/
  );
  if (!match) throw new Error("Could not preserve the verified colour logo wall");
  return match[1];
}

function productCard({
  number,
  href,
  image,
  alt,
  title,
  description,
}) {
  return `<article class="blade-card">
    <a class="blade-card-link" href="${href}" aria-label="${title}"></a>
    <figure class="blade-media">
      <picture>
        <source srcset="${base}/assets/images/2w/${image}.webp" type="image/webp">
        <img src="${base}/assets/images/2w/${image}.jpg" width="900" height="675" loading="lazy" decoding="async" alt="${alt}">
      </picture>
    </figure>
    <div class="blade-body"><span>${number}</span><h3>${title}</h3><p>${description}</p></div>
  </article>`;
}

function hero({ eyebrow, title, intro, primary, secondary, rfq, products }) {
  return `<section class="home-hero">
    <picture class="home-hero-picture">
      <source media="(max-width: 1079px)" srcset="${base}/assets/images/2w/hero-mobile.webp?v=20260730-2y-hero-fix" type="image/webp">
      <source srcset="${base}/assets/images/2w/hero-desktop.webp?v=20260730-2y-hero-fix" type="image/webp">
      <source media="(max-width: 1079px)" srcset="${base}/assets/images/2w/hero-mobile.jpg?v=20260730-2y-hero-fix">
      <img class="hero-media" src="${base}/assets/images/2w/hero-desktop.jpg?v=20260730-2y-hero-fix" width="1920" height="720" loading="eager" fetchpriority="high" decoding="async" alt="">
    </picture>
    <div class="container hero-inner">
      <div class="hero-copy">
        <span class="eyebrow">${eyebrow}</span>
        <h1>${title}</h1>
        <p>${intro}</p>
        <div class="hero-actions">
          <a class="button button-accent" href="${rfq}">${primary}</a>
          <a class="button button-outline-light" href="#product-directory">${secondary}</a>
        </div>
      </div>
    </div>
  </section>`;
}

function zhHome(logos) {
  const cards = [
    {
      number: "01",
      href: `${base}/products/woodworking-knives/`,
      image: "product-woodworking",
      alt: "木工机械刀具实物",
      title: "木工刀具",
      description: "刨切、指接与裁板",
    },
    {
      number: "02",
      href: `${base}/products/food-processing-knives/`,
      image: "product-food",
      alt: "食品加工机械刀具实物",
      title: "食品加工刀具",
      description: "切片、分切与前处理",
    },
    {
      number: "03",
      href: `${base}/products/plastic-crusher-blades/`,
      image: "product-recycling",
      alt: "塑料回收机械刀具实物",
      title: "塑料回收刀具",
      description: "粉碎、破碎与造粒",
    },
    {
      number: "04",
      href: `${base}/products/paper-slitting-knives/`,
      image: "product-paper",
      alt: "纸品分切机械刀具实物",
      title: "纸品分切刀具",
      description: "分条、修边与裁切",
    },
    {
      number: "05",
      href: `${base}/products/textile-cutting-knives/`,
      image: "product-textile",
      alt: "纺织服装机械刀具实物",
      title: "纺织服装刀具",
      description: "裁床、圆刀与缝纫设备",
    },
    {
      number: "06",
      href: `${base}/products/custom-industrial-blades/`,
      image: "product-custom",
      alt: "异型工业机械刀具实物",
      title: "异型配套刀具",
      description: "按图纸或样品制造",
    },
  ];

  return `<main id="main-content">
  ${hero({
    eyebrow: "按图纸或样品定制",
    title: "工业机械刀具定制制造",
    intro: "按图纸、样品与实际工况确认制造方案",
    primary: "提交询价",
    secondary: "查看产品",
    rfq: `${base}/rfq/`,
  })}

  <section class="section" id="product-directory">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">产品目录</span><h2>工业刀具产品</h2></div>
        <p>六类产品均可根据图纸、样品和使用要求制造</p>
      </div>
      <div class="blade-grid">${cards.map(productCard).join("\n")}</div>
      <div class="section-actions"><a class="text-link" href="${base}/products/">查看全部产品<span aria-hidden="true">→</span></a></div>
    </div>
  </section>

  <section class="section partner-section">
    <div class="container partner-layout">
      <figure class="partner-media">
        <picture>
          <source srcset="${base}/img/6-6uVLfQnG-1440.webp" type="image/webp">
          <img src="${base}/img/6-6uVLfQnG-1440.jpeg" width="1440" height="810" loading="lazy" decoding="async" alt="群新工业漳州生产基地">
        </picture>
      </figure>
      <div class="partner-copy">
        <span class="eyebrow">定制制造</span>
        <h2>根据制造条件确定方案</h2>
        <p>刀型、材料和工艺由工程人员结合图纸、样品与实际切割条件确认</p>
        <div class="partner-points">
          <div class="partner-point"><strong>工程确认</strong><span>尺寸、材料、硬度与数量</span></div>
          <div class="partner-point"><strong>精密制造</strong><span>机加工、热处理与研磨</span></div>
          <div class="partner-point"><strong>检验交付</strong><span>按双方确认项目执行检验</span></div>
        </div>
        <a class="button button-accent" href="${base}/capabilities/">查看制造能力</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">开始询价</span><h2>三种询价方式</h2></div>
        <p>没有完整图纸也可以先提交现有资料</p>
      </div>
      <div class="rfq-paths">
        <a class="rfq-path" href="${base}/rfq/"><b>01</b><h3>提交图纸</h3><p>提供尺寸、公差、材料与数量</p><span aria-hidden="true">→</span></a>
        <a class="rfq-path" href="${base}/rfq/"><b>02</b><h3>提供样品</h3><p>寄送旧刀或上传多个角度的清晰照片</p><span aria-hidden="true">→</span></a>
        <a class="rfq-path" href="${base}/rfq/"><b>03</b><h3>说明工况</h3><p>告诉我们设备、切割材料和当前问题</p><span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>

  <section class="section process-band">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">制造流程</span><h2>从图纸到成品</h2></div>
        <p>具体路线根据刀具结构与检验要求确定</p>
      </div>
      <div class="process-steps">
        <div class="process-step-home"><b>01</b><h3>资料确认</h3><p>核对刀型、尺寸和应用条件</p></div>
        <div class="process-step-home"><b>02</b><h3>材料与热处理</h3><p>按确认方案准备材料与硬度</p></div>
        <div class="process-step-home"><b>03</b><h3>加工与研磨</h3><p>完成机加工、精密研磨和刃口处理</p></div>
        <div class="process-step-home"><b>04</b><h3>检验与交付</h3><p>检验、刃口防护和包装</p></div>
      </div>
      <div class="section-actions"><a class="text-link" href="${base}/capabilities/">查看八道工序<span aria-hidden="true">→</span></a></div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">制造与质量</span><h2>真实工厂与检测现场</h2></div>
        <p>以实际设备、工序和检验记录支持项目评估</p>
      </div>
      <div class="evidence-home-grid">
        <article class="evidence-home-item">
          <figure><img src="${base}/images/web/process-20260725/04-machining.jpg" width="1280" height="720" loading="lazy" decoding="async" alt="群新工业机加工现场"></figure>
          <div class="evidence-home-copy"><h3>制造能力</h3><p>机加工、热处理、精密研磨与刃口处理</p><a class="text-link" href="${base}/capabilities/">查看能力<span aria-hidden="true">→</span></a></div>
        </article>
        <article class="evidence-home-item">
          <figure><img src="${base}/img/DjfribI31j-720.jpeg" width="720" height="480" loading="lazy" decoding="async" alt="群新工业检测设备"></figure>
          <div class="evidence-home-copy"><h3>质量控制</h3><p>依据图纸与确认要求检查关键尺寸、硬度和刃口状态</p><a class="text-link" href="${base}/quality/">查看质量体系<span aria-hidden="true">→</span></a></div>
        </article>
      </div>
    </div>
  </section>

  <section class="section reference-section">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">合作参考</span><h2>合作客户与设备品牌</h2></div>
      </div>
      ${logos}
      <div class="section-actions"><a class="text-link" href="${base}/customers/">查看合作参考<span aria-hidden="true">→</span></a></div>
    </div>
  </section>

  <section class="rfq-band">
    <div class="container rfq-band-grid">
      <div><span class="eyebrow">技术询价</span><h2>提交项目资料</h2></div>
      <p>图纸、样品与工况任选其一即可开始</p>
      <a class="button" href="${base}/rfq/">开始询价</a>
    </div>
  </section>
</main>`;
}

function enHome(logos) {
  const cards = [
    {
      number: "01",
      href: `${base}/en/products/woodworking-knives/`,
      image: "product-woodworking",
      alt: "Woodworking machine knife",
      title: "Woodworking Knives",
      description: "Planing, finger jointing and panel sizing",
    },
    {
      number: "02",
      href: `${base}/en/products/food-processing-knives/`,
      image: "product-food",
      alt: "Food processing machine knife",
      title: "Food Processing Knives",
      description: "Slicing, portioning and preparation",
    },
    {
      number: "03",
      href: `${base}/en/products/plastic-crusher-blades/`,
      image: "product-recycling",
      alt: "Plastics recycling machine knife",
      title: "Recycling Knives",
      description: "Crushing, shredding and granulation",
    },
    {
      number: "04",
      href: `${base}/en/products/paper-slitting-knives/`,
      image: "product-paper",
      alt: "Paper slitting machine knife",
      title: "Paper Slitting Knives",
      description: "Slitting, trimming and cut-off",
    },
    {
      number: "05",
      href: `${base}/en/products/textile-cutting-knives/`,
      image: "product-textile",
      alt: "Textile cutting machine knife",
      title: "Textile Cutting Knives",
      description: "Cutting tables, rotary cutters and sewing",
    },
    {
      number: "06",
      href: `${base}/en/products/custom-industrial-blades/`,
      image: "product-custom",
      alt: "Custom industrial machine knife",
      title: "Custom Machine Knives",
      description: "Made to drawing or physical sample",
    },
  ];

  return `<main id="main-content">
  ${hero({
    eyebrow: "MADE TO DRAWING OR SAMPLE",
    title: "Custom Industrial Blades, Built to Your Requirements.",
    intro:
      "For equipment makers and industrial users. Send a drawing, sample or cutting requirement for engineering review and quotation.",
    primary: "Send an RFQ",
    secondary: "View Products",
    rfq: `${base}/en/rfq/`,
  })}

  <section class="section" id="product-directory">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">Products</span><h2>Industrial Knife Products</h2></div>
        <p>Six product groups manufactured to drawings, samples and application requirements</p>
      </div>
      <div class="blade-grid">${cards.map(productCard).join("\n")}</div>
      <div class="section-actions"><a class="text-link" href="${base}/en/products/">View All Products<span aria-hidden="true">→</span></a></div>
    </div>
  </section>

  <section class="section partner-section">
    <div class="container partner-layout">
      <figure class="partner-media">
        <picture>
          <source srcset="${base}/img/6-6uVLfQnG-1440.webp" type="image/webp">
          <img src="${base}/img/6-6uVLfQnG-1440.jpeg" width="1440" height="810" loading="lazy" decoding="async" alt="Teamstar Zhangzhou manufacturing site">
        </picture>
      </figure>
      <div class="partner-copy">
        <span class="eyebrow">Custom Manufacturing</span>
        <h2>A Process Matched to the Application</h2>
        <p>Blade geometry, material and processing are reviewed against drawings, samples and actual cutting conditions</p>
        <div class="partner-points">
          <div class="partner-point"><strong>Engineering Review</strong><span>Dimensions, material, hardness and quantity</span></div>
          <div class="partner-point"><strong>Precision Production</strong><span>Machining, heat treatment and grinding</span></div>
          <div class="partner-point"><strong>Inspection</strong><span>Checks performed to agreed requirements</span></div>
        </div>
        <a class="button button-accent" href="${base}/en/capabilities/">View Capabilities</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">Start an RFQ</span><h2>Three Ways to Start</h2></div>
        <p>A complete drawing is helpful but not required for the first review</p>
      </div>
      <div class="rfq-paths">
        <a class="rfq-path" href="${base}/en/rfq/"><b>01</b><h3>Send a Drawing</h3><p>Share dimensions, tolerances, material and quantity</p><span aria-hidden="true">→</span></a>
        <a class="rfq-path" href="${base}/en/rfq/"><b>02</b><h3>Provide a Sample</h3><p>Send an existing knife or clear photos from several angles</p><span aria-hidden="true">→</span></a>
        <a class="rfq-path" href="${base}/en/rfq/"><b>03</b><h3>Describe the Application</h3><p>Tell us the machine, material being cut and current issue</p><span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>

  <section class="section process-band">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">Manufacturing Process</span><h2>From Drawing to Finished Knife</h2></div>
        <p>The production route is set by blade geometry and inspection requirements</p>
      </div>
      <div class="process-steps">
        <div class="process-step-home"><b>01</b><h3>Requirement Review</h3><p>Confirm geometry, dimensions and cutting conditions</p></div>
        <div class="process-step-home"><b>02</b><h3>Material and Heat Treatment</h3><p>Prepare material and hardness to the agreed route</p></div>
        <div class="process-step-home"><b>03</b><h3>Machining and Grinding</h3><p>Complete machining, precision grinding and edge work</p></div>
        <div class="process-step-home"><b>04</b><h3>Inspection and Delivery</h3><p>Inspect, protect the edge and pack for shipment</p></div>
      </div>
      <div class="section-actions"><a class="text-link" href="${base}/en/capabilities/">View the Eight Stages<span aria-hidden="true">→</span></a></div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">Production and Quality</span><h2>Real Manufacturing and Inspection</h2></div>
        <p>Actual equipment, process evidence and inspection practice support project review</p>
      </div>
      <div class="evidence-home-grid">
        <article class="evidence-home-item">
          <figure><img src="${base}/images/web/process-20260725/04-machining.jpg" width="1280" height="720" loading="lazy" decoding="async" alt="Teamstar machining process"></figure>
          <div class="evidence-home-copy"><h3>Manufacturing</h3><p>Machining, heat treatment, precision grinding and edge preparation</p><a class="text-link" href="${base}/en/capabilities/">View Capabilities<span aria-hidden="true">→</span></a></div>
        </article>
        <article class="evidence-home-item">
          <figure><img src="${base}/img/DjfribI31j-720.jpeg" width="720" height="480" loading="lazy" decoding="async" alt="Teamstar inspection equipment"></figure>
          <div class="evidence-home-copy"><h3>Quality Control</h3><p>Key dimensions, hardness and edge condition checked to agreed requirements</p><a class="text-link" href="${base}/en/quality/">View Quality Control<span aria-hidden="true">→</span></a></div>
        </article>
      </div>
    </div>
  </section>

  <section class="section reference-section">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">References</span><h2>Customer and Equipment References</h2></div>
      </div>
      ${logos}
      <div class="section-actions"><a class="text-link" href="${base}/en/customers/">View References<span aria-hidden="true">→</span></a></div>
    </div>
  </section>

  <section class="rfq-band">
    <div class="container rfq-band-grid">
      <div><span class="eyebrow">Technical RFQ</span><h2>Send Your Project Information</h2></div>
      <p>Start with a drawing, sample or application description</p>
      <a class="button" href="${base}/en/rfq/">Start an RFQ</a>
    </div>
  </section>
</main>`;
}

const zhPath = path.join(root, "index.html");
const enPath = path.join(root, "en/index.html");
const zhOriginal = await readFile(zhPath, "utf8");
const enOriginal = await readFile(enPath, "utf8");
const zhLogos = logoWall(zhOriginal);
const enLogos = logoWall(enOriginal);

for (const file of await htmlFiles(root)) {
  let html = await readFile(file, "utf8");
  html = html
    .replaceAll("redesign-2v", "redesign-2w")
    .replace(
      /<link href="\/teamstar-website-review\/assets\/css\/site-2v-overrides\.css\?v=[^"]+" rel="stylesheet">/,
      `<link href="${base}/assets/css/site-2w.css?v=20260730-2w" rel="stylesheet">`
    )
    .replace(
      /site-(?:2v|base)\.css\?v=20260730-(?:2v|2w)/g,
      "site-base.css?v=20260730-2w"
    );
  await writeFile(file, html);
}

for (const [file, main] of [
  [zhPath, zhHome(zhLogos)],
  [enPath, enHome(enLogos)],
]) {
  let html = await readFile(file, "utf8");
  html = html.replace(
    /<main id="main-content">[\s\S]*?<\/main>/,
    main
  );
  html = html.replace(
    /(<div class="footer-brand">\s*<strong>TEAMSTAR MANUFACTURING<\/strong>\s*<p>)[\s\S]*?(<\/p>)/,
    `$1${
      file === zhPath
        ? "按图纸、样品和使用要求制造工业机械刀具"
        : "Industrial machine knives made to drawings, samples and application requirements"
    }$2`
  );
  await writeFile(file, html);
}

console.log("Applied Teamstar 2w redesign to the review mirror");
