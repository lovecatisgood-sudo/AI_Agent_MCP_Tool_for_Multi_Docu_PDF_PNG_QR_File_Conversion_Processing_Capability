# VS Code configuration

Build the source checkout and configure a `stdio` MCP server whose command is `node` and whose arguments are:

```json
["/absolute/path/to/repository/dist/index.js", "--profile", "core", "--allow-read", "/absolute/input", "--allow-write", "/absolute/output"]
```

After npm publication, use command `npx` with arguments `-y`, `@djai/tools-mcp`, and the same profile/path options. Use the current MCP configuration surface supplied by your VS Code extension or agent; configuration keys may vary by extension version.
