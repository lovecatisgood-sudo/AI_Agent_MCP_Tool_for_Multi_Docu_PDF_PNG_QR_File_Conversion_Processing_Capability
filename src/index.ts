#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { HELP } from "./cli.js";
import { createConfig, parseCliArgs } from "./config.js";
import { createServer } from "./server.js";

async function main() {
  const options = parseCliArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(HELP);
    return;
  }
  if (options.version) {
    process.stdout.write("0.1.0\n");
    return;
  }
  const config = await createConfig(options);
  const server = createServer(config);
  const transport = new StdioServerTransport();
  process.on("SIGINT", () => void server.close().finally(() => process.exit(0)));
  process.on("SIGTERM", () => void server.close().finally(() => process.exit(0)));
  await server.connect(transport);
  console.error(`DJAI Tools MCP running with ${config.enabledTools.size} tools; profile=${config.profile}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
