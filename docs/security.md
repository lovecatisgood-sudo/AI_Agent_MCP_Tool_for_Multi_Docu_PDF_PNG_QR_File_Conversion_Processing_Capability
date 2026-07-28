# Security model

## Assets

- Confidentiality and integrity of source documents.
- Integrity of existing local outputs.
- Availability of the user's machine and agent session.
- Privacy of document contents and paths.

## Untrusted inputs

Treat model-generated arguments, filesystem paths, text, CSV, JSON, QR payloads, and future document formats as untrusted.

## Controls

Read files are resolved through the operating system and compared with canonical allowed roots. This blocks lexical traversal and symlinks that resolve outside a root. Write paths require an existing canonical parent inside an allowed write root. Output creation uses exclusive mode unless `--overwrite` was explicitly enabled.

Defaults limit files to 25 MB, packaged batches to 20 files and 50 MB total, inline text to 100,000 characters, and CSV/JSON data to 100,000 rows. Remote fetching and shell execution are absent by design.

## Residual risks

- The process inherits the launching user's permissions.
- A same-user process may race filesystem changes after validation.
- Parsers and dependencies may contain vulnerabilities.
- Large-but-allowed content can still consume CPU and memory.
- QR content may direct scanners to unsafe destinations; the server only encodes content.

For sensitive or hostile files, use dedicated directories and a least-privilege account, container, or virtual machine. Do not expose the `stdio` process as a network service.

## Safe launch

```bash
node dist/index.js \
  --profile ai-documents \
  --allow-read /absolute/path/to/inputs \
  --allow-write /absolute/path/to/outputs \
  --max-file-mb 10
```

Avoid authorizing a home directory, repository collection, cloud-sync root, secrets directory, or filesystem root.
