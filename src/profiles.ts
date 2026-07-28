import { TOOL_IDS, type ProfileName, type ToolId } from "./types.js";

export const PROFILES: Record<ProfileName, readonly ToolId[]> = {
  core: [
    "ai.count_tokens",
    "ai.optimize_context",
    "ai.chunk_for_rag",
    "ai.package_prompt",
    "data.csv_to_json",
    "data.clean_csv",
    "qr.generate"
  ],
  "ai-documents": [
    "ai.count_tokens",
    "ai.optimize_context",
    "ai.chunk_for_rag",
    "ai.package_prompt"
  ],
  data: ["data.csv_to_json", "data.json_to_csv", "data.clean_csv"],
  qr: ["qr.generate"],
  full: TOOL_IDS
};

const MCP_NAME_TO_ID = new Map<ToolId | string, ToolId>([
  ["djai_ai_count_tokens", "ai.count_tokens"],
  ["djai_ai_optimize_context", "ai.optimize_context"],
  ["djai_ai_chunk_for_rag", "ai.chunk_for_rag"],
  ["djai_ai_package_prompt", "ai.package_prompt"],
  ["djai_data_csv_to_json", "data.csv_to_json"],
  ["djai_data_json_to_csv", "data.json_to_csv"],
  ["djai_data_clean_csv", "data.clean_csv"],
  ["djai_qr_generate", "qr.generate"]
]);

for (const id of TOOL_IDS) MCP_NAME_TO_ID.set(id, id);

export function parseProfile(value: string): ProfileName {
  if (value in PROFILES) return value as ProfileName;
  throw new Error(`Unknown profile: ${value}. Choose core, ai-documents, data, qr, or full.`);
}

export function parseToolList(value: string): Set<ToolId> {
  const result = new Set<ToolId>();
  for (const raw of value.split(",").map((item) => item.trim()).filter(Boolean)) {
    const id = MCP_NAME_TO_ID.get(raw);
    if (!id) throw new Error(`Unknown tool selector: ${raw}`);
    result.add(id);
  }
  if (!result.size) throw new Error("--tools requires at least one tool selector.");
  return result;
}
