import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import QRCode from "qrcode";
import { z } from "zod";
import type { AppConfig } from "../types.js";
import { mcpResult, timedResult } from "../output/results.js";
import { resolveWritableFile, writeOutput } from "../security/paths.js";

export function registerQrTools(server: McpServer, config: AppConfig) {
  if (!config.enabledTools.has("qr.generate")) return;
  server.registerTool("djai_qr_generate", {
    title: "Generate QR SVG",
    description: "Generate a deterministic QR code as a local SVG file. Use for text, URLs, Wi-Fi payloads, or identifiers. It does not fetch or validate remote URLs and never embeds a remote image.",
    inputSchema: {
      content: z.string().min(1).max(4096).describe("Text payload encoded into the QR code."),
      output_path: z.string().optional().describe("Optional .svg output path inside an allowed write directory."),
      error_correction: z.enum(["L", "M", "Q", "H"]).default("M"),
      margin: z.number().int().min(0).max(16).default(4),
      width: z.number().int().min(64).max(4096).default(512),
      dark_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#000000"),
      light_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffffff")
    }
  }, async (input) => mcpResult(await timedResult("djai_qr_generate", async () => {
    const svg = await QRCode.toString(input.content, {
      type: "svg",
      errorCorrectionLevel: input.error_correction,
      margin: input.margin,
      width: input.width,
      color: { dark: input.dark_color, light: input.light_color }
    });
    const outputPath = await resolveWritableFile(input.output_path, "djai-qr-code.svg", config);
    const outputBytes = await writeOutput(outputPath, svg, config.overwrite);
    return { outputPaths: [outputPath], inputBytes: Buffer.byteLength(input.content), outputBytes, warnings: [], metadata: { format: "svg", width: input.width, errorCorrection: input.error_correction } };
  })));
}
