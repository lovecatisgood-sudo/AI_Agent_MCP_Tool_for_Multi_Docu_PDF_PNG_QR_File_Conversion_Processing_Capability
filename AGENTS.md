# Agent Guidance

## Scope

This repository is a local-first MCP server. Preserve the privacy promise: no hosted processing, arbitrary URL fetching, runtime repository cloning, or shell commands built from model input.

## Required checks

Run `npm run verify` after code changes. Run `npm pack --dry-run` after changes to package metadata or published files.

## Tool changes

- Keep MCP names prefixed with `djai_` and CLI selectors namespaced with dots.
- Describe when each tool should and should not be used.
- Return structured results with created paths, counts, warnings, timing, and `modifiedInput`.
- Preserve sources and keep overwrite disabled by default.
- Add malformed-input, resource-limit, and filesystem-boundary tests.

## Fixtures

Use only small synthetic fixtures. Never add personal, confidential, copyrighted, or credential-bearing samples.
