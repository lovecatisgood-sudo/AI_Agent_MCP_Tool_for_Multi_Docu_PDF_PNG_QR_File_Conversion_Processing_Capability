# Architecture

```text
MCP-capable agent
      | stdio
      v
src/index.ts -> CLI/config -> MCP server -> enabled tool handlers
                                      |-> path authorization
                                      |-> resource limits
                                      |-> pure processors
                                      `-> collision-safe local output
```

The package uses the stable v1 `@modelcontextprotocol/sdk` line. `stdio` is the only v0.1 transport. Standard output is reserved for MCP protocol messages; operational messages go to standard error.

Profiles select tools at startup. CLI selector IDs such as `ai.count_tokens` are configuration identifiers; MCP names such as `djai_ai_count_tokens` are the stable agent-facing tool names.

Pure text and CSV processors are separated from MCP handlers and Node filesystem adapters. Environment-independent behavior is adapted from the DJAI browser-tools project where appropriate, while browser-only `File`, DOM, Canvas, and worker code is not imported into Node.

Structured tool results make file creation and limits observable. Every successful call reports timing, warnings, output paths, metadata, and whether an input was modified.
