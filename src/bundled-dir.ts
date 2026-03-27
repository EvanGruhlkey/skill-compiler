import { fileURLToPath } from "node:url";
import path from "node:path";

/** Directory shipped next to `dist/` containing preset `*.json` skills. */
export function bundledPresetsDir(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bundled");
}
