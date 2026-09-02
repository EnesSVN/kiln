import {
  DM_Sans,
  Figtree,
  Inter,
  Lora,
  Manrope,
  Playfair_Display,
  Source_Serif_4,
  Space_Grotesk,
} from "next/font/google";
import { FONT_CATALOG, FONT_KEYS, fallbackStack, SYSTEM_STACK, isCatalogKey } from "./font-catalog.mjs";

/**
 * Studio tarafındaki next/font yükleyicileri.
 *
 * next/font çağrıları STATİK olmak zorunda — döngüyle üretilemiyorlar,
 * bu yüzden katalogla burası elle eşleniyor. Aşağıdaki kontrol ikisi
 * ayrışırsa geliştirmede bağırır.
 *
 * Studio 8 fontu da yüklüyor (araç, ürün değil). Çıktı repo'suna SADECE
 * seçilen iki font gider — kodu export üretiyor.
 *
 * Bu dosya çıktıya GİTMEZ.
 */
/**
 * next/font yükleyicilerinin argümanları TAMAMEN DÜZ OLMAK ZORUNDA:
 * her çağrı kendi const'una atanmalı ve nesne alanları birebir yazılmalı.
 * Ortak bir `opts` nesnesi yayımlamak ya da kısayol alan kullanmak
 * ("subsets," gibi) derleyici eklentisini kırıyor — bu yüzden tekrar var.
 */
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--kiln-inter",
  // preload YOK: katalog 8 font; hepsini preload etmek her sayfaya 16
  // font dosyası (~450 KB) bağlıyor ve yavaş bağlantıda LCP\'yi saniyelerce
  // geciktiriyordu. Fontlar CSS onlara başvurunca yükleniyor, display:swap
  // bu arada yedek yazı tipini gösteriyor.
  preload: false,
});

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--kiln-figtree",
  // preload YOK: katalog 8 font; hepsini preload etmek her sayfaya 16
  // font dosyası (~450 KB) bağlıyor ve yavaş bağlantıda LCP\'yi saniyelerce
  // geciktiriyordu. Fontlar CSS onlara başvurunca yükleniyor, display:swap
  // bu arada yedek yazı tipini gösteriyor.
  preload: false,
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--kiln-manrope",
  // preload YOK: katalog 8 font; hepsini preload etmek her sayfaya 16
  // font dosyası (~450 KB) bağlıyor ve yavaş bağlantıda LCP\'yi saniyelerce
  // geciktiriyordu. Fontlar CSS onlara başvurunca yükleniyor, display:swap
  // bu arada yedek yazı tipini gösteriyor.
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--kiln-dmsans",
  // preload YOK: katalog 8 font; hepsini preload etmek her sayfaya 16
  // font dosyası (~450 KB) bağlıyor ve yavaş bağlantıda LCP\'yi saniyelerce
  // geciktiriyordu. Fontlar CSS onlara başvurunca yükleniyor, display:swap
  // bu arada yedek yazı tipini gösteriyor.
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--kiln-spacegrotesk",
  // preload YOK: katalog 8 font; hepsini preload etmek her sayfaya 16
  // font dosyası (~450 KB) bağlıyor ve yavaş bağlantıda LCP\'yi saniyelerce
  // geciktiriyordu. Fontlar CSS onlara başvurunca yükleniyor, display:swap
  // bu arada yedek yazı tipini gösteriyor.
  preload: false,
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--kiln-sourceserif",
  // preload YOK: katalog 8 font; hepsini preload etmek her sayfaya 16
  // font dosyası (~450 KB) bağlıyor ve yavaş bağlantıda LCP\'yi saniyelerce
  // geciktiriyordu. Fontlar CSS onlara başvurunca yükleniyor, display:swap
  // bu arada yedek yazı tipini gösteriyor.
  preload: false,
});

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--kiln-lora",
  // preload YOK: katalog 8 font; hepsini preload etmek her sayfaya 16
  // font dosyası (~450 KB) bağlıyor ve yavaş bağlantıda LCP\'yi saniyelerce
  // geciktiriyordu. Fontlar CSS onlara başvurunca yükleniyor, display:swap
  // bu arada yedek yazı tipini gösteriyor.
  preload: false,
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--kiln-playfair",
  // preload YOK: katalog 8 font; hepsini preload etmek her sayfaya 16
  // font dosyası (~450 KB) bağlıyor ve yavaş bağlantıda LCP\'yi saniyelerce
  // geciktiriyordu. Fontlar CSS onlara başvurunca yükleniyor, display:swap
  // bu arada yedek yazı tipini gösteriyor.
  preload: false,
});

const LOADERS = {
  inter,
  figtree,
  manrope,
  dmSans,
  spaceGrotesk,
  sourceSerif,
  lora,
  playfair,
};

if (process.env.NODE_ENV !== "production") {
  const missing = FONT_KEYS.filter((k) => !(k in LOADERS));
  const extra = Object.keys(LOADERS).filter((k) => !FONT_KEYS.includes(k));
  if (missing.length || extra.length) {
    console.error(
      `[fonts] katalog ile yükleyiciler ayrıştı — eksik: ${missing}, fazla: ${extra}`,
    );
  }
}

/**
 * Katalogdaki TÜM fontların değişken sınıfları.
 *
 * SADECE /edit için: tema panelinde font değiştirince önizleme anında
 * dönsün diye sekizi de bağlı olmalı.
 *
 * Landing ve /preview'de KULLANMA — bu sınıf sekiz fontu da preload
 * ettiriyor (~450 KB, 16 dosya) ve yavaş bağlantıda LCP'yi saniyelerce
 * geciktiriyor (Lighthouse'ta ölçüldü). Onlar fontVariablesFor() kullanır.
 */
export const allFontVariables = Object.values(LOADERS)
  .map((f) => f.variable)
  .join(" ");

/** Yalnızca bu sitenin kullandığı fontların değişken sınıfları. */
export function fontVariablesFor(font: { heading: string; body: string }): string {
  const keys = [font.heading, font.body].filter(
    (k, i, arr) => isCatalogKey(k) && arr.indexOf(k) === i,
  ) as (keyof typeof LOADERS)[];
  return keys.map((k) => LOADERS[k].variable).join(" ");
}

/**
 * Token değerini gerçek CSS font-family yığınına çevirir.
 * Katalog anahtarı değilse değer olduğu gibi kullanılır (elle yazılmış JSON).
 */
export function fontStack(value: string): string {
  if (!isCatalogKey(value)) return value || SYSTEM_STACK;
  const key = value as keyof typeof LOADERS;
  return `${LOADERS[key].style.fontFamily}, ${fallbackStack(value)}`;
}

export { FONT_CATALOG, FONT_KEYS };
