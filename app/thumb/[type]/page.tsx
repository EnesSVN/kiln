import { notFound } from "next/navigation";
import { fontVariablesFor } from "@/lib/fonts";
import { PRESETS } from "@/lib/presets";
import { Render } from "@/lib/render";
import { thumbSample, thumbTypes } from "@/lib/thumb-samples";
import { tokensToCss } from "@/lib/tokens";

/**
 * Tek bloğu izole eden çerçeve. scripts/thumbs.mjs bu sayfanın ekran
 * görüntüsünü alıp public/thumbs/<Blok>.webp üretir; başka hiçbir yerden
 * link verilmez ve ZIP'e girmez.
 *
 * Çerçeve varsayılan 1024x640 (320x200 ile aynı en boy oranı); başlık
 * blokları için betik daha kısa bir çerçeve veriyor. Kırpma betikte değil burada, çünkü
 * ekran görüntüsü aracı kırpma yapamıyor. Genişlik 1024 çünkü Tailwind'in
 * en geniş kırılımı lg (1024px) — düzen masaüstü kalıyor ama içerik küçük
 * resimde daha büyük görünüyor.
 */
function frameCss(w: number, h: number): string {
  return `
html, body { margin: 0; padding: 0; background: var(--c-bg); }
#kiln-thumb {
  width: ${w}px;
  height: ${h}px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* Sığıyorsa ortalar, taşıyorsa üstten hizalar — "safe" tam olarak bu. */
  justify-content: safe center;
  background: var(--c-bg);
}
/* Animasyon kapalı: ekran görüntüsü IntersectionObserver'ın zamanlamasına
   bağlı olmamalı, yoksa bloklar rastgele yarı saydam çıkar. */
[data-anim] {
  opacity: 1 !important;
  transform: none !important;
  filter: none !important;
  transition: none !important;
  animation: none !important;
}
/* Geliştirme modundaki Next rozeti kadraja girmesin. */
nextjs-portal { display: none !important; }
`;
}

/** Ölçüler betikten geliyor; saçma değerler kadrajı bozmasın diye sınırlı. */
function sayi(v: string | string[] | undefined, varsayilan: number, alt: number, ust: number): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n >= alt && n <= ust ? Math.round(n) : varsayilan;
}

const THUMB_TOKENS =
  PRESETS.find((p) => p.id === "sade")?.tokens ?? PRESETS[0].tokens;

export const dynamicParams = false;

export function generateStaticParams() {
  return thumbTypes().map((type) => ({ type }));
}

export default async function ThumbPage({
  params,
  searchParams,
}: PageProps<"/thumb/[type]">) {
  const { type } = await params;
  const q = await searchParams;
  const node = thumbSample(type);
  if (!node) notFound();

  // Başlık blokları ince bir şerit: 640 yüksekliğinde kadrajda küçük resmin
  // %90'ı boş kalıyordu. Çerçeveyi kısaltmak kadrajı bloğun kendisine
  // yaklaştırıyor; dar çerçeve (768) de ölçeği 0.31'den 0.42'ye çıkarıyor.
  // 768 hâlâ masaüstü düzeni: Tailwind'in md kırılımı tam 768px.
  const w = sayi(q?.w, 1024, 320, 1600);
  const h = sayi(q?.h, 640, 120, 1200);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `${tokensToCss(THUMB_TOKENS)}\n${frameCss(w, h)}`,
        }}
      />
      <div
        id="kiln-thumb"
        className={`${fontVariablesFor(THUMB_TOKENS.font)} font-[family-name:var(--font-body)] text-[length:var(--fs-body)] text-[color:var(--c-fg)]`}
      >
        <Render nodes={[node]} />
      </div>
    </>
  );
}
