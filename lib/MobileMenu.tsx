import { bt } from "./block-text";
import { btnPrimary, logoLink, navLink } from "./styles";
import type { Link } from "./types";

/* Adresi boş bağlantı BASILMAZ. href="" tıklanınca sayfayı yeniden
   yüklüyor: kullanıcı ölü bir düğmeye basıp hiçbir şey olmadığını
   sanıyordu. Etiket varsa ama adres yoksa bağlantı hiç çıkmıyor. */

/**
 * Mobil menü — üç başlık bloğunun ORTAK parçası. JavaScript yok.
 *
 * Neden :target?
 * Menüyü JS'siz açmanın iki yolu var: gizli checkbox + label, ya da :target.
 * Checkbox adres çubuğunu kirletmez ve geçmişe girmez — orada daha temiz.
 * Ama menüdeki bir bağlantıya tıklandığında checkbox işaretli kalır: sayfa
 * bölüme gider, tam ekran menü ÜSTTE durmaya devam eder. Kullanıcı gittiği
 * yeri göremez. Bunu JS'siz kapatmanın yolu yok (`:has(:target)` ile
 * denendiğinde menü bir daha hiç açılamıyor, çünkü çapa kalıcı olarak
 * hedefte kalıyor).
 *
 * :target'ta ise "bölüme git" ile "menüyü kapat" AYNI durum değişikliği:
 * çapaya tıklamak hedefi menüden bölüme taşır, menü kendiliğinden kapanır.
 * Gereksinim tam olarak bu olduğu için :target korundu.
 *
 * :target'ın iki gerçek kusuru vardı, ikisi de burada kapatıldı:
 *
 * 1. Kapatma düğmesi href="#" idi. Boş fragment "belgenin başı" demek:
 *    menü kapanıyor ama sayfa da en üste zıplıyordu (1500px'ten 0'a).
 *    Artık kalıcı olarak gizli bir elemana işaret ediyor — hedef VAR
 *    (ölü bağlantı değil) ama görünmediği için tarayıcı ona kaydırmıyor.
 *
 * 2. Panel <Reveal> sarmalayıcısının içindeydi. Sarmalayıcı animasyon
 *    boyunca opacity/transform taşıyor, bu da yığın bağlamı yaratıp
 *    position:fixed panelin z-50'sini kendi kutusuna hapsediyordu: menü
 *    açıkken arkadaki içerik üstte kalıyordu. Panel artık Reveal'ın
 *    DIŞINDA, doğrudan <header> altında.
 */

/** Tetik, panel ve kapatma hedefi aynı kimlik ailesini kullanır. */
export function menuIds(blockId: string | undefined) {
  const base = `kiln-menu-${blockId ?? "header"}`;
  return { panel: base, kapali: `${base}-kapali` };
}

const ikonDugme =
  "inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius)] border border-[var(--c-border)] text-[color:var(--c-fg)]";

/** Hamburger — üç başlıkta da aynı yerde, aynı görünümde. */
export function MenuTrigger({ panelId, lang }: { panelId: string; lang?: string }) {
  return (
    <a
      href={`#${panelId}`}
      aria-label={bt(lang, "openMenu")}
      className={`${ikonDugme} lg:hidden`}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
      </svg>
    </a>
  );
}

/**
 * Tam ekran panel. <header>'ın doğrudan çocuğu olarak, <Reveal> DIŞINDA
 * render edilmeli — yukarıdaki 2. maddeye bakın.
 */
export function MenuPanel({
  ids,
  logo,
  links,
  cta,
  lang,
}: {
  ids: { panel: string; kapali: string };
  logo: string;
  links: Link[];
  cta?: Link;
  /** Sitenin dili — sabit metinler buradan (lib/block-text.ts). */
  lang?: string;
}) {
  return (
    <div className="lg:hidden">
      {/*
        Kapatma hedefi. Kalıcı olarak gizli: tarayıcı görünmeyen bir elemana
        kaydırmadığı için menü kapanırken sayfa yerinde kalıyor. Boş fragment
        (href="#") kullanılsaydı sayfa en üste zıplardı.
      */}
      <span id={ids.kapali} className="hidden" aria-hidden="true" />

      <div
        id={ids.panel}
        className="kiln-menu fixed inset-0 z-50 hidden flex-col overflow-y-auto bg-[var(--c-bg)] p-[var(--pad-band)] target:flex"
      >
        <div className="flex items-center justify-between gap-[var(--space)]">
          <span className={logoLink}>{logo}</span>
          <a href={`#${ids.kapali}`} aria-label={bt(lang, "closeMenu")} className={ikonDugme}>
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        <nav
          aria-label={bt(lang, "mobileMenu")}
          className="flex flex-col gap-[var(--space)] pt-[var(--space-lg)]"
        >
          <ul className="flex flex-col gap-[var(--space)]">
            {links.filter((l) => l.href).map((link) => (
              <li key={link.href + link.label}>
                <a href={link.href} className={navLink}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          {cta?.label && cta.href ? (
            <a href={cta.href} className={`${btnPrimary} mt-[var(--space)] self-start`}>
              {cta.label}
            </a>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
