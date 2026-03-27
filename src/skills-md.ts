import type { Skill } from "./types.js";

function toClaudeSkillName(skillId: string): string {
  const s = skillId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.length > 0 ? s : "skill";
}

/**
 * Claude Code–style `SKILL.md`: YAML frontmatter plus the same body as {@link skillToSkillsMd}.
 * Graph JSON remains canonical; frontmatter `description` should summarize when to invoke the skill.
 */
export function skillToClaudeSkillMd(skill: Skill, description: string): string {
  const name = toClaudeSkillName(skill.id);
  const desc = description.trim() || `Decision workflow inferred from recording: ${skill.id}.`;
  const frontmatter =
    "---\n" +
    `name: ${name}\n` +
    `description: ${JSON.stringify(desc)}\n` +
    'argument-hint: " "\n' +
    "user-invocable: true\n" +
    "---\n\n";
  return frontmatter + skillToSkillsMd(skill);
}

/**
 * Markdown suitable for skills.md / SKILL.md / agent rule files.
 * Graph JSON remains canonical; this is a human- and agent-readable view.
 */
export function skillToSkillsMd(skill: Skill): string {
  const lines: string[] = [];

  lines.push(`# Skill: ${skill.id}`);
  lines.push("");
  lines.push(
    "Use this workflow inside your agent setup (e.g. `skills.md`, `SKILL.md`, or project rules in Claude Code, Cursor, Codex). " +
      "Start at the entry node below. At each **choice**, reply with one of the listed branch keys (exact spelling; matching may be case-insensitive in tooling).",
  );
  lines.push("");
  lines.push(`- **Entry node:** \`${skill.start}\``);
  lines.push("");
  lines.push("## Nodes");
  lines.push("");

  const nodeIds = Object.keys(skill.nodes).sort((a, b) => a.localeCompare(b));
  for (const nodeId of nodeIds) {
    const node = skill.nodes[nodeId];
    lines.push(`### \`${nodeId}\` (${node.kind})`);
    lines.push("");

    if (node.kind === "choice") {
      lines.push(node.prompt);
      lines.push("");
      const keys = Object.keys(node.branches).sort((a, b) => a.localeCompare(b));
      for (const key of keys) {
        lines.push(`- \`${key}\` → \`${node.branches[key]}\``);
      }
    } else {
      lines.push(node.text);
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
