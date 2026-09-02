import { useEffect, useState } from "react";
import { ui } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";
import { deleteSite, listSites } from "@/lib/storage";

/**
 * Site seçici.
 *
 * Depolama en baştan id ile anahtarlıydı ve listSites() Faz 4'te yazılmıştı
 * ama hiçbir yerden çağrılmıyordu: kullanıcı ikinci bir site kurduğunda
 * birincisine dönemiyordu. Bu bileşen o boşluğu kapatıyor.
 *
 * Yeniden adlandırma sayfa BAŞLIĞINI değiştirir (meta.title) — listede
 * görünen ad zaten o. Ayrı bir "dosya adı" kavramı yok, olmasın da:
 * indirilen zip'in adı da başlıktan türüyor.
 */
export function SiteSwitcher({
  currentId,
  currentTitle,
  onOpen,
  onCreate,
  onRename,
  className,
}: {
  currentId: string;
  currentTitle: string;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onRename: (title: string) => void;
  className: string;
}) {
  const lang = useLang();
  const [acik, setAcik] = useState(false);
  const [liste, setListe] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (acik) setListe(listSites());
  }, [acik, currentTitle]);

  const kapat = () => setAcik(false);

  return (
    <span className="relative">
      <button
        type="button"
        className={className}
        aria-haspopup="menu"
        aria-expanded={acik}
        onClick={() => setAcik((v) => !v)}
        title={ui(lang, "sitesTitle")}
      >
        {ui(lang, "sites")}
      </button>

      {acik ? (
        <>
          {/* Dışarı tıklayınca kapansın. */}
          <span className="fixed inset-0 z-40" onClick={kapat} />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-1 w-[280px] rounded border border-[#c3c8ce] bg-white p-1 shadow-lg"
          >
            <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-[#8b949e]">
              {ui(lang, "sitesSaved", { count: liste.length })}
            </p>

            <ul className="max-h-[280px] overflow-y-auto">
              {liste.map((s) => (
                <li key={s.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    role="menuitem"
                    className={`min-w-0 flex-1 truncate rounded px-2 py-1.5 text-left text-[13px] hover:bg-[#f2f4f6] ${
                      s.id === currentId ? "font-semibold text-[#181818]" : "text-[#3b444d]"
                    }`}
                    onClick={() => {
                      if (s.id !== currentId) onOpen(s.id);
                      kapat();
                    }}
                  >
                    {s.id === currentId ? "• " : ""}
                    {s.title || ui(lang, "siteUntitled")}
                  </button>
                  <button
                    type="button"
                    className="shrink-0 rounded px-2 py-1 text-[12px] text-[#8b949e] hover:bg-[#fdeeee] hover:text-[#a3251f]"
                    aria-label={ui(lang, "siteDelete", { title: s.title || ui(lang, "siteUntitled") })}
                    onClick={() => {
                      if (!window.confirm(ui(lang, "siteDeleteConfirm", { title: s.title || ui(lang, "siteUntitled") }))) return;
                      deleteSite(s.id);
                      const kalan = listSites();
                      setListe(kalan);
                      // Açık olan kayıt silindiyse başka bir kayda geç.
                      if (s.id === currentId) {
                        if (kalan.length) onOpen(kalan[0].id);
                        else onCreate();
                        kapat();
                      }
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-1 border-t border-[#e4e8ec] pt-1">
              <button
                type="button"
                role="menuitem"
                className="w-full rounded px-2 py-1.5 text-left text-[13px] text-[#3b444d] hover:bg-[#f2f4f6]"
                onClick={() => {
                  const ad = window.prompt(ui(lang, "siteRenamePrompt"), currentTitle);
                  if (ad && ad.trim()) onRename(ad.trim());
                  kapat();
                }}
              >
                {ui(lang, "siteRename")}
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full rounded px-2 py-1.5 text-left text-[13px] text-[#3b444d] hover:bg-[#f2f4f6]"
                onClick={() => {
                  onCreate();
                  kapat();
                }}
              >
                {ui(lang, "siteNew")}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </span>
  );
}
