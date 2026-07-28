# Codex configuration

Build the repository, then add a local `stdio` MCP server using the equivalent command:

```text
node /absolute/path/to/repository/dist/index.js --profile core --allow-read /absolute/input --allow-write /absolute/output
```

After npm publication, `npx -y @djai/tools-mcp` can replace the `node .../dist/index.js` command. Use absolute paths. Consult the current official Codex documentation for the configuration-file location and syntax because client configuration may change independently of this package.
