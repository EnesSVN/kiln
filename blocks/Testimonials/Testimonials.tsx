import { staggerProps } from "@/lib/anim";
import { resp } from "@/lib/responsive";
import { Reveal } from "@/lib/Reveal";
import { surface, container, heading } from "@/lib/styles";
import type { Animation, Responsive } from "@/lib/types";

export type TestimonialsProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title?: string;
  subtitle?: string;
  items: { quote: string; author: string; role?: string }[];
  /** Masaüstü sütun sayısı. */
  columns?: 2 | 3;
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
};

// Tailwind sınıfları düz metin olmalı — şablonla üretilemez.
const COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

/** Referanslar — alıntı kartları. Kartlar sırayla belirir. */
export function Testimonials({
  anchorId,
  title,
  subtitle,
  items,
  columns = 3,
  padding,
  animation,
}: TestimonialsProps) {
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
              <h2
                className={`${heading} text-[length:var(--fs-h2)] text-balance`}
              >
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="max-w-[65ch] leading-[1.6] text-[length:var(--fs-body)] text-[color:var(--c-muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <ul
          className={`grid gap-[var(--space-lg)] ${COLS[columns] ?? COLS[3]}`}
        >
          {items.map((item, i) => (
            <li key={item.author + i} {...staggerProps(animation, i)}>
              <figure
                className={`${surface} flex h-full flex-col gap-[calc(var(--space)*1.5)] p-[var(--space-lg)]`}
              >
                {item.quote ? (
                  <blockquote className="leading-[1.6] text-[length:var(--fs-body)] text-[color:var(--c-fg)]">
                    {item.quote}
                  </blockquote>
                ) : null}
                {item.author || item.role ? (
                  <figcaption className="mt-auto flex flex-col gap-[calc(var(--space)/4)]">
                    {item.author ? (
                      <span
                        className={`${heading} text-[length:var(--fs-body)]`}
                      >
                        {item.author}
                      </span>
                    ) : null}
                    {item.role ? (
                      <span className="text-[length:var(--fs-body)] text-[color:var(--c-muted)]">
                        {item.role}
                      </span>
                    ) : null}
                  </figcaption>
                ) : null}
              </figure>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
