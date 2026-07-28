import path from "node:path";
import { constants } from "node:fs";
import { lstat, open, realpath, stat } from "node:fs/promises";
import type { AppConfig } from "../types.js";

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export async function resolveReadableFile(requested: string, config: AppConfig): Promise<{ path: string; bytes: number }> {
  const absolute = path.resolve(config.cwd, requested);
  const canonical = await realpath(absolute);
  if (!config.readRoots.some((root) => isInside(canonical, root))) {
    throw new Error(`Read denied outside allowed directories: ${requested}`);
  }
  const info = await stat(canonical);
  if (!info.isFile()) throw new Error(`Input is not a regular file: ${requested}`);
  if (info.size > config.limits.maxFileBytes) {
    throw new Error(`Input exceeds the ${Math.round(config.limits.maxFileBytes / 1024 / 1024)} MB limit: ${requested}`);
  }
  return { path: canonical, bytes: info.size };
}

export async function resolveWritableFile(requested: string | undefined, fallbackName: string, config: AppConfig): Promise<string> {
  const candidate = requested ? path.resolve(config.cwd, requested) : path.join(config.writeRoots[0]!, fallbackName);
  const parent = await realpath(path.dirname(candidate));
  const normalized = path.join(parent, path.basename(candidate));
  if (!config.writeRoots.some((root) => isInside(normalized, root))) {
    throw new Error(`Write denied outside allowed directories: ${requested ?? fallbackName}`);
  }
  let exists = false;
  try {
    const existing = await lstat(normalized);
    exists = true;
    if (existing.isSymbolicLink()) throw new Error(`Output cannot be a symbolic link: ${normalized}`);
    const canonicalExisting = await realpath(normalized);
    if (!config.writeRoots.some((root) => isInside(canonicalExisting, root))) {
      throw new Error(`Write denied outside allowed directories: ${requested ?? fallbackName}`);
    }
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Output cannot") || error.message.startsWith("Write denied"))) throw error;
    if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
  }
  if (exists && !config.overwrite) throw new Error(`Output already exists and overwrite is disabled: ${normalized}`);
  return normalized;
}

export async function writeOutput(filePath: string, data: string | Uint8Array, overwrite: boolean): Promise<number> {
  const flags = constants.O_WRONLY | constants.O_CREAT | constants.O_NOFOLLOW | (overwrite ? constants.O_TRUNC : constants.O_EXCL);
  const handle = await open(filePath, flags, 0o600);
  try {
    if (typeof data === "string") await handle.writeFile(data, "utf8");
    else await handle.writeFile(data);
  } finally {
    await handle.close();
  }
  return Buffer.byteLength(data);
}
