#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { loadSkillFile } from "./load-skill.js";
import { runSkillInteractive } from "./run.js";
import { skillToSkillsMd } from "./skills-md.js";

function printUsage(): void {
  console.error(`Usage:
  skill-compiler run <skill.json>
  skill-compiler export <skill.json> [--out|-o <file>]

Legacy: skill-compiler <skill.json>  (same as run)`);
}

function parseExportOutPath(argv: string[]): { outPath?: string; restOk: boolean } {
  let outPath: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o" || a === "--out") {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("-")) {
        return { restOk: false };
      }
      outPath = next;
      i++;
    }
  }
  return { outPath, restOk: true };
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  let mode: "run" | "export";
  let fileArg: string;
  let exportArgv: string[] = [];

  const first = argv[0];
  if (first === "export") {
    mode = "export";
    fileArg = argv[1] ?? "";
    exportArgv = argv.slice(2);
  } else if (first === "run") {
    mode = "run";
    fileArg = argv[1] ?? "";
  } else {
    mode = "run";
    fileArg = first;
  }

  if (!fileArg) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const abs = path.resolve(process.cwd(), fileArg);
  const loaded = await loadSkillFile(abs);

  if (!loaded.ok) {
    if (loaded.kind === "read") {
      console.error(loaded.message);
    } else if (loaded.kind === "json") {
      console.error(loaded.message);
    } else {
      for (const err of loaded.errors) {
        console.error(err);
      }
    }
    process.exitCode = 1;
    return;
  }

  if (mode === "run") {
    await runSkillInteractive(loaded.skill);
    return;
  }

  const { outPath, restOk } = parseExportOutPath(exportArgv);
  if (!restOk) {
    console.error("export: missing value for --out / -o");
    process.exitCode = 1;
    return;
  }

  const md = skillToSkillsMd(loaded.skill);
  if (outPath === undefined) {
    process.stdout.write(md);
  } else {
    const outAbs = path.resolve(process.cwd(), outPath);
    await writeFile(outAbs, md, "utf8");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
