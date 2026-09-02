import { staggerProps } from "@/lib/anim";
import { resp } from "@/lib/responsive";
import { Media } from "@/lib/Media";
import { Reveal } from "@/lib/Reveal";
import { frame, container, heading } from "@/lib/styles";
import type { Animation, Image, Responsive } from "@/lib/types";

export type GalleryProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title?: string;
  subtitle?: string;
  items: Image[];
  /** Masaüstü sütun sayısı. */
  columns?: 2 | 3 | 4;
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
  /** Sitenin dili; Render veriyor. Sabit metinler için. */
  lang?: string;
};

// Tailwind sınıfları düz metin olmalı — şablonla üretilemez.
const COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Galeri — eşit grid, 1/1 kare oran (docs/DESIGN.md). Görseller sırayla belirir. */
export function Gallery({
  anchorId,
  title,
  subtitle,
  items,
  columns = 3,
  padding,
  animation,
  lang,
}: GalleryProps) {
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

        <ul className={`grid gap-[var(--space-lg)] ${COLS[columns] ?? COLS[3]}`}>
          {items.map((item, i) => (
            <li
              key={item.src + i}
              className={frame}
              {...staggerProps(animation, i)}
            >
              <Media
                image={item}
                lang={lang}
                className="aspect-square w-full object-cover"
                sizes={`(min-width: 1024px) ${Math.round(100 / columns)}vw, 50vw`}
                width={800}
                height={800}
              />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
