# AI Agent Skills Guide: Local Documents, RAG, Context, CSV/JSON and Privacy

[English](SKILLS.md) · [ภาษาไทย](SKILLS.th.md) · [Main README](README.md) · [MCP tool reference](docs/tools.md)

DJAI Tools MCP includes four free, open-source AI agent skills for repeatable local document and data workflows. They teach an agent how to combine the MCP tools safely: preparing text for RAG, packaging source files for an AI coding agent, cleaning CSV/JSON data, and processing private files without overwriting the originals.

This guide explains what the skills are, why Siamese Cat Dev and DJAI Academy made them, how they help, how to install them in Codex, and what to ask your agent.

> **Current scope:** these v0.1 skills work with UTF-8 text, Markdown, CSV, JSON, and generated SVG QR codes. PDF, DOCX, OCR, PNG/JPG/WebP processing, XLSX, embeddings, and vector-database indexing are on the MCP roadmap and must not be described as available today.

## What is an AI agent skill?

An **MCP tool** performs one operation, such as counting tokens or converting CSV to JSON. An **agent skill** is a reusable workflow that teaches the agent when to use those tools, in which order, what safety checks to make, and what result to report.

| Layer | Role in this project | Example |
| --- | --- | --- |
| MCP server | Connects the agent to local capabilities | DJAI Tools MCP runs over local `stdio` |
| MCP tool | Performs a focused operation | `djai_ai_chunk_for_rag` creates JSONL chunks |
| Agent skill | Coordinates tools and quality checks | `document-to-rag` counts, optionally cleans, chunks, and reports |
| Your prompt | Defines the outcome and files | “Prepare these notes as 700-token RAG chunks” |

The skills do not replace the MCP server and do not secretly upload or process files themselves. Install the MCP server to supply the tools, then install the skill folders to give a compatible agent the workflows.

## Why we made these skills

Giving an agent a menu of tools is only the first step. Reliable file work also needs good decisions: preserve originals, choose the smallest tool profile, avoid cleaning source code as prose, check parser warnings, report output paths, and distinguish prepared RAG chunks from a finished vector index.

The skills encode those decisions so beginners can describe the result they want while experienced users get a consistent, reviewable workflow. Benefits include:

- **Faster onboarding:** start with a natural-language request instead of memorizing every tool argument.
- **Repeatable results:** common defaults and completion reports make runs easier to compare.
- **Local privacy:** workflows respect configured read/write roots and avoid unnecessary content display.
- **Source preservation:** outputs are written separately unless replacement is explicitly authorized.
- **Better agent context:** token counting and selective packaging reduce irrelevant material.
- **Clear boundaries:** the agent stops instead of pretending an unavailable PDF, OCR, embedding, or fuzzy-matching feature exists.

## The four published skills

| Skill | Best for | MCP profile | Main tools |
| --- | --- | --- | --- |
| [`document-to-rag`](skills/document-to-rag/SKILL.md) | Turn extracted text or Markdown into token-aware JSONL chunks | `ai-documents` | count, optimize, chunk |
| [`agent-context-preparation`](skills/agent-context-preparation/SKILL.md) | Package requirements, notes, docs, or code for an AI/coding agent | `ai-documents` | count, optimize, package |
| [`batch-data-cleanup`](skills/batch-data-cleanup/SKILL.md) | Clean UTF-8 CSV and convert flat CSV/JSON data | `data` | clean CSV, CSV↔JSON |
| [`private-document-processing`](skills/private-document-processing/SKILL.md) | Apply supported tools with strict local-file and reporting rules | Use the narrowest applicable profile | Any enabled v0.1 tool |

## Before installing a skill

1. Install and build DJAI Tools MCP by following the [main setup guide](README.md#download-install-and-build).
2. Connect it to your agent using an example from [`examples/`](examples/).
3. Set narrow absolute `--allow-read` and `--allow-write` paths.
4. Choose the recommended profile, or use `--tools` for an exact allowlist.
5. Test that your client can see the expected `djai_*` tools before asking a skill to use them.

Skills are optional. The MCP tools can be called without them, but the skills provide the recommended multi-step procedure.

## Install the skills in Codex

Codex supports global skills in `~/.agents/skills` and repository-specific skills in `.agents/skills`. Copy each **complete skill directory**, not only its `SKILL.md` file.

### Option A: install all four for your user

Run this from the cloned DJAI Tools MCP repository:

```bash
mkdir -p ~/.agents/skills
cp -R skills/document-to-rag ~/.agents/skills/
cp -R skills/agent-context-preparation ~/.agents/skills/
cp -R skills/batch-data-cleanup ~/.agents/skills/
cp -R skills/private-document-processing ~/.agents/skills/
```

### Option B: install skills for one repository

Run this from the project where you want Codex to discover the workflows, replacing the source path with your clone:

```bash
mkdir -p .agents/skills
cp -R /absolute/path/to/djai-tools-mcp/skills/document-to-rag .agents/skills/
cp -R /absolute/path/to/djai-tools-mcp/skills/agent-context-preparation .agents/skills/
```

Start a new Codex session after installation. Codex may choose a skill when the task matches its description, or you can request it explicitly with `$skill-name`.

```text
$document-to-rag prepare notes.md as JSONL chunks of 700 tokens with 100-token overlap.
```

These locations and discovery rules follow the current [official Codex skills documentation](https://learn.chatgpt.com/docs/customization/overview#skills). Other agents may use a different skill format or installation directory; keep the MCP connection and adapt the workflow instructions according to that client’s documentation.

## Skill 1: Document to RAG

Use [`document-to-rag`](skills/document-to-rag/SKILL.md) when you already have a UTF-8 `.txt` or Markdown document and want deterministic JSONL chunks for a later RAG ingestion step.

What it does:

1. Confirms the source type and allowed path.
2. Counts the source tokens.
3. Optionally removes repeated page furniture, broken prose wrapping, and excess whitespace.
4. Creates token-aware chunks; the starting recommendation is 700 tokens with 100-token overlap.
5. Reports the output path, token total, chunk count, settings, and warnings.

Example prompts:

```text
$document-to-rag prepare research-notes.md for RAG. Use 700-token chunks,
100-token overlap, preserve the source, and report the JSONL path and statistics.
```

```text
Use the document-to-rag workflow on extracted-manual.txt. First remove repeated
page headers, but do not use embeddings or upload the text anywhere.
```

The output is an ingestion-ready JSONL chunk file. It is **not** an embedding set, vector database, retrieval service, or complete chatbot. In v0.1, extract text from PDF, DOCX, or images before using this skill.

## Skill 2: Agent Context Preparation

Use [`agent-context-preparation`](skills/agent-context-preparation/SKILL.md) to combine selected requirements, source code, notes, or documentation into one traceable context artifact for an AI agent.

What it does:

1. Selects relevant UTF-8 files, up to the configured 20-file batch limit.
2. Measures unusually large inputs.
3. Cleans prose only when appropriate; it does not reformat code.
4. Packages sources with Markdown or XML boundaries and retains source names.
5. Counts the final package and reports what was included.

Example prompts:

```text
$agent-context-preparation package REQUIREMENTS.md, src/api.ts, and docs/schema.md
for a coding agent. Use XML boundaries and report the final token count.
```

```text
Prepare a compact agent context from these meeting notes and specifications.
Exclude secrets, build output, and unrelated files; do not invent requirements.
```

This is useful for coding-agent handoffs, bug-investigation packets, architecture reviews, implementation briefs, and reducing token waste before a long AI task.

## Skill 3: Batch Data Cleanup

Use [`batch-data-cleanup`](skills/batch-data-cleanup/SKILL.md) for UTF-8 CSV cleanup and conversion between header-based CSV and a top-level array of flat JSON objects.

What it can do:

- Trim CSV headers and values.
- Remove empty rows.
- Remove exact duplicate rows.
- Convert CSV values into a formatted JSON array.
- Convert flat JSON objects into spreadsheet-friendly CSV.
- Report rows, columns, removed records, warnings, and the output path.

Example prompts:

```text
$batch-data-cleanup clean customers.csv, remove empty and exact duplicate rows,
write a new file, convert the cleaned result to JSON, and report all row counts.
```

```text
Convert products.json to CSV. Stop and explain if the JSON contains nested
objects or arrays; do not flatten them automatically.
```

The workflow does not perform fuzzy deduplication, record linkage, automatic type inference, or implicit flattening of nested JSON. CSV values remain strings.

## Skill 4: Private Document Processing

Use [`private-document-processing`](skills/private-document-processing/SKILL.md) when local privacy, narrow permissions, source preservation, and a complete output report are the main requirements.

This is an oversight skill for supported v0.1 work. It makes the agent:

- Confirm allowed input and output directories.
- Select the narrowest applicable tool rather than enabling everything.
- Preserve originals and avoid implicit overwrite.
- Inspect success status, warnings, sizes, counts, paths, and `modifiedInput`.
- Avoid exposing sensitive content merely to prove success.

Example prompts:

```text
$private-document-processing count tokens in private-notes.md and package it
with policy.md. Work only in the configured local folders, preserve both files,
and report created outputs without quoting sensitive text.
```

```text
Using the private-document-processing workflow, create an SVG QR code for this
Wi-Fi payload in the allowed output folder and report the exact file path.
```

Local processing reduces unnecessary transfer, but the MCP process still has the operating-system permissions of the account that starts it. Always configure narrow roots and review [the security model](docs/security.md).

## Practical workflow recipes

### Prepare extracted documents for a local RAG pipeline

```text
$document-to-rag process handbook.txt and faq.md separately. Preserve both
sources, use 700-token chunks with 100-token overlap, and return each JSONL path,
token count, chunk count, and warning.
```

### Give a coding agent only the context it needs

```text
$agent-context-preparation inspect the files I named, select only material
relevant to the authentication bug, package it with XML source boundaries,
and tell me what you included and excluded.
```

### Clean data before analysis or API import

```text
$batch-data-cleanup preserve sales.csv, trim values, remove empty and exact
duplicate rows, create sales-clean.csv and sales-clean.json, and compare counts.
```

### Combine privacy rules with a specialized workflow

```text
Use $private-document-processing and $document-to-rag. Keep all work local,
prepare notes.txt as RAG JSONL, do not overwrite the source, and do not print
document contents in the completion message.
```

## Troubleshooting

**The agent can see the skill but not the `djai_*` tools.** The skill was installed, but the MCP server is not connected or the selected profile does not expose the required tools. Check the client configuration and [profiles](docs/profiles.md).

**The agent can see MCP tools but does not choose the skill.** Invoke it explicitly, for example `$batch-data-cleanup`, and start a new session after installing or updating a skill.

**The server rejects a path.** Use absolute paths and confirm the source is under `--allow-read` and the destination is under `--allow-write`. Do not bypass the restriction with symlinks.

**A PDF, image, DOCX, or XLSX request stops.** That is the correct v0.1 behavior. Use extracted UTF-8 text for today’s RAG workflow or follow the [roadmap](ROADMAP.md) for native format support.

**The JSONL file is not searchable yet.** Chunking prepares records; a separate, explicitly chosen embedding and vector-index system is required for semantic retrieval.

## Tutorial, blog, and video ideas

Creators, teachers, and community members may use these search-friendly topics when demonstrating the project:

- How to build a local document-to-RAG workflow with an AI agent and MCP
- How to install reusable skills in Codex and connect them to MCP tools
- Private AI document processing without uploading files to a third-party website
- How to package source code and requirements without wasting AI context tokens
- Clean CSV and convert CSV to JSON with a local AI agent
- MCP tools vs agent skills: what each layer does
- Thai and English local document automation for small businesses, developers, and educators

When publishing content, state the current release scope clearly and link to this repository so viewers receive the latest security notes and setup instructions.

## Who can benefit?

- Developers preparing concise context for Codex or another coding agent
- AI/RAG learners who need transparent, deterministic text chunks
- Analysts cleaning ordinary CSV/JSON files before import
- Small businesses and educators working with Thai or English local data
- Privacy-conscious users who want agent automation without a DJAI-hosted upload service
- Content creators teaching practical MCP and AI agent workflows

## Credits and open-source license

These skills and DJAI Tools MCP are created by [Siamese Cat Dev](https://www.djai.academy/siamese_cat/dev/en/) at [DJAI Academy](https://www.djai.academy/). The project grows from our earlier [free PDF, image, OCR, DOCX, QR, AI and data browser tools](https://github.com/lovecatisgood-sudo/free-pdf-image-ocr-docx-document-converter-qr-code-ai-token-rag-csv-excel-tools).

[Siamese Cat Cafe](https://siamesecat.cafe/) is the connected community business supporting cat adoption and independent creative development. Stars, contributions, responsible tutorials, cafe visits, and genuine visitor reviews help sustain the wider mission.

The code and skills are free and open source under the [MIT License](LICENSE). Attribution is appreciated but not required beyond retaining the MIT notice where the license requires it. See [ATTRIBUTION.md](ATTRIBUTION.md) for copy-ready credit examples.
