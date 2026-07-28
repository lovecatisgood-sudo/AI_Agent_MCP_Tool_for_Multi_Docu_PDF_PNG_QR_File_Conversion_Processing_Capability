import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createConfig, parseCliArgs } from "../src/config.js";
import { createServer } from "../src/server.js";

test("core profile lists only its seven tools and calls token counting", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "djai-mcp-server-"));
  const config = await createConfig(parseCliArgs([]), temp);
  const server = createServer(config);
  const client = new Client({ name: "test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  try {
    const listed = await client.listTools();
    assert.equal(listed.tools.length, 7);
    assert.ok(listed.tools.some((tool) => tool.name === "djai_ai_count_tokens"));
    assert.ok(!listed.tools.some((tool) => tool.name === "djai_data_json_to_csv"));
    const result = await client.callTool({ name: "djai_ai_count_tokens", arguments: { text: "Hello MCP", encoding: "o200k_base" } });
    assert.equal(result.isError, undefined);
    assert.equal(result.structuredContent?.success, true);
  } finally {
    await client.close();
    await server.close();
  }
});

test("full profile writes CSV and QR outputs inside the configured root", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "djai-mcp-tools-"));
  const inputPath = path.join(temp, "people.csv");
  const jsonPath = path.join(temp, "people.json");
  await writeFile(inputPath, "name,value\n Alice , 1 \nAlice,1\nBob,2\n");
  await writeFile(jsonPath, '[{"name":"Alice","value":"1"},{"name":"Bob","value":"2"}]');
  const config = await createConfig(parseCliArgs(["--profile", "full"]), temp);
  const server = createServer(config);
  const client = new Client({ name: "test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  try {
    const listed = await client.listTools();
    assert.equal(listed.tools.length, 8);
    const optimized = await client.callTool({ name: "djai_ai_optimize_context", arguments: { input_path: inputPath } });
    assert.equal(optimized.structuredContent?.success, true);
    const chunks = await client.callTool({ name: "djai_ai_chunk_for_rag", arguments: { input_path: inputPath, chunk_size: 100, overlap: 20 } });
    assert.equal(chunks.structuredContent?.success, true);
    const packaged = await client.callTool({ name: "djai_ai_package_prompt", arguments: { input_paths: [inputPath, jsonPath], boundary: "xml" } });
    assert.equal(packaged.structuredContent?.success, true);
    const toJson = await client.callTool({ name: "djai_data_csv_to_json", arguments: { input_path: inputPath } });
    assert.equal(toJson.structuredContent?.success, true);
    const toCsv = await client.callTool({ name: "djai_data_json_to_csv", arguments: { input_path: jsonPath } });
    assert.equal(toCsv.structuredContent?.success, true);
    const csvResult = await client.callTool({ name: "djai_data_clean_csv", arguments: { input_path: inputPath } });
    assert.equal(csvResult.structuredContent?.success, true);
    assert.match(await readFile(path.join(temp, "djai-output", "people-clean.csv"), "utf8"), /Bob,2/);
    const qrResult = await client.callTool({ name: "djai_qr_generate", arguments: { content: "https://www.djai.academy/" } });
    assert.equal(qrResult.structuredContent?.success, true);
    assert.match(await readFile(path.join(temp, "djai-output", "djai-qr-code.svg"), "utf8"), /<svg/);
  } finally {
    await client.close();
    await server.close();
  }
});
