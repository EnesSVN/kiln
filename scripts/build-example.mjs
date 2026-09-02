#!/usr/bin/env node
/**
 * Örnek çıktı repo'su — CI'da üretilir, depoda TUTULMAZ.
 *
 * "İndirdiğiniz dosyalar studio'nun çalıştırdığı dosyaların aynısı" iddiası
 * en iyi gerçek bir çıktıyla gösterilir. Ama o çıktıyı depoya işlemek elle
 * senkron tutulacak ikinci bir kopya yaratır: blok değişir, örnek eskir ve
 * iddia sessizce yalan olur.
 *
 * Bu yüzden örnek her çalıştırmada sıfırdan üretiliyor. CI bunu bir artifact
 * olarak yayımlayabilir ya da ayrı bir repoya itebilir; kaynak depoda
 * yalnızca bu betik durur.
 *
 * Kullanım:
 *   node scripts/build-example.mjs                    # data/demos/kepenk.json
 *   node scripts/build-example.mjs data/demos/bahce.json --out dist/ornek
 *   node scripts/build-example.mjs --all              # tüm demolar
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const bayrak = (ad) => {
  const i = args.indexOf(`--${ad}`);
  return i === -1 ? undefined : args[i + 1];
};

const CIKIS = join(ROOT, bayrak("out") ?? "dist/example");
const hepsi = args.includes("--all");
const verilen = args.find((a) => !a.startsWith("--") && a.endsWith(".json"));

const siteler = hepsi
  ? readdirSync(join(ROOT, "data", "demos"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => join("data", "demos", f))
  : [verilen ?? join("data", "demos", "kepenk.json")];

const JSZip = (await import("jszip")).default;
const { buildProjectFiles } = await import(join(ROOT, "lib", "export-core.mjs"));
const bundle = await import(join(ROOT, "generated", "files.mjs"));

rmSync(CIKIS, { recursive: true, force: true });

let toplamDosya = 0;
for (const yol of siteler) {
  const mutlak = isAbsolute(yol) ? yol : join(ROOT, yol);
  const site = JSON.parse(readFileSync(mutlak, "utf8"));
  const ad = yol.split("/").pop().replace(/\.json$/, "");
  const hedef = siteler.length > 1 ? join(CIKIS, ad) : CIKIS;

  const { files, assets } = buildProjectFiles(site, bundle);

  for (const [rel, icerik] of Object.entries(files)) {
    const dosya = join(hedef, rel);
    mkdirSync(dirname(dosya), { recursive: true });
    writeFileSync(dosya, icerik);
    toplamDosya += 1;
  }
  for (const [rel, b64] of Object.entries(assets)) {
    const dosya = join(hedef, rel);
    mkdirSync(dirname(dosya), { recursive: true });
    writeFileSync(dosya, Buffer.from(b64, "base64"));
    toplamDosya += 1;
  }

  // Örneğin ne olduğunu açıklayan not — indirilen zip'te YOK, yalnızca burada.
  writeFileSync(
    join(hedef, "ORNEK.md"),
    [
      `# ${site.meta.title} — örnek çıktı`,
      "",
      "Bu klasör elle yazılmadı. `node scripts/build-example.mjs` her",
      `çalıştığında \`${yol}\` dosyasından yeniden üretiliyor; Kiln'deki`,
      "\"Projeyi indir\" düğmesinin ürettiği zip'in birebir aynısı.",
      "",
      "Depoda tutulmuyor — eskimesin diye. Değiştirmeyin: bir sonraki",
      "üretimde kaybolur.",
      "",
    ].join("\n"),
  );
  console.log(`  · ${ad} → ${hedef.replace(ROOT + "/", "")}`);
}

console.log(
  `[example] ${siteler.length} örnek, ${toplamDosya} dosya · ${CIKIS.replace(ROOT + "/", "")}`,
);
