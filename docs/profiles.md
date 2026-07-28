# Profiles

Profiles control which tools are registered. Register the narrowest useful set to reduce tool-selection ambiguity and agent context usage.

| Profile | Membership |
| --- | --- |
| `core` | Token count, context optimization, RAG chunks, prompt packaging, CSV-to-JSON, CSV cleaning, QR generation |
| `ai-documents` | Token count, context optimization, RAG chunks, prompt packaging |
| `data` | CSV-to-JSON, JSON-to-CSV, CSV cleaning |
| `qr` | QR SVG generation |
| `full` | All eight v0.1 tools |

`core` is the default. `--tools` overrides profile membership and accepts comma-separated selector IDs or exposed MCP names.

Examples:

```bash
node dist/index.js --profile data
node dist/index.js --tools data.clean_csv,data.csv_to_json
node dist/index.js --tools djai_ai_count_tokens
```

Profile membership may expand in backward-compatible minor releases. Use exact tools when a stable minimal registration set is important.
