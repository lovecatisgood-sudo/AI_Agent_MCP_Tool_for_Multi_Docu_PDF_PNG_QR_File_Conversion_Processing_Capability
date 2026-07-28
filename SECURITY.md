# Security Policy

## Supported versions

Security fixes are applied to the latest release and the default branch during the prerelease period.

## Report a vulnerability

Do not open a public issue for an unpatched vulnerability. Use GitHub private vulnerability reporting after it is enabled for the repository. If that is unavailable, email `contact@djai.academy` with subject `DJAI Tools MCP security report`.

Use synthetic reproductions. Never send confidential documents, credentials, private keys, or personal data.

## Security boundary

The MCP process runs with the operating-system permissions of the user who launches it. MCP clients and model-generated tool calls are not inherently trusted.

The server therefore:

- resolves real paths and validates them against configured roots;
- rejects symlink escapes and path traversal;
- preserves source files and disables overwrite by default;
- applies file, batch, row, and inline-input limits;
- rejects output paths whose parent is outside an allowed write root;
- does not fetch URLs or construct shell commands from tool input;
- writes created files with owner-only permissions where supported;
- keeps document contents out of application logs.

The server cannot prevent another process running as the same user from changing files or symlinks concurrently. Use dedicated input and output directories, least-privilege OS accounts, containers, or virtual machines for hostile inputs.

See [docs/security.md](docs/security.md) for the threat model and deployment guidance.
