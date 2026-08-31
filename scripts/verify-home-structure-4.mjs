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
      "1978",
      "集团刀具制造积累",
      "关键工序",
      "1<small>件起</small>",
      "10,000+<small>m²</small>",
      "漳州基地生产厂房超过 10,000 平方米。",
      "工业刀具、手工具与裁布设备",
      "手工具",
      "裁布机成品",
      "找到适合您的刀具",
      "请发送询价或说明您的需求",
    ],
  },
  {
    file: "home/index.html",
    locale: "zh-CN",
    markers: [
      "为什么选择群新",
      "1978",
      "集团刀具制造积累",
      "关键工序",
      "1<small>件起</small>",
      "10,000+<small>m²</small>",
      "漳州基地生产厂房超过 10,000 平方米。",
      "工业刀具、手工具与裁布设备",
      "手工具",
      "裁布机成品",
      "找到适合您的刀具",
      "请发送询价或说明您的需求",
    ],
  },
  {
    file: "en/index.html",
    locale: "en",
    markers: [
      "Why customers choose Qunxin",
      "1978",
      "Group knife manufacturing since 1978",
      "Critical processes",
      "1<small>PIECE</small>",
      "10,000+<small>m²</small>",
      "More than 10,000 m² of manufacturing space.",
      "Industrial Knives, Hand Tools and Cloth Cutting Machines",
      "Hand Tools",
      "Complete Cloth Cutting Machines",
      "Let’s find your perfect blade",
      "Send us your inquiry or describe your issue",
    ],
  },
  {
    file: "en/home/index.html",
    locale: "en",
    markers: [
      "Why customers choose Qunxin",
      "1978",
      "Group knife manufacturing since 1978",
      "Critical processes",
      "1<small>PIECE</small>",
      "10,000+<small>m²</small>",
      "More than 10,000 m² of manufacturing space.",
      "Industrial Knives, Hand Tools and Cloth Cutting Machines",
      "Hand Tools",
      "Complete Cloth Cutting Machines",
      "Let’s find your perfect blade",
      "Send us your inquiry or describe your issue",
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
    html.includes("home-structure-4.css?v=20260826-4b"),
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
    (html.match(/class="why-proof"/g) || []).length === 4,
    `${page.file}: expected four Why Qunxin proof points`,
  );
  expect(
    (html.match(/class="blade-card(?: product-pending-card)?"/g) || []).length === 8,
    `${page.file}: expected eight product categories`,
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
expect(css.includes("repeat(4, minmax(0, 1fr))"), "Desktop product grid is missing");
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
      proofPoints: 4,
      productCategories: 8,
      pendingPhotoCategories: 2,
      noindex: true,
    },
    null,
    2,
  ),
);
