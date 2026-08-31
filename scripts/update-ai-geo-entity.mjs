import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const organization = {
  "@type": "Organization",
  "@id": "https://www.teamstarmfg.com/#organization",
  name: "Teamstar Manufacturing",
  legalName: "群新工业（漳州）有限公司",
  alternateName: [
    "Qunxin Industrial",
    "群新工业",
    "Teamstar Manufacturing (Zhangzhou) Ltd.",
  ],
  url: "https://www.teamstarmfg.com/",
  logo: "https://www.teamstarmfg.com/images/web/brand-sign.jpg",
  foundingDate: "2023-11-01",
  email: "ga01@teamstarmfg.com",
  parentOrganization: {
    "@type": "Organization",
    name: "Great Knives Manufacture Co., Ltd.",
    alternateName: "Wei Qun Cutting Tools Group",
    url: "https://www.greatknives.com.tw/",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: "rd01@teamstarmfg.com",
    availableLanguage: ["Chinese", "English"],
  },
  knowsAbout: [
    "Custom industrial machine knives",
    "Textile and apparel cutting knives",
    "Paper slitting knives",
    "Food processing machine knives",
    "Plastic crusher and granulator knives",
    "Woodworking machine knives",
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "No. 6 Shunxing Road, Gutong Farm, Changtai District",
    addressLocality: "Zhangzhou",
    addressRegion: "Fujian",
    addressCountry: "CN",
  },
};

function htmlFiles(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "full-style-preview") return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(absolute);
    return entry.isFile() && entry.name.endsWith(".html") ? [absolute] : [];
  });
}

function updateOrganization(html) {
  let updated = false;
  const next = html.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    (block, json) => {
      let document;
      try {
        document = JSON.parse(json.trim());
      } catch {
        return block;
      }
      if (!Array.isArray(document["@graph"])) return block;
      const index = document["@graph"].findIndex((node) => {
        const types = Array.isArray(node?.["@type"])
          ? node["@type"]
          : [node?.["@type"]];
        return types.includes("Organization");
      });
      if (index < 0) return block;
      document["@graph"][index] = organization;
      updated = true;
      return `<script type="application/ld+json"> ${JSON.stringify(document, null, 2)} </script>`;
    },
  );
  return { html: next, found: updated };
}

function updateRetiredMailbox(html, relative) {
  let next = html.replaceAll(
    '<a href="mailto:info@teamstarmfg.com">info@teamstarmfg.com</a>',
    '<a href="mailto:ga01@teamstarmfg.com">ga01@teamstarmfg.com</a>',
  );
  if (relative.startsWith("en/")) {
    next = next.replace(
      '<a href="mailto:ga01@teamstarmfg.com">ga01@teamstarmfg.com</a> <a href="tel:',
      '<a href="mailto:ga01@teamstarmfg.com">General enquiries: ga01@teamstarmfg.com</a> <a href="mailto:rd01@teamstarmfg.com">Sales enquiries: rd01@teamstarmfg.com</a> <a href="tel:',
    );
  } else {
    next = next.replace(
      '<a href="mailto:ga01@teamstarmfg.com">ga01@teamstarmfg.com</a> <a href="tel:',
      '<a href="mailto:ga01@teamstarmfg.com">一般咨询：ga01@teamstarmfg.com</a> <a href="mailto:rd01@teamstarmfg.com">销售咨询：rd01@teamstarmfg.com</a> <a href="tel:',
    );
  }
  return next;
}

const companyCopy = new Map([
  [
    "company/index.html",
    [
      [
        '<div class="timeline-year">2024</div><div><h3>漳州群新工业成立</h3><p>开展工业机械刀具制造与销售业务。</p>',
        '<div class="timeline-year">2024.06</div><div><h3>漳州生产基地启动搬迁</h3><p>群新工业启动生产基地搬迁工作。</p>',
      ],
    ],
  ],
  [
    "en/company/index.html",
    [
      [
        '<div class="timeline-year">2024</div><div><h3>Qunxin Industrial established in Zhangzhou</h3><p>Established for the manufacture and sale of industrial machine knives.</p>',
        '<div class="timeline-year">2024.06</div><div><h3>Relocation to the Zhangzhou base began</h3><p>Qunxin Industrial began the move to its Zhangzhou manufacturing base.</p>',
      ],
    ],
  ],
]);

let changed = 0;
let found = 0;
for (const file of htmlFiles()) {
  const relative = path.relative(root, file);
  const original = fs.readFileSync(file, "utf8");
  const entityUpdate = updateOrganization(original);
  if (!entityUpdate.found) continue;
  found += 1;
  let next = updateRetiredMailbox(entityUpdate.html, relative);

  for (const [from, to] of companyCopy.get(relative) || []) {
    if (next.includes(from)) next = next.replace(from, to);
    else if (!next.includes(to)) throw new Error(`${relative}: expected timeline copy not found`);
  }

  if (next !== original) {
    fs.writeFileSync(file, next);
    changed += 1;
  }
}

if (found !== 54) throw new Error(`Expected 54 canonical Organization pages, found ${found}`);
console.log(`Updated canonical Organization data in ${changed} of ${found} local review HTML files.`);
