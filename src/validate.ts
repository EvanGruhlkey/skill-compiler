import type { Skill } from "./types.js";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function validateSkill(raw: unknown): { ok: true; skill: Skill } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["Root must be a JSON object."] };
  }

  const o = raw as Record<string, unknown>;

  if (!isNonEmptyString(o.id)) {
    errors.push("Field `id` must be a non-empty string.");
  }
  if (!isNonEmptyString(o.start)) {
    errors.push("Field `start` must be a non-empty string.");
  }
  if (o.nodes === null || typeof o.nodes !== "object" || Array.isArray(o.nodes)) {
    errors.push("Field `nodes` must be an object.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const id = o.id as string;
  const start = o.start as string;
  const nodes = o.nodes as Record<string, unknown>;

  if (!(start in nodes)) {
    errors.push(`start node "${start}" is not present in nodes.`);
  }

  for (const [nodeId, nodeRaw] of Object.entries(nodes)) {
    if (nodeRaw === null || typeof nodeRaw !== "object" || Array.isArray(nodeRaw)) {
      errors.push(`nodes["${nodeId}"] must be an object.`);
      continue;
    }
    const n = nodeRaw as Record<string, unknown>;
    const kind = n.kind;

    if (kind === "choice") {
      if (!isNonEmptyString(n.prompt)) {
        errors.push(`nodes["${nodeId}"].prompt must be a non-empty string.`);
      }
      if (n.branches === null || typeof n.branches !== "object" || Array.isArray(n.branches)) {
        errors.push(`nodes["${nodeId}"].branches must be an object.`);
      } else {
        const b = n.branches as Record<string, unknown>;
        const keys = Object.keys(b);
        if (keys.length === 0) {
          errors.push(`nodes["${nodeId}"].branches must have at least one key.`);
        }
        for (const [k, target] of Object.entries(b)) {
          if (!isNonEmptyString(target)) {
            errors.push(`nodes["${nodeId}"].branches["${k}"] must be a non-empty string (target node id).`);
          } else if (!(target in nodes)) {
            errors.push(`nodes["${nodeId}"].branches["${k}"] points to missing node "${target}".`);
          }
        }
      }
    } else if (kind === "end") {
      if (!isNonEmptyString(n.text)) {
        errors.push(`nodes["${nodeId}"].text must be a non-empty string.`);
      }
    } else {
      errors.push(`nodes["${nodeId}"].kind must be "choice" or "end" (got ${String(kind)}).`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, skill: raw as Skill };
}
