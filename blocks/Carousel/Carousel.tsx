"use client";

import useEmblaCarousel from "embla-carousel-react";
import { bt } from "@/lib/block-text";
import { useCallback, useEffect, useState } from "react";
import { resp } from "@/lib/responsive";
import { Media } from "@/lib/Media";
import { Reveal } from "@/lib/Reveal";
import { container, frame, heading } from "@/lib/styles";
import type { Animation, Image, Responsive } from "@/lib/types";

export type CarouselProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title?: string;
  subtitle?: string;
  /** Slaytlar 16/9 (docs/DESIGN.md · Görseller · hero oranı). */
  items: Image[];
  /** Otomatik oynatma — 0 kapalı, aksi halde ms cinsinden aralık. */
  autoplayMs?: number;
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
  /** Sitenin dili; Render veriyor. Sabit metinler için. */
  lang?: string;
};

/**
 * Carousel — projedeki İKİNCİ ve son client bileşeni (diğeri lib/Reveal).
 *
 * Klavye: sola/sağa ok tuşları. Otomatik oynatma embla eklentisiyle değil
 * elle yapılıyor — ikinci bir npm paketi getirmemek için. Kullanıcı
 * etkileşime girince ya da hareket azaltma açıksa duruyor.
 *
 * embla-carousel-react SADECE bu blok kullanıldığında çıktının
 * package.json'ına giriyor (bkz. scripts/bundle.mjs · BLOCK_DEPS).
 */
export function Carousel({
  anchorId,
  title,
  subtitle,
  items,
  autoplayMs = 0,
  padding,
  animation,
  lang,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);
  const [durduruldu, setDurduruldu] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Otomatik oynatma: hareket azaltma açıksa hiç başlamaz.
  useEffect(() => {
    if (!emblaApi || !autoplayMs || durduruldu) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => emblaApi.scrollNext(), autoplayMs);
    return () => clearInterval(id);
  }, [emblaApi, autoplayMs, durduruldu]);

  const git = useCallback(
    (yon: -1 | 1) => {
      setDurduruldu(true);
      if (yon === -1) emblaApi?.scrollPrev();
      else emblaApi?.scrollNext();
    },
    [emblaApi],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        git(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        git(1);
      }
    },
    [git],
  );

  const okClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius)] bg-[var(--c-surface)] text-[color:var(--c-fg)] hover:opacity-80 disabled:opacity-40";

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

        <div
          role="region"
          aria-roledescription={bt(lang, "carousel")}
          aria-label={title ?? bt(lang, "imageCarousel")}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="flex flex-col gap-[var(--space)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-primary)]"
        >
          <div className={`${frame} w-full`} ref={emblaRef}>
            {/* Otomatik oynatmada canlı bölge kapalı: her slaytı okumak
                ekran okuyucuyu boğar. Manuel gezinmede duyuruluyor. */}
            <div className="flex" aria-live={autoplayMs ? "off" : "polite"}>
              {items.map((item, i) => (
                <div
                  key={item.src + i}
                  className="min-w-0 flex-[0_0_100%]"
                  role="group"
                  aria-roledescription={bt(lang, "slide")}
                  // "3 / 5" ekran okuyucuda "üç bölü beş" diye okunuyordu:
                  // sayı doğru, cümle yok. Sözlükten geçince hem dile
                  // uyuyor hem de neyin sayıldığı söyleniyor.
                  aria-label={bt(lang, "slideOfTotal", {
                    n: i + 1,
                    total: items.length,
                  })}
                >
                  {/* İlk slayt eager: embla slaytları transform ile yana
                      taşıdığı için görüntü alanı dışındaki lazy görseller
                      hiç yüklenmiyor ve açılışta ilk slayt boş kalıyordu. */}
                  <Media
                    image={item}
                    lang={lang}
                    eager={i === 0}
                    className="aspect-[16/9] w-full object-cover"
                    width={1600}
                    height={900}
                    sizes="(min-width: 1200px) 1200px, 100vw"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-[var(--space)]">
            <div className="flex gap-[calc(var(--space)/2)]">
              <button
                type="button"
                className={okClass}
                onClick={() => git(-1)}
                aria-label={bt(lang, "prevSlide")}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    d="M12 4l-6 6 6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={okClass}
                onClick={() => git(1)}
                aria-label={bt(lang, "nextSlide")}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    d="M8 4l6 6-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="ml-auto flex flex-wrap items-center justify-end">
              {items.map((item, i) => (
                <button
                  key={`nokta-${item.src}-${i}`}
                  type="button"
                  onClick={() => {
                    setDurduruldu(true);
                    emblaApi?.scrollTo(i);
                  }}
                  aria-label={bt(lang, "goToSlide", { n: i + 1 })}
                  aria-current={i === selected}
                  // Nokta görsel olarak küçük ama dokunma hedefi 44px:
                  // görünen pil içeride, tıklanabilir alan dışarıda.
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center"
                >
                  <span
                    aria-hidden="true"
                    className={`h-2.5 rounded-full transition-all ${
                      i === selected
                        ? "w-6 bg-[var(--c-primary)]"
                        : "w-2.5 bg-[var(--c-surface)]"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
