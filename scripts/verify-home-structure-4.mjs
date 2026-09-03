import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

const pages = [
  {
    file: "index.html",
    locale: "zh-CN",
    markers: [
      "为什么选择群新",
      "40+<small>年</small>",
      "制刀经验",
      "关键工序",
      "1<small>件起</small>",
      "可接受单件试制，价格根据材料、工艺和项目要求评估。",
      "产品目录",
      "找到适合您的刀具",
    ],
  },
  {
    file: "home/index.html",
    locale: "zh-CN",
    markers: [
      "为什么选择群新",
      "40+<small>年</small>",
      "制刀经验",
      "关键工序",
      "1<small>件起</small>",
      "可接受单件试制，价格根据材料、工艺和项目要求评估。",
      "产品目录",
      "找到适合您的刀具",
    ],
  },
  {
    file: "en/index.html",
    locale: "en",
    markers: [
      "Why customers choose Qunxin",
      "40+<small>YEARS</small>",
      "Knife-making experience",
      "Critical processes",
      "1<small>PIECE</small>",
      "Single-piece trials can be quoted, with pricing confirmed after review of material, process and project requirements.",
      "<h2>Products</h2>",
      "Let’s find your perfect blade",
    ],
  },
  {
    file: "en/home/index.html",
    locale: "en",
    markers: [
      "Why customers choose Qunxin",
      "40+<small>YEARS</small>",
      "Knife-making experience",
      "Critical processes",
      "1<small>PIECE</small>",
      "Single-piece trials can be quoted, with pricing confirmed after review of material, process and project requirements.",
      "<h2>Products</h2>",
      "Let’s find your perfect blade",
    ],
  },
];

for (const page of pages) {
  const html = read(page.file);
  expect(!html.includes("2,000"), `${page.file}: warehouse figure should remain off the Home page`);
  expect(html.includes(`<html lang="${page.locale}">`), `${page.file}: locale is incorrect`);
  expect(
    html.includes('name="robots" content="noindex,nofollow,noarchive"'),
    `${page.file}: review robots protection is missing`,
  );
  expect(
    html.includes("home-structure-4.css?v=20260901-nav-content-1"),
    `${page.file}: structural stylesheet is missing`,
  );
  expect(
    html.includes('class="page-home page-home-video redesign-2w home-structure-4"'),
    `${page.file}: structural body scope is missing`,
  );
  for (const marker of page.markers) {
    expect(html.includes(marker), `${page.file}: missing ${marker}`);
  }

  const hero = html.indexOf('class="home-hero home-video-hero"');
  const logos = html.indexOf('class="section reference-section home-logo-section"');
  const why = html.indexOf('class="why-qunxin-section"');
  const products = html.indexOf('class="section home-product-section"');
  const contact = html.indexOf('class="rfq-band" id="contact"');
  expect(
    hero !== -1 && hero < logos && logos < why && why < products && products < contact,
    `${page.file}: visible Home section order is incorrect`,
  );
  expect(
    (html.match(/class="why-proof"/g) || []).length === 3,
    `${page.file}: expected three Why Qunxin proof points`,
  );
  const whySection = html.match(/<section class="why-qunxin-section"[\s\S]*?<\/section>/)?.[0] || "";
  expect(!/10,000|manufacturing space|生产厂房/.test(whySection), `${page.file}: facility area remains in Why Qunxin`);
  expect(
    (html.match(/class="blade-card"/g) || []).length === 6,
    `${page.file}: expected six product categories`,
  );
  expect(
    (html.match(/class="section legacy-home-section/g) || []).length === 4,
    `${page.file}: superseded Home sections are not fully isolated`,
  );
  for (const removed of [
    "40<sup>+</sup>",
    "more than 40 years",
    "超过 40 年",
    "1990",
    "提交项目资料",
    "图纸、样品与工况任选其一即可开始",
    "Send Your Project Information",
    "Start with a drawing, sample or application description",
    "按图纸或样品定制",
    "按图纸、样品与实际工况确认制造方案",
    "六类工业刀具已有实拍；手工具和裁布机成品资料正在补充",
    "请发送询价或说明您的需求",
    "MADE TO DRAWING OR SAMPLE",
    "For equipment makers and industrial users. Send a drawing, sample or cutting requirement for engineering review and quotation.",
    "Six industrial knife families are shown with current photography. Hand tool and cloth cutting machine materials are being added.",
    "Send us your inquiry or describe your issue",
  ]) {
    expect(!html.includes(removed), `${page.file}: old RFQ copy remains: ${removed}`);
  }

  const logoSection = html.slice(logos, why);
  expect(
    (logoSection.match(/class="logo-item"/g) || []).length === 10,
    `${page.file}: expected ten approved reference logos`,
  );
}

expect(
  read("index.html") === read("home/index.html"),
  "Chinese root and /home/ have diverged",
);
expect(
  read("en/index.html") === read("en/home/index.html"),
  "English root and /en/home/ have diverged",
);

for (const asset of [
  "assets/css/home-structure-4.css",
  "images/logos/kam.png",
  "images/logos/eastman.png",
  "images/logos/sata.png",
  "images/logos/stanley.png",
  "images/logos/baird-medical.png",
  "images/logos/tti.png",
  "images/logos/jwei.png",
  "images/logos/lectra.png",
  "images/logos/bullmer.png",
  "images/logos/fiskars.png",
]) {
  expect(fs.existsSync(path.join(root, asset)), `Missing required asset: ${asset}`);
}

const css = read("assets/css/home-structure-4.css");
expect(css.includes(".legacy-home-section"), "Superseded section isolation is missing");
expect(css.includes("repeat(3, minmax(0, 1fr))"), "Desktop product grid is missing");
expect(css.includes("prefers-reduced-motion: reduce"), "Reduced-motion fallback is missing");

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      pages: pages.length,
      sectionOrder: ["hero", "logos", "why-qunxin", "products", "contact"],
      proofPoints: 3,
      productCategories: 6,
      pendingPhotoCategories: 0,
      noindex: true,
    },
    null,
    2,
  ),
);
