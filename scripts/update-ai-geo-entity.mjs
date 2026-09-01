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
  areaServed: [
    {
      "@type": "AdministrativeArea",
      name: "Europe",
    },
    {
      "@type": "Country",
      name: "United States",
    },
  ],
  memberOf: {
    "@type": "Organization",
    name: "Wei Qun Cutting Tools Group",
    alternateName: "伟群制刀工业集团",
    url: "https://www.greatknives.com.tw/",
    foundingDate: "1978",
    description: "Wei Qun Cutting Tools Group was founded in Taiwan in 1978 and began by manufacturing industrial cutting products for the garment industry.",
    brand: [
      {
        "@type": "Brand",
        name: "GOLDEN EAGLE",
        url: "https://www.greatknives.tw/",
      },
      {
        "@type": "Brand",
        name: "QUICKLY",
        url: "https://www.greatknives.com.tw/industries/38/",
      },
      {
        "@type": "Brand",
        name: "WAYKEN",
        url: "https://www.wayken.com.tw/",
      },
    ],
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
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Manufacturing space",
        minValue: 10000,
        unitCode: "MTK",
        unitText: "square metres",
      },
      {
        "@type": "PropertyValue",
        name: "Warehouse space",
        value: 2000,
        unitCode: "MTK",
        unitText: "square metres",
      },
    ],
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
    "Direct export order handling",
    "OEM and private-label industrial knife manufacturing",
    "Material and production-batch traceability",
    "Industrial knife sample approval and change control",
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
      [
        '<h1>群新工业</h1> <p>群新工业（漳州）有限公司是伟群制刀工业集团成员企业，专注工业机械刀具制造。</p>',
        '<h1>群新工业</h1> <p>群新工业（漳州）有限公司是伟群制刀工业集团成员企业，专注工业机械刀具制造，长期服务欧洲和美国客户。</p>',
      ],
      [
        '<h1>群新工业</h1> <p>群新工业（漳州）有限公司是伟群制刀工业集团成员企业，专注工业机械刀具制造，长期服务欧洲和美国客户。</p>',
        '<h1>群新工业</h1> <p>群新的制造业务支持集团在欧洲和美国的客户，现也可直接承接客户询价与订单。</p>',
      ],
      [
        '<aside><div class="notice">各项目的制造工艺与检验方案，依据刀具类别、图纸及批量要求确定。</div></aside>',
        '<aside><div class="notice"><strong>集团品牌与接单方式</strong><br>GOLDEN EAGLE、QUICKLY 和 WAYKEN 是集团服装行业品牌。过往海外订单由台北集团协调并安排生产；群新现可直接承接客户询价与订单。</div></aside>',
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
      [
        '<h1>Teamstar Manufacturing (Zhangzhou) Ltd.</h1> <p>A member of Wei Qun Cutting Tools Group, focused on industrial machine knife manufacturing in Zhangzhou.</p>',
        '<h1>Teamstar Manufacturing (Zhangzhou) Ltd.</h1> <p>A member of Wei Qun Cutting Tools Group, Teamstar manufactures industrial machine knives in Zhangzhou for customers in Europe and the United States.</p>',
      ],
      [
        '<h1>Teamstar Manufacturing (Zhangzhou) Ltd.</h1> <p>A member of Wei Qun Cutting Tools Group, Teamstar manufactures industrial machine knives in Zhangzhou for customers in Europe and the United States.</p>',
        '<h1>Teamstar Manufacturing (Zhangzhou) Ltd.</h1> <p>Teamstar manufacturing supports group customers in Europe and the United States and now also accepts direct enquiries and orders.</p>',
      ],
      [
        '<aside><div class="notice">Manufacturing and inspection plans are defined according to the knife type, drawing and order requirements.</div></aside>',
        '<aside><div class="notice"><strong>Group brands and order handling</strong><br>GOLDEN EAGLE, QUICKLY and WAYKEN are group brands serving the garment industry. Overseas orders were historically coordinated by the Taipei group and assigned for production; Teamstar now also accepts direct enquiries and orders.</div></aside>',
      ],
      [
        '<aside><div class="notice">Manufacturing processes and inspection plans are defined for each project according to blade family, drawing and batch requirements.</div></aside>',
        '<aside><div class="notice"><strong>Group brands and order handling</strong><br>GOLDEN EAGLE, QUICKLY and WAYKEN are group brands serving the garment industry. Overseas orders were historically coordinated by the Taipei group and assigned for production; Teamstar now also accepts direct enquiries and orders.</div></aside>',
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

const operationalReplacements = [
  [
    "从单件试制到批量供货，根据实际需求安排。",
    "可接受单件试制，价格根据材料、工艺和项目要求评估。",
  ],
  [
    "From one-off trials to repeat production, quantities are arranged around the actual requirement.",
    "Single-piece trials can be quoted, with pricing confirmed after review of material, process and project requirements.",
  ],
  [
    "检验方案根据产品、图纸和使用条件制定，重点控制材料、尺寸、刃口与批次一致性。",
    "检验方案根据产品、图纸和使用条件制定，重点控制材料、尺寸、刃口与批次一致性。如检验或交付与确认要求不符，先进行技术复核，再根据双方确认结果安排重做、补货或其他处理。",
  ],
  [
    "Inspection plans follow the product, drawing and application, with focus on material, dimensions, cutting edges and batch consistency.",
    "Inspection plans follow the product, drawing and application, with focus on material, dimensions, cutting edges and batch consistency. If inspection or delivered products do not meet the agreed requirements, the issue is reviewed technically before remake, replacement or another agreed resolution.",
  ],
  [
    "核对图纸版本、材料要求和验收项目。",
    "核对并保存图纸或样品版本、材料要求和验收项目；复购按已确认资料复核。",
  ],
  [
    "Review the drawing revision, material requirements and acceptance items.",
    "Review and retain the drawing or sample revision, material requirements and acceptance items; repeat orders are checked against the confirmed records.",
  ],
  [
    "依据验收要求执行批次放行，并保留相应检验记录。",
    "每批依据验收要求放行，保留相应检验记录，并随批提供检验报告。",
  ],
  [
    "Release each batch against the acceptance criteria and retain the relevant inspection records.",
    "Release each batch against the acceptance criteria, retain the inspection records and provide an inspection report with the shipment.",
  ],
  [
    "核对并保存图纸或样品版本、材料要求和验收项目；复购按已确认资料复核。",
    "核对并保存图纸或样品版本、材料要求和验收项目；原材料与生产批次保留追溯记录，复购按已确认资料复核。",
  ],
  [
    "Review and retain the drawing or sample revision, material requirements and acceptance items; repeat orders are checked against the confirmed records.",
    "Review and retain the drawing or sample revision, material requirements and acceptance items; material and production-batch records are traceable, and repeat orders are checked against the confirmed records.",
  ],
  [
    "请告诉我们所需刀具、规格及数量。",
    "技术人员会与您确认材料、硬度、刃口、安装尺寸和使用条件，并据此评估制造与报价。",
  ],
  [
    "Tell us the blade type, specifications and quantity you need.",
    "Our technical team reviews the material, hardness, cutting edge, mounting dimensions and application with you before confirming manufacturing and quotation requirements.",
  ],
  [
    '<p class="rfq-guide-copy">如果您更方便通过邮件沟通，可直接发送询价和附件。支持客户品牌、中性或指定包装及 OEM 项目；如有保密要求，可按项目签署保密协议。支持客户品牌、中性或指定包装及 OEM 项目；如有保密要求，可按项目签署保密协议。</p>',
    '<p class="rfq-guide-copy">如果您更方便通过邮件沟通，可直接发送询价和附件。支持客户品牌、中性或指定包装及 OEM 项目；如有保密要求，可按项目签署保密协议。</p>',
  ],
  [
    '<p class="rfq-guide-copy">Prefer email? Send your inquiry and files directly to our sales team. Customer branding, neutral or specified packaging and OEM/private-label projects are supported; a confidentiality agreement can be signed when the project requires it. Customer branding, neutral or specified packaging and OEM/private-label projects are supported; a confidentiality agreement can be signed when the project requires it.</p>',
    '<p class="rfq-guide-copy">Prefer email? Send your inquiry and files directly to our sales team. Customer branding, neutral or specified packaging and OEM/private-label projects are supported; a confidentiality agreement can be signed when the project requires it.</p>',
  ],
  [
    '<p class="rfq-guide-copy">如果您更方便通过邮件沟通，可直接发送询价和附件。</p>',
    '<p class="rfq-guide-copy">如果您更方便通过邮件沟通，可直接发送询价和附件。支持客户品牌、中性或指定包装及 OEM 项目；如有保密要求，可按项目签署保密协议。</p>',
  ],
  [
    '<p class="rfq-guide-copy">Prefer email? Send your inquiry and files directly to our sales team.</p>',
    '<p class="rfq-guide-copy">Prefer email? Send your inquiry and files directly to our sales team. Customer branding, neutral or specified packaging and OEM/private-label projects are supported; a confidentiality agreement can be signed when the project requires it.</p>',
  ],
  [
    '<h1>群新工业</h1> <p>群新的制造业务支持集团在欧洲和美国的客户，现也可直接承接客户询价与订单。</p>',
    '<h1>群新工业</h1> <p>群新的制造业务支持集团在欧洲和美国的客户。群新现可直接接单，并独立办理合同、收款、开票及出口报关。</p>',
  ],
  [
    '<aside><div class="notice"><strong>集团品牌与接单方式</strong><br>GOLDEN EAGLE、QUICKLY 和 WAYKEN 是集团服装行业品牌。过往海外订单由台北集团协调并安排生产；群新现可直接承接客户询价与订单。</div></aside>',
    '<aside><div class="notice"><strong>集团品牌与接单方式</strong><br>GOLDEN EAGLE、QUICKLY 和 WAYKEN 是集团服装行业品牌。过往海外订单由台北集团协调并安排生产；群新现可直接接单，并独立办理合同、收款、开票及出口报关。</div></aside>',
  ],
  [
    '<h1>Teamstar Manufacturing (Zhangzhou) Ltd.</h1> <p>Teamstar manufacturing supports group customers in Europe and the United States and now also accepts direct enquiries and orders.</p>',
    '<h1>Teamstar Manufacturing (Zhangzhou) Ltd.</h1> <p>Teamstar manufacturing supports group customers in Europe and the United States. Teamstar now also accepts direct orders and handles contracting, payment, invoicing and export customs formalities.</p>',
  ],
  [
    '<aside><div class="notice"><strong>Group brands and order handling</strong><br>GOLDEN EAGLE, QUICKLY and WAYKEN are group brands serving the garment industry. Overseas orders were historically coordinated by the Taipei group and assigned for production; Teamstar now also accepts direct enquiries and orders.</div></aside>',
    '<aside><div class="notice"><strong>Group brands and order handling</strong><br>GOLDEN EAGLE, QUICKLY and WAYKEN are group brands serving the garment industry. Overseas orders were historically coordinated by the Taipei group and assigned for production; Teamstar now also accepts direct orders and handles contracting, payment, invoicing and export customs formalities.</div></aside>',
  ],
  [
    "检验方案根据产品、图纸和使用条件制定，重点控制材料、尺寸、刃口与批次一致性。如检验或交付与确认要求不符，先进行技术复核，再根据双方确认结果安排重做、补货或其他处理。",
    "检验方案根据产品、图纸和使用条件制定，重点控制材料、尺寸、刃口与批次一致性。收到客户反馈后，我们会尽快回复并启动技术复核，再根据双方确认结果安排重做、补货或其他处理。",
  ],
  [
    "Inspection plans follow the product, drawing and application, with focus on material, dimensions, cutting edges and batch consistency. If inspection or delivered products do not meet the agreed requirements, the issue is reviewed technically before remake, replacement or another agreed resolution.",
    "Inspection plans follow the product, drawing and application, with focus on material, dimensions, cutting edges and batch consistency. Customer feedback is answered promptly and moved into technical review before remake, replacement or another agreed resolution is arranged.",
  ],
  [
    "核对并保存图纸或样品版本、材料要求和验收项目；原材料与生产批次保留追溯记录，复购按已确认资料复核。",
    "核对并保存图纸或样品版本、材料要求和验收项目；原材料批次、热处理批次、生产工单、检验记录和检验报告可关联追溯，复购按已确认资料复核。",
  ],
  [
    "Review and retain the drawing or sample revision, material requirements and acceptance items; material and production-batch records are traceable, and repeat orders are checked against the confirmed records.",
    "Review and retain the drawing or sample revision, material requirements and acceptance items. Raw-material batches, heat-treatment batches, production work orders, inspection records and inspection reports can be traced together; repeat orders are checked against confirmed records.",
  ],
  [
    "在刀坯成形、热处理、机加工和研磨过程中实施过程检验。",
    "按已确认工艺实施过程检验；图纸、材料、热处理或关键工艺如需变更，实施前先与客户确认。",
  ],
  [
    "Perform in-process inspection during blank shaping, heat treatment, machining and grinding.",
    "Perform in-process inspection against the confirmed process. Changes to the drawing, material, heat treatment or key process are confirmed with the customer before implementation.",
  ],
  [
    "检验已确认的材料、尺寸、安装接口和刃口要求。",
    "检验已确认的材料、尺寸、安装接口和刃口要求；新定制项目按项目安排样品确认。",
  ],
  [
    "Verify the agreed material, dimensions, mounting interfaces and cutting-edge requirements.",
    "Verify the agreed material, dimensions, mounting interfaces and cutting-edge requirements; sample approval is arranged for new custom projects as appropriate.",
  ],
  [
    '<p class="rfq-guide-copy">如果您更方便通过邮件沟通，可直接发送询价和附件。支持客户品牌、中性或指定包装及 OEM 项目；如有保密要求，可按项目签署保密协议。</p>',
    '<p class="rfq-guide-copy">如果您更方便通过邮件沟通，可直接发送询价和附件。支持客户品牌、OEM 与中性或指定包装；防锈、刃口保护和独立包装按产品及订单要求安排。可提供材质证明；如有保密要求，可按项目签署保密协议。</p>',
  ],
  [
    '<p class="rfq-guide-copy">Prefer email? Send your inquiry and files directly to our sales team. Customer branding, neutral or specified packaging and OEM/private-label projects are supported; a confidentiality agreement can be signed when the project requires it.</p>',
    '<p class="rfq-guide-copy">Prefer email? Send your inquiry and files directly to our sales team. Customer branding, OEM/private-label manufacturing and neutral or specified packaging are available. Rust prevention, edge protection and individual packing are arranged to suit the product and order. Material certificates can be provided, and a confidentiality agreement can be signed when required.</p>',
  ],
];

function updateOperationalCopy(html) {
  let next = operationalReplacements.reduce(
    (next, [from, to]) => next.replaceAll(from, to),
    html,
  );
  next = next.replace(
    /(<span class="eyebrow">PROCESS CONTROL<\/span><h2>质量控制<\/h2><\/div><p>)[\s\S]*?(<\/p><\/div> <div class="quality-flow">)/,
    "$1检验方案根据产品、图纸和使用条件制定，重点控制材料、尺寸、刃口与批次一致性。收到客户反馈后，我们会尽快回复并启动技术复核，再根据双方确认结果安排重做、补货或其他处理。$2",
  );
  next = next.replace(
    /(<span class="eyebrow">PROCESS CONTROL<\/span><h2>Quality Control<\/h2><\/div><p>)[\s\S]*?(<\/p><\/div> <div class="quality-flow">)/,
    "$1Inspection plans follow the product, drawing and application, with focus on material, dimensions, cutting edges and batch consistency. Customer feedback is answered promptly and moved into technical review before remake, replacement or another agreed resolution is arranged.$2",
  );
  for (const suffix of [
    "如检验或交付与确认要求不符，先进行技术复核，再根据双方确认结果安排重做、补货或其他处理。",
    " If inspection or delivered products do not meet the agreed requirements, the issue is reviewed technically before remake, replacement or another agreed resolution.",
  ]) {
    while (next.includes(suffix + suffix)) {
      next = next.replaceAll(suffix + suffix, suffix);
    }
  }
  return next;
}

const facilityCopy = new Map([
  [
    "company/index.html",
    [
      "<p>漳州基地生产厂房超过 10,000 平方米。以下现场照片展示厂区入口、办公与生产楼、制造车间、数控设备区和检测室。</p>",
      "<p>漳州基地生产厂房超过 10,000 平方米，另设 2,000 平方米仓储空间。以下现场照片展示厂区入口、办公与生产楼、制造车间、数控设备区和检测室。</p>",
    ],
  ],
  [
    "en/company/index.html",
    [
      "<p>The Zhangzhou site provides more than 10,000 m² of manufacturing space. The photographs show the site entrance, office and production building, manufacturing workshop, CNC equipment area and inspection room.</p>",
      "<p>The Zhangzhou site provides more than 10,000 m² of manufacturing space, with a further 2,000 m² dedicated to warehousing. The photographs show the site entrance, office and production building, manufacturing workshop, CNC equipment area and inspection room.</p>",
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
  if (company) {
    if (next.includes(company[0])) {
      next = next.replace(company[0], company[1]);
    } else if (!next.includes(company[1])) {
      throw new Error(`${relative}: factory evidence copy marker not found`);
    }
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
  next = updateOperationalCopy(next);
  next = updateFacilityCopy(next, relative);
  next = updateQualityCertification(next, relative);

  if (next !== original) {
    fs.writeFileSync(file, next);
    changed += 1;
  }
}

if (found !== 54) throw new Error(`Expected 54 canonical Organization pages, found ${found}`);
console.log(`Updated canonical Organization data in ${changed} of ${found} local review HTML files.`);
