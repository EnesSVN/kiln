import { BLOK_ACIKLAMA } from "./block-info.mjs";
/**
 * Zip içeriğini üreten çekirdek. Düz JS — hem tarayıcı (lib/export.ts) hem
 * Node (scripts/verify-export.mjs) aynı kodu koşsun diye. CI'daki test ile
 * kullanıcının indirdiği zip birebir aynı yoldan çıkmalı.
 *
 * Çıktı repo'suna GİTMEZ.
 */
import {
  FONT_CATALOG,
  FONT_SUBSETS,
  SYSTEM_STACK,
  fallbackList,
  isCatalogKey,
} from "./font-catalog.mjs";
import { tokenCss } from "./tokens-core.mjs";

/** Çıktıya her zaman giden lib dosyaları. */
const SHIPPED_LIB = [
  "lib/types.ts",
  "lib/anim.ts",
  "lib/block-text.ts",
  "lib/responsive.ts",
  "lib/Media.tsx",
  "lib/MobileMenu.tsx",
  "lib/Reveal.tsx",
  "lib/SplitText.tsx",
  "lib/styles.ts",
  "lib/render.tsx",
];
// lib/tokens.ts BİLEREK yok: çıktıda onu import eden kimse olmadığı için
// ölü dosya olurdu. Token'lar app/tokens.css'e derleniyor.

const TEMPLATE_MAP = {
  "template/env.example.tpl": ".env.example",
  "template/app/site-url.ts.tpl": "app/site-url.ts",
  "template/package.json.tpl": "package.json",
  "template/next.config.mjs.tpl": "next.config.mjs",
  "template/postcss.config.mjs.tpl": "postcss.config.mjs",
  "template/tsconfig.json.tpl": "tsconfig.json",
  "template/gitignore.tpl": ".gitignore",
  "template/README.md.tpl": "README.md",
  "template/app/layout.tsx.tpl": "app/layout.tsx",
  "template/app/page.tsx.tpl": "app/page.tsx",
  "template/app/globals.css.tpl": "app/globals.css",
  "template/app/sitemap.ts.tpl": "app/sitemap.ts",
  "template/app/robots.ts.tpl": "app/robots.ts",
  "template/app/manifest.ts.tpl": "app/manifest.ts",
  "template/app/opengraph-image.tsx.tpl": "app/opengraph-image.tsx",
};

function render(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`[export] şablon değişkeni eksik: ${key}`);
    return vars[key];
  });
}

export function slugify(title) {
  const map = { ğ: "g", ü: "u", ş: "s", ı: "i", ö: "o", ç: "c", İ: "i" };
  return (
    title
      .replace(/[ğüşıöçİ]/g, (c) => map[c] ?? c)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "site"
  );
}

/** Ölçek dışı değeri en yakın basamağa çeker — lib/responsive.ts ile aynı kural. */
function step(value, scale) {
  const keys = Object.keys(scale).map(Number);
  if (scale[value] !== undefined) return scale[value];
  const nearest = keys.reduce((a, b) =>
    Math.abs(b - value) < Math.abs(a - value) ? b : a,
  );
  return scale[nearest];
}

/**
 * Bu sitenin GERÇEKTEN ürettiği boşluk sınıfları.
 *
 * Studio'daki geniş güvenli liste (~200 sınıf) çıktıya kopyalanmaz;
 * burada sadece page.json'da geçen değerlerin karşılıkları toplanır.
 */
export function collectRespClasses(site, respUsage, scale) {
  const classes = new Set();

  for (const node of site.nodes) {
    const usage = respUsage[node.type] ?? [];
    for (const [prop, prefix] of usage) {
      const value = node.props?.[prop];
      if (value === undefined || value === null) continue;

      if (typeof value === "number") {
        classes.add(`${prefix}-${step(value, scale)}`);
        continue;
      }
      if (typeof value === "object") {
        if (value.base !== undefined) classes.add(`${prefix}-${step(value.base, scale)}`);
        if (value.md !== undefined) classes.add(`md:${prefix}-${step(value.md, scale)}`);
        if (value.lg !== undefined) classes.add(`lg:${prefix}-${step(value.lg, scale)}`);
      }
    }
  }

  return [...classes].sort();
}

/**
 * Sitenin referans verdiği YEREL varlık yolları ("/demo/kepenk.svg" gibi).
 *
 * v1'de görsel yükleme yok, kullanıcı URL yapıştırıyor — yani normalde
 * hepsi https:// ile başlar ve zip'e girmesi gerekmez. Ama demo site (ve
 * elle yazılmış JSON'lar) public/ altındaki dosyalara işaret edebiliyor;
 * onları taşımazsak indirilen sitede görsel 404 veriyor.
 */
export function collectLocalAssets(site) {
  const refs = new Set();

  const visit = (value) => {
    if (typeof value === "string") {
      if (value.startsWith("/") && /\.[a-z0-9]{2,5}$/i.test(value)) refs.add(value);
      return;
    }
    if (Array.isArray(value)) return value.forEach(visit);
    if (value && typeof value === "object") return Object.values(value).forEach(visit);
  };

  site.nodes.forEach((n) => visit(n.props));
  visit(site.meta.ogImage);

  return [...refs].sort();
}

function renderRegistry(usedTypes, blockFiles) {
  const imports = usedTypes
    .map((t) => {
      const rel = blockFiles[t].replace(/^blocks\//, "").replace(/\.tsx$/, "");
      return `import { ${t} } from "./${rel}";`;
    })
    .join("\n");

  const named = usedTypes.join(", ");
  const entries = usedTypes.map((t) => `  ${t},`).join("\n");

  return `${imports}

export { ${named} };

/**
 * Blok kayıt defteri. content/page.json'daki \`type\` alanı buradaki
 * anahtarla eşleşir.
 */
export const blocks: Record<string, React.ComponentType<any>> = {
${entries}
};
`;
}

/**
 * Çıktıdaki font kurulumu.
 *
 * Fontlar CDN <link>'i ile DEĞİL, next/font ile geliyor: dosyalar build
 * sırasında indirilip repo'nun kendi alanından servis ediliyor. Üçüncü parti
 * istek yok, layout shift yok.
 *
 * SADECE seçilen fontlar üretilir — studio 8 fontu önizlemek için yüklüyor
 * olabilir ama çıktıya ikisi giriyor.
 *
 * Token'daki değer katalog anahtarı değilse (elle yazılmış CSS yığını)
 * o slot için yükleyici üretilmez, değer tokens.css'e düz yazılır.
 */
function fontPlan(tokens) {
  const loaders = [];
  const cssVars = {};

  for (const slot of ["heading", "body"]) {
    const value = tokens.font?.[slot];
    if (isCatalogKey(value)) {
      loaders.push({
        slot,
        google: FONT_CATALOG[value].google,
        fallback: fallbackList(value),
      });
    } else {
      cssVars[`--font-${slot}`] = value || SYSTEM_STACK;
    }
  }

  if (loaders.length === 0) {
    return { cssVars, fontImport: "", fontDeclarations: 'const rootClassName = "antialiased";\n' };
  }

  const names = [...new Set(loaders.map((l) => l.google))].sort();
  const fontImport = `import { ${names.join(", ")} } from "next/font/google";\n`;

  const decls = loaders
    .map(
      (l) =>
        `const ${l.slot}Font = ${l.google}({\n` +
        `  subsets: ${JSON.stringify(FONT_SUBSETS)},\n` +
        `  display: "swap",\n` +
        `  variable: "--font-${l.slot}",\n` +
        `  fallback: ${JSON.stringify(l.fallback)},\n` +
        `});`,
    )
    .join("\n\n");

  const classParts = loaders.map((l) => `\${${l.slot}Font.variable}`).join(" ");
  const rootClass = `const rootClassName = \`antialiased ${classParts}\`;\n`;

  return { cssVars, fontImport, fontDeclarations: `${decls}\n\n${rootClass}` };
}

function renderTokensCss(tokens, extraVars) {
  // resolveFont VERİLMİYOR: --font-heading/--font-body'yi next/font <html>
  // üzerinde tanımlıyor, burada da basarsak çakışırlar.
  return `/* content/page.json içindeki token'lardan üretildi. */
${tokenCss(tokens, ":root", { extraVars })}

/*
 * Aynı renkleri Tailwind yardımcı sınıfı olarak da açar: bg-primary,
 * text-muted, border-border gibi. Elle blok yazarken işinize yarar.
 */
@theme inline {
  --color-bg: var(--c-bg);
  --color-fg: var(--c-fg);
  --color-muted: var(--c-muted);
  --color-primary: var(--c-primary);
  --color-primary-fg: var(--c-primary-fg);
  --color-border: var(--c-border);
}
`;
}

function jsonBlock(obj, indentSpaces) {
  const pad = " ".repeat(indentSpaces);
  return JSON.stringify(obj, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : pad + line))
    .join("\n");
}

/**
 * site + bundle -> { yol: içerik } haritası.
 * Zip'e çevirme işi çağırana ait.
 */
/** data URI mime -> dosya uzantısı. */
const UZANTI = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/** Kısa, kararlı içerik damgası — aynı görsel iki kez yazılmasın diye. */
function damga(metin) {
  let h = 0x811c9dc5;
  for (let i = 0; i < metin.length; i++) {
    h ^= metin.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Gömülü görselleri dosyaya çıkarır.
 *
 * Studio'da yüklenen görseller site JSON'una data URI olarak gömülüyor
 * (tarayıcıda dosya sistemi yok). İndirilen repo'da bunun yeri yok: elle
 * yazılmış görünmesi gereken bir projede 300 KB'lık base64 satırı ilk bakışta
 * ele verirdi ve Next görsel iyileştirmesi de data URI üzerinde çalışmaz.
 * Bu yüzden her gömülü görsel public/images/ altına gerçek dosya olarak
 * yazılır, JSON'da sadece yol kalır.
 *
 * Site NESNESİ DEĞİŞTİRİLMEZ: studio'nun belleğindeki kayıt indirmeden
 * etkilenmemeli, kullanıcı düzenlemeye kaldığı yerden devam ediyor.
 */
export function externalizeImages(site) {
  const assets = {};
  const kopya = JSON.parse(JSON.stringify(site));

  const cevir = (src) => {
    const m = /^data:([^;,]+);base64,(.*)$/s.exec(src);
    if (!m) return null;
    const [, mime, b64] = m;
    const uzanti = UZANTI[mime.toLowerCase()];
    if (!uzanti) throw new Error(`[export] desteklenmeyen görsel türü: ${mime}`);
    const ad = `gorsel-${damga(b64)}.${uzanti}`;
    assets[`public/images/${ad}`] = b64;
    return `/images/${ad}`;
  };

  const gez = (deger) => {
    if (Array.isArray(deger)) return deger.forEach(gez);
    if (!deger || typeof deger !== "object") return;
    for (const [anahtar, v] of Object.entries(deger)) {
      if (typeof v === "string" && v.startsWith("data:image/")) {
        const yol = cevir(v);
        if (yol) deger[anahtar] = yol;
      } else {
        gez(v);
      }
    }
  };

  kopya.nodes.forEach((n) => gez(n.props));
  gez(kopya.meta);

  // Kilit listesi EDİTÖR durumu — indirilen içerikte yeri yok.
  delete kopya.locked;

  return { site: kopya, assets };
}

/**
 * Site ikonu — tema renginden ve başlığın ilk harfinden üretilir.
 *
 * Çıktıda hiç ikon yoktu: tarayıcı /favicon.ico isteyip 404 alıyor ve sekmede
 * boş bir kâğıt simgesi duruyordu. İndirilen repoda görülen ilk şey bu.
 *
 * PNG değil SVG: export hem tarayıcıda hem Node'da (verify) çalışıyor ve
 * ikisinde ortak bir PNG kodlayıcı yok. Next `app/icon.svg` ve
 * `app/apple-icon.svg` adlarını kendisi tanıyor. Safari eski sürümlerde
 * SVG apple-touch-icon'u yok sayar — README'de not düşülüyor.
 */
function iconSvg(harf, bg, fg, boyut, yuvarlaklik) {
  const guvenli = String(harf).replace(/[&<>"']/g, "");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boyut} ${boyut}" width="${boyut}" height="${boyut}">\n` +
    `  <rect width="${boyut}" height="${boyut}" rx="${yuvarlaklik}" fill="${bg}"/>\n` +
    `  <text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="${fg}"` +
    ` font-family="system-ui, -apple-system, Segoe UI, sans-serif"` +
    ` font-size="${Math.round(boyut * 0.58)}" font-weight="600">${guvenli}</text>\n` +
    `</svg>\n`
  );
}

export function buildProjectFiles(rawSite, bundle) {
  const {
    FILES,
    BLOCK_FILES,
    RESP_USAGE,
    DEPS,
    BLOCK_DEPS = {},
    SCALE,
    PUBLIC_ASSETS = {},
  } = bundle;
  const out = {};

  // Gömülü görseller ÖNCE dosyaya çıkarılır: bundan sonraki her adım
  // (alt denetimi, content/page.json, yerel varlık toplama) yolu görür,
  // base64'ü değil.
  const { site, assets: gomuluVarliklar } = externalizeImages(rawSite);
  /** base64 içerik — zip'e ikili olarak yazılır. */
  const assets = { ...gomuluVarliklar };

  const usedTypes = [...new Set(site.nodes.map((n) => n.type))].sort();
  if (usedTypes.length === 0) {
    throw new Error("[export] sitede hiç blok yok");
  }
  for (const type of usedTypes) {
    if (!BLOCK_FILES[type]) {
      throw new Error(`[export] bilinmeyen blok tipi: ${type}`);
    }
  }

  // 0. alt metni boş görselle export edilmez (kural 7).
  //    Şema alt'ı zorunlu tutuyor ama boş dizeyi geçiriyordu; kırık
  //    erişilebilirlikle site yayına çıkmasın diye burada duruyoruz.
  const altsiz = [];
  const gorselAra = (deger, blok) => {
    if (Array.isArray(deger)) return deger.forEach((d) => gorselAra(d, blok));
    if (!deger || typeof deger !== "object") return;
    if (typeof deger.src === "string" && "alt" in deger) {
      // Adresi boş görsel = görsel YOK; Media yer tutucu basıyor, <img> çıkmıyor.
      // Boş alt orada doğru cevap — kural 7 yalnızca gerçekten basılan
      // görseller için geçerli. Aksi halde görselsiz blok export'u kilitliyor.
      if (deger.src.trim() && !String(deger.alt ?? "").trim()) {
        altsiz.push({ blok, src: deger.src });
      }
    }
    Object.values(deger).forEach((d) => gorselAra(d, blok));
  };
  for (const node of site.nodes) gorselAra(node.props, node.type);
  if (altsiz.length) {
    throw new Error(
      `[export] ${altsiz.length} görselin alt metni boş — düzeltmeden dışa aktarılamaz:\n` +
        altsiz.map((g) => `  · ${g.blok}: ${g.src}`).join("\n"),
    );
  }

  // 1. Sadece kullanılan bloklar — olduğu gibi kopya
  for (const type of usedTypes) {
    const path = BLOCK_FILES[type];
    out[path] = FILES[path];
  }

  // 2. Kayıt defteri kullanılanlarla yeniden üretilir
  out["blocks/index.ts"] = renderRegistry(usedTypes, BLOCK_FILES);

  // 3. lib — olduğu gibi kopya
  for (const path of SHIPPED_LIB) {
    if (!FILES[path]) throw new Error(`[export] pakette yok: ${path}`);
    out[path] = FILES[path];
  }

  // 4. İçerik
  out["content/page.json"] = JSON.stringify(site, null, 2) + "\n";

  // 5. Token'lar + fontlar
  // tokenVars'a resolveFont VERİLMİYOR: --font-heading/--font-body'yi
  // next/font <html> üzerinde tanımlıyor, burada da basarsak çakışırlar.
  const fonts = fontPlan(site.tokens);
  out["app/tokens.css"] = renderTokensCss(site.tokens, fonts.cssVars);

  // 6. Şablonlar
  const respClasses = collectRespClasses(site, RESP_USAGE, SCALE);
  const sourceInline = respClasses.length
    ? `@source inline("${respClasses.join(" ")}");`
    : "/* Bu sayfa dinamik boşluk sınıfı kullanmıyor. */";

  // Sadece KULLANILAN blokların npm bağımlılıkları eklenir. Carousel yoksa
  // embla çıktının package.json'ına girmez — kullanılmayan bağımlılık
  // taşımak "temiz çıktı" iddiasını doğrudan çürütürdü.
  const dependencies = { ...DEPS.dependencies };
  for (const type of usedTypes) {
    Object.assign(dependencies, BLOCK_DEPS[type] ?? {});
  }
  const sortedDeps = Object.fromEntries(
    Object.keys(dependencies).sort().map((k) => [k, dependencies[k]]),
  );

  const renkler = site.tokens?.colors ?? {};
  const ilkHarf = (site.meta.title.trim()[0] ?? "K").toUpperCase();

  /**
   * README'deki blok listesi.
   *
   * Repo'yu açan kişi blocks/ altında ne olduğunu dosya adlarından tahmin
   * etmek zorunda kalmasın. Metinler lib/block-info.mjs'te — studio'nun
   * çekmecesinde gösterdiği açıklamaların aynısı, ikinci bir kopya yok.
   */
  const blokListesi = usedTypes
    .map((t) => `- **${t}** — ${BLOK_ACIKLAMA[t]?.tr ?? ""} \`blocks/${BLOCK_FILES[t].split("/")[1]}/\``)
    .join("\n");

  const vars = {
    name: slugify(site.meta.title),
    blockList: blokListesi,
    title: site.meta.title,
    shortTitle: site.meta.title.split(/[|\u2014-]/)[0].trim().slice(0, 24) || site.meta.title,
    description: site.meta.description ?? "",
    bgColor: renkler.bg ?? "#ffffff",
    primaryColor: renkler.primary ?? "#111111",
    fgColor: renkler.fg ?? "#111111",
    mutedColor: renkler.muted ?? "#666666",
    dependencies: jsonBlock(sortedDeps, 2),
    devDependencies: jsonBlock(DEPS.devDependencies, 2),
    sourceInline,
    fontImport: fonts.fontImport,
    fontDeclarations: fonts.fontDeclarations,
  };

  // Site ikonları — Next bu dosya adlarını kendisi tanıyor.
  out["app/icon.svg"] = iconSvg(ilkHarf, renkler.primary ?? "#111111", renkler.primaryFg ?? "#ffffff", 64, 12);
  out["app/apple-icon.svg"] = iconSvg(ilkHarf, renkler.primary ?? "#111111", renkler.primaryFg ?? "#ffffff", 180, 36);

  for (const [tplPath, outPath] of Object.entries(TEMPLATE_MAP)) {
    if (!FILES[tplPath]) throw new Error(`[export] şablon yok: ${tplPath}`);
    out[outPath] = render(FILES[tplPath], vars);
  }

  // 7. Referans verilen yerel varlıklar
  for (const ref of collectLocalAssets(site)) {
    const key = `public${ref}`;
    if (PUBLIC_ASSETS[key]) assets[key] = PUBLIC_ASSETS[key];
    // Bulunamayanlar sessizce atlanır: kullanıcı kendi sunucusundaki bir
    // yola işaret ediyor olabilir, bu bizim bileceğimiz şey değil.
  }

  return { files: out, assets };
}

/** JSZip yapıcısı dışarıdan geliyor — bu dosya bağımlılık taşımasın. */
export function buildZip(site, bundle, JSZip) {
  const { files, assets } = buildProjectFiles(site, bundle);
  const zip = new JSZip();

  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }
  for (const [path, base64] of Object.entries(assets)) {
    zip.file(path, base64, { base64: true });
  }

  return zip;
}
