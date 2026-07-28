---
name: document-to-rag
description: Prepare local UTF-8 text or Markdown documents as cleaned, token-aware JSONL chunks using DJAI Tools MCP. Use when an agent must build RAG ingestion files, chunk extracted document text, or report chunk statistics while keeping source material local.
---

# Document to RAG

Turn supported local text into deterministic JSONL chunks without sending document contents to a remote service.

## Workflow

1. Confirm the input is UTF-8 text or Markdown inside an allowed read directory.
2. If the source is PDF, DOCX, or an image, stop unless text has already been extracted. The v0.1 server does not provide extraction or OCR.
3. Call `djai_ai_count_tokens` with `input_path` to establish the input size.
4. Call `djai_ai_optimize_context` with `input_path` and an allowed `output_path` when the text contains repeated page furniture or broken wrapping. Skip cleanup when exact formatting matters.
5. Call `djai_ai_chunk_for_rag` on the cleaned path. Start with `chunk_size: 700` and `overlap: 100`; change them only for a stated retrieval requirement.
6. Report the JSONL path, total tokens, chunk count, chunk size, overlap, and warnings.

## Safety

- Preserve every source file.
- Keep all paths inside the configured read and write roots.
- Do not display sensitive content merely to prove the workflow succeeded.
- Do not use a remote converter, OCR service, embedding API, or URL fetcher unless the user separately authorizes it.
- Never claim the JSONL is embedded or indexed; this workflow only prepares chunks.
