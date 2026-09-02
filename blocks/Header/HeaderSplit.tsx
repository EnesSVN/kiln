import { bt } from "@/lib/block-text";
import { MenuPanel, MenuTrigger, menuIds } from "@/lib/MobileMenu";
import { resp } from "@/lib/responsive";
import { Reveal } from "@/lib/Reveal";
import { btnPrimary, container, logoLink, navLink } from "@/lib/styles";
import type { Animation, Link, Responsive, WithNodeId } from "@/lib/types";

/* Adresi boş bağlantı BASILMAZ. href="" tıklanınca sayfayı yeniden
   yüklüyor: kullanıcı ölü bir düğmeye basıp hiçbir şey olmadığını
   sanıyordu. Etiket varsa ama adres yoksa bağlantı hiç çıkmıyor. */

export type HeaderSplitProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Verilmezse blok kendi kimliğini üretir:
   * logo bağlantısının gidecek bir hedefi olmalı.
   */
  anchorId?: string;
  logo: string;
  links: Link[];
  /** Etiketi boşsa buton çıkmaz. */
  cta?: Link;
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
  /** Sitenin dili; Render veriyor. Sabit metinler için. */
  lang?: string;
};

/**
 * Header — Bölünmüş: solda logo, sağda nav + CTA butonu.
 *
 * Mobil menü üç başlıkta da ortak: lib/MobileMenu.tsx.
 */
export function HeaderSplit({
  anchorId,
  id,
  logo,
  links,
  cta,
  padding,
  animation,
  lang,
}: WithNodeId<HeaderSplitProps>) {
  const ids = menuIds(id);
  const headerId = anchorId || `kiln-basi-${id ?? "header"}`;

  return (
    <header
      id={headerId}
      className={`border-b border-[var(--c-border)] bg-[var(--c-bg)] ${padding === undefined ? "p-[var(--pad-band)]" : resp(padding, "p")}`}
    >
      <Reveal anim={animation} className={container}>
        <div className="flex items-center justify-between gap-[var(--space-lg)]">
          {logo ? (
            <a href={`#${headerId}`} className={logoLink}>
              {logo}
            </a>
          ) : null}

          {/* Masaüstü — nav + CTA tek satır. 768'de sıkışıyordu, eşik lg. */}
          <div className="hidden items-center gap-[var(--space-lg)] lg:flex">
            <nav aria-label={bt(lang, "mainMenu")}>
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
            {cta?.label && cta.href ? (
              <a href={cta.href} className={btnPrimary}>
                {cta.label}
              </a>
            ) : null}
          </div>

          <MenuTrigger panelId={ids.panel} lang={lang} />
        </div>
      </Reveal>

      {/* Panel Reveal'ın DIŞINDA — gerekçe lib/MobileMenu.tsx'te. */}
      <MenuPanel ids={ids} logo={logo} links={links} cta={cta} lang={lang} />
    </header>
  );
}
