#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { validateSkill } from "./validate.js";
import { runSkillInteractive } from "./run.js";

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: skill-compiler <path-to-skill.json>");
    process.exitCode = 1;
    return;
  }

  const abs = path.resolve(process.cwd(), fileArg);
  let text: string;
  try {
    text = await readFile(abs, "utf8");
  } catch (e) {
    console.error(`Cannot read file: ${abs}`);
    process.exitCode = 1;
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error("File is not valid JSON.");
    process.exitCode = 1;
    return;
  }

  const result = validateSkill(parsed);
  if (!result.ok) {
    for (const err of result.errors) {
      console.error(err);
    }
    process.exitCode = 1;
    return;
  }

  await runSkillInteractive(result.skill);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
