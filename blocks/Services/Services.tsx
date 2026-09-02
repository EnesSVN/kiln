import { staggerProps } from "@/lib/anim";
import { resp } from "@/lib/responsive";
import { Reveal } from "@/lib/Reveal";
import { surface, container, heading } from "@/lib/styles";
import type { Animation, Responsive } from "@/lib/types";

/** Katalogdaki ikonlar — hepsi satır içi SVG, ikon kütüphanesi yok. */
const ICONS: Record<string, React.ReactNode> = {
  kalkan: <path d="M12 3l7 3v6c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3z" />,
  saat: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  anahtar: (
    <path d="M15 7a4 4 0 10-3.5 4L7 15.5 5 17l1 2 2 1 1.5-2 4.5-4.5A4 4 0 0015 7z" />
  ),
  onay: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </>
  ),
  telefon: (
    <path d="M5 4h3l2 4-2 1.5a10 10 0 004.5 4.5L14 12l4 2v3a2 2 0 01-2 2A13 13 0 013 6a2 2 0 012-2z" />
  ),
  kamyon: (
    <>
      <path d="M2 7h11v8H2zM13 10h4l3 3v2h-7z" />
      <circle cx="6" cy="17" r="1.6" />
      <circle cx="16" cy="17" r="1.6" />
    </>
  ),
  ev: <path d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" />,
  yildiz: (
    <path d="M12 4l2.4 5 5.6.7-4 3.9 1 5.4-5-2.7-5 2.7 1-5.4-4-3.9 5.6-.7z" />
  ),
};

export type ServicesProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title?: string;
  subtitle?: string;
  /** href verilirse kart tıklanabilir olur. */
  items: { icon: string; title: string; text: string; href?: string }[];
  /** 3'lü mü 4'lü mü grid. */
  columns?: 3 | 4;
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
};

// Tailwind sınıfları düz metin olmalı — şablonla üretilemez.
const COLS: Record<number, string> = {
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Hizmetler — ikon kart grid'i. Kartlar sırayla belirir (stagger). */
export function Services({
  anchorId,
  title,
  subtitle,
  items,
  columns = 3,
  padding,
  animation,
}: ServicesProps) {
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
          {items.map((item, i) => {
            const CardTag = item.href ? "a" : "div";
            return (
              <li key={item.title + i} {...staggerProps(animation, i)}>
                <CardTag
                  {...(item.href ? { href: item.href } : {})}
                  className={`${surface} flex h-full flex-col gap-[calc(var(--space)*1.5)] p-[var(--space-lg)] ${
                    item.href ? "transition-opacity hover:opacity-80" : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius)] bg-[var(--c-bg)] text-[color:var(--c-primary)]"
                  >
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {ICONS[item.icon] ?? ICONS.onay}
                    </svg>
                  </span>
                  {item.title ? (
                    <h3 className={`${heading} text-[length:var(--fs-h3)]`}>
                      {item.title}
                    </h3>
                  ) : null}
                  {item.text ? (
                    <p className="leading-[1.6] text-[length:var(--fs-body)] text-[color:var(--c-muted)]">
                      {item.text}
                    </p>
                  ) : null}
                </CardTag>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
