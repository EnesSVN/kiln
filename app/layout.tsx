import type { Metadata } from "next";
import "./globals.css";

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
window.__kilnReveal = function () {
  var els = document.querySelectorAll('[data-anim][data-trigger="scroll"]:not([data-izlendi])');
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
  for (var j = 0; j < els.length; j++) {
    els[j].dataset.izlendi = "1";
    io.observe(els[j]);
  }
};
/* /preview/current siteyi localStorage'dan İSTEMCİDE basıyor: bu script
   çalıştığında ortada blok yok, hiçbiri gözlemlenmiyor ve sayfa boş
   görünüyordu. Fonksiyon window'a asılı; o sayfa basıldıktan sonra
   yeniden çağırıyor. Mantık tek yerde kalıyor. */
window.__kilnReveal();

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

export const metadata: Metadata = {
  title: "Kiln",
  description:
    "Sürükle-bırak ile site kur, elle yazılmış gibi görünen bir Next.js repo'su indir.",
};

/**
 * Kök layout dili SABİT DEĞİL.
 *
 * "tr" sabitken İngilizce landing lang="tr" ile çıkıyordu; CSS
 * text-transform:uppercase Türkçe kuralına göre çalışıp editörde
 * "TYPE SİZE", "BUSİNESS (JSON-LD)" gibi başlıklar üretiyordu.
 * Artık dil sayfanın kendi verisinden geliyor: landing data/landing.json'un
 * meta.lang'ini kullanıyor, /preview/[id] kendi layout'unu değil bu
 * layout'u paylaştığı için oradaki demolar da doğru dili alsın diye
 * değer <html> üzerine sayfa tarafından da yazılabiliyor.
 */
import landing from "@/data/landing.json";

const KOK_DIL = (landing as { meta?: { lang?: string } }).meta?.lang ?? "en";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Font değişken sınıfları BURADA DEĞİL: kök layout'a koymak katalogdaki
    // sekiz fontu da her sayfaya preload ettiriyordu. Her sayfa kendi
    // ihtiyacını bağlıyor (bkz. lib/fonts.ts · fontVariablesFor).
    <html
      lang={KOK_DIL}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body className="min-h-full">
        {children}
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOTSTRAP }} />
      </body>
    </html>
  );
}
