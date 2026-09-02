import { resp } from "@/lib/responsive";
import { Reveal } from "@/lib/Reveal";
import { SplitText } from "@/lib/SplitText";
import { btnPrimary, btnSecondary, container, heading } from "@/lib/styles";
import type { Animation, Link, Responsive } from "@/lib/types";

/* Adresi boş bağlantı BASILMAZ. href="" tıklanınca sayfayı yeniden
   yüklüyor: kullanıcı ölü bir düğmeye basıp hiçbir şey olmadığını
   sanıyordu. Etiket varsa ama adres yoksa bağlantı hiç çıkmıyor. */

export type HeroTextProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title: string;
  subtitle?: string;
  /** Etiketi boşsa buton çıkmaz. */
  cta?: Link;
  secondaryCta?: Link;
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
};

/** Hero — Metin odaklı: görsel yok, ortalanmış metin + iki buton. */
export function HeroText({
  anchorId,
  title,
  subtitle,
  cta,
  secondaryCta,
  padding,
  animation,
}: HeroTextProps) {
  return (
    <section
      id={anchorId || undefined}
      className={`bg-[var(--c-bg)] ${padding === undefined ? "p-[var(--pad-section)]" : resp(padding, "p")}`}
    >
      <Reveal
        anim={animation}
        className={`${container} flex flex-col items-center gap-[var(--space)] text-center`}
      >
        {title ? (
          <h1 className={`${heading} max-w-[22ch] text-[length:var(--fs-h1)] text-balance`}>
            <SplitText text={title} anim={animation} />
          </h1>
        ) : null}

        {subtitle ? (
          <p className="max-w-[65ch] text-[length:var(--fs-body)] leading-[1.6] text-pretty text-[color:var(--c-muted)]">
            {subtitle}
          </p>
        ) : null}

        {(cta?.label && cta.href) || (secondaryCta?.label && secondaryCta.href) ? (
          <div className="flex flex-wrap justify-center gap-[var(--space)]">
            {cta?.label && cta.href ? (
              <a href={cta.href} className={btnPrimary}>
                {cta.label}
              </a>
            ) : null}
            {secondaryCta?.label && secondaryCta.href ? (
              <a href={secondaryCta.href} className={btnSecondary}>
                {secondaryCta.label}
              </a>
            ) : null}
          </div>
        ) : null}
      </Reveal>
    </section>
  );
}
