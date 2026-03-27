import { readdir } from "node:fs/promises";
import path from "node:path";
import { bundledPresetsDir } from "./bundled-dir.js";

function normalizePresetKey(name: string): string {
  const t = name.trim();
  if (t.endsWith(".json")) {
    return t.slice(0, -5);
  }
  return t;
}

export async function listPresetFiles(): Promise<string[]> {
  const dir = bundledPresetsDir();
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    throw new Error(`Cannot read bundled presets directory: ${dir}`);
  }
  return names
    .filter((n) => n.endsWith(".json"))
    .map((n) => n.slice(0, -5))
    .sort((a, b) => a.localeCompare(b));
}

export function resolveBundledPresetPath(presetName: string): string {
  const key = normalizePresetKey(presetName);
  if (!key) {
    throw new Error("Preset name is empty.");
  }
  return path.join(bundledPresetsDir(), `${key}.json`);
}
