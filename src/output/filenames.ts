import path from "node:path";

export function safeBaseName(inputPath: string): string {
  const base = path.basename(inputPath, path.extname(inputPath));
  return base.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "djai-result";
}
