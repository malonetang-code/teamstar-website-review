import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const organization = {
  "@type": "Organization",
  "@id": "https://www.teamstarmfg.com/#organization",
  name: "Teamstar Manufacturing",
  legalName: [
    "群新工业（漳州）有限公司",
    "Teamstar Manufacturing (Zhangzhou) Ltd.",
  ],
  alternateName: [
    "Qunxin Industrial",
    "群新工业",
  ],
  url: "https://www.teamstarmfg.com/",
  logo: "https://www.teamstarmfg.com/images/web/brand-sign.jpg",
  foundingDate: "2023-11-01",
  email: "ga01@teamstarmfg.com",
  telephone: "+8615305070074",
  memberOf: {
    "@type": "Organization",
    name: "Wei Qun Cutting Tools Group",
    alternateName: "伟群制刀工业集团",
    url: "https://www.greatknives.com.tw/",
    foundingDate: "1978",
    description: "Wei Qun Cutting Tools Group was founded in Taiwan in 1978 and began by manufacturing industrial cutting products for the garment industry.",
  },
  location: {
    "@type": "Place",
    "@id": "https://www.teamstarmfg.com/company/#zhangzhou-manufacturing-site",
    name: "Zhangzhou manufacturing site",
    address: {
      "@type": "PostalAddress",
      streetAddress: "No. 6 Shunxing Road, Gutong Farm, Changtai District",
      addressLocality: "Zhangzhou",
      addressRegion: "Fujian",
      addressCountry: "CN",
    },
    additionalProperty: {
      "@type": "PropertyValue",
      name: "Manufacturing space",
      minValue: 10000,
      unitCode: "MTK",
      unitText: "square metres",
    },
  },
  hasCertification: {
    "@type": "Certification",
    "@id": "https://www.teamstarmfg.com/quality/#iso-9001-certification",
    name: "ISO 9001:2015 Quality Management System Certification",
    description: "Design and manufacture of precision knives, hand tools and hardware components for industrial use, including heat treatment and assembly.",
    certificationIdentification: "CN25/00004088",
    certificationStatus: "https://schema.org/CertificationActive",
    validFrom: "2025-06-16",
    expires: "2028-06-15",
    url: "https://www.teamstarmfg.com/images/certs/iso9001-en.pdf",
    issuedBy: {
      "@type": "Organization",
      name: "SGS United Kingdom Ltd.",
      url: "https://www.sgs.com/",
    },
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "general inquiries",
      email: "ga01@teamstarmfg.com",
      telephone: "+8615305070074",
      availableLanguage: ["Chinese", "English"],
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "rd01@teamstarmfg.com",
      availableLanguage: ["Chinese", "English"],
    },
  ],
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
    next = next.replaceAll(
      '<a href="tel:+8618150707007">+86 181-5070-7007</a>',
      '<a href="tel:+8615305070074">General enquiries phone: +86 153-0507-0074</a>',
    );
  } else {
    next = next.replace(
      '<a href="mailto:ga01@teamstarmfg.com">ga01@teamstarmfg.com</a> <a href="tel:',
      '<a href="mailto:ga01@teamstarmfg.com">一般咨询：ga01@teamstarmfg.com</a> <a href="mailto:rd01@teamstarmfg.com">销售咨询：rd01@teamstarmfg.com</a> <a href="tel:',
    );
    next = next.replaceAll(
      '<a href="tel:+8618150707007">+86 181-5070-7007</a>',
      '<a href="tel:+8615305070074">一般咨询电话：153 0507 0074</a>',
    );
  }
  return next;
}

const companyCopy = new Map([
  [
    "company/index.html",
    [
      [
        '<div class="timeline-year">40+</div><div><h3>工业刀具行业经验</h3><p>集团业务始于台湾，积累超过 40 年的工业刀具行业经验。</p></div></div> <div class="timeline-row"><div class="timeline-year">1990</div><div><h3>深圳生产基地成立</h3><p>拓展集团在中国大陆的制造体系。</p>',
        '<div class="timeline-year">1978</div><div><h3>集团在台湾创立</h3><p>开始制造服装行业用工业裁切产品。</p></div></div> <div class="timeline-row"><div class="timeline-year">1991</div><div><h3>深圳生产启动</h3><p>集团在广东深圳启动生产。</p>',
      ],
      [
        '<div class="timeline-year">1990</div><div><h3>集团工业刀具业务起步</h3><p>集团开始从事工业刀具制造，并建立深圳生产基地。</p>',
        '<div class="timeline-year">1978</div><div><h3>集团在台湾创立</h3><p>开始制造服装行业用工业裁切产品。</p></div></div> <div class="timeline-row"><div class="timeline-year">1991</div><div><h3>深圳生产启动</h3><p>集团在广东深圳启动生产。</p>',
      ],
      [
        '<div class="timeline-year">2024</div><div><h3>漳州群新工业成立</h3><p>开展工业机械刀具制造与销售业务。</p>',
        '<div class="timeline-year">2024.06</div><div><h3>漳州生产基地启动搬迁</h3><p>群新工业启动生产基地搬迁工作。</p>',
      ],
      [
        '<h1>群新工业</h1> <p>伟群制刀工业集团成员企业，漳州生产基地专注工业机械刀具制造。</p>',
        '<h1>群新工业</h1> <p>群新工业（漳州）有限公司是伟群制刀工业集团成员企业，专注工业机械刀具制造。</p>',
      ],
    ],
  ],
  [
    "en/company/index.html",
    [
      [
        '<div class="timeline-year">40+</div><div><h3>Industrial cutting-tool experience</h3><p>The group business originated in Taiwan and has accumulated more than 40 years of industry experience.</p></div></div> <div class="timeline-row"><div class="timeline-year">1990</div><div><h3>Shenzhen production base established</h3><p>Expanded the group manufacturing system in mainland China.</p>',
        '<div class="timeline-year">1978</div><div><h3>Group founded in Taiwan</h3><p>Great Knives began manufacturing industrial cutting products for the garment industry.</p></div></div> <div class="timeline-row"><div class="timeline-year">1991</div><div><h3>Production launched in Shenzhen</h3><p>The group launched production in Shenzhen, Guangdong.</p>',
      ],
      [
        '<div class="timeline-year">1990</div><div><h3>Group industrial knife manufacturing began</h3><p>The group began manufacturing industrial knives and established its Shenzhen production base.</p>',
        '<div class="timeline-year">1978</div><div><h3>Group founded in Taiwan</h3><p>Great Knives began manufacturing industrial cutting products for the garment industry.</p></div></div> <div class="timeline-row"><div class="timeline-year">1991</div><div><h3>Production launched in Shenzhen</h3><p>The group launched production in Shenzhen, Guangdong.</p>',
      ],
      [
        '<div class="timeline-year">2024</div><div><h3>Qunxin Industrial established in Zhangzhou</h3><p>Established for the manufacture and sale of industrial machine knives.</p>',
        '<div class="timeline-year">2024.06</div><div><h3>Relocation to the Zhangzhou base began</h3><p>Qunxin Industrial began the move to its Zhangzhou manufacturing base.</p>',
      ],
      [
        '<h1>Qunxin Industrial</h1> <p>A Wei Qun Cutting Tools Group company focused on industrial machine knife manufacturing in Zhangzhou.</p>',
        '<h1>Teamstar Manufacturing (Zhangzhou) Ltd.</h1> <p>A member of Wei Qun Cutting Tools Group, focused on industrial machine knife manufacturing in Zhangzhou.</p>',
      ],
    ],
  ],
]);

const heritageReplacements = [
  ["始于 1990 年的制造积累", "始于 1978 年的集团制刀积累"],
  ["集团自 1990 年开展工业刀具制造", "集团于 1978 年在台湾创立，并开始制造工业刀具"],
  ["始于 1990", "始于 1978"],
  [">1990<", ">1978<"],
  ["Group industrial knife manufacturing since 1990", "Group industrial knife manufacturing since 1978"],
  ["Group knife manufacturing since 1990", "Group knife manufacturing since 1978"],
  ["The group has manufactured industrial knives since 1990", "The group was founded in Taiwan in 1978 and has manufactured industrial knives since then"],
  ["Manufacturing experience since 1990", "Group knife-making experience since 1978"],
  ["Since 1990", "Since 1978"],
];

function updateHeritageCopy(html) {
  return heritageReplacements.reduce(
    (next, [from, to]) => next.replaceAll(from, to),
    html,
  );
}

const facilityCopy = new Map([
  [
    "company/index.html",
    [
      "<p>现场照片展示漳州基地的厂区入口、办公与生产楼、制造车间、数控设备区和检测室。</p>",
      "<p>漳州基地生产厂房超过 10,000 平方米。以下现场照片展示厂区入口、办公与生产楼、制造车间、数控设备区和检测室。</p>",
    ],
  ],
  [
    "en/company/index.html",
    [
      "<p>The photographs show the site entrance, office and production building, manufacturing workshop, CNC equipment area and inspection room at the Zhangzhou base.</p>",
      "<p>The Zhangzhou site provides more than 10,000 m² of manufacturing space. The photographs show the site entrance, office and production building, manufacturing workshop, CNC equipment area and inspection room.</p>",
    ],
  ],
]);

const homeFacilityProof = new Map([
  [
    "index.html",
    {
      introFrom: "以长期积累、自主制造和灵活数量支持不同规模的产品需求",
      introTo: "以制造积累、实体基地、关键工序控制和灵活数量支持长期合作",
      marker: "<h3>灵活定制</h3>",
      proof: '<article class="why-proof"><strong class="why-proof-value why-proof-value-space">10,000+<small>m²</small></strong><h3>漳州生产厂房</h3><p>漳州基地生产厂房超过 10,000 平方米。</p></article>',
    },
  ],
  [
    "home/index.html",
    {
      introFrom: "以长期积累、自主制造和灵活数量支持不同规模的产品需求",
      introTo: "以制造积累、实体基地、关键工序控制和灵活数量支持长期合作",
      marker: "<h3>灵活定制</h3>",
      proof: '<article class="why-proof"><strong class="why-proof-value why-proof-value-space">10,000+<small>m²</small></strong><h3>漳州生产厂房</h3><p>漳州基地生产厂房超过 10,000 平方米。</p></article>',
    },
  ],
  [
    "en/index.html",
    {
      introFrom: "Long manufacturing experience, critical processes under our control, and quantities matched to the project.",
      introTo: "Manufacturing heritage, a substantial operating site, in-house process control and flexible quantities support long-term supply.",
      marker: "<h3>Flexible custom quantities</h3>",
      proof: '<article class="why-proof"><strong class="why-proof-value why-proof-value-space">10,000+<small>m²</small></strong><h3>Zhangzhou manufacturing site</h3><p>More than 10,000 m² of manufacturing space.</p></article>',
    },
  ],
  [
    "en/home/index.html",
    {
      introFrom: "Long manufacturing experience, critical processes under our control, and quantities matched to the project.",
      introTo: "Manufacturing heritage, a substantial operating site, in-house process control and flexible quantities support long-term supply.",
      marker: "<h3>Flexible custom quantities</h3>",
      proof: '<article class="why-proof"><strong class="why-proof-value why-proof-value-space">10,000+<small>m²</small></strong><h3>Zhangzhou manufacturing site</h3><p>More than 10,000 m² of manufacturing space.</p></article>',
    },
  ],
]);

function updateFacilityCopy(html, relative) {
  let next = html;
  const company = facilityCopy.get(relative);
  if (company && !next.includes("10,000")) {
    if (!next.includes(company[0])) throw new Error(`${relative}: factory evidence copy marker not found`);
    next = next.replace(company[0], company[1]);
  }
  const home = homeFacilityProof.get(relative);
  if (home) {
    next = next.replace(home.introFrom, home.introTo);
    if (next.includes("why-proof-value-space")) {
      next = next.replace(
        /<article class="why-proof"><strong class="why-proof-value why-proof-value-space">[\s\S]*?<\/article>/,
        home.proof,
      );
    } else {
      const markerIndex = next.indexOf(home.marker);
      if (markerIndex < 0) throw new Error(`${relative}: Why Qunxin quantity marker not found`);
      const articleEnd = next.indexOf("</article>", markerIndex);
      if (articleEnd < 0) throw new Error(`${relative}: Why Qunxin quantity article end not found`);
      const insertAt = articleEnd + "</article>".length;
      next = `${next.slice(0, insertAt)}${home.proof}${next.slice(insertAt)}`;
    }
  }
  return next;
}

const qualityCertificationCopy = new Map([
  [
    "quality/index.html",
    `<section class="section iso-certificate-section" id="iso-9001-certificate" aria-labelledby="iso-certificate-title"><div class="container iso-certificate-grid"><div class="iso-certificate-copy"><span class="eyebrow">CERTIFIED QUALITY MANAGEMENT</span><h2 id="iso-certificate-title">ISO 9001:2015 认证</h2><p>认证主体为群新工业（漳州）有限公司，认证范围涵盖工业用精密刀具、手工具和五金件的设计和制造，包括热处理和组装。</p><dl class="iso-certificate-facts"><div><dt>证书编号</dt><dd>CN25/00004088</dd></div><div><dt>有效期</dt><dd><time datetime="2025-06-16">2025 年 6 月 16 日</time>至<time datetime="2028-06-15">2028 年 6 月 15 日</time></dd></div><div><dt>认证机构</dt><dd>SGS United Kingdom Ltd.</dd></div></dl><p class="iso-certificate-note">证书须通过符合要求的监督审核保持有效。</p><a class="button button-outline" href="/teamstar-website-review/images/certs/iso9001-cn.pdf">查看中文证书</a></div><a class="iso-certificate-card" href="/teamstar-website-review/images/certs/iso9001-cn.pdf" aria-label="打开群新工业 ISO 9001:2015 中文证书"><img src="/teamstar-website-review/images/certs/iso9001-cn-thumb.jpg" width="847" height="1200" loading="lazy" decoding="async" alt="群新工业 ISO 9001:2015 证书缩略图"></a></div></section>`,
  ],
  [
    "en/quality/index.html",
    `<section class="section iso-certificate-section" id="iso-9001-certificate" aria-labelledby="iso-certificate-title"><div class="container iso-certificate-grid"><div class="iso-certificate-copy"><span class="eyebrow">CERTIFIED QUALITY MANAGEMENT</span><h2 id="iso-certificate-title">ISO 9001:2015 Certification</h2><p>Teamstar Manufacturing (Zhangzhou) Ltd. is certified for the design and manufacture of precision knives, hand tools and hardware components for industrial use, including heat treatment and assembly.</p><dl class="iso-certificate-facts"><div><dt>Certificate</dt><dd>CN25/00004088</dd></div><div><dt>Validity</dt><dd><time datetime="2025-06-16">16 June 2025</time> to <time datetime="2028-06-15">15 June 2028</time></dd></div><div><dt>Certification body</dt><dd>SGS United Kingdom Ltd.</dd></div></dl><p class="iso-certificate-note">Validity remains subject to satisfactory surveillance audits.</p><a class="button button-outline" href="/teamstar-website-review/images/certs/iso9001-en.pdf">View English certificate</a></div><a class="iso-certificate-card" href="/teamstar-website-review/images/certs/iso9001-en.pdf" aria-label="Open the Teamstar ISO 9001:2015 English certificate"><img src="/teamstar-website-review/images/certs/iso9001-en-thumb.jpg" width="847" height="1200" loading="lazy" decoding="async" alt="Teamstar ISO 9001:2015 certificate thumbnail"></a></div></section>`,
  ],
]);

function updateQualityCertification(html, relative) {
  const section = qualityCertificationCopy.get(relative);
  if (!section) return html;
  let next = html;
  if (!next.includes("ai-geo-evidence.css")) {
    next = next.replace(
      "</head>",
      '<link href="/teamstar-website-review/assets/css/ai-geo-evidence.css?v=20260831-1" rel="stylesheet"></head>',
    );
  }
  if (!next.includes('id="iso-9001-certificate"')) {
    const marker = '</section> <section class="section section-system">';
    if (!next.includes(marker)) throw new Error(`${relative}: quality introduction marker not found`);
    next = next.replace(marker, `</section> ${section} <section class="section section-system">`);
  }
  return next;
}

let changed = 0;
let found = 0;
for (const file of htmlFiles()) {
  const relative = path.relative(root, file);
  const original = fs.readFileSync(file, "utf8");
  const entityUpdate = updateOrganization(original);
  if (entityUpdate.found) found += 1;
  let next = entityUpdate.found
    ? updateRetiredMailbox(entityUpdate.html, relative)
    : entityUpdate.html;

  for (const [from, to] of companyCopy.get(relative) || []) {
    if (next.includes(from)) next = next.replace(from, to);
  }

  next = updateHeritageCopy(next);
  next = updateFacilityCopy(next, relative);
  next = updateQualityCertification(next, relative);

  if (next !== original) {
    fs.writeFileSync(file, next);
    changed += 1;
  }
}

if (found !== 54) throw new Error(`Expected 54 canonical Organization pages, found ${found}`);
console.log(`Updated canonical Organization data in ${changed} of ${found} local review HTML files.`);
