import { staggerProps } from "@/lib/anim";
import { resp } from "@/lib/responsive";
import { Reveal } from "@/lib/Reveal";
import { container, heading } from "@/lib/styles";
import type { Animation, Responsive } from "@/lib/types";

export type FAQProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title?: string;
  subtitle?: string;
  items: { question: string; answer: string }[];
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
};

/**
 * SSS — <details> accordion. JS YOK.
 *
 * Açılıp kapanma tarayıcının kendi davranışı; cevap metni kapalıyken de
 * HTML'de duruyor, yani arama motoru görüyor.
 */
export function FAQ({ anchorId, title, subtitle, items, padding, animation }: FAQProps) {
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

        <div className="flex max-w-[65ch] flex-col">
          {items.map((item, i) => (
            <details
              key={item.question + i}
              className="group border-b border-[var(--c-border)]"
              {...staggerProps(animation, i)}
            >
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-[var(--space)] py-[var(--space)] text-[length:var(--fs-body)] text-[color:var(--c-fg)] [&::-webkit-details-marker]:hidden">
                <span className={`${heading} text-[length:var(--fs-body)]`}>
                  {item.question}
                </span>
                <svg
                  className="h-5 w-5 shrink-0 text-[color:var(--c-muted)] transition-transform group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <p className="pb-[var(--space)] leading-[1.6] text-[length:var(--fs-body)] text-[color:var(--c-muted)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
