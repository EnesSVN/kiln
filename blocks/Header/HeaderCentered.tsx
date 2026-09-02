import { bt } from "@/lib/block-text";
import { MenuPanel, MenuTrigger, menuIds } from "@/lib/MobileMenu";
import { resp } from "@/lib/responsive";
import { Reveal } from "@/lib/Reveal";
import { container, logoLink, navLink } from "@/lib/styles";
import type { Animation, Link, Responsive, WithNodeId } from "@/lib/types";

/* Adresi boş bağlantı BASILMAZ. href="" tıklanınca sayfayı yeniden
   yüklüyor: kullanıcı ölü bir düğmeye basıp hiçbir şey olmadığını
   sanıyordu. Etiket varsa ama adres yoksa bağlantı hiç çıkmıyor. */

export type HeaderCenteredProps = {
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
 * Header — Ortalanmış: logo üstte ortada, altında nav.
 *
 * Mobil menü üç başlıkta da ortak: lib/MobileMenu.tsx.
 */
export function HeaderCentered({
  anchorId,
  id,
  logo,
  links,
  padding,
  animation,
  lang,
}: WithNodeId<HeaderCenteredProps>) {
  const ids = menuIds(id);
  const headerId = anchorId || `kiln-basi-${id ?? "header-centered"}`;

  return (
    <header
      id={headerId}
      className={`border-b border-[var(--c-border)] bg-[var(--c-bg)] ${padding === undefined ? "p-[var(--pad-band)]" : resp(padding, "p")}`}
    >
      <Reveal anim={animation} className={container}>
        {/* Mobilde logo solda + hamburger sağda; masaüstünde logo ortalanır
            ve nav altına geçer. Tetiğin yeri üç başlıkta da aynı: sağ üst. */}
        <div className="flex items-center justify-between gap-[var(--space)] lg:flex-col lg:justify-center">
          {logo ? (
            <a href={`#${headerId}`} className={logoLink}>
              {logo}
            </a>
          ) : null}

          <nav aria-label={bt(lang, "mainMenu")} className="hidden lg:block lg:pt-[var(--space)]">
            <ul className="flex flex-wrap items-center justify-center gap-x-[var(--space-lg)] gap-y-[var(--space)]">
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
        </div>
      </Reveal>

      {/* Panel Reveal'ın DIŞINDA — gerekçe lib/MobileMenu.tsx'te. */}
      <MenuPanel ids={ids} logo={logo} links={links} lang={lang} />
    </header>
  );
}
