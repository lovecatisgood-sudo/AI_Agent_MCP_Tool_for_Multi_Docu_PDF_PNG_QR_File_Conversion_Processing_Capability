import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createConfig, parseCliArgs } from "../src/config.js";
import { resolveReadableFile, resolveWritableFile, writeOutput } from "../src/security/paths.js";

test("enforces read roots, symlink boundaries, and output collisions", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "djai-mcp-security-"));
  const allowed = path.join(temp, "allowed");
  const outside = path.join(temp, "outside");
  const output = path.join(temp, "output");
  await Promise.all([mkdir(allowed), mkdir(outside), mkdir(output)]);
  await writeFile(path.join(allowed, "ok.txt"), "ok");
  await writeFile(path.join(outside, "secret.txt"), "secret");
  await symlink(path.join(outside, "secret.txt"), path.join(allowed, "escape.txt"));
  const config = await createConfig(parseCliArgs(["--allow-read", allowed, "--allow-write", output]), temp);

  assert.equal((await resolveReadableFile(path.join(allowed, "ok.txt"), config)).bytes, 2);
  await assert.rejects(resolveReadableFile(path.join(outside, "secret.txt"), config), /Read denied/);
  await assert.rejects(resolveReadableFile(path.join(allowed, "escape.txt"), config), /Read denied/);
  await assert.rejects(resolveWritableFile(path.join(outside, "bad.txt"), "unused.txt", config), /Write denied/);

  const destination = await resolveWritableFile(undefined, "result.txt", config);
  await writeOutput(destination, "first", false);
  await assert.rejects(resolveWritableFile(undefined, "result.txt", config), /overwrite is disabled/);
  assert.equal(await readFile(destination, "utf8"), "first");

  const overwriteConfig = await createConfig(parseCliArgs(["--allow-read", allowed, "--allow-write", output, "--overwrite"]), temp);
  await symlink(path.join(outside, "secret.txt"), path.join(output, "linked.txt"));
  await assert.rejects(resolveWritableFile(undefined, "linked.txt", overwriteConfig), /symbolic link/);
});
