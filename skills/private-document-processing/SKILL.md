---
name: private-document-processing
description: Process local text, CSV, JSON, and generated QR assets with DJAI Tools MCP while enforcing allowed directories and preserving originals. Use when privacy, local-only processing, output traceability, or safe file handling is central to a document or data task.
---

# Private Document Processing

Apply DJAI MCP tools with explicit local-file boundaries and a complete output report.

## Workflow

1. Identify the source paths, requested results, and whether exact formatting or whitespace is significant.
2. Confirm every input is inside an allowed read root and every destination is inside an allowed write root.
3. Select the narrowest applicable tool. Do not enable the `full` profile merely for convenience.
4. Preserve originals. Do not request overwrite unless the user explicitly asks to replace a known output.
5. Call the selected tool and inspect `success`, `outputPaths`, `warnings`, counts, sizes, and `modifiedInput`.
6. Report every created file. Summarize sensitive contents only when required by the task.

## Boundaries

- Supported v0.1 inputs are UTF-8 text, Markdown, CSV, and JSON. QR generation accepts inline text.
- PDF, DOCX, OCR, image conversion, XLSX, archives, and remote URLs are not supported in v0.1.
- Do not work around a denied path with a symlink, copy, shell command, or alternate service.
- Treat parser warnings as material; include them in the result summary.
