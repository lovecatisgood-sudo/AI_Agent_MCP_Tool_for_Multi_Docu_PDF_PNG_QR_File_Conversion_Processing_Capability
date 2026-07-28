import type { ToolResult } from "../types.js";

export function mcpResult(result: ToolResult) {
  const text = JSON.stringify(result, null, 2);
  return {
    content: [{ type: "text" as const, text }],
    structuredContent: result
  };
}

export async function timedResult(tool: string, run: () => Promise<Omit<ToolResult, "success" | "tool" | "processingMs" | "modifiedInput">>): Promise<ToolResult> {
  const started = performance.now();
  const value = await run();
  return {
    success: true,
    tool,
    processingMs: Math.round(performance.now() - started),
    modifiedInput: false,
    ...value
  };
}
