import { readFile } from "node:fs/promises";
import type { Skill } from "./types.js";
import { validateSkill } from "./validate.js";

export type LoadSkillOk = { ok: true; skill: Skill; path: string };

export type LoadSkillErr =
  | { ok: false; kind: "read"; path: string; message: string }
  | { ok: false; kind: "json"; message: string }
  | { ok: false; kind: "validate"; errors: string[] };

export async function loadSkillFile(resolvedPath: string): Promise<LoadSkillOk | LoadSkillErr> {
  let text: string;
  try {
    text = await readFile(resolvedPath, "utf8");
  } catch {
    return {
      ok: false,
      kind: "read",
      path: resolvedPath,
      message: `Cannot read file: ${resolvedPath}`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, kind: "json", message: "File is not valid JSON." };
  }

  const result = validateSkill(parsed);
  if (!result.ok) {
    return { ok: false, kind: "validate", errors: result.errors };
  }

  return { ok: true, skill: result.skill, path: resolvedPath };
}
