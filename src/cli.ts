#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { bundledPresetsDir } from "./bundled-dir.js";
import { loadSkillFile } from "./load-skill.js";
import { listPresetFiles, resolveBundledPresetPath } from "./presets.js";
import { runSkillInteractive } from "./run.js";
import { skillToClaudeSkillMd, skillToSkillsMd } from "./skills-md.js";

function printUsage(): void {
  console.error(`Usage:
  skill-compiler run <skill.json>
  skill-compiler validate <skill.json>
  skill-compiler export <skill.json> [--out|-o <file>]
  skill-compiler export-claude <skill.json> --out|-o <SKILL.md> --description <text>
  skill-compiler preset list
  skill-compiler preset init <preset> [--dir|-d <dir>] [--export|-e]

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

function parseExportClaudeArgs(argv: string[]): {
  outPath?: string;
  description?: string;
  restOk: boolean;
  err?: string;
} {
  let outPath: string | undefined;
  let description: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o" || a === "--out") {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("-")) {
        return { restOk: false, err: "export-claude: missing value for --out / -o" };
      }
      outPath = next;
      i++;
      continue;
    }
    if (a === "--description") {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("-")) {
        return { restOk: false, err: "export-claude: missing value for --description" };
      }
      description = next;
      i++;
      continue;
    }
    return { restOk: false, err: `export-claude: unexpected argument ${a}` };
  }
  if (outPath === undefined) {
    return { restOk: false, err: "export-claude: --out / -o is required" };
  }
  if (description === undefined || description.trim() === "") {
    return { restOk: false, err: "export-claude: --description is required" };
  }
  return { outPath, description, restOk: true };
}

type PresetInitParse = { ok: true; dir: string; doExport: boolean } | { ok: false; message: string };

function parsePresetInitArgs(argv: string[]): PresetInitParse {
  let dir = ".";
  let doExport = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-d" || a === "--dir") {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("-")) {
        return { ok: false, message: "preset init: missing value for --dir / -d" };
      }
      dir = next;
      i++;
      continue;
    }
    if (a === "-e" || a === "--export") {
      doExport = true;
      continue;
    }
    if (a.startsWith("-")) {
      return { ok: false, message: `preset init: unknown flag ${a}` };
    }
  }
  return { ok: true, dir, doExport };
}

async function cmdPresetInit(presetArg: string, argv: string[]): Promise<void> {
  const parsed = parsePresetInitArgs(argv);
  if (!parsed.ok) {
    console.error(parsed.message);
    process.exitCode = 1;
    return;
  }

  const src = resolveBundledPresetPath(presetArg);
  const loaded = await loadSkillFile(src);
  if (!loaded.ok) {
    if (loaded.kind === "read") {
      console.error(
        loaded.message +
          `
Hint: run \`preset list\` for names in ${bundledPresetsDir()}.`,
      );
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

  const outDir = path.resolve(process.cwd(), parsed.dir);
  await mkdir(outDir, { recursive: true });
  const jsonName = `${path.basename(src, ".json")}.json`;
  const jsonPath = path.join(outDir, jsonName);
  const body = JSON.stringify(loaded.skill, null, 2) + "\n";
  await writeFile(jsonPath, body, "utf8");
  console.error(`Wrote ${jsonPath}`);

  if (parsed.doExport) {
    const mdPath = path.join(outDir, `${loaded.skill.id}.skills.md`);
    await writeFile(mdPath, skillToSkillsMd(loaded.skill), "utf8");
    console.error(`Wrote ${mdPath}`);
  }
}

async function cmdPresetList(): Promise<void> {
  const names = await listPresetFiles();
  if (names.length === 0) {
    console.error(`No preset JSON files in ${bundledPresetsDir()}.`);
    return;
  }
  for (const n of names) {
    console.log(n);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const first = argv[0];

  if (first === "validate") {
    const fileArg = argv[1] ?? "";
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
    return;
  }

  if (first === "export-claude") {
    const fileArg = argv[1] ?? "";
    if (!fileArg) {
      console.error("export-claude: missing skill.json path");
      printUsage();
      process.exitCode = 1;
      return;
    }
    const { outPath, description, restOk, err } = parseExportClaudeArgs(argv.slice(2));
    if (!restOk) {
      console.error(err ?? "export-claude: invalid arguments");
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
        for (const e of loaded.errors) {
          console.error(e);
        }
      }
      process.exitCode = 1;
      return;
    }
    const outAbs = path.resolve(process.cwd(), outPath!);
    await mkdir(path.dirname(outAbs), { recursive: true });
    await writeFile(outAbs, skillToClaudeSkillMd(loaded.skill, description!), "utf8");
    return;
  }

  if (first === "preset") {
    const sub = argv[1];
    if (sub === "list") {
      try {
        await cmdPresetList();
      } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        process.exitCode = 1;
      }
      return;
    }
    if (sub === "init") {
      const presetArg = argv[2] ?? "";
      if (!presetArg) {
        console.error("preset init: missing preset name");
        printUsage();
        process.exitCode = 1;
        return;
      }
      await cmdPresetInit(presetArg, argv.slice(3));
      return;
    }
    console.error(`Unknown preset subcommand: ${sub ?? "(none)"}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  let mode: "run" | "export";
  let fileArg: string;
  let exportArgv: string[] = [];

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
