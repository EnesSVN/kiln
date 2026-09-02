/**
 * Blokların sabit metinleri — kullanıcının yazmadığı, ama ekran okuyucuya
 * giden dizeler.
 *
 * Neden ayrı bir dosya ve neden bu kadar küçük?
 * Studio'nun çeviri altyapısı (lib/i18n.ts) ARAYÜZÜN dili için: hangi dilde
 * çalıştığınızı editörden seçiyorsunuz. Bloklarınki başka bir şey — sitenin
 * dili, ziyaretçinin gördüğü dil. İkisi aynı anda farklı olabilir: İngilizce
 * arayüzde Türkçe bir site kurabilirsiniz.
 *
 * Bu dosya indirilen repo'ya kopyalanıyor, i18n.ts kopyalanmıyor. Bu yüzden
 * burada tablo dışında hiçbir şey yok: sözlük büyürse çıktı da büyür.
 *
 * Sabit Türkçe yazılmışlardı; İngilizce bir site indirdiğinizde ekran
 * okuyucu "Menüyü aç", "karusel", "Önceki slayt" diyordu.
 */

/** Dil bilinmiyorsa varsayılan. Kiln'in kendi varsayılanı da bu. */
const VARSAYILAN = "en";

const SOZLUK = {
  en: {
    mainMenu: "Main menu",
    mobileMenu: "Main menu (mobile)",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    carousel: "carousel",
    slide: "slide",
    imageCarousel: "Image carousel",
    prevSlide: "Previous slide",
    nextSlide: "Next slide",
    locationMap: "Location map",
    goToSlide: "Go to slide {n}",
    slideOfTotal: "Slide {n} of {total}",
    noImage: "No image",
  },
  tr: {
    mainMenu: "Ana menü",
    mobileMenu: "Ana menü (mobil)",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    carousel: "karusel",
    slide: "slayt",
    imageCarousel: "Görsel karuseli",
    prevSlide: "Önceki slayt",
    nextSlide: "Sonraki slayt",
    locationMap: "Konum haritası",
    goToSlide: "{n}. slayta git",
    slideOfTotal: "{total} slayttan {n}.",
    noImage: "Görsel eklenmedi",
  },
} as const;

export type BlockTextKey = keyof (typeof SOZLUK)["en"];

/**
 * `lang` doğrudan site.meta.lang'den geliyor, yani "tr-TR" ya da "en-GB"
 * olabilir; tabloda birincil alt etiket aranıyor. Tabloda olmayan bir dil
 * (örn. "de") İngilizceye düşüyor — yanlış dilde bir dize basmaktansa
 * anlaşılır bir varsayılan.
 */
export function bt(
  lang: string | undefined,
  key: BlockTextKey,
  /**
   * {n} gibi yer tutucular. Sıra dilden dile değişiyor — İngilizcede
   * "Go to slide 3", Türkçede "3. slayta git" — bu yüzden sayı dizeye
   * eklenmiyor, cümlenin İÇİNE konuyor.
   */
  degerler?: Record<string, string | number>,
): string {
  const kok = (lang ?? VARSAYILAN).toLowerCase().split("-")[0];
  const tablo = (SOZLUK as Record<string, Record<string, string>>)[kok];
  const ham = tablo?.[key] ?? SOZLUK[VARSAYILAN][key];
  if (!degerler) return ham;
  return ham.replace(/\{(\w+)\}/g, (tam, ad) =>
    ad in degerler ? String(degerler[ad]) : tam,
  );
}

/** Bloklara Render üzerinden geçen ortak prop. */
export type WithLang = { lang?: string };
