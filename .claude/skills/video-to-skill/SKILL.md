---
name: video-to-skill
description: Turn a walkthrough video (or transcript) into a validated decision-graph skill — JSON source of truth plus Claude-ready SKILL.md. Use when the user wants to capture a procedure from a recording, demo, or Loom-style video; phrases like "make a skill from this video", "compile my screen recording into a workflow". Pass a video path or URL as an argument if it is not already in VIDEO_SOURCE.md.
argument-hint: "<path-or-url-to-video>"
user-invocable: true
---

# Video → skill (Claude Code pipeline)

You are compiling **structured agent skills** for this repository — not prose-only runbooks. The output must be a **valid skill graph JSON** and a **derived** Claude `SKILL.md`, same pattern as skill templates that ship slash commands from `.claude/skills/`.

## Pre-flight

1. Read **`VIDEO_SOURCE.md`** and **`AGENTS.md`**. If `$ARGUMENTS` gives a video path or URL, ensure `VIDEO_SOURCE.md` matches (update the **Video** row).
2. Confirm tooling: `npm run build` succeeds. If `dist/cli.js` is missing, run `npm install` then `npm run build` and fix errors before generating skills.
3. Ensure directories exist: `docs/skill-drafts/`, and create `skills/` when you write the final JSON.

## Principles (mirror of a good template skill)

1. **JSON is canonical** — Every `choice` / `end` node, edge, and prompt lives in one `.json` file. Never treat the Markdown as editable truth; regenerate Markdown from JSON after changes.
2. **Validate at the boundary** — After every JSON write or edit, run:
   `node dist/cli.js validate <path-to.json>`
   Fix all validator errors before exporting.
3. **Branch keys are APIs** — Use short, stable tokens (`yes`, `no`, `rollback`, `aws`, …). They are what users and agents type at each decision.
4. **One decision per `choice`** — If the video mixes unrelated forks, split into chained choices instead of one giant prompt.
5. **End nodes conclude** — `end` nodes give concrete next actions or outcomes, not new questions.

## Phase 1 — Ingest

Goal: get a **usable description of the procedure** independent of the video container.

- If **`docs/skill-drafts/transcript.txt`** exists, read it first and ground the graph in that text.
- Otherwise, derive a transcript or step outline from the video using whatever tools are available in the environment (speech-to-text, frame review, user-supplied summary). If the video is not directly readable, ask the user for a transcript or bullet list and save it under `docs/skill-drafts/transcript.txt`, then continue.

Capture in notes (mental or `docs/skill-drafts/notes.md`):

- Ordered steps the human follows
- Explicit decision points (“if X then A else B”)
- Terminal outcomes (success, abort, escalate, …)

## Phase 2 — Graph design

1. Choose a skill `id`: prefer **`VIDEO_SOURCE.md` task name** sluggified (kebab-case), e.g. `deploy-canary-checklist`.
2. Map the flow:
   - Each **question / branch** → `kind: "choice"` with `prompt` and `branches` (map token → next node id)
   - Each **leaf outcome** → `kind: "end"` with `text`
3. Ensure **`start`** points at the entry node id and **every** branch target exists in `nodes`.
4. Write the first draft to **`docs/skill-drafts/<skill-id>.json`**, then iterate until `validate` passes.

## Phase 3 — Finalize + export

1. Copy (or move) the validated file to **`skills/<skill-id>.json`** — this is the maintained artifact in the project root skill set.
2. `node dist/cli.js validate skills/<skill-id>.json`
3. Generate the agent-facing Claude skill (frontmatter + body) into a **new** folder under `.claude/skills/`:
   `node dist/cli.js export-claude skills/<skill-id>.json -o .claude/skills/<skill-id>/SKILL.md --description "<one line: when to use this skill>"`

   The description should read like Claude Code **discovery text**: include clear triggers, tools, and when to invoke the slash command.

4. Optionally also export neutral markdown for other tools:
   `node dist/cli.js export skills/<skill-id>.json -o skills/<skill-id>.skills.md`

## Phase 4 — Sanity check

- Show the user the **graph summary** (entry node and number of choices).
- Suggest they run **`/video-to-skill`** again only when the recording changes; for small edits, hand-edit JSON and re-run `validate` + `export-claude`.

## When stuck

- If the procedure is linear with **no** decisions, still use one `choice` with a single branch or collapse to a single `end` after a narrative `choice` — the validator requires well-formed graphs; prefer at least one meaningful decision if the video truly has none, document that in `VIDEO_SOURCE.md` Notes.

---

Canonical format and CLI details: repository **`README.md`**.
