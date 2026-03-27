# Video → skill (source)

Edit this file before running **`/video-to-skill`** in Claude Code (or when driving the pipeline manually).

| Field | Your value |
|--------|---------|
| **Video** | Local path (e.g. `./recordings/demo.webm`) or URL the agent can access |
| **Language** | Spoken language (e.g. `en`) — helps transcription if used |
| **Task name** | Short label for the procedure (becomes part of the skill `id` suggestion) |
| **Fidelity** | `verbatim` (match demo exactly) or `generalized` (stable branch keys, reusable wording) |
| **Notes** | Extra context: tools shown, environment, branches you know must exist |

Optional: drop a transcript at `docs/skill-drafts/transcript.txt` if you already have one; the skill prefers it over re-deriving from video alone.
