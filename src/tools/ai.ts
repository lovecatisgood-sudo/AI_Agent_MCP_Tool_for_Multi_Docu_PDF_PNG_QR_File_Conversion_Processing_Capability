import path from "node:path";
import { readFile } from "node:fs/promises";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AppConfig } from "../types.js";
import { safeBaseName } from "../output/filenames.js";
import { mcpResult, timedResult } from "../output/results.js";
import { resolveReadableFile, resolveWritableFile, writeOutput } from "../security/paths.js";
import { countTextMetrics, countTextTokens, makeRagChunks, optimizeContext, packagePrompt, readTextSource, type TokenEncoding } from "../processors/text.js";

const sourceShape = {
  text: z.string().optional().describe("Inline UTF-8 text. Provide this or input_path, not both."),
  input_path: z.string().optional().describe("Local UTF-8 text file inside an allowed read directory. Provide this or text, not both.")
};

function optionalOutputShape() {
  return { output_path: z.string().optional().describe("Optional output path inside an allowed write directory. Existing files are rejected unless the server starts with --overwrite.") };
}

export function registerAiTools(server: McpServer, config: AppConfig) {
  if (config.enabledTools.has("ai.count_tokens")) {
    server.registerTool("djai_ai_count_tokens", {
      title: "Count AI Tokens",
      description: "Count tokens and text metrics locally. Use before budgeting prompt or RAG context. Accepts inline text or an allowed local UTF-8 file; it never modifies files.",
      inputSchema: {
        ...sourceShape,
        encoding: z.enum(["o200k_base", "cl100k_base", "p50k_base"]).default("o200k_base").describe("Tokenizer encoding to use.")
      }
    }, async (input) => mcpResult(await timedResult("djai_ai_count_tokens", async () => {
      const source = await readTextSource(input, config);
      const encoding = input.encoding as TokenEncoding;
      const metadata = countTextMetrics(source.text);
      metadata.tokens = await countTextTokens(source.text, encoding);
      return { outputPaths: [], inputBytes: source.inputBytes, warnings: [], metadata: { encoding, ...metadata } };
    })));
  }

  if (config.enabledTools.has("ai.optimize_context")) {
    server.registerTool("djai_ai_optimize_context", {
      title: "Optimize AI Context",
      description: "Clean repeated headers, page labels, broken line wraps, and excess whitespace from local text. Use before prompting or chunking extracted document text. Do not use when exact formatting must be preserved.",
      inputSchema: { ...sourceShape, ...optionalOutputShape() }
    }, async (input) => mcpResult(await timedResult("djai_ai_optimize_context", async () => {
      const source = await readTextSource(input, config);
      const output = optimizeContext(source.text);
      const warnings: string[] = [];
      const outputPaths: string[] = [];
      let outputBytes = Buffer.byteLength(output);
      let data: unknown = { text: output };
      if (input.output_path || output.length > config.limits.maxInlineCharacters) {
        const fallback = `${source.inputPath ? safeBaseName(source.inputPath) : "context"}-optimized.md`;
        const outputPath = await resolveWritableFile(input.output_path, fallback, config);
        outputBytes = await writeOutput(outputPath, output, config.overwrite);
        outputPaths.push(outputPath);
        data = { preview: output.slice(0, 2000) };
        if (!input.output_path) warnings.push("Large output was written to the default output directory instead of returned inline.");
      }
      return { outputPaths, inputBytes: source.inputBytes, outputBytes, warnings, metadata: { inputTokens: countTextMetrics(source.text).tokens, outputTokens: countTextMetrics(output).tokens }, data };
    })));
  }

  if (config.enabledTools.has("ai.chunk_for_rag")) {
    server.registerTool("djai_ai_chunk_for_rag", {
      title: "Chunk Text for RAG",
      description: "Split local text into deterministic o200k_base token chunks and write JSONL for a RAG knowledge base. Use after extraction and cleanup. Do not use overlap equal to or larger than chunk_size.",
      inputSchema: {
        ...sourceShape,
        chunk_size: z.number().int().min(100).max(8000).default(700),
        overlap: z.number().int().min(0).max(4000).default(100),
        ...optionalOutputShape()
      }
    }, async (input) => mcpResult(await timedResult("djai_ai_chunk_for_rag", async () => {
      if (input.overlap >= input.chunk_size) throw new Error("overlap must be smaller than chunk_size.");
      const source = await readTextSource(input, config);
      const result = makeRagChunks(source.text, input.chunk_size, input.overlap);
      const jsonl = result.chunks.map((chunk) => JSON.stringify(chunk)).join("\n");
      const fallback = `${source.inputPath ? safeBaseName(source.inputPath) : "rag"}-chunks.jsonl`;
      const outputPath = await resolveWritableFile(input.output_path, fallback, config);
      const outputBytes = await writeOutput(outputPath, jsonl, config.overwrite);
      return { outputPaths: [outputPath], inputBytes: source.inputBytes, outputBytes, warnings: [], metadata: { totalTokens: result.totalTokens, chunks: result.chunks.length, chunkSize: input.chunk_size, overlap: input.overlap }, data: { firstChunk: result.chunks[0] ?? null } };
    })));
  }

  if (config.enabledTools.has("ai.package_prompt")) {
    server.registerTool("djai_ai_package_prompt", {
      title: "Package Prompt Context",
      description: "Combine multiple allowed local UTF-8 files into one agent-ready Markdown or XML-delimited context file. Use to preserve source boundaries. Do not use for binary files or more than the configured batch limit.",
      inputSchema: {
        input_paths: z.array(z.string()).min(1).max(config.limits.maxBatchFiles),
        instructions: z.string().max(20_000).optional(),
        boundary: z.enum(["markdown", "xml"]).default("markdown"),
        ...optionalOutputShape()
      }
    }, async (input) => mcpResult(await timedResult("djai_ai_package_prompt", async () => {
      const resolved = await Promise.all(input.input_paths.map((item) => resolveReadableFile(item, config)));
      const totalInputBytes = resolved.reduce((total, item) => total + item.bytes, 0);
      if (totalInputBytes > config.limits.maxBatchBytes) {
        throw new Error(`Combined inputs exceed the ${Math.round(config.limits.maxBatchBytes / 1024 / 1024)} MB batch limit.`);
      }
      const parts = await Promise.all(resolved.map(async (item) => ({ name: path.basename(item.path), text: await readFile(item.path, "utf8") })));
      const output = packagePrompt(parts, input.boundary, input.instructions);
      const outputPath = await resolveWritableFile(input.output_path, `djai-agent-context.${input.boundary === "xml" ? "xml" : "md"}`, config);
      const outputBytes = await writeOutput(outputPath, output, config.overwrite);
      return { outputPaths: [outputPath], inputBytes: totalInputBytes, outputBytes, warnings: [], metadata: { sources: parts.length, boundary: input.boundary, tokens: countTextMetrics(output).tokens } };
    })));
  }
}
