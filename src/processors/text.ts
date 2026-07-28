import { readFile } from "node:fs/promises";
import { countTokens, decode, encode } from "gpt-tokenizer/encoding/o200k_base";
import type { AppConfig } from "../types.js";
import { resolveReadableFile } from "../security/paths.js";

export type TokenEncoding = "o200k_base" | "cl100k_base" | "p50k_base";

export async function readTextSource(input: { text?: string | undefined; input_path?: string | undefined }, config: AppConfig) {
  if ((input.text !== undefined) === (input.input_path !== undefined)) throw new Error("Provide exactly one of text or input_path.");
  if (input.text !== undefined) {
    if (input.text.length > config.limits.maxInlineCharacters) throw new Error(`Inline text exceeds ${config.limits.maxInlineCharacters} characters; use input_path.`);
    return { text: input.text, inputBytes: Buffer.byteLength(input.text), inputPath: undefined };
  }
  const file = await resolveReadableFile(input.input_path!, config);
  const text = await readFile(file.path, "utf8");
  return { text, inputBytes: file.bytes, inputPath: file.path };
}

export async function countTextTokens(text: string, encoding: TokenEncoding): Promise<number> {
  if (encoding === "cl100k_base") return (await import("gpt-tokenizer/encoding/cl100k_base")).countTokens(text);
  if (encoding === "p50k_base") return (await import("gpt-tokenizer/encoding/p50k_base")).countTokens(text);
  return countTokens(text);
}

export function countTextMetrics(text: string) {
  const segments = (granularity: "grapheme" | "word" | "sentence") => [...new Intl.Segmenter(undefined, { granularity }).segment(text)];
  const words = text ? segments("word").filter((segment) => segment.isWordLike).length : 0;
  return {
    tokens: countTokens(text),
    words,
    characters: text ? segments("grapheme").length : 0,
    bytes: Buffer.byteLength(text),
    lines: text ? text.split(/\r\n|\r|\n/u).length : 0,
    paragraphs: text.trim() ? text.trim().split(/\n\s*\n/u).length : 0
  };
}

export function optimizeContext(input: string): string {
  const normalized = input.replace(/\n\s*page\s+\d+(?:\s+of\s+\d+)?\s*\n/gi, "\n\f\n");
  const pages = normalized.split(/\f|\n\s*---\s*page\s+\d+\s*---\s*\n/i);
  const frequency = new Map<string, number>();
  for (const page of pages) {
    const unique = new Set(page.split("\n").map((line) => line.trim()).filter((line) => line.length > 2 && line.length < 100));
    for (const line of unique) frequency.set(line, (frequency.get(line) ?? 0) + 1);
  }
  const repeatedThreshold = Math.max(2, Math.ceil(pages.length * 0.6));
  return pages.map((page) => page
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line) => line && !/^page\s+\d+(\s+of\s+\d+)?$/i.test(line) && (frequency.get(line) ?? 0) < repeatedThreshold)
    .join("\n"))
    .join("\n\n")
    .replace(/([A-Za-z])[-‐]\n([a-z])/g, "$1$2")
    .replace(/([^\n.!?:;])\n(?=[a-z0-9])/gi, "$1 ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function makeRagChunks(text: string, size: number, overlap: number) {
  const tokens = encode(text);
  const chunks: Array<{ id: string; tokenCount: number; text: string }> = [];
  const step = size - overlap;
  for (let start = 0, index = 0; start < tokens.length; start += step, index += 1) {
    const slice = tokens.slice(start, start + size);
    chunks.push({ id: `chunk-${String(index + 1).padStart(4, "0")}`, tokenCount: slice.length, text: decode(slice) });
    if (start + size >= tokens.length) break;
  }
  return { totalTokens: tokens.length, chunks };
}

export function packagePrompt(parts: Array<{ name: string; text: string }>, boundary: "markdown" | "xml", instructions?: string): string {
  const intro = instructions?.trim() ? `${instructions.trim()}\n\n` : "";
  if (boundary === "xml") {
    const escaped = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    return `${intro}<sources>\n${parts.map((part, index) => `  <source index="${index + 1}" name="${escaped(part.name)}">\n${escaped(part.text)}\n  </source>`).join("\n")}\n</sources>\n`;
  }
  return `${intro}${parts.map((part, index) => `## Source ${index + 1}: ${part.name}\n\n${part.text}`).join("\n\n---\n\n")}\n`;
}
