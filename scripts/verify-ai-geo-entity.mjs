import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
let checked = 0;

function htmlFiles(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "full-style-preview") return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".html") ? [absolute] : [];
  });
}

function findOrganization(html, relative) {
  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    let document;
    try {
      document = JSON.parse(match[1].trim());
    } catch (error) {
      errors.push(`${relative}: invalid JSON-LD (${error.message})`);
      continue;
    }
    if (!Array.isArray(document["@graph"])) continue;
    const organization = document["@graph"].find((node) => {
      const types = Array.isArray(node?.["@type"])
        ? node["@type"]
        : [node?.["@type"]];
      return types.includes("Organization");
    });
    if (organization) return organization;
  }
  return null;
}

for (const file of htmlFiles()) {
  const relative = path.relative(root, file);
  const html = fs.readFileSync(file, "utf8");
  const organization = findOrganization(html, relative);
  if (!organization) continue;
  checked += 1;

  const expected = {
    foundingDate: "2023-11-01",
    email: "ga01@teamstarmfg.com",
  };
  for (const [key, value] of Object.entries(expected)) {
    if (organization[key] !== value) {
      errors.push(`${relative}: Organization ${key} is ${JSON.stringify(organization[key])}`);
    }
  }

  const legalNames = Array.isArray(organization.legalName)
    ? organization.legalName
    : [organization.legalName].filter(Boolean);
  for (const legalName of [
    "群新工业（漳州）有限公司",
    "Teamstar Manufacturing (Zhangzhou) Ltd.",
  ]) {
    if (!legalNames.includes(legalName)) {
      errors.push(`${relative}: missing legal company name ${legalName}`);
    }
  }
  if (organization.alternateName?.includes("Teamstar Manufacturing (Zhangzhou) Ltd.")) {
    errors.push(`${relative}: official English company name remains classified as an alternate name`);
  }

  const contactPoints = Array.isArray(organization.contactPoint)
    ? organization.contactPoint
    : [organization.contactPoint].filter(Boolean);
  const general = contactPoints.find((point) => point.contactType === "general inquiries");
  const sales = contactPoints.find((point) => point.contactType === "sales");
  if (
    organization.telephone !== "+8615305070074" ||
    general?.email !== "ga01@teamstarmfg.com" ||
    general?.telephone !== "+8615305070074"
  ) {
    errors.push(`${relative}: general enquiries phone/email are not canonical`);
  }
  if (sales?.email !== "rd01@teamstarmfg.com" || sales?.telephone) {
    errors.push(`${relative}: sales must use rd01@teamstarmfg.com without a phone number`);
  }
  if (organization.alternateName?.includes("Wei Qun Cutting Tools Group")) {
    errors.push(`${relative}: parent group is incorrectly listed as an alternate company name`);
  }
  if (organization.parentOrganization) {
    errors.push(`${relative}: group membership must not be represented as a parent organization`);
  }
  const areaServed = Array.isArray(organization.areaServed)
    ? organization.areaServed
    : [organization.areaServed].filter(Boolean);
  if (
    !areaServed.some(
      (area) => area?.["@type"] === "AdministrativeArea" && area?.name === "Europe",
    ) ||
    !areaServed.some(
      (area) => area?.["@type"] === "Country" && area?.name === "United States",
    )
  ) {
    errors.push(`${relative}: confirmed Europe and United States markets are missing`);
  }
  if (
    organization.memberOf?.name !== "Wei Qun Cutting Tools Group" ||
    organization.memberOf?.alternateName !== "伟群制刀工业集团" ||
    organization.memberOf?.url !== "https://www.greatknives.com.tw/" ||
    organization.memberOf?.foundingDate !== "1978" ||
    organization.memberOf?.description !==
      "Wei Qun Cutting Tools Group was founded in Taiwan in 1978 and began by manufacturing industrial cutting products for the garment industry." ||
    !organization.knowsAbout
  ) {
    errors.push(`${relative}: confirmed group membership or manufacturing scope evidence is missing`);
  }
  for (const capability of [
    "Direct export order handling",
    "OEM and private-label industrial knife manufacturing",
    "Material and production-batch traceability",
    "Industrial knife sample approval and change control",
  ]) {
    if (!organization.knowsAbout?.includes(capability)) {
      errors.push(`${relative}: missing confirmed capability ${capability}`);
    }
  }
  const groupBrands = Array.isArray(organization.memberOf?.brand)
    ? organization.memberOf.brand
    : [];
  for (const [name, url] of [
    ["GOLDEN EAGLE", "https://www.greatknives.tw/"],
    ["QUICKLY", "https://www.greatknives.com.tw/industries/38/"],
    ["WAYKEN", "https://www.wayken.com.tw/"],
  ]) {
    if (
      !groupBrands.some(
        (brand) =>
          brand?.["@type"] === "Brand" &&
          brand?.name === name &&
          brand?.url === url,
      )
    ) {
      errors.push(`${relative}: missing verified group brand ${name}`);
    }
  }
  const facilityProperties = organization.location?.additionalProperty;
  const manufacturingSpace = Array.isArray(facilityProperties)
    ? facilityProperties.find((property) => property?.name === "Manufacturing space")
    : null;
  const warehouseSpace = Array.isArray(facilityProperties)
    ? facilityProperties.find((property) => property?.name === "Warehouse space")
    : null;
  if (
    organization.location?.["@type"] !== "Place" ||
    organization.location?.["@id"] !== "https://www.teamstarmfg.com/company/#zhangzhou-manufacturing-site" ||
    organization.location?.name !== "Zhangzhou manufacturing site" ||
    manufacturingSpace?.["@type"] !== "PropertyValue" ||
    manufacturingSpace?.minValue !== 10000 ||
    manufacturingSpace?.unitCode !== "MTK" ||
    manufacturingSpace?.unitText !== "square metres" ||
    warehouseSpace?.["@type"] !== "PropertyValue" ||
    warehouseSpace?.value !== 2000 ||
    warehouseSpace?.unitCode !== "MTK" ||
    warehouseSpace?.unitText !== "square metres"
  ) {
    errors.push(`${relative}: confirmed Zhangzhou manufacturing and warehouse space facts are missing`);
  }
  const certification = organization.hasCertification;
  if (
    certification?.["@type"] !== "Certification" ||
    certification?.["@id"] !== "https://www.teamstarmfg.com/quality/#iso-9001-certification" ||
    certification?.name !== "ISO 9001:2015 Quality Management System Certification" ||
    certification?.description !==
      "Design and manufacture of precision knives, hand tools and hardware components for industrial use, including heat treatment and assembly." ||
    certification?.certificationIdentification !== "CN25/00004088" ||
    certification?.certificationStatus !== "https://schema.org/CertificationActive" ||
    "validFrom" in certification ||
    "expires" in certification ||
    certification?.url !== "https://www.teamstarmfg.com/images/certs/iso9001-en.pdf" ||
    certification?.issuedBy?.["@type"] !== "Organization" ||
    certification?.issuedBy?.name !== "SGS United Kingdom Ltd." ||
    certification?.issuedBy?.url !== "https://www.sgs.com/"
  ) {
    errors.push(`${relative}: verified ISO 9001 certification data is missing or inconsistent`);
  }
  if (!html.includes('name="robots" content="noindex,nofollow,noarchive"')) {
    errors.push(`${relative}: local review robots protection missing`);
  }
  if (html.includes("info@teamstarmfg.com")) {
    errors.push(`${relative}: retired info mailbox remains`);
  }
  if (
    html.includes("18150707007") ||
    html.includes("181-5070-7007") ||
    html.includes("tel:+8618150707007")
  ) {
    errors.push(`${relative}: non-company 181 telephone remains`);
  }
  for (const unsupportedClaim of [
    "一个工作日内回复",
    "24 小时内回复",
    "每批提供材质证明",
    "within one business day",
    "within 24 hours",
    "Material certificates are provided with every batch",
  ]) {
    if (html.includes(unsupportedClaim)) {
      errors.push(`${relative}: unsupported fixed commitment remains: ${unsupportedClaim}`);
    }
  }
}

const qualityChecks = [
  [
    "quality/index.html",
    [
      'href="/teamstar-website-review/assets/css/ai-geo-evidence.css?v=20260831-1"',
      'id="iso-9001-certificate"',
      "认证主体为群新工业（漳州）有限公司",
      "工业用精密刀具、手工具和五金件的设计和制造，包括热处理和组装",
      "CN25/00004088",
      "SGS United Kingdom Ltd.",
      "/teamstar-website-review/images/certs/iso9001-cn.pdf",
      "/teamstar-website-review/images/certs/iso9001-cn-thumb.jpg",
      "核对并保存图纸或样品版本、材料要求和验收项目；原材料批次、热处理批次、生产工单、检验记录和检验报告可关联追溯，复购按已确认资料复核。",
      "图纸、材料、热处理或关键工艺如需变更，实施前先与客户确认。",
      "新定制项目按项目安排样品确认。",
      "每批依据验收要求放行，保留相应检验记录，并随批提供检验报告。",
      "收到客户反馈后，我们会尽快回复并启动技术复核",
    ],
  ],
  [
    "en/quality/index.html",
    [
      'href="/teamstar-website-review/assets/css/ai-geo-evidence.css?v=20260831-1"',
      'id="iso-9001-certificate"',
      "Teamstar Manufacturing (Zhangzhou) Ltd. is certified",
      "design and manufacture of precision knives, hand tools and hardware components for industrial use, including heat treatment and assembly",
      "CN25/00004088",
      "SGS United Kingdom Ltd.",
      "/teamstar-website-review/images/certs/iso9001-en.pdf",
      "/teamstar-website-review/images/certs/iso9001-en-thumb.jpg",
      "Raw-material batches, heat-treatment batches, production work orders, inspection records and inspection reports can be traced together",
      "Changes to the drawing, material, heat treatment or key process are confirmed with the customer before implementation.",
      "sample approval is arranged for new custom projects as appropriate.",
      "Release each batch against the acceptance criteria, retain the inspection records and provide an inspection report with the shipment.",
      "Customer feedback is answered promptly and moved into technical review",
    ],
  ],
];

for (const [relative, required] of qualityChecks) {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  for (const phrase of required) {
    if (!html.includes(phrase)) errors.push(`${relative}: missing verified certificate evidence ${phrase}`);
  }
  if ((html.match(/id="iso-9001-certificate"/g) ?? []).length !== 1) {
    errors.push(`${relative}: expected exactly one visible ISO certificate section`);
  }
  const nonconformancePhrase = relative.startsWith("en/")
    ? "Customer feedback is answered promptly and moved into technical review before remake, replacement or another agreed resolution is arranged."
    : "收到客户反馈后，我们会尽快回复并启动技术复核，再根据双方确认结果安排重做、补货或其他处理。";
  if ((html.split(nonconformancePhrase).length - 1) !== 1) {
    errors.push(`${relative}: nonconformance statement must appear exactly once`);
  }
}

const certificateFiles = [
  [
    "images/certs/iso9001-cn.pdf",
    "2a28a07193e060c6d3bc966c70c628db6c9d7e46800c1dbe28562734423a459f",
  ],
  [
    "images/certs/iso9001-en.pdf",
    "d98767da0ba7b7bd86b585e57a68306b6f86c368b7e7047edeb488c9a36d3edf",
  ],
];

for (const [relative, expectedHash] of certificateFiles) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    errors.push(`${relative}: verified source certificate is missing`);
    continue;
  }
  const actualHash = createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
  if (actualHash !== expectedHash) errors.push(`${relative}: source certificate digest changed`);
}

const companyChecks = [
  [
    "company/index.html",
    [
      "2024.06",
      "1978",
      "集团在台湾创立",
      "开始制造服装行业用工业裁切产品。",
      "1991",
      "深圳生产启动",
      "集团在广东深圳启动生产。",
      "群新的制造业务支持集团在欧洲和美国的客户。群新现可直接接单，并独立办理合同、收款、开票及出口报关。",
      "company-timeline-only",
      "漳州生产基地启动搬迁",
      "群新工业启动生产基地搬迁工作。",
      "漳州基地生产厂房超过 10,000 平方米",
      "另设 2,000 平方米仓储空间。",
    ],
    [
      "40+",
      "超过 40 年",
      "1990",
      "漳州群新工业成立",
      "开展工业机械刀具制造与销售业务。",
      "集团品牌与接单方式",
      "GOLDEN EAGLE、QUICKLY 和 WAYKEN 是集团服装行业品牌。",
      "过往海外订单由台北集团协调并安排生产",
    ],
  ],
  [
    "en/company/index.html",
    [
      "2024.06",
      "1978",
      "Group founded in Taiwan",
      "Great Knives began manufacturing industrial cutting products for the garment industry.",
      "1991",
      "Production launched in Shenzhen",
      "The group launched production in Shenzhen, Guangdong.",
      "Teamstar Manufacturing (Zhangzhou) Ltd.",
      "Teamstar manufacturing supports group customers in Europe and the United States. Teamstar now also accepts direct orders and handles contracting, payment, invoicing and export customs formalities.",
      "company-timeline-only",
      "Relocation to the Zhangzhou base began",
      "Qunxin Industrial began the move to its Zhangzhou manufacturing base.",
      "The Zhangzhou site provides more than 10,000 m² of manufacturing space",
      "with a further 2,000 m² dedicated to warehousing.",
    ],
    [
      "40+",
      "more than 40 years",
      "1990",
      "Qunxin Industrial established in Zhangzhou",
      "Established for the manufacture and sale of industrial machine knives.",
      "Group brands and order handling",
      "GOLDEN EAGLE, QUICKLY and WAYKEN are group brands serving the garment industry.",
      "Overseas orders were historically coordinated by the Taipei group and assigned for production",
    ],
  ],
];

for (const [relative, required, rejected] of companyChecks) {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  for (const phrase of required) {
    if (!html.includes(phrase)) errors.push(`${relative}: missing ${phrase}`);
  }
  for (const phrase of rejected) {
    if (html.includes(phrase)) errors.push(`${relative}: superseded copy remains: ${phrase}`);
  }
}

const rfqChecks = [
  [
    "rfq/index.html",
    [
      "技术人员会与您确认材料、硬度、刃口、安装尺寸和使用条件，并据此评估制造与报价。",
      "支持客户品牌、OEM 与中性或指定包装",
      "防锈、刃口保护和独立包装按产品及订单要求安排。",
      "可提供材质证明",
      "如有保密要求，可按项目签署保密协议。",
    ],
  ],
  [
    "en/rfq/index.html",
    [
      "Our technical team reviews the material, hardness, cutting edge, mounting dimensions and application with you before confirming manufacturing and quotation requirements.",
      "Customer branding, OEM/private-label manufacturing and neutral or specified packaging are available.",
      "Rust prevention, edge protection and individual packing are arranged to suit the product and order.",
      "Material certificates can be provided",
      "a confidentiality agreement can be signed when required.",
    ],
  ],
];

for (const [relative, required] of rfqChecks) {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  for (const phrase of required) {
    if (!html.includes(phrase)) {
      errors.push(`${relative}: missing confirmed customer-project support ${phrase}`);
    }
  }
}

const homeChecks = [
  [
    "home/index.html",
    "可接受单件试制，价格根据材料、工艺和项目要求评估。",
  ],
  [
    "en/home/index.html",
    "Single-piece trials can be quoted, with pricing confirmed after review of material, process and project requirements.",
  ],
];

for (const [relative, required] of homeChecks) {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  if (!html.includes(required)) errors.push(`${relative}: missing confirmed single-piece trial boundary`);
}

const qualityValidityChecks = [
  ["quality/index.html", ["<dt>有效期</dt>", "2025 年 6 月 16 日", "2028 年 6 月 15 日", "证书须通过符合要求的监督审核保持有效。"]],
  ["en/quality/index.html", ["<dt>Validity</dt>", "16 June 2025", "15 June 2028", "Validity remains subject to satisfactory surveillance audits."]],
];

for (const [relative, rejected] of qualityValidityChecks) {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  for (const phrase of rejected) {
    if (html.includes(phrase)) errors.push(`${relative}: certificate validity copy should not be displayed: ${phrase}`);
  }
}

if (checked !== 54) errors.push(`Expected 54 canonical review pages, checked ${checked}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `AI-GEO entity check passed: ${checked} canonical local-review pages keep the legal company date separate from the group history, record the 1978 group foundation and 1991 Shenzhen production launch, use consistent contacts, retain the June 2024 Zhangzhou relocation start, expose the separate 10,000+ square metre manufacturing and 2,000 square metre warehouse facts, distinguish Taipei-group order history from Teamstar direct export handling, record the verified group brands, qualified single-piece trial offer, OEM/private-label support, project confidentiality agreements, linked material and production traceability, sample and change control, order-specific packaging support, per-batch inspection reports and prompt technical review, and expose the verified bilingual ISO 9001 certificate evidence.`,
);
