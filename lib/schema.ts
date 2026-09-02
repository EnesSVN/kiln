/**
 * Şema = tek doğruluk kaynağı.
 *
 * Bu dosya STUDIO tarafıdır, çıktı repo'suna GİTMEZ (zod bağımlılığı
 * taşımasın diye). Bloklara giden tipler lib/types.ts'te.
 */
import { z } from "zod";
import type { Animation, Density, Site, Space, Tokens } from "./types";

/** lib/responsive.ts'teki SCALE ile aynı basamaklar. */
export const SPACE_STEPS = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96] as const;

export const SpaceSchema = z.union(
  SPACE_STEPS.map((n) => z.literal(n)) as unknown as [
    z.ZodLiteral<0>,
    z.ZodLiteral<4>,
    ...z.ZodLiteral<Space>[],
  ],
);

/** T | { base, md?, lg? } */
export const responsive = <T extends z.ZodTypeAny>(inner: T) =>
  z.union([
    inner,
    z.object({
      base: inner,
      md: inner.optional(),
      lg: inner.optional(),
    }),
  ]);

export const AnimationSchema = z.object({
  type: z.enum(["none", "fade", "slide-up", "slide-left", "scale", "blur"]),
  duration: z.number().min(0).max(2000).default(500),
  delay: z.number().min(0).max(2000).default(0),
  trigger: z.enum(["load", "scroll"]).default("scroll"),
  once: z.boolean().default(true),
  splitBy: z.enum(["none", "word", "char"]).default("none"),
  stagger: z.number().min(0).max(200).default(40),
});

/** Rule 7: alt metni olmayan görsel export edilemez. */
/**
 * src ve alt BOŞ OLABİLİR — bilerek.
 *
 * Önceden ikisi de .min(1) idi. Sonuç: kullanıcı alt metnini silip sayfayı
 * yenilediğinde site şemadan geçmiyor, loadSite null dönüyor ve editör demo
 * siteye düşüyordu — sessiz veri kaybı. Kural 7 (alt zorunlu) yükleme
 * anında değil DIŞA AKTARMA anında zorlanıyor: lib/export-core.mjs boş alt
 * metniyle zip üretmeyi hangi blok olduğunu söyleyerek reddediyor,
 * ImageField de alanın altında uyarı gösteriyor.
 */
export const ImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  sources: z
    .array(z.object({ w: z.number().int().positive(), src: z.string() }))
    .optional(),
});

export const LinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const DensitySchema = z.enum(["compact", "normal", "wide"]);

export const TokensSchema = z.object({
  colors: z.object({
    bg: z.string(),
    fg: z.string(),
    muted: z.string(),
    primary: z.string(),
    primaryFg: z.string(),
    border: z.string(),
  }),
  font: z.object({ heading: z.string(), body: z.string() }),
  scale: z.object({
    h1: z.number(),
    h2: z.number(),
    h3: z.number(),
    body: z.number(),
  }),
  radius: z.number().min(0).max(24),
  // Eski JSON'lar spacing'i sayı olarak tutuyordu; en yakın yoğunluğa çevrilir.
  spacing: z.union([
    DensitySchema,
    z.number().transform((n): Density => (n <= 12 ? "compact" : n >= 24 ? "wide" : "normal")),
  ]),
});

export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.unknown()),
});

export const SiteSchema = z.object({
  // id'si olmayan eski/elle yazılmış JSON'lar okunduğunda kimlik üretilir.
  id: z.string().min(1).default(() => crypto.randomUUID()),
  version: z.literal(1),
  meta: z.object({
    title: z.string().max(60),
    description: z.string().max(160),
    ogImage: z.string().optional(),
    lang: z.string().default("tr"),
    business: z
      .object({
        // JSON-LD LocalBusiness için
        name: z.string(),
        phone: z.string().optional(),
        address: z.string().optional(),
        geo: z.tuple([z.number(), z.number()]).optional(),
      })
      .optional(),
  }),
  tokens: TokensSchema,
  nodes: z.array(NodeSchema),
  locked: z.array(z.string()).optional(),
});

/**
 * Şema ile lib/types.ts birbirinden kaçarsa burası derlenmez.
 * Faz 3'te bloklar types.ts'e güvenecek, şema ise doğrulamayı yapacak —
 * ikisinin aynı şeyi söylediğinden emin olmak gerekiyor.
 */
type Assert<_A extends _B, _B> = true;
export type _AnimationMatches = Assert<z.infer<typeof AnimationSchema>, Animation>;
export type _TokensMatches = Assert<z.infer<typeof TokensSchema>, Tokens>;
export type _SiteMatches = Assert<z.infer<typeof SiteSchema>, Site>;

/** Ham JSON → doğrulanmış Site. Hatalıysa fırlatır. */
export function parseSite(input: unknown): Site {
  return SiteSchema.parse(input);
}
