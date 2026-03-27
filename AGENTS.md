# Skill Compiler — agent context

This repo implements **local-first decision skills**: a **JSON graph** (`id`, `start`, `nodes` with `choice` / `end`) is the single source of truth. Markdown for agents is **always derived** from validated JSON.

## Claude Code

- User-defined slash command: **`/video-to-skill`** — implemented by [`.claude/skills/video-to-skill/SKILL.md`](.claude/skills/video-to-skill/SKILL.md).
- Configure the recording in **`VIDEO_SOURCE.md`** (same role as `TARGET.md` in workflow templates like [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)).

## Commands (after `npm install` / `npm run build`)

| Command | Purpose |
|--------|--------|
| `node dist/cli.js validate <skill.json>` | Non-interactive check; exit `1` on errors |
| `node dist/cli.js export <skill.json> [-o file.md]` | Generic `skills.md`-style export |
| `node dist/cli.js export-claude <skill.json> -o path/SKILL.md --description "..."` | Claude Code `SKILL.md` (frontmatter + body) |
| `node dist/cli.js run <skill.json>` | Interactive walkthrough |
| `node dist/cli.js preset list` / `preset init …` | Ship bundled JSON into this project |

## Conventions

- Draft graphs: `docs/skill-drafts/`
- Finished graphs: `skills/*.json` (create the folder when needed)
- Prefer **kebab-case** branch keys on `choice` nodes (`yes`, `no`, `production`, …) so agents match user replies reliably.
