---
name: agent-context-preparation
description: Build a concise, source-delimited context file from local UTF-8 requirements, code, notes, or documentation using DJAI Tools MCP. Use when preparing multiple local references for a coding agent, measuring prompt size, cleaning extracted text, or packaging sources with Markdown or XML boundaries.
---

# Agent Context Preparation

Create one traceable context artifact from local source files.

## Workflow

1. Select only relevant UTF-8 files inside the allowed read roots. Keep the batch at or below 20 files.
2. Use `djai_ai_count_tokens` on unusually large sources.
3. Use `djai_ai_optimize_context` only on prose with repeated headers, page labels, or broken wraps. Do not clean source code or formatting-sensitive text.
4. Call `djai_ai_package_prompt` with the selected `input_paths`:
   - Choose `markdown` for ordinary agent context.
   - Choose `xml` when robust machine-readable source boundaries are useful.
   - Put task-level framing in `instructions`; do not silently invent requirements.
5. Call `djai_ai_count_tokens` on the packaged output.
6. Report the output path, source count, boundary format, and token count.

## Quality checks

- Retain source names in the package.
- Do not include secrets, generated folders, binaries, or irrelevant files.
- Do not describe the package as complete unless every user-designated source was included.
- Preserve the original files and list the one new context artifact.
