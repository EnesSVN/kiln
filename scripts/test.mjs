#!/usr/bin/env node
/**
 * Birim testler — node:test, yeni bağımlılık yok.
 *
 * Node 20 TypeScript'i doğrudan çalıştıramıyor. Test edilecek modüller
 * projedeki tsc ile .test-build/ altına derlenip oradan import ediliyor;
 * testler .mjs olarak tests/ altında duruyor.
 *
 * Derlenen çıktı ESM ama uzantısız import kullanıyor ("./schema"), Node bunu
 * çözemez — bu yüzden import specifier'ları burada .js ile tamamlanıyor.
 * Bundler'lar bu işi normalde kendileri yapıyor; test koşarken bundler yok.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".test-build");

function calistir(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

rmSync(OUT, { recursive: true, force: true });
calistir(join(ROOT, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.test.json"]);

/** Uzantısız göreli import'lara .js ekle. */
function duzelt(dizin) {
  for (const ad of readdirSync(dizin)) {
    const yol = join(dizin, ad);
    if (statSync(yol).isDirectory()) {
      duzelt(yol);
      continue;
    }
    if (!ad.endsWith(".js")) continue;
    const s = readFileSync(yol, "utf8").replace(
      /(from\s+")(\.[^"]*?)(")/g,
      (tam, a, yolu, b) => (/\.(js|mjs|json)$/.test(yolu) ? tam : `${a}${yolu}.js${b}`),
    );
    writeFileSync(yol, s);
  }
}
duzelt(OUT);

calistir(process.execPath, ["--test", "tests/"]);
