---
name: batch-data-cleanup
description: Convert and clean local CSV or JSON datasets with DJAI Tools MCP. Use when trimming tabular values, removing empty or exact duplicate CSV rows, converting CSV to a JSON array, converting a flat JSON-object array to CSV, or validating local row and column counts.
---

# Batch Data Cleanup

Prepare local tabular data for analysis, APIs, or spreadsheet import while preserving the source.

## Workflow

1. Confirm the file is UTF-8 CSV or JSON and lies inside an allowed read root.
2. Determine whether whitespace and duplicate rows are semantically meaningful. If they are, do not call `djai_data_clean_csv` without user confirmation.
3. Choose one operation:
   - `djai_data_clean_csv`: trim headers and values, remove empty rows, remove exact duplicates.
   - `djai_data_csv_to_json`: create a formatted JSON array from a header-based CSV.
   - `djai_data_json_to_csv`: create CSV from a top-level array of flat objects.
4. Write to a new path in an allowed write root.
5. Compare input expectations with reported rows, columns, removed rows, and warnings.
6. Report the output path and any lossy or ambiguous behavior.

## Limits

- Do not flatten nested JSON implicitly.
- Do not infer types: CSV values remain strings.
- Stop when the configured row or file-size limit is exceeded.
- Do not describe exact-duplicate removal as fuzzy deduplication or record linkage.
