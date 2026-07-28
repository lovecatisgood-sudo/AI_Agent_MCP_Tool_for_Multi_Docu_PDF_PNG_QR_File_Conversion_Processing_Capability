# AI Agent MCP Tool for Local Document, PDF, PNG/Image, QR, RAG, CSV & File Processing

[![CI](https://github.com/lovecatisgood-sudo/AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability/actions/workflows/ci.yml/badge.svg)](https://github.com/lovecatisgood-sudo/AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/Model%20Context%20Protocol-local%20stdio-blue)](https://modelcontextprotocol.io/)

[English](README.md) · [ภาษาไทย](README.th.md) · [Try the original browser tools](https://www.djai.academy/tools/en/) · [Tool reference](docs/tools.md) · [Roadmap](ROADMAP.md)

Since publishing our free browser-based PDF tools, image converter and compressor, Thai-English OCR, DOCX converter, QR generator, AI token/RAG utilities, and CSV/JSON/Excel tools, many people have asked how they could let their AI or coding agents access that tool bundle and do the work for them. **DJAI Tools MCP is our answer:** a free, open-source, local-first Model Context Protocol server that gives AI agents carefully controlled file-processing capabilities on the user's own computer.

The goal is to help ChatGPT-compatible agents, Claude, Codex, Cursor, VS Code agents, and other MCP clients prepare context, count tokens, create RAG chunks, clean CSV/JSON data, generate QR files, and—through staged releases—process PDF, DOCX, OCR, PNG, JPG, WebP, images, and spreadsheets without sending private documents to DJAI.

> **Current release scope:** `v0.1.0` contains eight tested text, RAG, CSV, JSON, and QR tools. PDF conversion, DOCX, OCR, PNG/JPG image processing, and XLSX tools are published in our existing browser-tool collection and are planned for later MCP phases; they are not falsely advertised as working MCP commands in this release.

## Why we built this

Browser tools are useful when a person wants to open a page and process a file. An MCP server serves a different workflow: the user asks an agent to prepare context, clean data, generate an artifact, or perform a multi-step task, and the agent calls narrowly described tools on the user's behalf.

This project is designed to provide:

- **Local privacy:** files are read and processed on the user's machine.
- **Agent access:** MCP-compatible agents can discover and call enabled tools.
- **Controlled permissions:** the server reads and writes only inside allowed directories.
- **Repeatable workflows:** structured results report paths, sizes, counts, warnings, and processing time.
- **Smaller tool menus:** profiles register only the capabilities an agent needs.
- **Open development:** source code is free under the MIT License and welcomes community review.
- **No DJAI processing bill:** users provide their own compute and storage; DJAI does not host document processing.

## Working MCP tools in v0.1.0

| Capability | MCP tool | What the agent can achieve |
| --- | --- | --- |
| AI token counter | `djai_ai_count_tokens` | Measure prompt, document, code, and context size using common tokenizer encodings |
| AI context optimizer | `djai_ai_optimize_context` | Remove repeated page furniture, broken prose wrapping, and excess whitespace |
| RAG chunk generator | `djai_ai_chunk_for_rag` | Create deterministic token-aware JSONL chunks with configurable overlap |
| Prompt/context packager | `djai_ai_package_prompt` | Combine local source files with Markdown or XML boundaries for an AI agent |
| CSV to JSON | `djai_data_csv_to_json` | Convert header-based CSV rows into a formatted JSON array |
| JSON to CSV | `djai_data_json_to_csv` | Convert an array of flat JSON objects into spreadsheet-friendly CSV |
| CSV cleaner | `djai_data_clean_csv` | Trim fields, remove empty rows, and remove exact duplicates |
| QR SVG generator | `djai_qr_generate` | Generate a local SVG QR code from text, URLs, Wi-Fi payloads, or identifiers |

Planned phases cover merge/split/rotate/watermark PDF, PDF text and AI Markdown extraction, local Thai-English OCR, DOCX conversion, PNG/JPG/WebP image conversion and compression, PDF-to-image and image-to-PDF processing, and CSV/XLSX workflows. See [ROADMAP.md](ROADMAP.md).

## Example agent workflows

- “Count the tokens in these requirements and package only the relevant sources for Codex.”
- “Clean this CSV, remove exact duplicates, convert it to JSON, and report the row counts.”
- “Prepare this extracted document text as 700-token RAG chunks with 100-token overlap.”
- “Generate a high-error-correction SVG QR code for this URL.”
- Later releases: “OCR these Thai scanned pages, clean the text, and prepare a RAG knowledge base.”
- Later releases: “Merge these PDFs, add page numbers, compress the output, and preserve the originals.”

## Privacy and security model

The server uses local MCP over `stdio`; it is not a hosted upload API.

- Read root defaults to the current working directory.
- Write root defaults to `./djai-output`.
- Existing files are not overwritten unless `--overwrite` is explicitly enabled.
- Real paths and symlinks are checked before file access.
- Defaults limit files to 25 MB, packaged batches to 20 files/50 MB, inline text to 100,000 characters, and CSV/JSON to 100,000 rows.
- Remote URL fetching and shell commands built from model input are not implemented.
- Every successful operation reports the files it created and `modifiedInput: false`.

An MCP process still inherits the permissions of the account that starts it. Authorize narrow folders and read the complete [security model](docs/security.md).

## Download, install, and build

Requires Node.js 22.13 or newer and npm.

```bash
git clone https://github.com/lovecatisgood-sudo/AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability.git
cd AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability
npm ci
npm run build
node dist/index.js --version
```

Run the server from source:

```bash
node dist/index.js --profile core \
  --allow-read /absolute/path/to/documents \
  --allow-write /absolute/path/to/djai-output
```

After the npm package is published, the intended one-command installation is:

```bash
npx -y @djai/tools-mcp --profile core \
  --allow-read /absolute/path/to/documents \
  --allow-write /absolute/path/to/djai-output
```

## Connect an MCP-capable agent

For a source checkout, use the absolute path to the built server:

```json
{
  "mcpServers": {
    "djai-tools": {
      "command": "node",
      "args": [
        "/absolute/path/to/AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability/dist/index.js",
        "--profile",
        "core",
        "--allow-read",
        "/absolute/path/to/documents",
        "--allow-write",
        "/absolute/path/to/djai-output"
      ]
    }
  }
}
```

Use absolute paths because desktop agents may start the process from an unexpected directory. Client-specific examples for Claude Desktop, Codex, Cursor, and VS Code are in [`examples/`](examples/).

## Profiles and exact tool selection

```bash
node dist/index.js --profile core
node dist/index.js --profile ai-documents
node dist/index.js --profile data
node dist/index.js --profile qr
node dist/index.js --profile full

# Exact selectors override the profile
node dist/index.js --tools ai.count_tokens,ai.chunk_for_rag
```

`core` registers seven broadly useful tools; smaller profiles reduce agent context and selection ambiguity. Read [profiles](docs/profiles.md) and the [complete tool reference](docs/tools.md).

## Original free browser tools

The MCP project grows from the earlier [Free PDF, Image, OCR, DOCX, QR, AI and Data Tools](https://github.com/lovecatisgood-sudo/free-pdf-image-ocr-docx-document-converter-qr-code-ai-token-rag-csv-excel-tools). Those applications already provide live, private browser workflows for PDF, image resizing/conversion/compression, Thai-English OCR, documents, QR, AI context/RAG, CSV, JSON, and Excel.

| Browser collection | English | ไทย |
| --- | --- | --- |
| All tools | [Open](https://www.djai.academy/tools/en/) | [เปิดเครื่องมือ](https://www.djai.academy/tools/) |
| PDF tools | [Open](https://www.djai.academy/tools/PDFTools/en/) | [เปิด](https://www.djai.academy/tools/PDFTools/) |
| Image tools | [Open](https://www.djai.academy/tools/resizeimg/en/) | [เปิด](https://www.djai.academy/tools/resizeimg/) |
| Document and OCR | [Open](https://www.djai.academy/tools/document/en/) | [เปิด](https://www.djai.academy/tools/document/) |
| AI token and RAG | [Open](https://www.djai.academy/tools/ai/en/) | [เปิด](https://www.djai.academy/tools/ai/) |
| CSV/JSON/Excel | [Open](https://www.djai.academy/tools/spreadsheet/en/) | [เปิด](https://www.djai.academy/tools/spreadsheet/) |
| QR generator | [Open](https://www.djai.academy/tools/qrgen/en/) | [เปิด](https://www.djai.academy/tools/qrgen/) |

## About DJAI Academy, Siamese Cat Dev, and Siamese Cat Cafe

- [DJAI Academy](https://www.djai.academy/) develops practical technology education, software services, AI-agent integrations, and free digital tools for people and businesses.
- [Siamese Cat Dev](https://www.djai.academy/siamese_cat/dev/en/) is the independent developer and product builder behind this open-source MCP release and the original browser-tool collection.
- [Siamese Cat Cafe](https://siamesecat.cafe/) is the connected community business helping support cat adoption and independent creative development. Visitors can also find the [cafe on Google](https://share.google/I0Zp942t2DRuUzrIZ).

Stars, contributions, honest feedback, visits to the cafe, and genuine reviews from people who have visited all help sustain the software and community mission.

## Follow Siamese Cat Dev

- GitHub: [@lovecatisgood-sudo](https://github.com/lovecatisgood-sudo)
- Developer profile: [Siamese Cat Dev](https://www.djai.academy/siamese_cat/dev/en/)
- X: [@siamesecatdev](https://x.com/siamesecatdev)
- Instagram: [@djcatdev](https://www.instagram.com/djcatdev/)
- Facebook: [Siamese Cat Dev](https://www.facebook.com/people/Siamese-Cat-Dev/61592514145429/)
- Website: [DJAI Academy](https://www.djai.academy/)

## Development and contributions

```bash
npm run check
npm test
npm run build
npm pack --dry-run
```

Use only synthetic fixtures—never commit personal, proprietary, confidential, or credential-bearing documents. Read [CONTRIBUTING.md](CONTRIBUTING.md), [SUPPORT.md](SUPPORT.md), [SECURITY.md](SECURITY.md), and the [Code of Conduct](CODE_OF_CONDUCT.md).

## MIT License and attribution

This project is free and open source under the [MIT License](LICENSE). You may use, copy, modify, merge, publish, distribute, sublicense, and sell copies, including in commercial and closed-source products, provided the MIT copyright and permission notice is retained in copies or substantial portions.

Visible backlink credit is **not required** by MIT, but it is warmly appreciated:

- Creator: [Siamese Cat Dev at DJAI Academy](https://www.djai.academy/siamese_cat/dev/en/)
- Original tools: [Free PDF, Image, OCR, DOCX, QR, AI and Data Tools](https://github.com/lovecatisgood-sudo/free-pdf-image-ocr-docx-document-converter-qr-code-ai-token-rag-csv-excel-tools)
- Community business: [Siamese Cat Cafe](https://siamesecat.cafe/)

See [ATTRIBUTION.md](ATTRIBUTION.md) for copy-ready examples. The MIT License does not grant trademark rights or permission to imply endorsement; see [TRADEMARKS.md](TRADEMARKS.md).
