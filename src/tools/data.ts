import { readFile } from "node:fs/promises";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AppConfig } from "../types.js";
import { safeBaseName } from "../output/filenames.js";
import { mcpResult, timedResult } from "../output/results.js";
import { resolveReadableFile, resolveWritableFile, writeOutput } from "../security/paths.js";
import { cleanCsv, csvToJson, jsonToCsv } from "../processors/csv.js";

const fileShape = {
  input_path: z.string().describe("Input file inside an allowed read directory."),
  output_path: z.string().optional().describe("Optional output path inside an allowed write directory.")
};

async function loadInput(inputPath: string, config: AppConfig) {
  const input = await resolveReadableFile(inputPath, config);
  return { ...input, text: await readFile(input.path, "utf8") };
}

export function registerDataTools(server: McpServer, config: AppConfig) {
  if (config.enabledTools.has("data.csv_to_json")) {
    server.registerTool("djai_data_csv_to_json", {
      title: "Convert CSV to JSON",
      description: "Convert a header-based CSV file into a formatted JSON array locally. Use for structured imports and APIs. The input is preserved and output is written only to an allowed directory.",
      inputSchema: fileShape
    }, async (input) => mcpResult(await timedResult("djai_data_csv_to_json", async () => {
      const source = await loadInput(input.input_path, config);
      const converted = csvToJson(source.text, config.limits.maxRows);
      const outputPath = await resolveWritableFile(input.output_path, `${safeBaseName(source.path)}.json`, config);
      const outputBytes = await writeOutput(outputPath, converted.output, config.overwrite);
      return { outputPaths: [outputPath], inputBytes: source.bytes, outputBytes, warnings: converted.warnings, metadata: { rows: converted.rows.length, columns: converted.fields.length } };
    })));
  }

  if (config.enabledTools.has("data.json_to_csv")) {
    server.registerTool("djai_data_json_to_csv", {
      title: "Convert JSON to CSV",
      description: "Convert a JSON array of flat objects into CSV locally. Use for spreadsheet import. Do not use for top-level objects or deeply nested data without flattening it first.",
      inputSchema: fileShape
    }, async (input) => mcpResult(await timedResult("djai_data_json_to_csv", async () => {
      const source = await loadInput(input.input_path, config);
      const converted = jsonToCsv(source.text, config.limits.maxRows);
      const outputPath = await resolveWritableFile(input.output_path, `${safeBaseName(source.path)}.csv`, config);
      const outputBytes = await writeOutput(outputPath, converted.output, config.overwrite);
      return { outputPaths: [outputPath], inputBytes: source.bytes, outputBytes, warnings: [], metadata: { rows: converted.rows } };
    })));
  }

  if (config.enabledTools.has("data.clean_csv")) {
    server.registerTool("djai_data_clean_csv", {
      title: "Clean CSV",
      description: "Trim headers and values, remove empty rows, and remove exact duplicate rows from CSV locally. Use for basic cleanup; do not use when whitespace or duplicate rows are semantically meaningful.",
      inputSchema: fileShape
    }, async (input) => mcpResult(await timedResult("djai_data_clean_csv", async () => {
      const source = await loadInput(input.input_path, config);
      const cleaned = cleanCsv(source.text, config.limits.maxRows);
      const outputPath = await resolveWritableFile(input.output_path, `${safeBaseName(source.path)}-clean.csv`, config);
      const outputBytes = await writeOutput(outputPath, cleaned.output, config.overwrite);
      return { outputPaths: [outputPath], inputBytes: source.bytes, outputBytes, warnings: cleaned.warnings, metadata: { rows: cleaned.rows.length, columns: cleaned.fields.length, removedRows: cleaned.removedRows } };
    })));
  }
}
