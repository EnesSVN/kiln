import { resp } from "@/lib/responsive";
import { Reveal } from "@/lib/Reveal";
import { btnPrimary, container, heading } from "@/lib/styles";
import type { Animation, Link, Responsive } from "@/lib/types";

/* Adresi boş bağlantı BASILMAZ. href="" tıklanınca sayfayı yeniden
   yüklüyor: kullanıcı ölü bir düğmeye basıp hiçbir şey olmadığını
   sanıyordu. Etiket varsa ama adres yoksa bağlantı hiç çıkmıyor. */

export type CTAProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title: string;
  /** Etiketi boşsa buton çıkmaz. */
  cta?: Link;
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
};

/**
 * CTA bandı — tek satır başlık + buton, tam genişlik tonlu bant.
 *
 * Zemin kart yüzeyiyle aynı token (--c-surface): kenarlık yok, gölge yok,
 * bant sayfadan tonla ayrışıyor (docs/DESIGN.md · Kararlar).
 */
export function CTA({ anchorId, title, cta, padding, animation }: CTAProps) {
  return (
    <section
      id={anchorId || undefined}
      className={`bg-[var(--c-surface)] ${padding === undefined ? "p-[var(--pad-section)]" : resp(padding, "p")}`}
    >
      <Reveal
        anim={animation}
        className={`${container} flex flex-col items-start justify-between gap-[var(--space-lg)] md:flex-row md:items-center`}
      >
        {title ? (
          <h2 className={`${heading} max-w-[30ch] text-[length:var(--fs-h2)] text-balance`}>
            {title}
          </h2>
        ) : null}

        {cta?.label && cta.href ? (
          <a href={cta.href} className={`${btnPrimary} shrink-0`}>
            {cta.label}
          </a>
        ) : null}
      </Reveal>
    </section>
  );
}
