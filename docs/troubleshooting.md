# Troubleshooting

## The agent cannot start the server

Run `node --version`; v0.1 requires Node 22.13 or newer. Build source checkouts with `npm run build`. Use absolute paths in desktop-agent configuration.

## The client reports invalid protocol output

Nothing may write ordinary logs to standard output during MCP operation. Redirect diagnostics to standard error and check wrappers or shell startup scripts for extra output.

## Read or write denied

Pass the directory itself with `--allow-read` or `--allow-write`. Symlinks are evaluated by their real destination. Output parent directories must already exist unless they are the configured default root.

## Output already exists

Choose a new output path. Start with `--overwrite` only when replacing existing generated outputs is explicitly intended.

## `npx @djai/tools-mcp` cannot find the package

The command works only after npm publication and requires access to the `@djai` npm scope. During prerelease development, run the built `dist/index.js` from a checkout.

## A PDF, DOCX, image, XLSX, or URL is rejected

Those formats are outside v0.1. Convert or extract them with a separately authorized local workflow; do not rename binary content as text.
