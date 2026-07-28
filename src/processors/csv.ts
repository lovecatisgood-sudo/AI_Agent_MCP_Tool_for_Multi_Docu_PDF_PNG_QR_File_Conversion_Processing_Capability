import Papa from "papaparse";

export function parseCsv(text: string, maxRows: number) {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim()
  });
  if (result.errors.length && !result.data.length) throw new Error(result.errors[0]!.message);
  if (result.data.length > maxRows) throw new Error(`CSV exceeds the ${maxRows} row limit.`);
  return { rows: result.data, fields: result.meta.fields ?? [], warnings: result.errors.map((error) => `Row ${error.row ?? "?"}: ${error.message}`) };
}

export function csvToJson(text: string, maxRows: number) {
  const parsed = parseCsv(text, maxRows);
  return { ...parsed, output: JSON.stringify(parsed.rows, null, 2) };
}

export function jsonToCsv(text: string, maxRows: number) {
  const value: unknown = JSON.parse(text);
  if (!Array.isArray(value)) throw new Error("JSON must contain an array of objects.");
  if (value.length > maxRows) throw new Error(`JSON exceeds the ${maxRows} row limit.`);
  if (value.some((row) => row === null || Array.isArray(row) || typeof row !== "object")) throw new Error("Every JSON array item must be an object.");
  return { rows: value.length, output: Papa.unparse(value) };
}

export function cleanCsv(text: string, maxRows: number) {
  const parsed = parseCsv(text, maxRows);
  const seen = new Set<string>();
  const rows = parsed.rows
    .map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim(), String(value ?? "").trim()])))
    .filter((row) => Object.values(row).some(Boolean))
    .filter((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return {
    rows,
    removedRows: parsed.rows.length - rows.length,
    fields: parsed.fields,
    warnings: parsed.warnings,
    output: Papa.unparse(rows, { columns: parsed.fields })
  };
}
