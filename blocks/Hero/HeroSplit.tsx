import { resp } from "@/lib/responsive";
import { Media } from "@/lib/Media";
import { Reveal } from "@/lib/Reveal";
import { SplitText } from "@/lib/SplitText";
import { btnPrimary, container, frame, heading } from "@/lib/styles";
import type { Animation, Image, Link, Responsive } from "@/lib/types";

/* Adresi boş bağlantı BASILMAZ. href="" tıklanınca sayfayı yeniden
   yüklüyor: kullanıcı ölü bir düğmeye basıp hiçbir şey olmadığını
   sanıyordu. Etiket varsa ama adres yoksa bağlantı hiç çıkmıyor. */

export type HeroSplitProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title: string;
  subtitle?: string;
  image: Image;
  cta?: Link;
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
  /** Sitenin dili; Render veriyor. Sabit metinler için. */
  lang?: string;
};

/** Hero — Bölünmüş: solda metin, sağda görsel. Sayfanın tek h1'i burada. */
export function HeroSplit({
  anchorId,
  title,
  subtitle,
  image,
  cta,
  padding,
  animation,
  lang,
}: HeroSplitProps) {
  return (
    // padding verilmemişse temadan devralınır; --pad-section yoğunluğa göre
    // kırılım noktası başına değişiyor (bkz. lib/tokens-core.mjs).
    <section
      id={anchorId || undefined}
      className={`bg-[var(--c-bg)] ${padding === undefined ? "p-[var(--pad-section)]" : resp(padding, "p")}`}
    >
      <div className={`${container} grid items-center gap-[var(--space-lg)] md:grid-cols-2`}>
        <Reveal anim={animation} className="flex flex-col items-start gap-[var(--space)]">
          {/* Boş başlık boş bir <h1> basıyordu: sayfada 75px'lik görünmez
              bir boşluk, çıktıda ise içi boş bir başlık elemanı kalıyordu. */}
          {title ? (
            <h1 className={`${heading} text-[length:var(--fs-h1)] text-balance`}>
              <SplitText text={title} anim={animation} />
            </h1>
          ) : null}

          {subtitle ? (
            <p className="max-w-[65ch] text-[length:var(--fs-body)] leading-[1.6] text-pretty text-[color:var(--c-muted)]">
              {subtitle}
            </p>
          ) : null}

          {cta?.label && cta.href ? (
            <a
              href={cta.href}
              className={btnPrimary}
            >
              {cta.label}
            </a>
          ) : null}
        </Reveal>

        <Reveal
          anim={animation}
          className={frame}
        >
          {/* Hero görseli LCP öğesi: lazy bırakmak keşfini geciktiriyordu. */}
          <Media
            image={image}
            lang={lang}
            className="aspect-[16/9] w-full object-cover"
            width={1600}
            height={900}
            sizes="(min-width: 1024px) 50vw, 100vw"
            eager
          />
        </Reveal>
      </div>
    </section>
  );
}
