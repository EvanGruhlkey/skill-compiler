# Skill: weather-umbrella

Use this workflow inside your agent setup (e.g. `skills.md`, `SKILL.md`, or project rules in Claude Code, Cursor, Codex). Start at the entry node below. At each **choice**, reply with one of the listed branch keys (exact spelling; matching may be case-insensitive in tooling).

- **Entry node:** `ask-rain`

## Nodes

### `ask-rain` (choice)

Is it raining?

- `no` → `skip-umbrella`
- `yes` → `take-umbrella`

### `skip-umbrella` (end)

You can leave the umbrella at home.

### `take-umbrella` (end)

Bring an umbrella.
