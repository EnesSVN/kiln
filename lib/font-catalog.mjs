/**
 * Font kataloğu — düz JS, next/font'a bağlı değil.
 *
 * Studio (lib/fonts.ts) buradan yükleyicileri kurar, export (export-core)
 * buradan çıktı repo'sunun layout.tsx'ini üretir. Tek liste, iki tüketici.
 *
 * SUBSET NOTU: latin-ext ŞART. Türkçe'nin ğ ş ı İ karakterleri latin
 * subset'inde yok — sadece "latin" ile başlıklarda tofu kutuları çıkar.
 *
 * Hepsi variable font: next/font'a weight vermiyoruz, tam eksen geliyor.
 */
export const FONT_SUBSETS = ["latin", "latin-ext"];

export const FONT_CATALOG = {
  inter: { label: "Inter", google: "Inter", kind: "sans" },
  figtree: { label: "Figtree", google: "Figtree", kind: "sans" },
  manrope: { label: "Manrope", google: "Manrope", kind: "sans" },
  dmSans: { label: "DM Sans", google: "DM_Sans", kind: "sans" },
  spaceGrotesk: { label: "Space Grotesk", google: "Space_Grotesk", kind: "sans" },
  sourceSerif: { label: "Source Serif 4", google: "Source_Serif_4", kind: "serif" },
  lora: { label: "Lora", google: "Lora", kind: "serif" },
  playfair: { label: "Playfair Display", google: "Playfair_Display", kind: "serif" },
};

export const FONT_KEYS = Object.keys(FONT_CATALOG);

const FALLBACK = {
  sans: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  serif: "ui-serif, Georgia, 'Times New Roman', serif",
};

/** next/font'un `fallback` seçeneğine verilecek biçim. */
const FALLBACK_LIST = {
  sans: ["ui-sans-serif", "system-ui", "sans-serif"],
  serif: ["ui-serif", "Georgia", "serif"],
};

export function fallbackList(key) {
  const entry = FONT_CATALOG[key];
  return FALLBACK_LIST[entry ? entry.kind : "sans"];
}

export const SYSTEM_STACK = FALLBACK.sans;

/** Katalogdaki fontun yedek yığını. */
export function fallbackStack(key) {
  const entry = FONT_CATALOG[key];
  return entry ? FALLBACK[entry.kind] : SYSTEM_STACK;
}

/**
 * Token'daki değer katalog anahtarı mı, yoksa elle yazılmış bir CSS yığını mı?
 * Elle yazılmış JSON'lar bozulmasın diye ikisi de kabul ediliyor.
 */
export function isCatalogKey(value) {
  return typeof value === "string" && value in FONT_CATALOG;
}
