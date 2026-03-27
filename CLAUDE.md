# Claude Code — Skill Compiler

Project context for Claude Code lives in **`AGENTS.md`**.

- **`/video-to-skill`** — compile a recording into JSON + `.claude/skills/<id>/SKILL.md` (see `.claude/skills/video-to-skill/SKILL.md`).
- Configure inputs in **`VIDEO_SOURCE.md`** before running the skill.

After pulling changes, run **`npm install`** and **`npm run build`** so `dist/cli.js` exists for `validate` / `export` / `export-claude`.
