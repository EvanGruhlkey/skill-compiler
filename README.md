<p align="center">
  <strong style="font-size: 1.75rem;">Skill Compiler</strong>
</p>

<p align="center">
  <strong>Capture how a task is done as a decision-based skill graph. Run it step-by-step, locally.</strong>
</p>

<p align="center">
  <a href="#end-goals">End goals</a> ·
  <a href="#architecture">Architecture</a> ·
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

The **graph format**, **examples**, and a **TypeScript CLI** that validates a skill, **runs** it interactively, and **exports** it to Markdown for agent skill files are in this repo. The video compiler, bundled presets, and per-editor install helpers build on this.

## Architecture

**Principle:** The **JSON skill graph** is the only source of truth. Markdown (and later, tool-specific files) is always **derived** from validated JSON, whether the graph was hand-written, generated from **video**, or shipped as a **preset** inside the npm package.

**Why this shape**

- One schema for **run**, **export**, tests, and future codegen—no parallel “agent prose” canon to drift.
- **Validation at the boundary:** anything that produces JSON (LLM, transcript pipeline, human edit) must pass the same checks before export or bundling.
- **Agents read the project:** Claude Code, Cursor, and Codex pick up instructions from files in the workspace. The package’s job is to **materialize** those files (copy, export, or install into documented paths), not to push to a proprietary “skills API” unless you add that later on purpose.

**End-to-end flow (target)**

```
video or preset or hand edit
        →  draft graph JSON
        →  validate  →  (optional) human fix
        →  same JSON as examples/ and bundled/ skills
        →  export → Markdown for skills.md / rules
        →  optional: install/sync into .cursor/, Claude paths, etc.
```

**Package role**

- Ship the **CLI** (`run`, `export`, future `presets`, future `install <editor>`).
- Ship **bundled** JSON skills (common workflows) alongside the tool; they use the **same** validate → export path as user-generated skills.
- **Video pipeline** (future) is a separate stage that only **outputs** graph JSON into that pipeline; it does not replace presets or hand-authored skills.

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

### Run the CLI

```bash
npm install
npm run build
npm run skill -- examples/binary-choice.json
```

Answer with a branch key when prompted (e.g. `yes` / `no`). Validation errors print to stderr and exit with code 1.

After `npm run build`, you can run `node dist/cli.js run <path-to-skill.json>` (or the legacy form `node dist/cli.js <path-to-skill.json>`), or run `npm link` in this repo to get the `skill-compiler` command on your PATH.

### Export to Markdown (`skills.md` style)

Write to stdout:

```bash
npm run build
node dist/cli.js export examples/binary-choice.json
# or: npm run export-skill -- examples/binary-choice.json
```

Write to a file:

```bash
node dist/cli.js export examples/binary-choice.json -o skills.md
# or: npm run export-skill -- examples/binary-choice.json -o skills.md
```

The output is a single Markdown document you can paste or check in next to agent configs (Claude Code, Cursor, Codex, etc.). Filename is up to you; `skills.md` or product-specific names both work.

## Roadmap

| Phase | What | Status |
|--------|------|--------|
| 1 | Skill JSON format + example files | Done |
| 2 | TypeScript CLI: load a skill, step through `choice` / `end`, validate graph | Done |
| 3 | Exporter: graph → Markdown for `skills.md` / agent skill files | Done |
| 4 | Bundled preset skills in the npm package; CLI to materialize into a project | Planned |
| 5 | Compiler pipeline: video (and related inputs) → graph JSON | Planned |
| 6 | Per-editor `install` (or documented paths only); polish, optional JSON Schema | Ongoing / planned |

Hosted APIs and automatic recording are not required for the core loop; local-first remains the default until there is a clear reason to add services.

## Contributing

Contributions are welcome. If the roadmap matches something you want to work on, open an issue to discuss scope or send a focused pull request. Small, reviewable changes are easiest to merge early while the design is still taking shape.
