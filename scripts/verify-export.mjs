#!/usr/bin/env node
/**
 * Projenin iddiasını koruyan test.
 *
 *   zip üret -> geçici klasöre aç -> npm i -> npm run build
 *
 * Build hata VEYA uyarı verirse çıkış kodu 1. Bu test yeşil kaldığı sürece
 * "indirdiğin repo gerçekten çalışıyor" cümlesi ayakta.
 *
 * Kullanım:
 *   node scripts/verify-export.mjs [site.json] [--keep]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const keep = args.includes("--keep");
const sitePath = args.find((a) => !a.startsWith("--")) ?? "data/demos/kepenk.json";

const fail = [];
const step = (msg) => console.log(`\n\x1b[1m▸ ${msg}\x1b[0m`);
const ok = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const bad = (msg) => {
  console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
  fail.push(msg);
};

function run(cmd, cmdArgs, cwd) {
  return execFileSync(cmd, cmdArgs, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0", CI: "1" },
    maxBuffer: 32 * 1024 * 1024,
  });
}

// ---------------------------------------------------------------------------

step("Paket tazeleniyor (bundle.mjs)");
run("node", ["scripts/bundle.mjs"], ROOT);
ok("generated/ güncel");

const { buildProjectFiles, buildZip, collectLocalAssets, externalizeImages } =
  await import("../lib/export-core.mjs");
const bundle = await import("../generated/files.mjs");

// Mutlak yol da kabul edilmeli: CI dışında elle bir site.json denemek yaygın.
const resolvedSite = isAbsolute(sitePath) ? sitePath : join(ROOT, sitePath);
const site = JSON.parse(readFileSync(resolvedSite, "utf8"));
// --- Tarayıcı yolu Node yoluyla aynı paketi mi kullanıyor? -----------------

step("tarayıcı export yolu");
{
  /**
   * Bu betik paketi bütün import ediyor; tarayıcı ise lib/export.ts'in
   * verdiği nesneyi kullanıyor. İkisi ayrılırsa CI yeşil kalırken indirilen
   * proje bozuk çıkıyor — bir kez oldu: PUBLIC_ASSETS ve BLOCK_DEPS eksikti,
   * varsayılan görseller 404 verdi, Carousel'li projeler derlenmedi.
   */
  const kaynak = readFileSync(join(ROOT, "lib", "export.ts"), "utf8");
  const moduleAnahtarlari = Object.keys(bundle).filter((k) => k !== "default");
  const ns = /import\s+\*\s+as\s+(\w+)\s+from\s+["']@\/generated\/files["']/.exec(kaynak);
  const literal = /const\s+bundle\s*=\s*\{([^}]*)\}/.exec(kaynak);

  if (ns) {
    const ad = ns[1];
    if (new RegExp(`buildZip\\(\\s*site\\s*,\\s*${ad}\\s*,`).test(kaynak)) {
      ok(`tarayıcı paketi bütün geçiyor (import * as ${ad}) — ${moduleAnahtarlari.length} anahtar`);
    } else {
      bad(`lib/export.ts namespace import ediyor ama buildZip'e ${ad} verilmiyor`);
    }
  } else if (literal) {
    const verilen = literal[1].split(",").map((t) => t.split(":")[0].trim()).filter(Boolean);
    const eksik = moduleAnahtarlari.filter((k) => !verilen.includes(k));
    if (eksik.length) {
      bad(
        "lib/export.ts paketi EKSİK kuruyor — tarayıcıdan inen zip Node'unkinden farklı. " +
          `Eksik: ${eksik.join(", ")}`,
      );
    } else {
      ok("tarayıcı paketi tüm anahtarları taşıyor");
    }
  } else {
    bad("lib/export.ts içinde paket bulunamadı — export yolu değişmiş olabilir");
  }
}

step(`Zip üretiliyor — ${sitePath}`);
const zip = buildZip(site, bundle, JSZip);
const buffer = await zip.generateAsync({ type: "nodebuffer" });
ok(`zip ${(buffer.length / 1024).toFixed(1)} KB`);

const work = mkdtempSync(join(tmpdir(), "kiln-verify-"));
const app = join(work, "site");
mkdirSync(app, { recursive: true });

step("Zip açılıyor");
const loaded = await JSZip.loadAsync(buffer);
const written = [];
for (const [path, entry] of Object.entries(loaded.files)) {
  if (entry.dir) continue;
  const dest = join(app, path);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, await entry.async("nodebuffer"));
  written.push(path);
}
ok(`${written.length} dosya açıldı: ${work}`);

// --- İçerik kontrolleri ----------------------------------------------------

step("Çıktı içeriği denetleniyor");

const pkg = JSON.parse(readFileSync(join(app, "package.json"), "utf8"));
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
const banned = ["zod", "jszip", "@puckeditor/core", "@measured/puck"];
const leaked = banned.filter((d) => d in allDeps);
if (leaked.length) bad(`çıktı package.json'a sızmış: ${leaked.join(", ")}`);
else ok(`studio bağımlılığı yok (${banned.join(", ")} aranmadı bulunamadı)`);
console.log(`    dependencies    : ${Object.keys(pkg.dependencies).join(", ")}`);
console.log(`    devDependencies : ${Object.keys(pkg.devDependencies).join(", ")}`);

const usedTypes = [...new Set(site.nodes.map((n) => n.type))];

// Kullanılmayan blokların npm bağımlılıkları çıktıya SIZMAMALI.
// (ör. Carousel yoksa embla-carousel-react package.json'da olmamalı)
const kullanilan = new Set();
for (const t of usedTypes) {
  for (const pkg of Object.keys(bundle.BLOCK_DEPS?.[t] ?? {})) kullanilan.add(pkg);
}
const kullanilmayan = new Set();
for (const [type, deps] of Object.entries(bundle.BLOCK_DEPS ?? {})) {
  if (usedTypes.includes(type)) continue;
  for (const pkg of Object.keys(deps)) if (!kullanilan.has(pkg)) kullanilmayan.add(pkg);
}
const sizan = [...kullanilmayan].filter((pkg) => pkg in allDeps);
if (sizan.length) {
  bad(`kullanılmayan blok bağımlılığı çıktıya sızmış: ${sizan.join(", ")}`);
} else if (kullanilmayan.size) {
  ok(`kullanılmayan blok bağımlılığı sızmamış (${[...kullanilmayan].join(", ")})`);
}
for (const pkg of kullanilan) {
  if (pkg in allDeps) ok(`kullanılan blok bağımlılığı var: ${pkg}`);
  else bad(`kullanılan blok bağımlılığı EKSİK: ${pkg}`);
}
const shippedBlocks = written.filter(
  (p) => p.startsWith("blocks/") && p !== "blocks/index.ts",
);
const expected = usedTypes.map((t) => bundle.BLOCK_FILES[t]).sort();
if (JSON.stringify(shippedBlocks.sort()) !== JSON.stringify(expected)) {
  bad(`blok dosyaları beklenenle uyuşmuyor:\n      var: ${shippedBlocks}\n      olmalı: ${expected}`);
} else {
  ok(`sadece kullanılan bloklar var (${usedTypes.join(", ")})`);
}

// Studio'ya ait hiçbir dosya çıktıya girmemeli.
const STUDIO_ONLY = [
  /^puck\//,
  /^generated\//,
  /^scripts\//,
  /^data\//,
  /lib\/schema\.ts$/,
  /lib\/storage\.ts$/,
  /lib\/export/,
  /lib\/tokens/,
  /\.tpl$/,
];
const strays = written.filter((p) => STUDIO_ONLY.some((re) => re.test(p)));
if (strays.length) strays.forEach((f) => bad(`çıktıya sızan studio dosyası: ${f}`));
else ok("studio dosyası sızmamış (puck/, schema, storage, export, şablonlar)");

// Sitenin işaret ettiği yerel görseller zip'e girmiş mi?
// Girmezse site hatasız derlenir ama görseller 404 verir — sessiz bozulma.
// Denetim DIŞA AKTARILMIŞ site üzerinde: studio'da yüklenen görseller
// kaynakta data URI, çıktıda /images/... yolu.
const { site: disaAktarilan } = externalizeImages(site);
const localAssets = collectLocalAssets(disaAktarilan);
const missingAssets = localAssets.filter((ref) => !written.includes(`public${ref}`));
if (missingAssets.length) {
  bad(`yerel görsel zip'te yok: ${missingAssets.join(", ")}`);
} else if (localAssets.length) {
  ok(`${localAssets.length} yerel görsel taşındı (${localAssets.join(", ")})`);
} else {
  ok("yerel görsel referansı yok (hepsi dış URL)");
}

// --- Meta ve kimlik dosyaları ----------------------------------------------

step("meta / ikon denetimi");

const pageTsx = readFileSync(join(app, "app", "page.tsx"), "utf8");
const layoutTsx = readFileSync(join(app, "app", "layout.tsx"), "utf8");
if (!/metadataBase:\s*new URL\(/.test(layoutTsx)) {
  bad("kök layout'ta metadataBase yok — göreli og:image adresleri çözülemez");
} else {
  ok("metadataBase kök layout'ta (tüm rotalar devralıyor)");
}
if (!written.includes("app/opengraph-image.tsx")) bad("opengraph-image.tsx çıktıda yok");
else ok("sosyal medya kartı build'de üretiliyor");
if (!/themeColor/.test(pageTsx)) bad("viewport.themeColor yok");
else ok("theme-color basılıyor");

for (const [dosya, aciklama] of [
  ["app/site-url.ts", "tek kaynak yayın adresi"],
  [".env.example", "örnek ortam dosyası"],
  ["app/manifest.ts", "web manifest"],
  ["app/icon.svg", "site ikonu"],
  ["app/apple-icon.svg", "apple touch ikonu"],
]) {
  if (written.includes(dosya)) ok(`${dosya} (${aciklama})`);
  else bad(`${dosya} çıktıda yok — ${aciklama}`);
}

const siteUrl = readFileSync(join(app, "app", "site-url.ts"), "utf8");
if (!/NEXT_PUBLIC_SITE_URL/.test(siteUrl)) bad("site-url.ts ortam değişkenini okumuyor");
else ok("yayın adresi NEXT_PUBLIC_SITE_URL'den geliyor");
for (const f of ["app/sitemap.ts", "app/robots.ts"]) {
  const icerik = readFileSync(join(app, f), "utf8");
  if (/https:\/\/example\.com/.test(icerik)) bad(`${f} hâlâ sabit example.com içeriyor`);
}
ok("sitemap/robots sabit adres taşımıyor");

// --- Yinelenen bölüm kimliği -----------------------------------------------

step("bölüm kimliği denetimi");
{
  const sayac = new Map();
  for (const n of site.nodes) {
    const a = n.props?.anchorId;
    if (typeof a === "string" && a.trim()) sayac.set(a, (sayac.get(a) ?? 0) + 1);
  }
  const yinelenen = [...sayac].filter(([, n]) => n > 1);
  if (yinelenen.length) {
    // Tarayıcı ilk eşleşmeye gider; ikinci bölüme verilen bağlantılar
    // sessizce yanlış yere düşer.
    yinelenen.forEach(([a, n]) => bad(`aynı bölüm kimliği ${n} blokta: "${a}"`));
  } else {
    ok(`${sayac.size} bölüm kimliğinin hepsi benzersiz`);
  }
}

// --- Gömülü görsel (base64) çıktıya sızmasın -------------------------------

step("gömülü görsel denetimi");

const pageJsonYolu = join(app, "content", "page.json");
const pageJson = readFileSync(pageJsonYolu, "utf8");
if (/"locked"\s*:/.test(pageJson)) {
  bad("content/page.json içinde editör durumu (locked) var");
} else {
  ok("editör durumu içeriğe sızmamış");
}
if (/data:image\//.test(pageJson)) {
  bad("content/page.json içinde base64 görsel var — gömülü görsel dosyaya çıkarılmamış");
} else {
  ok("content/page.json'da base64 yok");
}

/**
 * Mekanizmayı fiilen çalıştıran gidiş-dönüş testi.
 *
 * Demolarda gömülü görsel yok, dolayısıyla yukarıdaki denetim onlarda
 * kendiliğinden geçer. Sentetik bir site kurmadan "base64 sızmıyor" demek,
 * hiç denenmemiş bir yolu yeşil göstermek olurdu.
 */
{
  // 1x1 webp ve 1x1 png — içerik önemsiz, biçim önemli.
  const WEBP = "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
  const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const sentetik = {
    ...site,
    meta: { ...site.meta, ogImage: `data:image/png;base64,${PNG}` },
    nodes: [
      {
        id: "gomulu-test",
        type: "Gallery",
        props: {
          title: "Gömülü görsel testi",
          columns: 3,
          items: [
            {
              src: `data:image/webp;base64,${WEBP}`,
              alt: "gömülü test görseli",
              // srcset basamakları da dosyaya çıkmalı.
              sources: [
                { w: 400, src: `data:image/webp;base64,${WEBP}AA` },
                { w: 800, src: `data:image/webp;base64,${WEBP}BB` },
                { w: 1600, src: `data:image/webp;base64,${WEBP}` },
              ],
            },
            { src: `data:image/webp;base64,${WEBP}`, alt: "aynı görsel, tekrar" },
          ],
          animation: { type: "fade", trigger: "scroll", duration: 500, delay: 0, once: true },
        },
      },
    ],
  };

  try {
    const { files: sf, assets: sa } = buildProjectFiles(sentetik, bundle);
    const sentetikJson = sf["content/page.json"];

    if (/data:image\//.test(sentetikJson)) {
      bad("sentetik site: base64 content/page.json'da kaldı");
    } else {
      ok("sentetik site: base64 JSON'dan çıkarıldı");
    }

    const yollar = [...sentetikJson.matchAll(/"(\/images\/[^"]+)"/g)].map((m) => m[1]);
    const eksik = yollar.filter((y) => !sa[`public${y}`]);
    if (!yollar.length) {
      bad("sentetik site: /images/ yolu üretilmedi");
    } else if (eksik.length) {
      bad(`sentetik site: dosyası yazılmayan yol: ${eksik.join(", ")}`);
    } else {
      ok(`${yollar.length} gömülü görsel public/images/ altına yazıldı`);
    }

    // Aynı görsel iki kez gömülüyse tek dosya olmalı. Toplam dört dosya
    // bekleniyor: 1600'lük ana kaynak (iki öğe paylaşıyor) + 400 + 800 +
    // meta.ogImage.
    const cikti = JSON.parse(sentetikJson);
    const [a, b] = cikti.nodes[0].props.items.map((i) => i.src);
    const dosyaSayisi = Object.keys(sa).length;
    if (a === b && dosyaSayisi === 4) {
      ok(`aynı görsel tek dosyaya indirgendi (${dosyaSayisi} dosya)`);
    } else {
      bad(`tekilleştirme çalışmadı: ${a} vs ${b}, ${dosyaSayisi} dosya`);
    }

    // srcset basamakları
    const kaynaklar = cikti.nodes[0].props.items[0].sources ?? [];
    const bozuk = kaynaklar.filter((k) => !/^\/images\//.test(k.src));
    if (kaynaklar.length !== 3) {
      bad(`srcset basamakları eksik: ${kaynaklar.length}/3`);
    } else if (bozuk.length) {
      bad(`srcset basamağı dosyaya çıkmamış: ${bozuk.map((k) => k.w).join(", ")}`);
    } else {
      ok("srcset basamaklarının üçü de public/images/ altında");
    }

    if (!/^\/images\//.test(String(JSON.parse(sentetikJson).meta.ogImage))) {
      bad("sentetik site: meta.ogImage dışa aktarılmadı");
    } else {
      ok("meta.ogImage de dosyaya çıkarıldı");
    }
  } catch (err) {
    bad(`sentetik site kurulamadı: ${err.message}`);
  }
}

// --- Kurulum ve derleme ----------------------------------------------------

step("npm install");
try {
  run("npm", ["install", "--no-audit", "--no-fund", "--prefer-offline", "--loglevel=error"], app);
  ok("bağımlılıklar kuruldu");
} catch (err) {
  bad(`npm install başarısız:\n${err.stdout ?? ""}${err.stderr ?? ""}`);
}

step("npm run build");
let buildOut = "";
try {
  buildOut = run("npm", ["run", "build"], app);
  ok("build tamamlandı");
} catch (err) {
  buildOut = `${err.stdout ?? ""}${err.stderr ?? ""}`;
  bad("build BAŞARISIZ");
  console.log(buildOut);
}

/**
 * Üretilen kodla ilgisi olmayan, ortamdan gelen bilgilendirmeler.
 * Liste BİLEREK dar tutulmuştur — buraya bir şey eklemek, o uyarıyı
 * bir daha asla görmemek demek.
 */
const IGNORED_WARNINGS = [
  // Her seferinde boş bir klasörde derlediğimiz için kaçınılmaz.
  /No build cache found/i,
];

const warnLines = buildOut
  .split("\n")
  .filter((l) => /⚠|\bwarn(ing)?\b/i.test(l))
  .filter((l) => l.trim())
  .filter((l) => !IGNORED_WARNINGS.some((re) => re.test(l)));
if (warnLines.length) {
  bad(`build uyarı verdi (${warnLines.length} satır):`);
  warnLines.forEach((l) => console.log(`      ${l.trim()}`));
} else {
  ok("uyarı yok");
}

// --- JS kapalıyken metin görünüyor mu? -------------------------------------

step("SSR HTML denetimi (JS kapalı senaryosu)");
const htmlPath = [
  join(app, ".next/server/app/index.html"),
  join(app, ".next/server/app/page.html"),
].find(existsSync);

if (!htmlPath) {
  bad("üretilmiş HTML bulunamadı");
} else {
  const html = readFileSync(htmlPath, "utf8");
  const texts = [];
  for (const node of site.nodes) {
    for (const [key, value] of Object.entries(node.props)) {
      // Sadece GÖRÜNEN metin alanları. Adresler (harita gömme, görsel src,
      // tel/mailto) sayfada metin olarak çıkmaz; onları aramak yanlış alarm.
      const adresMi =
        /^(https?:|tel:|mailto:|#|\/)/.test(value) || /url$/i.test(key) || key === "src" || key === "href";
      if (typeof value === "string" && value.length > 12 && !adresMi) {
        texts.push([key, value]);
      }
    }
  }
  // Etiketler ayıklanmış metin: bölünmüş başlık <span>'lara ayrıldığı için
  // ham HTML'de kesintisiz geçmiyor, ama tarayıcı ve tarayıcı botu metni
  // birleştirerek okuyor. Doğru soru "kesintisiz mi" değil, "okunur mu".
  const duzMetin = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

  let missing = 0;
  for (const [key, value] of texts) {
    const probe = value.slice(0, 40).split("&")[0].split("<")[0];
    if (!duzMetin.includes(probe)) {
      bad(`SSR metninde yok (${key}): "${probe}"`);
      missing++;
    }
  }
  if (!missing) ok(`${texts.length} metin alanı SSR metninde okunur`);

  // Fontlar next/font ile mi geliyor, CDN'den mi?
  const cdn = /fonts\.googleapis\.com|fonts\.gstatic\.com|@import\s+url\(/i;
  if (cdn.test(html)) bad("fontlar CDN'den çekiliyor — next/font kullanılmalı");
  else ok("font CDN linki yok");

  // Dosya adında birden fazla nokta var: <hash>.p.<hash>.woff2
  const selfHosted = html.match(/\/_next\/static\/media\/[\w.-]+\.woff2?/g) ?? [];
  if (selfHosted.length) ok(`${selfHosted.length} font dosyası kendi alanından servis ediliyor`);
  else bad("kendi alanından servis edilen font dosyası bulunamadı");

  // JS'siz koruma katmanları duruyor mu?
  if (/classList\.add\("js"\)/.test(html)) ok("js sınıfı satır içi script ile ekleniyor");
  else bad("js sınıfını ekleyen satır içi script yok — JS kapalıyken metin gizli kalabilir");

  // Başlık metni HTML'de TEK KEZ geçmeli.
  // Bölünmüş başlıkta bir ara sr-only kopya + görünür parçalar üretiliyordu
  // ve h1.textContent başlığı çift veriyordu (arama motoru çift okuyor).
  for (const node of site.nodes) {
    const baslik = node.props?.title;
    const anim = node.props?.animation;
    if (typeof baslik !== "string" || !baslik.trim()) continue;
    if (!anim || anim.splitBy === "none" || !anim.splitBy) continue;

    // Parçalanmış başlıkta düz metin aranmaz; kelimelerin tekrar sayısına bakılır.
    const ilkKelime = baslik.trim().split(/\s+/)[0];
    const kacKez = html.split(`>${ilkKelime}<`).length - 1;
    if (kacKez > 1) {
      bad(`bölünmüş başlık HTML'de ${kacKez} kez geçiyor (çift metin): "${ilkKelime}"`);
    } else {
      ok(`bölünmüş başlık tek kez geçiyor ("${ilkKelime}")`);
    }
  }

  // Görseller dizi/nesne içinde de olabiliyor (Gallery items[],
  // Features items[].image). Önceki kontrol yalnızca props'un ilk
  // seviyesine bakıyordu, bu yüzden o demolarda kural 7 sessizce
  // doğrulanmadan geçiyordu.
  const images = [];
  const walk = (value) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== "object") return;
    // Adresi boş görsel <img> basmıyor (Media yer tutucu çiziyor); alt
    // denetimi yalnızca gerçekten basılanlar için anlamlı.
    if (typeof value.src === "string" && value.src.trim() && "alt" in value) {
      images.push(value);
    }
    Object.values(value).forEach(walk);
  };
  site.nodes.forEach((n) => walk(n.props));

  const bosAlt = images.filter((img) => !img.alt || !String(img.alt).trim());
  if (bosAlt.length) {
    bad(`${bosAlt.length} görselin alt metni boş: ${bosAlt.map((i) => i.src).join(", ")}`);
  }
  // React öznitelik değerlerini kaçırarak basar (Alsancak'ta -> Alsancak&#x27;ta).
  // Ham karşılaştırma, doğru basılmış alt metnini "yok" sanıyordu.
  const attrEsc = (s) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  const eksik = images.filter(
    (img) => img.alt && !html.includes(`alt="${attrEsc(String(img.alt))}"`),
  );
  for (const img of eksik) bad(`alt metni HTML'de yok: ${img.alt}`);

  // Boş alan = eleman hiç basılmasın. Boş bir <h1> ekran okuyucuda adsız bir
  // başlık, sayfada da görünmez bir boşluk bırakıyordu.
  const bosEleman = [...html.matchAll(/<(h1|h2|h3|p|blockquote|figcaption)\b[^>]*>\s*<\/\1>/g)];
  if (bosEleman.length) {
    bad(`${bosEleman.length} boş metin elemanı: ${bosEleman.map((m) => m[1]).join(", ")}`);
  } else ok("boş metin elemanı yok");
  const bosBag = [...html.matchAll(/<a\b[^>]*>\s*<\/a>/g)];
  if (bosBag.length) bad(`${bosBag.length} boş bağlantı (erişilebilir adı yok)`);

  if (!images.length) ok("sayfada görsel yok");
  else if (!bosAlt.length && !eksik.length) {
    ok(`${images.length} görselin alt metni yerinde`);
  }
}

// ---------------------------------------------------------------------------

// --- Sabit dize denetimi ----------------------------------------------------
//
// Bloklarda ekran okuyucuya giden metinler sabit Türkçe yazılmıştı:
// İngilizce bir site indirdiğinizde menü düğmesi "Menüyü aç" diyordu.
// Artık hepsi lib/block-text.ts'ten, site diline göre geliyor.
//
// Denetim Türkçe HARFE bakmıyor. Bakmayı denedim ve kaçırdı: "slayta git"
// içinde tek bir Türkçe karakter yok. Kural yapısal — metin taşıyan
// öznitelikler düz dize alamaz, ya bt() ya da prop olmak zorunda.

step("sabit dize denetimi");
{
  const METIN_OZNITELIKLERI = ["aria-label", "aria-roledescription", "aria-description", "title", "placeholder"];
  const kaynaklar = written.filter(
    (f) => (f.startsWith("blocks/") || f.startsWith("lib/")) && /\.tsx?$/.test(f),
  );
  const oku = (f) => readFileSync(join(app, f), "utf8");

  const yorumsuz = (kod) =>
    kod.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  /**
   * Öznitelik ifadesini SÜSLÜ PARANTEZ EŞLEYEREK çıkarır.
   *
   * Önce regex'le denendi ve kaçırdı: aria-label={`${i + 1}. slayta git`}
   * içindeki ${...} kapanışı ifadeyi erken kesiyor, geriye tek tırnak
   * kalıyor ve dize sayılmıyordu. Tam da yakalaması gereken satırdı.
   */
  const ifadeAl = (kod, acilis) => {
    let derinlik = 0;
    let tirnak = null;
    for (let j = acilis; j < kod.length; j += 1) {
      const c = kod[j];
      if (tirnak) {
        if (c === "\\") j += 1;
        else if (c === tirnak) tirnak = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") tirnak = c;
      else if (c === "{") derinlik += 1;
      else if (c === "}") {
        derinlik -= 1;
        if (derinlik === 0) return kod.slice(acilis + 1, j);
      }
    }
    return null;
  };

  // bt(...) çağrılarındaki dizeler sözlük anahtarı — onlar meşru.
  // bt(...) çağrıları ve ${...} ara değerleri meşru: ilki sözlükten geliyor,
  // ikincisi kod (`${items.length}` dize değil, değişken adı).
  const btsiz = (ifade) =>
    ifade.replace(/bt\([\s\S]*?\)/g, "").replace(/\$\{[^}]*\}/g, "");
  const dizeVar = (ifade) => /(["'`])(?:[^"'`\\]|\\.)*[A-Za-z]{2}(?:[^"'`\\]|\\.)*\1/.test(ifade);

  const sabitler = [];
  for (const f of kaynaklar) {
    const kod = yorumsuz(oku(f));
    for (const oz of METIN_OZNITELIKLERI) {
      for (const m of kod.matchAll(new RegExp(`${oz}=(["{])`, "g"))) {
        if (m[1] === '"') {
          const son = kod.indexOf('"', m.index + oz.length + 2);
          sabitler.push(`${f}: ${oz}="${kod.slice(m.index + oz.length + 2, son)}"`);
          continue;
        }
        const ifade = ifadeAl(kod, m.index + oz.length + 1);
        if (ifade !== null && dizeVar(btsiz(ifade))) {
          sabitler.push(`${f}: ${oz}={${ifade.trim().slice(0, 60)}}`);
        }
      }
    }
  }
  if (sabitler.length) {
    bad(`${sabitler.length} sabit metin özniteliği (site diline uymaz):\n    ` + sabitler.join("\n    "));
  } else {
    ok(`${kaynaklar.length} kaynak dosyada sabit metin özniteliği yok`);
  }

  // Basılan HTML gerçekten sitenin dilinde mi? Kaynak temiz olsa bile
  // lang geçilmezse sözlük varsayılana düşer ve kimse fark etmez.
  const btKaynak = written.includes("lib/block-text.ts") ? oku("lib/block-text.ts") : null;
  if (!btKaynak) {
    bad("lib/block-text.ts çıktıda yok");
  } else if (htmlPath) {
    const html = readFileSync(htmlPath, "utf8");
    const diller = {};
    for (const m of btKaynak.matchAll(/^  (\w+): \{$([\s\S]*?)^  \},$/gm)) {
      diller[m[1]] = [...m[2].matchAll(/: "([^"]+)"/g)].map((x) => x[1]);
    }
    const siteDili = (site.meta.lang ?? "en").toLowerCase().split("-")[0];
    const beklenen = diller[siteDili] ?? diller.en;
    const yabanci = Object.entries(diller)
      .filter(([d]) => d !== siteDili && diller[d])
      .flatMap(([d, dizeler]) =>
        dizeler
          // Yer tutuculu dizeler ham haliyle HTML'de görünmez.
          .filter((t) => !t.includes("{") && !beklenen.includes(t))
          .filter((t) => html.includes(`"${t}"`) || html.includes(`>${t}<`))
          .map((t) => `${d}: "${t}"`),
      );
    if (yabanci.length) {
      bad(`HTML'de site dili (${siteDili}) DIŞINDA sözlük dizesi var: ${yabanci.join(", ")}`);
    } else {
      ok(`sözlük dizeleri site diline uyuyor (${siteDili})`);
    }
  }
}

// ---------------------------------------------------------------------------

// --- Animasyon CSS güvenlik ağları ------------------------------------------

step("Animasyon CSS'i denetleniyor");
const cssFiles = [];
const cssDir = join(app, ".next/static/chunks");
if (existsSync(cssDir)) {
  for (const f of readdirSync(cssDir)) {
    if (f.endsWith(".css")) cssFiles.push(readFileSync(join(cssDir, f), "utf8"));
  }
}
const allCss = cssFiles.join("\n");

if (!allCss) {
  bad("üretilmiş CSS bulunamadı");
} else {
  // prefers-reduced-motion: hareketi kapatan kullanıcı animasyon görmemeli
  const rm = allCss.match(/@media[^{]*prefers-reduced-motion[^{]*\{([\s\S]{0,400})/);
  if (!rm) {
    bad("prefers-reduced-motion bloğu CSS'te yok");
  } else if (!/opacity:\s*1/.test(rm[1]) || !/transition:\s*none/.test(rm[1])) {
    bad(`prefers-reduced-motion bloğu animasyonu nötrlemiyor: ${rm[1].slice(0, 120)}`);
  } else {
    ok("prefers-reduced-motion animasyonu kapatıyor");
  }

  const sc = allCss.match(/@media[^{]*scripting:\s*none[^{]*\{([\s\S]{0,400})/);
  if (!sc) bad("scripting: none bloğu CSS'te yok");
  else if (!/opacity:\s*1/.test(sc[1])) bad("scripting: none bloğu içeriği göstermiyor");
  else ok("scripting: none içeriği görünür tutuyor");

  if (/\.js\s+\[data-anim\]/.test(allCss)) ok("gizleme .js sınıfına bağlı");
  else bad("gizleme .js sınıfına bağlı değil");
}

// Animasyon yüzünden fazladan client bileşeni gelmiş mi?
step("Client bileşeni sayımı");
// Yönerge, kendi başına bir satır olmalı — yorum içinde geçen
// "use client" ifadesi client bileşeni yapmaz.
const CLIENT_DIRECTIVE = /^\s*["']use client["'];?\s*$/m;
const clientFiles = written.filter((f) => {
  if (!/\.(tsx|ts)$/.test(f)) return false;
  return CLIENT_DIRECTIVE.test(readFileSync(join(app, f), "utf8"));
});
// İzin verilen client bileşenleri: lib/Reveal + (kullanılıyorsa) Carousel.
// lib/ altında Reveal dışında client bileşeni OLMAMALI — SplitText, styles,
// anim ve responsive sunucuda kalmalı.
// Reveal artık sunucu bileşeni; gözlemci <head>'deki satır içi script'te.
// Çıktıda client bileşeni yalnızca Carousel (o da kullanılırsa).
const izinli = new Set(["blocks/Carousel/Carousel.tsx"]);
const beklenmeyen = clientFiles.filter((f) => !izinli.has(f));
const libClient = clientFiles.filter((f) => f.startsWith("lib/"));

if (beklenmeyen.length) {
  bad(`beklenmeyen client bileşeni: ${beklenmeyen.join(", ")}`);
} else if (libClient.length) {
  bad(`lib/ altında fazladan client bileşeni: ${libClient.join(", ")}`);
} else {
  ok(
    clientFiles.length
      ? `client bileşenleri: ${clientFiles.join(", ")}`
      : "client bileşeni YOK — animasyon tamamen sunucu + satır içi script",
  );
}

if (keep) console.log(`\nGeçici klasör bırakıldı: ${app}`);
else rmSync(work, { recursive: true, force: true });

console.log("");
if (fail.length) {
  console.log(`\x1b[31m\x1b[1mBAŞARISIZ — ${fail.length} sorun\x1b[0m`);
  process.exit(1);
}
console.log("\x1b[32m\x1b[1mHEPSİ GEÇTİ\x1b[0m");
