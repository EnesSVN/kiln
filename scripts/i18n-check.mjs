#!/usr/bin/env node
/**
 * Çeviri denetimi.
 *
 * puck/*.config.ts içindeki her `label:` değerinin lib/i18n.ts · ETIKET
 * tablosunda karşılığı olmalı. Karşılığı olmayan etiket İngilizce arayüzde
 * Türkçe görünür — sessiz kalmasın diye burada kırılıyor.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(ROOT, "lib", "i18n.ts"), "utf8");

// ETIKET bloğundaki anahtarlar
const blok = src.slice(src.indexOf("export const ETIKET"), src.indexOf("/** Özel alanların"));
const tablo = new Set(
  [...blok.matchAll(/^\s{2}(?:"([^"]+)"|([A-Za-zÇĞİÖŞÜçğıöşü_][\wÇĞİÖŞÜçğıöşü]*)):/gm)].map(
    (m) => m[1] ?? m[2],
  ),
);

/**
 * defaultProps içindeki `label:` bir arayüz etiketi değil, blok İÇERİĞİ —
 * gezinme bağlantısının yazısı, düğmenin üstündeki söz. Çevrilmez; kullanıcı
 * onu zaten kendi diliyle değiştiriyor. Varsayılanlar İngilizceye dönünce
 * denetim sekiz tanesini "çevirisi yok" diye işaretledi.
 */
function varsayilanlariAt(kod) {
  let cikti = "";
  let i = 0;
  for (;;) {
    const m = /default(?:Item)?Props\s*:\s*\{/.exec(kod.slice(i));
    if (!m) return cikti + kod.slice(i);
    cikti += kod.slice(i, i + m.index);
    let derinlik = 0;
    let j = i + m.index + m[0].length - 1;
    for (; j < kod.length; j += 1) {
      if (kod[j] === "{") derinlik += 1;
      else if (kod[j] === "}" && (derinlik -= 1) === 0) break;
    }
    i = j + 1;
  }
}

const eksik = new Map();
for (const f of readdirSync(join(ROOT, "puck")).filter((f) => f.endsWith(".config.ts"))) {
  const s = varsayilanlariAt(readFileSync(join(ROOT, "puck", f), "utf8"));
  for (const m of s.matchAll(/label: "([^"]+)"/g)) {
    if (!tablo.has(m[1])) eksik.set(m[1], f);
  }
}

/**
 * Kabuk denetimi YAPISAL — Türkçe harf aramıyor.
 *
 * Arıyordu ve kaçırdı: bildirim çubuğunun kapatma düğmesi "Kapat" yazıyordu,
 * içinde tek bir Türkçe karakter olmadığı için denetim "tam" diyordu. Aynı
 * kör nokta "Sil", "Yeni", "slayta git" için de geçerliydi.
 *
 * Yeni kural dilden bağımsız: kullanıcıya görünen bir dize KAYNAKTA
 * yazamaz. Nereden geldiğine bakılıyor — ui(), alan(), bt() ya da bir
 * değişken olmalı. Böylece İngilizce sabit dizeler de yakalanıyor.
 */
const KABUK_DOSYALARI = [
  "app/edit/page.tsx",
  "app/edit/ThemePanel.tsx",
  "app/edit/MetaPanel.tsx",
  "app/edit/SiteSwitcher.tsx",
  "app/edit/Notice.tsx",
  "app/preview/page.tsx",
  "app/preview/current/page.tsx",
  "lib/storage.ts",
  "puck/EmptyState.tsx",
  "puck/config.tsx",
  ...readdirSync(join(ROOT, "puck", "fields")).map((f) => `puck/fields/${f}`),
];

/** Kullanıcıya metin taşıyan öznitelikler. */
const METIN_OZNITELIKLERI = ["title", "aria-label", "aria-description", "placeholder", "alt"];
/** Çeviriden geldiğini gösteren çağrılar. */
const CEVIRI = /\b(ui|alan|bt|ETIKET|BLOK_ACIKLAMA|KATEGORI)\s*[([]/;
/**
 * Çevrilecek metin OLMAYAN değerler: sayı (görüş alanı genişliği), adres,
 * dosya yolu, teknik belirteç. Bunlar dilden bağımsız.
 */
const CEVRILMEZ = /^(\d+|https?:\/\/\S*|\/[\w./-]*|[\w.-]+\.(svg|png|webp|json|ts|tsx)|Kiln[\s—-]*\w*)$/;

const kabuk = [];
for (const dosya of KABUK_DOSYALARI) {
  const kodsuz = readFileSync(join(ROOT, dosya), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

  // 1) JSX metin düğümü: >Merhaba< gibi. {ui(...)} sarmalı olan sorun değil.
  //    `=>` ok işlevi de ">" üretiyor; onu dışarıda tutmak için önündeki
  //    karakter kontrol ediliyor.
  for (const m of kodsuz.matchAll(/(^|[^=!<>])>\s*([A-Za-zÇĞİÖŞÜçğıöşü][^<>{}\n]{1,80}?)\s*</gm)) {
    const metin = m[2].trim();
    if (!/[A-Za-zÇĞİÖŞÜçğıöşü]{2}/.test(metin)) continue;
    kabuk.push(`${dosya}: JSX metni "${metin}"`);
  }

  // 2) Metin taşıyan öznitelikte düz dize
  for (const oz of METIN_OZNITELIKLERI) {
    for (const m of kodsuz.matchAll(new RegExp(`${oz}="([^"]{2,})"`, "g"))) {
      if (CEVRILMEZ.test(m[1])) continue;
      kabuk.push(`${dosya}: ${oz}="${m[1]}"`);
    }
  }

  // 3) confirm/alert/prompt'a düz dize
  for (const m of kodsuz.matchAll(/\b(?:window\.)?(confirm|alert|prompt)\(\s*(["'`])/g)) {
    kabuk.push(`${dosya}: ${m[1]}() düz dize alıyor`);
  }

  // 4) Bildirim/hata nesnelerinde düz dize
  for (const m of kodsuz.matchAll(/\b(title|detail|message|label)\s*:\s*(["'])([^"']{2,})\2/g)) {
    if (CEVIRI.test(m[3]) || CEVRILMEZ.test(m[3])) continue;
    kabuk.push(`${dosya}: ${m[1]}: "${m[3]}"`);
  }
}

if (kabuk.length) {
  console.error(`[i18n] editör kabuğunda ${kabuk.length} sabit Türkçe dize var:`);
  kabuk.forEach((k) => console.error(`  · ${k}`));
  process.exit(1);
}

if (eksik.size) {
  console.error(`[i18n] ${eksik.size} etiketin İngilizce karşılığı yok (lib/i18n.ts · ETIKET):`);
  for (const [etiket, dosya] of eksik) console.error(`  · "${etiket}"  (${dosya})`);
  process.exit(1);
}

console.log(`[i18n] ${tablo.size} etiket · config dosyalarındaki tüm etiketlerin karşılığı var`);
