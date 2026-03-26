import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type { Skill } from "./types.js";

const MAX_STEPS = 500;

function normalizeKey(input: string): string {
  return input.trim().toLowerCase();
}

function resolveBranch(
  branches: Record<string, string>,
  answer: string,
): string | undefined {
  const trimmed = answer.trim();
  if (trimmed in branches) {
    return branches[trimmed];
  }
  const lower = normalizeKey(answer);
  for (const [key, target] of Object.entries(branches)) {
    if (normalizeKey(key) === lower) {
      return target;
    }
  }
  return undefined;
}

export async function runSkillInteractive(skill: Skill): Promise<void> {
  const rl = readline.createInterface({ input, output });
  let currentId = skill.start;
  let steps = 0;

  try {
    while (steps++ < MAX_STEPS) {
      const node = skill.nodes[currentId];
      if (!node) {
        console.error(`Internal error: missing node "${currentId}".`);
        process.exitCode = 1;
        return;
      }

      if (node.kind === "end") {
        console.log(node.text);
        return;
      }

      console.log(node.prompt);
      const keys = Object.keys(node.branches).sort();
      console.log(`Options: ${keys.join(", ")}`);

      const line = await rl.question("> ");
      const next = resolveBranch(node.branches, line);

      if (next === undefined) {
        console.log(`No branch matches "${line.trim()}". Try one of: ${keys.join(", ")}`);
        steps--;
        continue;
      }

      currentId = next;
    }

    console.error("Stopped: too many steps (possible cycle in the graph).");
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}
