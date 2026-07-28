import path from "node:path";
import { access, readdir, readFile } from "node:fs/promises";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const excluded = new Set(["node_modules", "dist", ".git"]);
const markdownFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(entryPath);
    else if (entry.name.endsWith(".md")) markdownFiles.push(entryPath);
  }
}

await walk(root);
const failures = [];
const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

for (const file of markdownFiles) {
  const content = await readFile(file, "utf8");
  for (const match of content.matchAll(linkPattern)) {
    const raw = match[1].trim().replace(/^<|>$/g, "");
    if (!raw || raw.startsWith("#") || /^(https?:|mailto:)/i.test(raw)) continue;
    const target = decodeURIComponent(raw.split("#", 1)[0]);
    try {
      await access(path.resolve(path.dirname(file), target));
    } catch {
      failures.push(`${path.relative(root, file)} -> ${raw}`);
    }
  }
}

if (failures.length) {
  console.error(`Broken local documentation links:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Validated local links in ${markdownFiles.length} Markdown files.`);
}
