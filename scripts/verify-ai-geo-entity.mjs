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
  if (
    organization.memberOf?.name !== "Wei Qun Cutting Tools Group" ||
    organization.memberOf?.alternateName !== "伟群制刀工业集团" ||
    organization.memberOf?.foundingDate !== "1978" ||
    organization.memberOf?.description !==
      "Wei Qun Cutting Tools Group was founded in Taiwan in 1978 and began by manufacturing industrial cutting products for the garment industry." ||
    !organization.knowsAbout
  ) {
    errors.push(`${relative}: confirmed group membership or manufacturing scope evidence is missing`);
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
    certification?.validFrom !== "2025-06-16" ||
    certification?.expires !== "2028-06-15" ||
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
      "2025 年 6 月 16 日",
      "2028 年 6 月 15 日",
      "SGS United Kingdom Ltd.",
      "/teamstar-website-review/images/certs/iso9001-cn.pdf",
      "/teamstar-website-review/images/certs/iso9001-cn-thumb.jpg",
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
      "16 June 2025",
      "15 June 2028",
      "SGS United Kingdom Ltd.",
      "/teamstar-website-review/images/certs/iso9001-en.pdf",
      "/teamstar-website-review/images/certs/iso9001-en-thumb.jpg",
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
      "群新工业（漳州）有限公司是伟群制刀工业集团成员企业",
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

if (checked !== 54) errors.push(`Expected 54 canonical review pages, checked ${checked}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `AI-GEO entity check passed: ${checked} canonical local-review pages keep the legal company date separate from the group history, record the 1978 group foundation and 1991 Shenzhen production launch, use consistent contacts, retain the June 2024 Zhangzhou relocation start, expose the separate 10,000+ square metre manufacturing and 2,000 square metre warehouse facts, and expose the verified bilingual ISO 9001 certificate evidence.`,
);
