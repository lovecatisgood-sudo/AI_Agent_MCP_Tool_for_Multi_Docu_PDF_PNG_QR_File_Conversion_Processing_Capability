import assert from "node:assert/strict";
import test from "node:test";
import { cleanCsv, csvToJson, jsonToCsv } from "../src/processors/csv.js";
import { countTextMetrics, makeRagChunks, optimizeContext, packagePrompt } from "../src/processors/text.js";

test("counts multilingual text and chunks deterministically", () => {
  const metrics = countTextMetrics("Hello โลก");
  assert.equal(metrics.words, 2);
  assert.ok(metrics.tokens > 0);
  const first = makeRagChunks("one two three four ".repeat(200), 100, 20);
  const second = makeRagChunks("one two three four ".repeat(200), 100, 20);
  assert.deepEqual(first, second);
  assert.ok(first.chunks.length > 1);
});

test("context cleanup removes repeated page furniture", () => {
  const input = "Report Header\nFirst line\nPage 1 of 2\n\f\nReport Header\nSecond line\nPage 2 of 2";
  const output = optimizeContext(input);
  assert.doesNotMatch(output, /Report Header/);
  assert.doesNotMatch(output, /Page 1/);
  assert.match(output, /First line/);
});

test("prompt packaging preserves explicit source boundaries", () => {
  const markdown = packagePrompt([{ name: "a.md", text: "Alpha" }, { name: "b.md", text: "Beta" }], "markdown", "Review these.");
  assert.match(markdown, /## Source 1: a\.md/);
  assert.match(markdown, /---/);
  const xml = packagePrompt([{ name: "unsafe<name>", text: "A & B" }], "xml");
  assert.match(xml, /unsafe&lt;name&gt;/);
  assert.match(xml, /A &amp; B/);
});

test("CSV conversion and cleanup preserve structure", () => {
  const dirty = " name ,value\n Alice , 1 \nAlice,1\n,\nBob,2\n";
  const cleaned = cleanCsv(dirty, 100);
  assert.equal(cleaned.rows.length, 2);
  assert.equal(cleaned.removedRows, 1);
  const json = csvToJson(cleaned.output, 100);
  assert.equal(json.rows.length, 2);
  const csv = jsonToCsv(json.output, 100);
  assert.match(csv.output, /Alice/);
});

test("CSV and JSON limits reject excessive rows", () => {
  assert.throws(() => csvToJson("a\n1\n2", 1), /row limit/);
  assert.throws(() => jsonToCsv('[{"a":1},{"a":2}]', 1), /row limit/);
});
