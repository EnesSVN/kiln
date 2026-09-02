import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseSite } from "./schema";
import type { Site } from "./types";

/**
 * data/demos/*.json — elle yazılmış örnek siteler.
 *
 * Sadece SUNUCUDA çalışır (node:fs). /preview/[id] build zamanında
 * bunları statik sayfalara çeviriyor; yorum satırı takas etmeye gerek yok.
 */
const DEMOS_DIR = join(process.cwd(), "data", "demos");

export function demoIds(): string[] {
  return readdirSync(DEMOS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

/** Bilinmeyen id null döner — dizin dışına çıkan yol denemeleri de. */
export function loadDemo(id: string): Site | null {
  if (!demoIds().includes(id)) return null;
  return parseSite(JSON.parse(readFileSync(join(DEMOS_DIR, `${id}.json`), "utf8")));
}
