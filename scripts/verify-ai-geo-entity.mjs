import fs from "node:fs";
import path from "node:path";
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
    legalName: "群新工业（漳州）有限公司",
    foundingDate: "2023-11-01",
    email: "ga01@teamstarmfg.com",
  };
  for (const [key, value] of Object.entries(expected)) {
    if (organization[key] !== value) {
      errors.push(`${relative}: Organization ${key} is ${JSON.stringify(organization[key])}`);
    }
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
  if (!organization.parentOrganization || !organization.knowsAbout) {
    errors.push(`${relative}: parent or manufacturing scope evidence is missing`);
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

const companyChecks = [
  [
    "company/index.html",
    [
      "2024.06",
      "漳州生产基地启动搬迁",
      "群新工业启动生产基地搬迁工作。",
    ],
    ["漳州群新工业成立", "开展工业机械刀具制造与销售业务。"],
  ],
  [
    "en/company/index.html",
    [
      "2024.06",
      "Relocation to the Zhangzhou base began",
      "Qunxin Industrial began the move to its Zhangzhou manufacturing base.",
    ],
    [
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
  `AI-GEO entity check passed: ${checked} canonical local-review pages use the legal 2023-11-01 founding date, the sales contact is consistent, and the visible bilingual timeline records the June 2024 Zhangzhou relocation start.`,
);
