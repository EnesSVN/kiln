import type { Metadata } from "next";
import landing from "@/data/landing.json";
import { Render } from "@/lib/render";
import { parseSite } from "@/lib/schema";
import { fontVariablesFor } from "@/lib/fonts";
import { tokensToCss } from "@/lib/tokens";

/**
 * Landing — Kiln'in kendi blok kütüphanesiyle render ediliyor.
 *
 * Bu sayfada elle yazılmış tek bir <section> yok: içerik data/landing.json,
 * render yolu /preview/[id] ile birebir aynı. Projenin en güçlü kanıtı bu —
 * bloklar kendi tanıtım sayfasını taşıyamıyorsa müşteri sitesini de taşıyamaz.
 */
const site = parseSite(landing);

export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
  openGraph: {
    title: site.meta.title,
    description: site.meta.description,
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: tokensToCss(site.tokens) }} />
      <div lang={site.meta.lang} className={`${fontVariablesFor(site.tokens.font)} min-h-screen bg-[var(--c-bg)] font-[family-name:var(--font-body)] text-[length:var(--fs-body)] text-[color:var(--c-fg)]`}>
        <Render nodes={site.nodes} lang={site.meta.lang} />
      </div>
    </>
  );
}
