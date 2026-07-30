import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const sharp = require(
  process.env.SHARP_PATH ||
    "/Users/malone/Documents/Codex/2026-05-26/codex-codex/qunxin-company/01_projects/02_official_website_ops/teamstarmfg/node_modules/sharp"
);

const root = process.cwd();
const outputDir = path.join(root, "assets/images/2w");
const grey = { r: 160, g: 161, b: 161 };

const products = [
  ["product-woodworking", "img/crotKizX0J-960.jpeg"],
  ["product-food", "img/mZaq84W78n-960.jpeg"],
  ["product-recycling", "img/kDD9SWMj0H-960.jpeg"],
  ["product-paper", "img/W8YmneBOMh-960.jpeg"],
  ["product-textile", "img/47jYn3TWma-960.jpeg"],
  ["product-custom", "img/TTtdzuoFgG-960.jpeg"],
];

function colourDistance(r, g, b, target) {
  return Math.sqrt(
    (r - target.r) ** 2 + (g - target.g) ** 2 + (b - target.b) ** 2
  );
}

async function cutOut(input, threshold = 34) {
  const { data, info } = await sharp(input)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const corners = [
    [8, 8],
    [width - 9, 8],
    [8, height - 9],
    [width - 9, height - 9],
  ];
  const background = corners.reduce(
    (acc, [x, y]) => {
      const offset = (y * width + x) * channels;
      acc.r += data[offset];
      acc.g += data[offset + 1];
      acc.b += data[offset + 2];
      return acc;
    },
    { r: 0, g: 0, b: 0 }
  );
  background.r /= corners.length;
  background.g /= corners.length;
  background.b /= corners.length;

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const enqueue = (x, y) => {
    const pixel = y * width + x;
    if (visited[pixel]) return;
    const offset = pixel * channels;
    if (
      colourDistance(
        data[offset],
        data[offset + 1],
        data[offset + 2],
        background
      ) > threshold
    ) {
      return;
    }
    visited[pixel] = 1;
    queue[tail++] = pixel;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) enqueue(x - 1, y);
    if (x < width - 1) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y < height - 1) enqueue(x, y + 1);
  }

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      const offset = pixel * channels;
      if (visited[pixel]) {
        data[offset + 3] = 0;
      } else {
        data[offset + 3] = 255;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const padding = 6;
  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const extractWidth = Math.min(width - left, maxX - minX + 1 + padding * 2);
  const extractHeight = Math.min(
    height - top,
    maxY - minY + 1 + padding * 2
  );

  return sharp(data, {
    raw: { width, height, channels },
  })
    .extract({ left, top, width: extractWidth, height: extractHeight })
    .png()
    .toBuffer();
}

async function createProductCover(name, input) {
  const source = path.join(root, input);
  const image = sharp(source)
    .rotate()
    .resize(900, 675, {
      fit: "contain",
      background: grey,
      withoutEnlargement: false,
    })
    .modulate({ brightness: 1.01, saturation: 0.82 })
    .sharpen({ sigma: 0.55 });

  await image.clone().webp({ quality: 84 }).toFile(path.join(outputDir, `${name}.webp`));
  await image.clone().jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(outputDir, `${name}.jpg`));
}

async function productLayer(input, width, height) {
  const cutout = await cutOut(path.join(root, input));
  return sharp(cutout)
    .resize(width, height, {
      fit: "contain",
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .modulate({ brightness: 1.03, saturation: 0.86 })
    .sharpen({ sigma: 0.6 })
    .png()
    .toBuffer();
}

async function createHero(width, height, filename, mobile = false) {
  const wood = await productLayer("img/crotKizX0J-960.jpeg", mobile ? 570 : 610, mobile ? 570 : 610);
  const food = await productLayer("img/mZaq84W78n-960.jpeg", mobile ? 350 : 350, mobile ? 350 : 350);
  const textile = await productLayer("img/47jYn3TWma-960.jpeg", mobile ? 650 : 640, mobile ? 300 : 285);

  const base = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 20, g: 22, b: 24, alpha: 1 },
    },
  });

  const placements = mobile
    ? [
        { input: wood, left: 35, top: 475 },
        { input: food, left: 520, top: 550 },
        { input: textile, left: 105, top: 795 },
      ]
    : [
        { input: wood, left: 980, top: 60 },
        { input: food, left: 1500, top: 76 },
        { input: textile, left: 1230, top: 402 },
      ];

  const floorY = mobile ? 790 : 530;
  const backdrop = Buffer.from(`<svg width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#141618"/>
    <rect x="0" y="${floorY}" width="${width}" height="${height - floorY}" fill="#191c1f"/>
    <line x1="${mobile ? 36 : 930}" y1="${floorY}" x2="${width}" y2="${floorY}" stroke="#363a3e" stroke-width="1"/>
    <rect x="${mobile ? 36 : 930}" y="${mobile ? 458 : 54}" width="4" height="${mobile ? 358 : 566}" fill="#c92f27"/>
  </svg>`);
  const accents = [
    {
      input: backdrop,
      left: 0,
      top: 0,
    },
    ...placements,
  ];

  await base
    .clone()
    .composite(accents)
    .webp({ quality: 86 })
    .toFile(path.join(outputDir, `${filename}.webp`));
  await base
    .clone()
    .composite(accents)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(outputDir, `${filename}.jpg`));
}

await mkdir(outputDir, { recursive: true });
await Promise.all(products.map(([name, input]) => createProductCover(name, input)));
await createHero(1920, 720, "hero-desktop");
await createHero(900, 1100, "hero-mobile", true);

console.log(`Created 2w visuals in ${outputDir}`);
