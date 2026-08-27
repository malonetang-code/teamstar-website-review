import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function collectHtml(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtml(fullPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

function replaceOrVerify(source, from, to, label) {
  if (source.includes(from)) return source.replaceAll(from, to);
  if (source.includes(to)) return source;
  throw new Error(`${label}: neither the previous nor updated copy was found`);
}

for (const file of collectHtml(root)) {
  const relativePath = path.relative(root, file);
  const isEnglish = relativePath.startsWith('en/');
  const previousLabel = isEnglish ? 'Request a Quote' : '获取报价';
  const expertLabel = isEnglish ? 'Talk to a Knife Expert' : '咨询刀具专家';
  const rfqHref = isEnglish
    ? '/teamstar-website-review/en/rfq/'
    : '/teamstar-website-review/rfq/';
  let html = fs.readFileSync(file, 'utf8');

  html = replaceOrVerify(
    html,
    `<a href="${rfqHref}" class="nav-rfq">${previousLabel}</a>`,
    `<a href="${rfqHref}" class="nav-rfq">${expertLabel}</a>`,
    `${relativePath} desktop navigation`,
  );

  const mobileMatch = html.match(/<nav\b[^>]*class="[^"]*\bmobile-menu\b[^"]*"[^>]*>[\s\S]*?<\/nav>/);
  if (!mobileMatch || mobileMatch.index === undefined) {
    throw new Error(`${relativePath}: mobile navigation was not found`);
  }
  const mobileStart = mobileMatch.index;
  const mobile = mobileMatch[0];
  const updatedMobile = replaceOrVerify(
    mobile,
    `<a href="${rfqHref}">${previousLabel}</a>`,
    `<a href="${rfqHref}">${expertLabel}</a>`,
    `${relativePath} mobile navigation`,
  );
  html = `${html.slice(0, mobileStart)}${updatedMobile}${html.slice(mobileStart + mobile.length)}`;

  fs.writeFileSync(file, html);
}

const rfqHeadings = [
  ['rfq/index.html', '<h1>我们能为您做什么？</h1>', '<h1>告诉我们您需要什么样的刀具</h1>'],
  ['en/rfq/index.html', '<h1>How can we help?</h1>', '<h1>Talk to Our Knife Experts</h1>'],
];

for (const [relativePath, from, to] of rfqHeadings) {
  const file = path.join(root, relativePath);
  const html = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, replaceOrVerify(html, from, to, `${relativePath} hero heading`));
}

console.log('Updated expert-contact copy across the bilingual review site.');
