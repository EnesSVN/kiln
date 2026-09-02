/**
 * Token matematiği — düz JS, tip yok.
 *
 * Neden .mjs: bu mantığı hem studio (TS, /preview, tuval) hem de export
 * betiği (Node, tarayıcı yok) kullanıyor. Tek kopya olmazsa önizlemedeki
 * site ile indirilen site sessizce ayrışır.
 *
 * Çıktı repo'suna GİTMEZ (orada token'lar app/tokens.css'e derlenmiş halde).
 */

/**
 * Hex ayrıştırma. #rgb ve #rrggbb kabul eder, başka biçimde null döner.
 */
function parseHex(value) {
  if (typeof value !== "string") return null;
  let h = value.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * `a` renginin `ratio` kadarını `b`'ye karıştırır, düz hex döndürür.
 *
 * Neden CSS color-mix() değil: color-mix Chrome 111+/Safari 16.2+ istiyor
 * ve desteklenmediğinde değişken hiç tanımlanmıyor — kart zemini kayboluyor,
 * kenarlık da olmadığı için kartlar görünmez kalıyordu. Hesabı burada
 * yapınca çıktıya düz `#f8f8f9` gidiyor: her tarayıcıda çalışır,
 * @supports yedeği gerekmez.
 *
 * Ayrıştırılamayan renkte `b` aynen döner (yüzey = zemin).
 */
export function mixHex(a, b, ratio) {
  const A = parseHex(a);
  const B = parseHex(b);
  if (!A || !B) return b;

  const channel = (i) =>
    Math.round(B[i] + (A[i] - B[i]) * ratio)
      .toString(16)
      .padStart(2, "0");

  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

/**
 * Akışkan başlık ölçeği. Token tek sayı tutar ama o sayı ÜST SINIR'dır;
 * küçük ekranda başlık orantılı küçülür. ~1024px'te üst sınıra ulaşır.
 */
/** Zemin koyu mu? sRGB göreli parlaklık eşiği. */
export function koyuMu(hex) {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.2;
}

export function fluid(px, floor = 0.62) {
  const min = Math.round(px * floor);
  const vw = Number((px / 10.24).toFixed(2));
  return `clamp(${min}px, ${vw}vw, ${px}px)`;
}

/**
 * Yoğunluk tablosu.
 *
 * space / spaceLg : blokların İÇ ritmi (başlık-paragraf arası, sütun arası)
 *
 * Bölüm arası boşluk (2 × section) blok içi boşluktan (spaceLg) BELİRGİN
 * şekilde büyük olmalı — docs/DESIGN.md · Kararlar. Oran mobilde 2×,
 * masaüstünde 4×+ tutuluyor.
 * section / band  : blokların DIŞ padding'i, kırılım noktası başına
 *
 * İki padding var çünkü tek değer işe yaramıyor: hero'ya yakışan 96px
 * header'ı devasa yapar. "section" içerik bölümleri için, "band" header
 * gibi ince şeritler için.
 *
 * section/band değerleri CSS değişkeni olarak basılıyor (Tailwind sınıfı
 * değil), bu yüzden lib/responsive.ts'teki SCALE basamaklarıyla sınırlı
 * değiller — Geniş lg'de 128 kullanabiliyoruz.
 *
 * Oran (2 × section ÷ spaceLg) her kırılım noktasında sırayla artar:
 * Kompakt < Normal < Geniş. Önceden Normal ve Geniş lg'de aynı 96px'i
 * kullanıyordu, yani masaüstünde Geniş hiçbir şey yapmıyordu.
 */
export const DENSITY = {
  compact: {
    space: 10,
    spaceLg: 24,
    section: { base: 24, md: 48, lg: 64 },
    band: { base: 8, md: 16 },
  },
  normal: {
    space: 16,
    spaceLg: 32,
    section: { base: 40, md: 72, lg: 96 },
    band: { base: 16, md: 24 },
  },
  wide: {
    space: 24,
    spaceLg: 40,
    section: { base: 56, md: 96, lg: 128 },
    band: { base: 24, md: 32 },
  },
};

/** Tailwind kırılım noktaları — media query'ler bunlarla eşleşmeli. */
const BREAKPOINTS = { md: 768, lg: 1024 };

export function densityOf(value) {
  return DENSITY[value] ?? DENSITY.normal;
}

/**
 * Tokens -> CSS değişkeni adı/değer haritası.
 *
 * resolveFont verilirse font değişkenleri de basılır (studio: next/font'un
 * ürettiği aile adına çevrilir). Verilmezse font değişkenleri ATLANIR —
 * çıktı repo'sunda onları next/font <html> üzerinde kendisi tanımlıyor,
 * burada da basarsak ikisi çakışır.
 */
export function tokenVars(tokens, { resolveFont } = {}) {
  const d = densityOf(tokens.spacing);

  const vars = {
    "--c-bg": tokens.colors.bg,
    "--c-fg": tokens.colors.fg,
    "--c-muted": tokens.colors.muted,
    "--c-primary": tokens.colors.primary,
    "--c-primary-fg": tokens.colors.primaryFg,
    "--c-border": tokens.colors.border,

    // Kart yüzeyi: arka plandan sapma (docs/DESIGN.md · Kararlar).
    // Metin rengini karıştırıyoruz, sabit siyah/beyaz değil — böylece açık
    // temada hafif koyulaşıyor, koyu temada hafif açılıyor. Sonuç düz hex;
    // studio da export da aynı fonksiyonu çağırıyor, dolayısıyla önizleme
    // ile indirilen site birebir aynı.
    //
    // Oran KOYU TEMADA daha yüksek. %3 açık zeminde görülüyor ama koyu
    // zeminde göz ayırt edemiyor: siyaha yakın iki rengin arasındaki fark
    // aynı yüzde için çok daha az algılanıyor. Koyu temada iletişim
    // formunun alanları sayfadan ayrılmıyordu.
    "--c-surface": mixHex(tokens.colors.fg, tokens.colors.bg, koyuMu(tokens.colors.bg) ? 0.08 : 0.03),

    // Form alanlarının kenarlığı: yüzey tek başına "buraya yazılır"
    // demiyor. Tema kenarlığından bağımsız, her iki uçta da görünür.
    //
    // Oran 0.5: WCAG 1.4.11 arayüz bileşeni sınırı için 3:1 istiyor.
    // 0.22'de dört temanın en düşüğü 1.58 idi — ölçünün yarısı. 0.5
    // dördünü birden 3.2 ve üstüne çıkarıyor (en düşük: sicak 3.23).
    "--c-field": mixHex(tokens.colors.fg, tokens.colors.bg, 0.5),
  };

  if (resolveFont) {
    vars["--font-heading"] = resolveFont(tokens.font.heading);
    vars["--font-body"] = resolveFont(tokens.font.body);
  }

  // Dört basamak da akışkan.
  //
  // Önce yalnızca h1 ve h2 akışkandı, h3 ile gövde sabitti. Sonuç: 375px'te
  // h2 alt sınırına inerken h3 yerinde kalıyor ve ikisi neredeyse eşitleniyordu
  // (h2/h3 = 1.14). Bölüm başlığı ile kart başlığı ayırt edilemez oluyordu.
  //
  // Alt sınır katsayıları basamak başına ayrı: h1 en çok küçülen (0.62),
  // h2 orta (0.85), h3 ve gövde aynı katsayıyla (0.94) küçülüyor — böylece
  // aralarındaki 1.25 oranı her genişlikte korunuyor. Dört presette de
  // 375px'te h2/h3 >= 1.37.
  vars["--fs-h1"] = fluid(tokens.scale.h1);
  vars["--fs-h2"] = fluid(tokens.scale.h2, 0.85);
  vars["--fs-h3"] = fluid(tokens.scale.h3, 0.94);
  vars["--fs-body"] = fluid(tokens.scale.body, 0.94);

  vars["--radius"] = `${tokens.radius}px`;
  vars["--space"] = `${d.space}px`;
  vars["--space-lg"] = `${d.spaceLg}px`;

  // Temadan gelen varsayılan padding (blok kendi padding'ini vermediyse).
  vars["--pad-section"] = `${d.section.base}px`;
  vars["--pad-band"] = `${d.band.base}px`;

  return vars;
}

/**
 * Token'ların tamamı CSS metni olarak — media query'ler dahil.
 *
 * Neden satır içi style değil: padding kırılım noktasına göre değişiyor ve
 * inline style'da @media yazılamıyor. Aynı metin studio önizlemesinde,
 * Puck tuvalinde ve çıktının app/tokens.css'inde kullanılıyor.
 */
export function tokenCss(tokens, selector = ":root", options = {}) {
  const d = densityOf(tokens.spacing);
  const vars = { ...tokenVars(tokens, options), ...(options.extraVars ?? {}) };

  const block = (entries, indent = "  ") =>
    Object.entries(entries)
      .map(([k, v]) => `${indent}${k}: ${v};`)
      .join("\n");

  const out = [`${selector} {`, block(vars), "}"];

  const md = {};
  if (d.section.md !== undefined) md["--pad-section"] = `${d.section.md}px`;
  if (d.band.md !== undefined) md["--pad-band"] = `${d.band.md}px`;
  if (Object.keys(md).length) {
    out.push(
      "",
      `@media (min-width: ${BREAKPOINTS.md}px) {`,
      `  ${selector} {`,
      block(md, "    "),
      "  }",
      "}",
    );
  }

  const lg = {};
  if (d.section.lg !== undefined) lg["--pad-section"] = `${d.section.lg}px`;
  if (d.band.lg !== undefined) lg["--pad-band"] = `${d.band.lg}px`;
  if (Object.keys(lg).length) {
    out.push(
      "",
      `@media (min-width: ${BREAKPOINTS.lg}px) {`,
      `  ${selector} {`,
      block(lg, "    "),
      "  }",
      "}",
    );
  }

  return out.join("\n") + "\n";
}
