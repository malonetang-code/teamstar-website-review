import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function sha256(relativePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(root, relativePath)))
    .digest("hex");
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

const productionAssetHashes = {
  "assets/css/site-2w.css":
    "4305e1d9d4691de9e58ae06fbb085a2a921d68e5da628bdad7dc1ad5a6b1fcd8",
  "assets/js/home-video.js":
    "354f1cd60f603b37c659417be2da41c29890081e23bdf31cb8472f4f555f610b",
};

for (const [file, expectedHash] of Object.entries(productionAssetHashes)) {
  expect(sha256(file) === expectedHash, `${file}: differs from production release 20260731-3a`);
}

const pageChecks = [
  ["index.html", "因需而制，以准致信。", "三种询价方式"],
  ["home/index.html", "因需而制，以准致信。", "三种询价方式"],
  [
    "en/index.html",
    "Engineered for Your Needs. Trusted for Precision.",
    "Three Ways to Start",
  ],
  [
    "en/home/index.html",
    "Engineered for Your Needs. Trusted for Precision.",
    "Three Ways to Start",
  ],
];

for (const [file, heading, removedInquiry] of pageChecks) {
  const html = read(file);
  expect(html.includes(heading), `${file}: production Home heading is missing`);
  expect(
    html.includes('name="robots" content="noindex,nofollow,noarchive"'),
    `${file}: review noindex protection is missing`,
  );
  expect(
    html.includes('name="teamstar-review-baseline" content="20260731-3a"'),
    `${file}: production baseline marker is missing`,
  );
  expect(!html.includes(removedInquiry), `${file}: removed inquiry section remains`);
  expect(!html.includes('class="rfq-paths"'), `${file}: inquiry route cards remain`);
  expect(
    (html.match(/<video\b/g) || []).length === 1,
    `${file}: expected exactly one production Home video`,
  );
  for (const required of [
    "home-company-manufacturing-montage-20260730.mp4",
    "home-company-manufacturing-montage-20260730-poster.jpg",
    "home-company-manufacturing-montage-20260730-poster-mobile.jpg",
    "data-home-video",
    "home-video.js?v=20260731-3a",
    "img/6-6uVLfQnG-1440.webp",
    "images/web/process-20260725/04-machining.jpg",
    "img/DjfribI31j-720.jpeg",
    "reference-section",
    "home-reference-marquee.css?v=20260803-2",
    "home-reference-marquee.js?v=20260803-2",
  ]) {
    expect(html.includes(required), `${file}: required production content is missing: ${required}`);
  }
  expect(
    (html.match(/class="logo-item"/g) || []).length === 10,
    `${file}: expected ten source reference logos`,
  );

  const partnerStart = html.indexOf('<section class="section partner-section">');
  const partnerEnd = html.indexOf("</section>", partnerStart);
  const partnerSection = html.slice(partnerStart, partnerEnd);
  expect(partnerStart !== -1 && partnerEnd !== -1, `${file}: partner section is missing`);
  expect(!partnerSection.includes("/rfq/"), `${file}: partner section contains an RFQ CTA`);
}

const marqueeCss = read("assets/css/home-reference-marquee.css");
const marqueeJs = read("assets/js/home-reference-marquee.js");
expect(
  marqueeCss.includes("translate3d(-50%, 0, 0)"),
  "Marquee CSS does not define a seamless half-track loop",
);
expect(
  marqueeCss.includes("prefers-reduced-motion: reduce"),
  "Marquee CSS does not respect reduced motion",
);
expect(
  marqueeJs.includes('duplicate.setAttribute("aria-hidden", "true")'),
  "Marquee duplicates are not hidden from assistive technology",
);
expect(
  marqueeJs.includes("if (reducedMotion.matches) return"),
  "Marquee script does not preserve a static reduced-motion layout",
);

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      pages: pageChecks.length,
      productionAssetsVerified: Object.keys(productionAssetHashes).length,
      noindex: true,
      inquirySectionRemoved: true,
      partnerRfqCta: false,
      sourceLogosPerLocale: 10,
      reducedMotionFallback: true,
    },
    null,
    2,
  ),
);
