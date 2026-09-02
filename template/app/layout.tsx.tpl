import type { Metadata } from "next";
import type { ReactNode } from "react";
{{fontImport}}import site from "@/content/page.json";
import type { Site } from "@/lib/types";
import { SITE_URL } from "./site-url";
import "./globals.css";

/**
 * metadataBase KÖK LAYOUT'ta.
 *
 * page.tsx'te dururken /_not-found gibi kendi metadata'sı olmayan rotalar
 * onu devralmıyordu ve opengraph-image eklenince derleme uyarı veriyordu.
 * Kökte tanımlanınca her rota devralıyor.
 */
export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

{{fontDeclarations}}
/**
 * <head>'de senkron çalışır: CSS gizlemesi bu sınıfa bağlı. Script hiç
 * çalışmazsa (JS kapalı, eklenti engelledi) metin gizlenmeden görünür.
 */
const JS_FLAG = 'document.documentElement.classList.add("js")';

/**
 * Görünürlük gözlemcisi — <body> SONUNDA, ertelenmemiş satır içi script.
 *
 * DOMContentLoaded KULLANILMIYOR: o olay ertelenmiş (defer/module) framework
 * paketlerinin çalışmasını bekliyor ve 4x CPU kısıtı altında ~4.9 sn sürüyor.
 * Bu süre boyunca ekranın üstündeki bloklar opacity:0 kalıp LCP'yi kilitliyordu
 * (Lighthouse'ta ölçüldü). Body sonundaki satır içi script parser oraya
 * ulaşır ulaşmaz çalışır — elemanlar zaten ayrıştırılmıştır.
 */
const REVEAL_BOOTSTRAP = `
(function () {
  var els = document.querySelectorAll('[data-anim][data-trigger="scroll"]');
  if (!window.IntersectionObserver) {
    for (var i = 0; i < els.length; i++) els[i].dataset.visible = "true";
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var once = e.target.dataset.once !== "false";
      if (e.isIntersecting) {
        e.target.dataset.visible = "true";
        if (once) io.unobserve(e.target);
      } else if (!once) {
        delete e.target.dataset.visible;
      }
    });
  }, { threshold: 0.15 });
  for (var j = 0; j < els.length; j++) io.observe(els[j]);
})();

/* Kırık görsel: yer tutucuya düş.
   onError için client bileşeni gerekirdi (kural 6: "use client" yalnızca
   Carousel ve mobil menüde). Hata olayı yükselmiyor ama YAKALAMA evresinde
   dinlenebiliyor — animasyon gözlemcisiyle aynı satır içi script bunu da
   üstleniyor, tarayıcıya giden ek paket yok. */
document.addEventListener(
  "error",
  function (e) {
    var el = e.target;
    if (el && el.tagName === "IMG") el.setAttribute("data-kirik", "");
  },
  true
);
`;

const data = site as unknown as Site;

/** İşletme bilgisi girildiyse JSON-LD LocalBusiness basılır. */
function localBusinessJsonLd() {
  const b = data.meta.business;
  if (!b) return null;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: b.name,
    ...(b.phone ? { telephone: b.phone } : {}),
    ...(b.address
      ? { address: { "@type": "PostalAddress", streetAddress: b.address } }
      : {}),
    ...(b.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: b.geo[0],
            longitude: b.geo[1],
          },
        }
      : {}),
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = localBusinessJsonLd();

  return (
    // suppressHydrationWarning: <head>'deki script hidrasyondan ÖNCE <html>'e
    // "js" sınıfını ekliyor; sunucu/istemci className farkı beklenen tek fark.
    <html
      lang={data.meta.lang}
      className={rootClassName}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOTSTRAP }} />
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        ) : null}
      </body>
    </html>
  );
}
