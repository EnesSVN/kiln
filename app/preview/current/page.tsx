"use client";

import { useEffect, useState } from "react";
import { fontVariablesFor } from "@/lib/fonts";
import { ui } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";
import { Render } from "@/lib/render";
import { loadSite } from "@/lib/storage";
import { tokensToCss } from "@/lib/tokens";
import type { Site } from "@/lib/types";

/**
 * Üzerinde çalışılan sitenin tam ekran önizlemesi.
 *
 * "Önizleme" düğmesi /preview'e (demo listesine) gidiyordu: kullanıcı kendi
 * sayfasını tuval dışında hiçbir yerde göremiyordu. Bu sayfa tarayıcı
 * deposundaki aktif siteyi editör kabuğu olmadan render ediyor.
 *
 * İstemci bileşeni olmak zorunda — veri localStorage'da, sunucu göremiyor.
 * Editörün kendisi de öyle; bu yüzden yeni bir client sınırı açmıyor.
 */
export default function CurrentPreview() {
  const lang = useLang();
  const [site, setSite] = useState<Site | null>(null);
  const [yuklendi, setYuklendi] = useState(false);

  useEffect(() => {
    setSite(loadSite());
    setYuklendi(true);
  }, []);

  /*
    Bloklar basıldıktan SONRA görünürlük gözlemcisini yeniden kur.
    Kök layout'un satır içi script'i sayfa yüklenirken çalışıyor; burada
    içerik o an henüz yok (localStorage istemcide okunuyor), dolayısıyla
    scroll tetiklemeli her blok opacity:0'da kalıp sayfa bomboş
    görünüyordu. Gözlemci mantığı layout'ta tek nüsha; burada yalnızca
    yeniden çağrılıyor.
  */
  useEffect(() => {
    if (site) (window as unknown as { __kilnReveal?: () => void }).__kilnReveal?.();
  }, [site]);

  if (!yuklendi) return null;

  if (!site || site.nodes.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-lg font-semibold">{ui(lang, "previewEmptyTitle")}</h1>
        <p className="text-sm text-[#5a5a5a]">{ui(lang, "previewEmptyBody")}</p>
        <a
          href="/edit"
          className="rounded border border-[#c3c8ce] px-3 py-1.5 text-sm hover:border-[#181818]"
        >
          {ui(lang, "openEditor")}
        </a>
      </main>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: tokensToCss(site.tokens) }} />
      <div
        lang={site.meta.lang}
        className={`${fontVariablesFor(site.tokens.font)} min-h-screen bg-[var(--c-bg)] font-[family-name:var(--font-body)] text-[length:var(--fs-body)] text-[color:var(--c-fg)]`}
      >
        <Render nodes={site.nodes} lang={site.meta.lang} />
      </div>
    </>
  );
}
