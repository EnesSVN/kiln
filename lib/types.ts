/**
 * Saf TypeScript tipleri. Burada runtime import YOK.
 *
 * Bu dosya bloklarla birlikte çıktı repo'suna gider, bu yüzden zod'a
 * dokunmaz. zod şemaları lib/schema.ts'te durur ve orada bu tiplere
 * uyduğu derleme zamanında kontrol edilir.
 */

/** Tek değer ya da kırılım noktası başına değer: 16 | { base: 16, md: 32 } */
export type Responsive<T> = T | { base: T; md?: T; lg?: T };

/** Sabit boşluk ölçeği. Keyfi değer yok — bkz. lib/responsive.ts */
export type Space = 0 | 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64 | 96;

export type AnimationType =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-left"
  | "scale"
  | "blur";

export type Animation = {
  type: AnimationType;
  duration: number;
  delay: number;
  trigger: "load" | "scroll";
  once: boolean;
  splitBy: "none" | "word" | "char";
  stagger: number;
};

/**
 * Render sırasında düğüm kimliği prop olarak geçilir (lib/render.tsx).
 * Puck `id`'yi kendisi yönettiği için blok PROP TİPİNE dahil edilmez —
 * sadece bileşenin imzasına eklenir.
 */
export type WithNodeId<T> = T & { id?: string };

/** alt zorunlu — alt metni olmayan görsel şemadan geçmez. */
export type Image = {
  src: string;
  alt: string;
  /**
   * Aynı görselin küçük sürümleri (400/800/1600). Studio'da yüklenen
   * fotoğraflarda dolu, adresle bağlanan ya da SVG olan görsellerde yok.
   * Media bunlardan srcset üretir; boşsa tek kaynakla davranır.
   */
  sources?: { w: number; src: string }[];
};

export type Link = { label: string; href: string };

/** Boşluk yoğunluğu — blokların iç aralıklarını (--space) sürer. */
export type Density = "compact" | "normal" | "wide";

export type Tokens = {
  colors: {
    bg: string;
    fg: string;
    muted: string;
    primary: string;
    primaryFg: string;
    border: string;
  };
  font: { heading: string; body: string };
  scale: { h1: number; h2: number; h3: number; body: number };
  radius: number;
  spacing: Density;
};

export type Business = {
  name: string;
  phone?: string;
  address?: string;
  geo?: [number, number];
};

export type Meta = {
  title: string;
  description: string;
  ogImage?: string;
  lang: string;
  business?: Business;
};

/** DOM'daki Node ile karışmasın diye SiteNode. */
export type SiteNode = {
  id: string;
  type: string;
  props: Record<string, unknown>;
};

export type Site = {
  /** Kalıcı kimlik. Depolama bununla anahtarlanır — meta.title değişebilir. */
  id: string;
  version: 1;
  meta: Meta;
  tokens: Tokens;
  nodes: SiteNode[];
  /**
   * Kilitli blokların kimlikleri — EDİTÖR durumu, site içeriği değil.
   *
   * props'a konsaydı indirilen content/page.json'a sızardı; oradaki her
   * satır kullanıcının sitesine ait olmalı. Bu yüzden ayrı alan ve export
   * sırasında siliniyor (lib/export-core.mjs).
   */
  locked?: string[];
};
