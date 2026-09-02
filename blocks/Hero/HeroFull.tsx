import { resp } from "@/lib/responsive";
import { Media } from "@/lib/Media";
import { Reveal } from "@/lib/Reveal";
import { SplitText } from "@/lib/SplitText";
import { btnPrimary, btnSecondary, container, heading } from "@/lib/styles";
import type { Animation, Image, Link, Responsive } from "@/lib/types";

/* Adresi boş bağlantı BASILMAZ. href="" tıklanınca sayfayı yeniden
   yüklüyor: kullanıcı ölü bir düğmeye basıp hiçbir şey olmadığını
   sanıyordu. Etiket varsa ama adres yoksa bağlantı hiç çıkmıyor. */

export type HeroFullProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title: string;
  subtitle?: string;
  /** Tam genişlik arka plan. Kaynak görsel 16/9 olmalı. */
  image: Image;
  cta?: Link;
  secondaryCta?: Link;
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
  /** Sitenin dili; Render veriyor. Sabit metinler için. */
  lang?: string;
};

/**
 * Hero — Tam ekran görsel: arka planda görsel, üstünde metin.
 *
 * Perde (scrim) sabit siyah değil, tema arka plan rengi: koyu temada da
 * açık temada da metin okunur kalıyor. Gölge yok (docs/DESIGN.md).
 */
export function HeroFull({
  anchorId,
  title,
  subtitle,
  image,
  cta,
  secondaryCta,
  padding,
  animation,
  lang,
}: HeroFullProps) {
  return (
    <section
      id={anchorId || undefined}
      className={`relative isolate flex min-h-[min(56.25vw,680px)] items-center bg-[var(--c-bg)] ${padding === undefined ? "p-[var(--pad-section)]" : resp(padding, "p")}`}
    >
      {/* Hero görseli LCP öğesi: lazy bırakmak keşfini geciktiriyordu. */}
      <Media
        image={image}
        lang={lang}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        width={1600}
        height={900}
        sizes="100vw"
        eager
      />
      {/* Metin okunurluğu için tema renginden perde */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[var(--c-bg)] opacity-60"
      />

      <Reveal
        anim={animation}
        className={`${container} flex flex-col items-start gap-[var(--space)]`}
      >
        {title ? (
          <h1 className={`${heading} max-w-[20ch] text-[length:var(--fs-h1)] text-balance`}>
            <SplitText text={title} anim={animation} />
          </h1>
        ) : null}

        {subtitle ? (
          <p className="max-w-[65ch] text-[length:var(--fs-body)] leading-[1.6] text-pretty text-[color:var(--c-fg)]">
            {subtitle}
          </p>
        ) : null}

        {(cta?.label && cta.href) || (secondaryCta?.label && secondaryCta.href) ? (
          <div className="flex flex-wrap gap-[var(--space)]">
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
