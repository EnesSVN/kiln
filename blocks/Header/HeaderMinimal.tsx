import { bt } from "@/lib/block-text";
import { MenuPanel, MenuTrigger, menuIds } from "@/lib/MobileMenu";
import { resp } from "@/lib/responsive";
import { Reveal } from "@/lib/Reveal";
import { container, logoLink, navLink } from "@/lib/styles";
import type { Animation, Link, Responsive, WithNodeId } from "@/lib/types";

/* Adresi boş bağlantı BASILMAZ. href="" tıklanınca sayfayı yeniden
   yüklüyor: kullanıcı ölü bir düğmeye basıp hiçbir şey olmadığını
   sanıyordu. Etiket varsa ama adres yoksa bağlantı hiç çıkmıyor. */

export type HeaderMinimalProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Verilmezse blok kendi kimliğini üretir:
   * logo bağlantısının gidecek bir hedefi olmalı.
   */
  anchorId?: string;
  logo: string;
  links: Link[];
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
  /** Sitenin dili; Render veriyor. Sabit metinler için. */
  lang?: string;
};

/**
 * Header — Minimal: solda logo, sağda düz bağlantılar. JS yok.
 *
 * Mobilde (lg altı) bağlantılar tam ekran menüye taşınır — üç başlık bloğu
 * da aynı deseni kullanıyor, bkz. lib/MobileMenu.tsx.
 */
export function HeaderMinimal({
  anchorId,
  id,
  logo,
  links,
  padding,
  animation,
  lang,
}: WithNodeId<HeaderMinimalProps>) {
  const ids = menuIds(id);
  // Logo sayfanın başına döner. Hedef her zaman var: kullanıcı çapa
  // vermediyse blok kendi kimliğini basıyor. href="#" kullanılmıyordu,
  // çünkü o "hiçbir yer" demek ve tarama araçlarında ölü bağlantı sayılıyor.
  const headerId = anchorId || `kiln-basi-${id ?? "header"}`;

  return (
    // Header ince bir şerit: section değil band padding'ini devralır.
    <header
      id={headerId}
      className={`border-b border-[var(--c-border)] bg-[var(--c-bg)] ${padding === undefined ? "p-[var(--pad-band)]" : resp(padding, "p")}`}
    >
      <Reveal
        anim={animation}
        className={`${container} flex items-center justify-between gap-x-[var(--space-lg)] gap-y-[var(--space)]`}
      >
        {logo ? (
          <a href={`#${headerId}`} className={logoLink}>
            {logo}
          </a>
        ) : null}

        <nav aria-label={bt(lang, "mainMenu")} className="hidden lg:block">
          <ul className="flex flex-wrap items-center gap-x-[var(--space-lg)] gap-y-[var(--space)]">
            {links.filter((l) => l.href).map((link) => (
              <li key={link.href + link.label}>
                <a href={link.href} className={navLink}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <MenuTrigger panelId={ids.panel} lang={lang} />
      </Reveal>

      {/* Panel Reveal'ın DIŞINDA: animasyonlu sarmalayıcı yığın bağlamı
          yaratıp fixed paneli kendi kutusuna hapsediyor. */}
      <MenuPanel ids={ids} logo={logo} links={links} lang={lang} />
    </header>
  );
}
