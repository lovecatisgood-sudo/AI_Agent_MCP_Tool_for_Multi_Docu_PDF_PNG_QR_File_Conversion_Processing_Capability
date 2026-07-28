import assert from "node:assert/strict";
import test from "node:test";
import { parseCliArgs } from "../src/config.js";

test("uses a safe core profile by default", () => {
  const options = parseCliArgs([]);
  assert.equal(options.profile, "core");
  assert.equal(options.overwrite, false);
  assert.equal(options.maxFileMb, 25);
});

test("exact tool selection accepts selector and MCP names", () => {
  const options = parseCliArgs(["--tools", "ai.count_tokens,djai_qr_generate"]);
  assert.deepEqual([...options.exactTools!], ["ai.count_tokens", "qr.generate"]);
});

test("rejects unknown arguments and unsafe limits", () => {
  assert.throws(() => parseCliArgs(["--remote-url", "https://example.com"]), /Unknown argument/);
  assert.throws(() => parseCliArgs(["--max-file-mb", "0"]), /greater than 0/);
});
