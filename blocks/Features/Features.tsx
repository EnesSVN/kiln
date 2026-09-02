import { staggerProps } from "@/lib/anim";
import { resp } from "@/lib/responsive";
import { Media } from "@/lib/Media";
import { Reveal } from "@/lib/Reveal";
import { frame, container, heading } from "@/lib/styles";
import type { Animation, Image, Responsive } from "@/lib/types";

export type FeaturesProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title?: string;
  subtitle?: string;
  items: { title: string; text: string; image: Image }[];
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
  /** Sitenin dili; Render veriyor. Sabit metinler için. */
  lang?: string;
};

/**
 * Özellikler — dönüşümlü metin + görsel şeritleri (zig-zag).
 *
 * Metin sütunu dikeyde ORTALANMIYOR (items-start): görsel 4/3 olduğu için
 * metinden çok daha uzun ve ortalayınca metin havada duruyordu. Sütunlar da
 * eşit değil (1fr / 1.2fr) — görsel biraz geniş, metin biraz dar.
 *
 * Tek sayılı şeritlerde görsel sola geçiyor. Mobilde sıra bozulmuyor:
 * her şerit tek sütuna iniyor, metin daima görselden önce geliyor
 * (docs/DESIGN.md — mobilde her şey tek sütun).
 */
export function Features({
  anchorId,
  title,
  subtitle,
  items,
  padding,
  animation,
  lang,
}: FeaturesProps) {
  return (
    <section
      id={anchorId || undefined}
      className={`bg-[var(--c-bg)] ${padding === undefined ? "p-[var(--pad-section)]" : resp(padding, "p")}`}
    >
      <Reveal
        anim={animation}
        className={`${container} flex flex-col gap-[var(--space-lg)]`}
      >
        {title || subtitle ? (
          <div className="flex flex-col gap-[var(--space)]">
            {title ? (
              <h2 className={`${heading} text-[length:var(--fs-h2)] text-balance`}>{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="max-w-[65ch] leading-[1.6] text-[length:var(--fs-body)] text-[color:var(--c-muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-[var(--space-lg)]">
          {items.map((item, i) => {
            const flipped = i % 2 === 1;
            return (
              <article
                key={item.title + i}
                className="grid items-start gap-[var(--space-lg)] md:grid-cols-[1fr_1.2fr]"
                {...staggerProps(animation, i)}
              >
                <div
                  className={`flex flex-col gap-[var(--space)] ${flipped ? "md:order-2" : ""}`}
                >
                  {item.title ? (
                    <h3 className={`${heading} text-[length:var(--fs-h3)]`}>{item.title}</h3>
                  ) : null}
                  {item.text ? (
                    <p className="max-w-[65ch] leading-[1.6] text-[length:var(--fs-body)] text-[color:var(--c-muted)]">
                      {item.text}
                    </p>
                  ) : null}
                </div>

                <div className={`${frame} ${flipped ? "md:order-1" : ""}`}>
                  <Media
                    image={item.image}
                    lang={lang}
                    className="aspect-[4/3] w-full object-cover"
                    width={800}
                    height={600}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
