<p align="center">
  <strong style="font-size: 1.75rem;">Skill Compiler</strong>
</p>

<p align="center">
  <strong>Capture how a task is done as a decision-based skill graph. Run it step-by-step, locally.</strong>
</p>

<p align="center">
  <a href="#end-goals">End goals</a> ·
  <a href="#skill-file-format">Format</a> ·
  <a href="#examples">Examples</a> ·
  <a href="#roadmap">Roadmap</a> ·
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square" alt="Node 18+" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/scope-local--first-blue?style=flat-square" alt="local-first" />
</p>

---

## End goals

1. **Inputs** — Video (and similar captures) feed a compiler that infers a structured workflow, not only prose.
2. **Canonical skill** — That workflow is stored as a **decision graph** (JSON): prompts, branches, and end states. This is the source of truth.
3. **Agent-facing output** — The same skill is **exported to `skills.md`** (and aligned shapes) so people can drop it into setups used by **Claude Code**, **Cursor**, **Codex**, and other tools. Exact filenames vary by product (`SKILL.md`, project rules, etc.); the roadmap will pick conventions and mappings as we add export.

Today the repo only defines the **graph format** and **examples**. The compiler, exporter, and editor integrations build on this.

## Skill file format

| Field | Type | Description |
|--------|------|-------------|
| `id` | string | Skill identifier |
| `start` | string | First node id (must exist in `nodes`) |
| `nodes` | object | Node id to node object |

Each node has `kind`:

- **`choice`**: `prompt` (string), `branches` (object: answer token → next node id).
- **`end`**: `text` (string).

Runners should ignore unknown keys until specified.

## Examples

- `examples/binary-choice.json` — two-way branches  
- `examples/multi-choice.json` — multiple branch keys from one choice  

## Roadmap

| Phase | What | Status |
|--------|------|--------|
| 1 | Skill JSON format + example files | Done |
| 2 | TypeScript CLI: load a skill, step through `choice` / `end`, validate graph | Next |
| 3 | Exporter: graph → `skills.md` (and variants for Claude Code / Cursor / Codex as needed) | Planned |
| 4 | Compiler pipeline: video (and related inputs) → graph JSON | Planned |
| 5 | Polish: docs, edge cases, optional validation schema | Ongoing after core paths work |

Hosted APIs and automatic recording are not required for the core loop; local-first remains the default until there is a clear reason to add services.

## Contributing

Contributions are welcome. If the roadmap matches something you want to work on, open an issue to discuss scope or send a focused pull request. Small, reviewable changes are easiest to merge early while the design is still taking shape.
