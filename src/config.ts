import path from "node:path";
import { mkdir, realpath } from "node:fs/promises";
import { PROFILES, parseProfile, parseToolList } from "./profiles.js";
import type { AppConfig, ProfileName, ToolId } from "./types.js";

export type CliOptions = {
  profile: ProfileName;
  exactTools?: Set<ToolId>;
  readRoots: string[];
  writeRoots: string[];
  overwrite: boolean;
  maxFileMb: number;
  help: boolean;
  version: boolean;
};

function nextValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value.`);
  return value;
}

export function parseCliArgs(args: string[]): CliOptions {
  let profile: ProfileName = "core";
  let exactTools: Set<ToolId> | undefined;
  const readRoots: string[] = [];
  const writeRoots: string[] = [];
  let overwrite = false;
  let maxFileMb = 25;
  let help = false;
  let version = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--profile") profile = parseProfile(nextValue(args, index++, arg));
    else if (arg === "--tools") exactTools = parseToolList(nextValue(args, index++, arg));
    else if (arg === "--allow-read") readRoots.push(nextValue(args, index++, arg));
    else if (arg === "--allow-write") writeRoots.push(nextValue(args, index++, arg));
    else if (arg === "--max-file-mb") maxFileMb = Number(nextValue(args, index++, arg));
    else if (arg === "--overwrite") overwrite = true;
    else if (arg === "--help" || arg === "-h") help = true;
    else if (arg === "--version" || arg === "-v") version = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(maxFileMb) || maxFileMb <= 0 || maxFileMb > 1024) {
    throw new Error("--max-file-mb must be greater than 0 and no more than 1024.");
  }
  return { profile, ...(exactTools ? { exactTools } : {}), readRoots, writeRoots, overwrite, maxFileMb, help, version };
}

async function canonicalRoot(value: string, cwd: string, create: boolean): Promise<string> {
  const absolute = path.resolve(cwd, value);
  if (create) await mkdir(absolute, { recursive: true });
  return realpath(absolute);
}

export async function createConfig(options: CliOptions, cwd = process.cwd()): Promise<AppConfig> {
  const readValues = options.readRoots.length ? options.readRoots : [cwd];
  const writeValues = options.writeRoots.length ? options.writeRoots : [path.join(cwd, "djai-output")];
  const readRoots = await Promise.all(readValues.map((value) => canonicalRoot(value, cwd, false)));
  const writeRoots = await Promise.all(writeValues.map((value) => canonicalRoot(value, cwd, true)));
  const enabledTools = options.exactTools ?? new Set(PROFILES[options.profile]);
  return {
    cwd: path.resolve(cwd),
    profile: options.profile,
    enabledTools,
    readRoots,
    writeRoots,
    overwrite: options.overwrite,
    limits: {
      maxFileBytes: Math.floor(options.maxFileMb * 1024 * 1024),
      maxBatchBytes: Math.floor(options.maxFileMb * 2 * 1024 * 1024),
      maxBatchFiles: 20,
      maxRows: 100_000,
      maxInlineCharacters: 100_000
    }
  };
}
