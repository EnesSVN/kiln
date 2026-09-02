#!/usr/bin/env node
/**
 * blocks/ + lib/ + template/ dosyalarını okuyup generated/ altına gömer.
 *
 * Çıktı repo'suna giden her satır buradan geçer. Dosyalar OLDUĞU GİBİ
 * kopyalanır — tek satır kaynak dönüşümü yoktur. "İndirdiğin dosyalar
 * studio'da çalışan dosyaların aynısı" iddiası buna dayanıyor.
 *
 * predev/prebuild olarak koşar.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_DIR = join(ROOT, "generated");

/** Her çıktıda zaten bulunan paketler — blok bağımlılığı sayılmazlar. */
const BASE_DEPS = ["react", "react-dom", "next"];

/** Çıktıya kopyalanacak lib dosyaları. schema.ts YOK — zod çıktıya gitmez. */
const LIB_FILES = [
  "lib/types.ts",
  "lib/anim.ts",
  "lib/block-text.ts",
  "lib/responsive.ts",
  "lib/tokens.ts",
  "lib/Media.tsx",
  "lib/MobileMenu.tsx",
  "lib/Reveal.tsx",
  "lib/SplitText.tsx",
  "lib/styles.ts",
  "lib/render.tsx",
];

const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const posix = (p) => p.split(sep).join("/");

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

/** Yorumları çıkar — regex taramaları yorumdaki metne takılmasın. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * Bloğun hangi prop'u hangi Tailwind öneki için kullandığını çıkarır:
 *   resp(padding, "p")  ->  ["padding", "p"]
 *
 * Export bu haritayla, sitenin GERÇEKTEN ürettiği sınıfları hesaplayıp
 * @source inline satırını daraltıyor.
 *
 * Ayrıştıramadığı bir resp( çağrısı görürse PATLAR. Sessizce atlarsa
 * ilgili blok çıktıda boşluksuz kalır ve bunu kimse fark etmez.
 */
function extractRespUsage(src, label) {
  const clean = stripComments(src);
  const usage = [];

  const strict = /resp\(\s*([A-Za-z_$][\w$]*)\s*,\s*"([a-z][a-z-]*)"\s*\)/g;
  const found = new Set();
  let m;
  while ((m = strict.exec(clean)) !== null) {
    found.add(m.index);
    usage.push([m[1], m[2]]);
  }

  // Eşleşmeyen resp( çağrısı kaldı mı?
  const any = /\bresp\s*\(/g;
  while ((m = any.exec(clean)) !== null) {
    if (!found.has(m.index)) {
      const snippet = clean.slice(m.index, m.index + 80).split("\n")[0];
      throw new Error(
        `[bundle] ${label}: ayrıştırılamayan resp() çağrısı.\n` +
          `  Beklenen biçim: resp(propAdi, "onek")\n` +
          `  Bulunan: ${snippet}\n` +
          `  Bu biçime uymayan çağrılar çıktıda boşluk sınıfı üretmez.`,
      );
    }
  }

  return usage;
}

/**
 * lib/responsive.ts içindeki SCALE haritasını veri olarak çıkarır.
 *
 * Export, sitenin kullandığı boşluk sınıflarını hesaplarken bu ölçeğe
 * ihtiyaç duyuyor ama lib/responsive.ts TypeScript — Node import edemiyor.
 * Ölçeği elle ikinci kez yazmak yerine kaynaktan okuyoruz; tek doğruluk
 * kaynağı lib/responsive.ts kalsın.
 */
function extractScale() {
  const src = read("lib/responsive.ts");
  const block = src.match(/const SCALE[^=]*=\s*\{([\s\S]*?)\}/);
  if (!block) throw new Error("[bundle] lib/responsive.ts içinde SCALE bulunamadı");

  const scale = {};
  const re = /(\d+)\s*:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(block[1])) !== null) scale[m[1]] = m[2];

  if (Object.keys(scale).length === 0) {
    throw new Error("[bundle] SCALE ayrıştırılamadı");
  }
  return scale;
}

/** blocks/index.ts kayıt defterinden blok adı -> dosya yolu. */
function readRegistry() {
  const src = read("blocks/index.ts");
  const map = {};
  const re = /import\s*\{\s*(\w+)\s*\}\s*from\s*"\.\/([^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    map[m[1]] = `blocks/${m[2]}.tsx`;
  }
  if (Object.keys(map).length === 0) {
    throw new Error("[bundle] blocks/index.ts içinde blok importu bulunamadı");
  }
  return map;
}

/** Kurulu gerçek sürümleri oku — çıktı, test ettiğimiz sürümlere sabitlensin. */
function installedVersion(pkg) {
  const p = JSON.parse(read(`node_modules/${pkg}/package.json`));
  return `^${p.version}`;
}

function main() {
  const files = {};

  // 1. Bloklar (index.ts hariç — export sadece kullanılanlarla yeniden üretir)
  const blockFiles = walk(join(ROOT, "blocks"))
    .map((f) => posix(relative(ROOT, f)))
    .filter((f) => f !== "blocks/index.ts");
  for (const f of blockFiles) files[f] = read(f);

  // 2. lib
  for (const f of LIB_FILES) files[f] = read(f);

  // 3. template
  for (const f of walk(join(ROOT, "template")).map((f) => posix(relative(ROOT, f)))) {
    files[f] = read(f);
  }

  // 4. Bloklar hangi lib dosyalarını istiyor? Listede olmayan varsa PATLA.
  //
  // Bu iki kez ısırdı: yeni bir paylaşılan dosya (styles.ts, anim.ts) eklenip
  // LIB_FILES'a yazılmayınca zip sorunsuz üretiliyor ama açılan repo derlenmiyor.
  // Sessiz kalmaktansa burada duruyoruz.
  const importRe = /from\s+"@\/lib\/([A-Za-z0-9_-]+)"/g;
  const wanted = new Set();
  for (const f of blockFiles) {
    let m;
    while ((m = importRe.exec(files[f])) !== null) wanted.add(m[1]);
  }
  const shipped = new Set(LIB_FILES.map((f) => f.replace(/^lib\//, "").replace(/\.tsx?$/, "")));
  const missing = [...wanted].filter((w) => !shipped.has(w));
  if (missing.length) {
    throw new Error(
      `[bundle] blocks/ şu lib dosyalarını import ediyor ama LIB_FILES'ta yoklar: ` +
        `${missing.join(", ")}\n  Çıktı repo'su derlenmez. scripts/bundle.mjs ve ` +
        `lib/export-core.mjs içindeki listelere ekle.`,
    );
  }

  // 5. Blok kayıt defteri + resp kullanımı
  const registry = readRegistry();
  const respUsage = {};
  for (const [name, path] of Object.entries(registry)) {
    if (!files[path]) {
      throw new Error(`[bundle] ${name} için dosya yok: ${path}`);
    }
    respUsage[name] = extractRespUsage(files[path], path);
  }

  // 6. Blokların npm bağımlılıkları — blok başına, otomatik.
  //
  // Elle liste tutmuyoruz: blok kaynağındaki "çıplak" import'lar (göreli
  // olmayan, @/ ile başlamayan) taranıp kurulu sürümleriyle eşleniyor.
  // Böylece bir blok yeni paket kullanmaya başlayınca burada kendiliğinden
  // görünüyor ve SADECE o blok kullanıldığında çıktıya giriyor.
  const bareRe = /from\s+"([^".][^"]*)"/g;
  const blockDeps = {};
  for (const [name, path] of Object.entries(registry)) {
    const found = {};
    let m;
    while ((m = bareRe.exec(files[path])) !== null) {
      const spec = m[1];
      if (spec.startsWith("@/") || spec.startsWith("node:")) continue;
      // "embla-carousel-react/x" gibi alt yolları paket adına indir
      const pkg = spec.startsWith("@")
        ? spec.split("/").slice(0, 2).join("/")
        : spec.split("/")[0];
      if (BASE_DEPS.includes(pkg)) continue;
      found[pkg] = installedVersion(pkg);
    }
    if (Object.keys(found).length) blockDeps[name] = found;
  }


  // 5. Çıktı bağımlılıkları — zod/puck/jszip BURAYA GİRMEZ
  const deps = {
    dependencies: {
      next: installedVersion("next"),
      react: installedVersion("react"),
      "react-dom": installedVersion("react-dom"),
    },
    devDependencies: {
      "@tailwindcss/postcss": installedVersion("@tailwindcss/postcss"),
      "@types/node": installedVersion("@types/node"),
      "@types/react": installedVersion("@types/react"),
      "@types/react-dom": installedVersion("@types/react-dom"),
      tailwindcss: installedVersion("tailwindcss"),
      typescript: installedVersion("typescript"),
    },
  };

  // 6. public/ varlıkları — base64, çünkü png/jpg de olabilir.
  // Export bunlardan SADECE sitenin referans verdiklerini zip'e koyar.
  const assets = {};
  const publicDir = join(ROOT, "public");
  if (existsSync(publicDir)) {
    for (const full of walk(publicDir)) {
      const rel = posix(relative(ROOT, full));
      // public/thumbs studio'nun çekmece küçük resimleri — siteye ait değil.
      // Pakete girerse hem her export'a aday olur hem de base64 halleri
      // /edit'e boşuna ~200 KB yükler.
      if (rel.startsWith("public/thumbs/")) continue;
      assets[rel] = readFileSync(full).toString("base64");
    }
  }

  const scale = extractScale();

  mkdirSync(OUT_DIR, { recursive: true });

  const banner =
    "// scripts/bundle.mjs tarafından üretildi — ELLE DÜZENLEME.\n" +
    `// Kaynak: blocks/, ${LIB_FILES.join(", ")}, template/\n`;

  const mjs =
    banner +
    `export const FILES = ${JSON.stringify(files, null, 2)};\n\n` +
    `export const BLOCK_FILES = ${JSON.stringify(registry, null, 2)};\n\n` +
    `export const RESP_USAGE = ${JSON.stringify(respUsage, null, 2)};\n\n` +
    `export const DEPS = ${JSON.stringify(deps, null, 2)};\n\n` +
    `export const BLOCK_DEPS = ${JSON.stringify(blockDeps, null, 2)};\n\n` +
    `export const SCALE = ${JSON.stringify(scale, null, 2)};\n\n` +
    `export const PUBLIC_ASSETS = ${JSON.stringify(assets, null, 2)};\n`;
  writeFileSync(join(OUT_DIR, "files.mjs"), mjs);

  // Uygulamanın import ettiği tipli yüz. Veri tek yerde (files.mjs) duruyor;
  // Node tarafındaki verify betiği de aynı dosyayı okuyor.
  const ts =
    banner +
    `export { FILES, BLOCK_FILES, RESP_USAGE, DEPS, BLOCK_DEPS, SCALE, PUBLIC_ASSETS } from "./files.mjs";\n`;
  writeFileSync(join(OUT_DIR, "files.ts"), ts);

  const bytes = Object.values(files).reduce((n, c) => n + c.length, 0);
  console.log(
    `[bundle] ${Object.keys(files).length} dosya, ${(bytes / 1024).toFixed(1)} KB · ` +
      `${Object.keys(assets).length} public varlık · ` +
      `blok bağımlılığı: ${Object.keys(blockDeps).length ? JSON.stringify(blockDeps) : "yok"} · ` +
      `bloklar: ${Object.keys(registry).join(", ")}`,
  );
}

main();
