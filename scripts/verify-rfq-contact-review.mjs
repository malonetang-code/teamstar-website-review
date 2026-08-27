import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function requireText(relativePath, html, text) {
  if (!html.includes(text)) failures.push(`${relativePath}: missing ${text}`);
}

function rejectText(relativePath, html, text) {
  if (html.includes(text)) failures.push(`${relativePath}: old copy remains: ${text}`);
}

for (const relativePath of ['rfq/index.html', 'en/rfq/index.html']) {
  const html = read(relativePath);
  requireText(relativePath, html, 'name="robots" content="noindex,nofollow,noarchive"');
  requireText(relativePath, html, 'action="/teamstar-website-review/api/rfq"');
  requireText(relativePath, html, '/assets/css/rfq-contact-4.css?v=20260827-1');
  requireText(relativePath, html, 'data-rfq-form');
  requireText(relativePath, html, 'data-rfq-files');
  const stepCount = (html.match(/data-rfq-step=/g) || []).length;
  if (stepCount !== 3) failures.push(`${relativePath}: expected 3 form steps, found ${stepCount}`);
}

const zh = read('rfq/index.html');
[
  '我们能为您做什么？',
  '请发送询价，或说明您的切割需求。',
  '直接联系我们',
  '联系方式',
  '产品与需求',
  '核对并发送',
  '现有资料',
  '实物或照片',
  '应用需求',
  '价格和交期将在查看需求后确认。',
].forEach((text) => requireText('rfq/index.html', zh, text));
[
  '上传图纸不是必选项',
  '询价资料入口',
  '按图制造',
  '按样复刻',
  '工况评估',
  '提交技术询价',
].forEach((text) => rejectText('rfq/index.html', zh, text));

const en = read('en/rfq/index.html');
[
  'How can we help?',
  'Send us your inquiry or tell us about your cutting application.',
  'Contact us directly',
  'Contact details',
  'Product &amp; requirements',
  'Review &amp; send',
  'Sample or photo',
  'Application details',
  'Price and lead time will be confirmed after review.',
].forEach((text) => requireText('en/rfq/index.html', en, text));
[
  'A drawing is helpful, but not required.',
  'Starting point',
  'Submit technical RFQ',
].forEach((text) => rejectText('en/rfq/index.html', en, text));

const siteJs = read('assets/js/site.js');
requireText('assets/js/site.js', siteJs, 'sample:"实物或照片"');
requireText('assets/js/site.js', siteJs, 'sample:"Sample or photo"');
requireText('assets/js/site.js', siteJs, 'rd01@teamstarmfg.com');
rejectText('assets/js/site.js', siteJs, 'email info@teamstarmfg.com.');

const htmlFiles = [];
function collectHtml(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectHtml(fullPath);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(fullPath);
  }
}
collectHtml(root);

for (const file of htmlFiles) {
  const relativePath = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  const labels = [...html.matchAll(/class="nav-rfq"[^>]*>([^<]+)<\/a>/g)].map((match) => match[1]);
  for (const label of labels) {
    const expected = relativePath.startsWith('en/') ? 'Request a Quote' : '获取报价';
    if (label !== expected) failures.push(`${relativePath}: nav RFQ label is ${label}, expected ${expected}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`RFQ contact review verified across ${htmlFiles.length} HTML files.`);
