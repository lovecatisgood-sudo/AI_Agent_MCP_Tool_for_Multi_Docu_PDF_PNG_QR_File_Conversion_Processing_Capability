export const HELP = `DJAI Tools MCP v0.1.0

Run a private local MCP server over stdio.

Usage:
  djai-tools-mcp [options]

Options:
  --profile <name>       core (default), ai-documents, data, qr, or full
  --tools <ids>          Comma-separated exact selectors; overrides --profile
  --allow-read <dir>     Allowed read directory; repeatable (default: cwd)
  --allow-write <dir>    Allowed write directory; repeatable (default: ./djai-output)
  --max-file-mb <number> Per-file limit from 0 to 1024 (default: 25)
  --overwrite            Permit replacing existing output files
  --help, -h             Show this help
  --version, -v          Show the version

Tool selectors:
  ai.count_tokens, ai.optimize_context, ai.chunk_for_rag, ai.package_prompt,
  data.csv_to_json, data.json_to_csv, data.clean_csv, qr.generate
`;
