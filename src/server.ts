import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AppConfig } from "./types.js";
import { registerAiTools } from "./tools/ai.js";
import { registerDataTools } from "./tools/data.js";
import { registerQrTools } from "./tools/qr.js";

export function createServer(config: AppConfig) {
  const server = new McpServer({ name: "djai-tools-mcp", version: "0.1.0" });
  registerAiTools(server, config);
  registerDataTools(server, config);
  registerQrTools(server, config);
  return server;
}
