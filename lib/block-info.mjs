/**
 * Blok açıklamaları — studio ile export'un ORTAK metni.
 *
 * .mjs çünkü lib/export-core.mjs (Node) ve lib/i18n.ts (TypeScript) ikisi de
 * okuyor; tokens-core.mjs ve font-catalog.mjs ile aynı desen. İndirilen
 * repo'nun README'sindeki blok listesi buradan üretiliyor.
 */
export const BLOK_ACIKLAMA = {
  HeaderMinimal: {
    en: "Logo on the left, links on the right. The plainest header.",
    tr: "Solda logo, sağda bağlantılar. En sade başlık.",
  },
  HeaderCentered: {
    en: "Logo centered, links centered underneath.",
    tr: "Logo ortada, bağlantılar altında ortalanmış.",
  },
  HeaderSplit: {
    en: "Logo on the left, links and one action button on the right.",
    tr: "Solda logo, sağda bağlantılar ve bir eylem düğmesi.",
  },
  HeroSplit: {
    en: "Heading and text on the left, image on the right.",
    tr: "Solda başlık ve metin, sağda görsel.",
  },
  HeroFull: {
    en: "Full-width image behind, heading on top.",
    tr: "Arkada tam genişlik görsel, üstünde başlık.",
  },
  HeroText: {
    en: "Text only: large heading, description and buttons, centered.",
    tr: "Sadece metin: büyük başlık, açıklama ve düğmeler ortada.",
  },
  Services: {
    en: "Cards with icons. Lists services in 2–4 columns.",
    tr: "İkonlu kartlar. Hizmetleri 2-4 sütunda sıralar.",
  },
  Features: {
    en: "Zig-zag strips where image and text swap sides.",
    tr: "Görsel ve metnin sırayla yer değiştirdiği zig-zag şeritler.",
  },
  Gallery: {
    en: "Even grid of square images. 2, 3 or 4 columns.",
    tr: "Kare görsellerden eşit grid. 2, 3 veya 4 sütun.",
  },
  Carousel: {
    en: "16/9 slides with arrows and dots.",
    tr: "Ok ve noktalarla gezilen 16/9 slaytlar.",
  },
  Testimonials: {
    en: "Customer quotes on cards, with name and role.",
    tr: "Müşteri alıntıları, isim ve ünvanıyla kartlarda.",
  },
  FAQ: {
    en: "Question and answer list that opens on click. Uses no JavaScript.",
    tr: "Tıklayınca açılan soru-cevap listesi. JavaScript kullanmaz.",
  },
  CTA: {
    en: "One line of copy with a button beside it.",
    tr: "Tek satır çağrı ve yanında düğme.",
  },
  Contact: {
    en: "Form that posts to email on the left, details and map on the right.",
    tr: "Solda e-postaya giden form, sağda iletişim bilgileri ve harita.",
  },
  Footer: {
    en: "Three columns: about, links, contact.",
    tr: "Üç sütun: tanıtım, bağlantılar, iletişim.",
  },
};
