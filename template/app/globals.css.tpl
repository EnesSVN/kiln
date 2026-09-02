@import "tailwindcss";
@import "./tokens.css";

/* ---------------------------------------------------------------------------
 * Boşluk sınıfları content/page.json'dan okunuyor, yani kaynak dosyalarda
 * hiçbir yerde düz metin olarak geçmiyorlar. Tailwind'in tarayıcısı onları
 * göremediği için burada tek tek sayılıyorlar.
 *
 * Bu liste bu sayfanın GERÇEKTEN kullandığı sınıflardan ibarettir.
 * page.json'daki boşluk değerlerini elle değiştirirseniz buraya da
 * karşılığını eklemeniz gerekir.
 * ------------------------------------------------------------------------- */
{{sourceInline}}

body {
  background: var(--c-bg);
  color: var(--c-fg);
  font-family: var(--font-body);
  font-size: var(--fs-body);
}

/* ---------------------------------------------------------------------------
 * Animasyon: geçiş CSS'te, tetikleyici IntersectionObserver'da (lib/Reveal).
 * Kütüphane yok.
 *
 * GİZLEME `.js` SINIFINA BAĞLI. <head>'deki satır içi script bu sınıfı
 * <html>'e ekler. Script hiç çalışmazsa (JS kapalı, eklenti engelledi,
 * CSP reddetti) hiçbir şey gizlenmez ve metin olduğu gibi görünür.
 * Animasyon süslemedir; içeriği ona bağlamıyoruz.
 * ------------------------------------------------------------------------- */
.js [data-anim] {
  transition-property: opacity, transform, filter;
  transition-duration: var(--d, 500ms);
  transition-delay: var(--delay, 0ms);
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.js [data-anim="fade"] {
  opacity: 0;
}
.js [data-anim="slide-up"] {
  opacity: 0;
  transform: translateY(24px);
}
.js [data-anim="slide-left"] {
  opacity: 0;
  transform: translateX(24px);
}
.js [data-anim="scale"] {
  opacity: 0;
  transform: scale(0.96);
}
.js [data-anim="blur"] {
  opacity: 0;
  filter: blur(8px);
}

/* Reveal görünür olduğunda hem kendisi hem içindeki SplitText parçaları açılır.
   Parçaların kendi --delay'i olduğu için sırayla gelirler. */
.js [data-anim][data-visible],
.js [data-visible] [data-anim] {
  opacity: 1;
  transform: none;
  filter: none;
}

/* Mobil menü (:target) açıkken arka plan kaymasın. JS yok. */
html:has(.kiln-menu:target),
html:has(.kiln-menu:target) body {
  overflow: hidden;
}

/* ---------------------------------------------------------------------------
 * trigger="load" — SAF CSS, JS YOK.
 *
 * Ekranın üstündeki içerik IntersectionObserver'ı beklerse hidrasyona kadar
 * görünmez kalır ve LCP hidrasyon süresine kilitlenir. Bu animasyon ilk
 * boyamada başlar; içerik JS'ten bağımsız olarak görünür hale gelir.
 * ------------------------------------------------------------------------- */
.js [data-anim][data-trigger="load"] {
  animation-duration: var(--d, 500ms);
  animation-delay: var(--delay, 0ms);
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}

.js [data-anim="fade"][data-trigger="load"] { animation-name: kiln-fade; }
.js [data-anim="slide-up"][data-trigger="load"] { animation-name: kiln-slide-up; }
.js [data-anim="slide-left"][data-trigger="load"] { animation-name: kiln-slide-left; }
.js [data-anim="scale"][data-trigger="load"] { animation-name: kiln-scale; }
.js [data-anim="blur"][data-trigger="load"] { animation-name: kiln-blur; }

@keyframes kiln-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes kiln-slide-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
}
@keyframes kiln-slide-left {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: none; }
}
@keyframes kiln-scale {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: none; }
}
@keyframes kiln-blur {
  from { opacity: 0; filter: blur(8px); }
  to { opacity: 1; filter: none; }
}

/* transform inline elemanlara uygulanmaz. */
[data-split] {
  display: inline-block;
}

/* JS kapalıysa içerik ASLA gizli kalmamalı. */
@media (scripting: none) {
  [data-anim] {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    transition: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-anim] {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    transition: none !important;
  }
}

/* ---------------------------------------------------------------------------
 * Kırık görsel — adres yanlış ya da dosya kayıp.
 * Tarayıcının kırık simgesi yerine bloğun yer tutucusuna benziyor.
 * ------------------------------------------------------------------------- */
img[data-kirik] {
  background: var(--c-surface);
  object-fit: contain;
  /* Alt metni kırık simgenin yanında değil, kutunun içinde okunur dursun. */
  font-size: var(--fs-body);
  color: var(--c-muted);
  text-align: center;
}

