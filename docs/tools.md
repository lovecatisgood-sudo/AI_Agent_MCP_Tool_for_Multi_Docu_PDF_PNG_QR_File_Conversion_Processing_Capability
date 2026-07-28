# Tool reference

All tools run locally, preserve inputs, and return JSON containing `success`, `tool`, `outputPaths`, sizes, `processingMs`, `modifiedInput`, `warnings`, and operation metadata.

CLI exact-tool selectors appear in parentheses.

## `djai_ai_count_tokens` (`ai.count_tokens`)

Counts tokens, words, graphemes, bytes, lines, and paragraphs. Provide exactly one of `text` or `input_path`. `encoding` supports `o200k_base` (default), `cl100k_base`, and `p50k_base`. It creates no files.

## `djai_ai_optimize_context` (`ai.optimize_context`)

Removes repeated short page lines, page labels, broken English hyphenation, broken prose wraps, and excess whitespace. Provide `text` or `input_path`. `output_path` is optional for small outputs; large outputs are written automatically. Do not use it on code or formatting-sensitive text.

## `djai_ai_chunk_for_rag` (`ai.chunk_for_rag`)

Writes JSONL chunks using the `o200k_base` tokenizer. Inputs: `text` or `input_path`, `chunk_size` from 100–8000, `overlap` from 0–4000 and smaller than the chunk size, and optional `output_path`.

## `djai_ai_package_prompt` (`ai.package_prompt`)

Combines 1–20 local UTF-8 files into one Markdown or XML source-delimited context file. Inputs: `input_paths`, optional `instructions`, `boundary`, and optional `output_path`.

## `djai_data_csv_to_json` (`data.csv_to_json`)

Converts a header-based UTF-8 CSV into a formatted JSON array. CSV values remain strings. Parser warnings are returned.

## `djai_data_json_to_csv` (`data.json_to_csv`)

Converts a top-level JSON array of objects into CSV. Nested values are not flattened. Non-array and non-object rows are rejected.

## `djai_data_clean_csv` (`data.clean_csv`)

Trims header names and values, removes empty rows, and removes exact duplicate rows. It does not perform fuzzy matching or type inference.

## `djai_qr_generate` (`qr.generate`)

Writes an SVG QR code from up to 4096 characters. Supports error correction `L`, `M`, `Q`, or `H`; margin 0–16; width 64–4096; and six-digit hex dark/light colors. It does not visit or validate encoded URLs.
