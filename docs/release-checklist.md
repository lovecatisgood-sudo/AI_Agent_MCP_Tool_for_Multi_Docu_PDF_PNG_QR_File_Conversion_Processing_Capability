# Release checklist

## Before creating the GitHub repository

- [x] Review the repository name: `AI_Agent_MCP_Tool_for_Multi_Docu_PDF_PNG_QR_File_Conversion_Processing_Capability`.
- [x] Review the description: `Free local-first MCP server giving AI agents private token, RAG, context, CSV/JSON and QR tools; PDF, OCR, DOCX and image processing roadmap. MIT by DJAI Academy & Siamese Cat Dev.`
- [ ] Confirm the owner: `lovecatisgood-sudo`.
- [ ] Create a public repository without generated README, license, or `.gitignore` files.
- [ ] Enable Issues, Discussions, private vulnerability reporting, and branch protection after the first push.
- [x] Suggested topics: `mcp`, `model-context-protocol`, `ai-agent`, `agent-tools`, `document-processing`, `pdf-tools`, `pdf-converter`, `image-converter`, `png`, `qr-code-generator`, `ocr`, `thai-language`, `rag`, `token-counter`, `csv`, `json`, `local-first`, `privacy-first`, `typescript`, `open-source`.

## Before the first push

- [ ] Run `npm ci` from a clean checkout.
- [ ] Run `npm run check`, `npm test`, `npm run build`, and `npm pack --dry-run`.
- [ ] Confirm `git status` contains no fixtures, outputs, archives, environment files, or credentials.
- [ ] Confirm all skill validators pass.
- [ ] Review repository URLs and public contact details.

## Before npm publication

- [ ] Sign in with `npm adduser` using an account protected by two-factor authentication.
- [ ] Confirm the account owns or belongs to the `@djai` npm organization.
- [ ] Confirm `@djai/tools-mcp` remains available.
- [ ] Test the real tarball from a clean temporary directory.
- [ ] Publish the prerelease with `npm publish --access public --tag next`.
- [ ] Install with `npx -y @djai/tools-mcp@next --version` from a clean environment.

## After publication

- [ ] Create a GitHub prerelease for `v0.1.0` with the changelog and tarball integrity.
- [ ] Update the README status and remove prerelease-only warnings when appropriate.
- [ ] Link this repository from the DJAI browser-tools repository and DJAI Academy.
- [ ] Open small, well-scoped `good first issue` tasks.
- [ ] Monitor installation failures, dependency alerts, and MCP client compatibility.

## Current external blockers

- This machine is not authenticated to npm.
- The npm package name currently returns `404`, which means no package is published under that exact name; scope ownership must still be confirmed after login.
- GitHub publication is performed only after the complete local validation pass.
