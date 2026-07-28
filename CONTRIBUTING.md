# Contributing

Thank you for helping improve DJAI Tools MCP.

## Before opening a change

- Search existing issues and pull requests.
- Open an issue before large tool-schema, dependency, or security-boundary changes.
- Use only synthetic, redistributable fixtures.
- Keep every tool independently understandable without an agent skill.

## Local checks

```bash
npm install
npm run check
npm run validate:docs
npm test
npm run build
npm pack --dry-run
```

Changes to file processing must test success, malformed input, limits, output collisions, and path-boundary behavior where relevant. Do not weaken defaults to make a test pass.

Commits should be focused and written in imperative form. Pull requests should explain user impact, security implications, test coverage, and any tool-schema change.

Security vulnerabilities must follow [SECURITY.md](SECURITY.md), not the public issue tracker.
