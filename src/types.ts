export const TOOL_IDS = [
  "ai.count_tokens",
  "ai.optimize_context",
  "ai.chunk_for_rag",
  "ai.package_prompt",
  "data.csv_to_json",
  "data.json_to_csv",
  "data.clean_csv",
  "qr.generate"
] as const;

export type ToolId = (typeof TOOL_IDS)[number];
export type ProfileName = "core" | "ai-documents" | "data" | "qr" | "full";

export type Limits = {
  maxFileBytes: number;
  maxBatchBytes: number;
  maxBatchFiles: number;
  maxRows: number;
  maxInlineCharacters: number;
};

export type AppConfig = {
  cwd: string;
  profile: ProfileName;
  enabledTools: ReadonlySet<ToolId>;
  readRoots: readonly string[];
  writeRoots: readonly string[];
  overwrite: boolean;
  limits: Limits;
};

export type ToolResult = {
  success: true;
  tool: string;
  outputPaths: string[];
  inputBytes?: number;
  outputBytes?: number;
  processingMs: number;
  modifiedInput: false;
  warnings: string[];
  metadata: Record<string, unknown>;
  data?: unknown;
};
