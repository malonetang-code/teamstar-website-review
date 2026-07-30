import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

async function htmlFiles(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git") continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(target)));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(target);
  }
  return files;
}

const replacements = new Map([
  ["八道制造与质量控制工序", "制造与质量控制工序"],
  ["查看八道工序", "查看制造与质量控制工序"],
  ["Eight manufacturing and control stages", "Manufacturing and Quality Control"],
  ["View the Eight Stages", "View Manufacturing and Quality Control"],
]);

for (const file of await htmlFiles()) {
  let html = await readFile(file, "utf8");
  for (const [before, after] of replacements) {
    html = html.replaceAll(before, after);
  }
  await writeFile(file, html);
}

const generator = path.join(root, "scripts/apply-2w-redesign.mjs");
let source = await readFile(generator, "utf8");
for (const [before, after] of replacements) {
  source = source.replaceAll(before, after);
}
await writeFile(generator, source);

console.log("Removed fixed process-count language from review-mirror copy");
