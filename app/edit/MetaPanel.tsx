import { useState } from "react";
import type { Meta } from "@/lib/types";
import { type Lang, ui } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";

/**
 * Meta paneli — SEO çıktısını doğrudan belirleyen alanlar.
 *
 * Bunlar önceden yalnızca JSON elle düzenlenerek değişiyordu; başlık ve
 * açıklama ise arama sonucunda görünen tek şey. Sayaçlar Google'ın pratikte
 * kestiği uzunlukları gösteriyor (60 / 160) — limit aşınca engellemiyoruz,
 * sadece uyarıyoruz.
 */
const LIMIT = { title: 60, description: 160 };

const section = "border-b border-[#e6e9ec] px-4 py-4";
const legend = "mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#6b7480]";
const rowLabel = "text-[12px] text-[#181818]";
const control =
  "w-full rounded border border-[#c3c8ce] bg-white px-2 py-1.5 text-[13px] text-[#181818] outline-none focus:border-[#181818]";

function Sayac({ value, limit, lang }: { value: string; limit: number; lang: Lang }) {
  const n = value.length;
  const asti = n > limit;
  return (
    <span className={`text-[11px] ${asti ? "font-semibold text-[#a12a2a]" : "text-[#8b949e]"}`}>
      {n}/{limit}
      {asti ? ` — ${ui(lang, "metaTooLong")}` : ""}
    </span>
  );
}

export function MetaPanel({
  meta,
  onChange,
  onClose,
}: {
  meta: Meta;
  onChange: (next: Meta) => void;
  onClose: () => void;
}) {
  const lang = useLang();
  const patch = (part: Partial<Meta>) => onChange({ ...meta, ...part });
  const business = meta.business ?? { name: "" };
  /**
   * Koordinatlar metin olarak tutuluyor: kullanıcı "41." yazarken sayıya
   * çevirip geri yazsaydık imleç zıplardı. Sayıya ancak ikisi de geçerliyken
   * dönüyor; biri boş/geçersizse geo tamamen kaldırılıyor.
   */
  const geoMetniniKur = (g: Meta["business"]) => ({
    lat: g?.geo ? String(g.geo[0]) : "",
    lng: g?.geo ? String(g.geo[1]) : "",
  });
  const [geoMetni, setGeoMetni] = useState(() => geoMetniniKur(meta.business));

  /**
   * Dışarıdan gelen koordinat değişince metin kutuları da yenilensin.
   *
   * Tek yerel kopya bu: kullanıcı "41." yazarken sayıya çevirip geri
   * yazsaydık imleç zıplardı. Ama kopya bir kez kuruluyordu — site
   * sıfırlanınca ya da başka siteye geçilince kutularda eski koordinat
   * kalıyordu. Render sırasında düzeltmek React'in önerdiği desen.
   */
  const disGeo = meta.business?.geo;
  const [gorulenGeo, setGorulenGeo] = useState(disGeo);
  if (disGeo !== gorulenGeo) {
    setGorulenGeo(disGeo);
    setGeoMetni(geoMetniniKur(meta.business));
  }

  const sayi = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
  const gecerliEnlem = (n: number | null) => n !== null && Number.isFinite(n) && Math.abs(n) <= 90;
  const gecerliBoylam = (n: number | null) => n !== null && Number.isFinite(n) && Math.abs(n) <= 180;

  const bosMu = geoMetni.lat.trim() === "" && geoMetni.lng.trim() === "";
  const geoGecersiz =
    !bosMu && !(gecerliEnlem(sayi(geoMetni.lat)) && gecerliBoylam(sayi(geoMetni.lng)));

  const geoYaz = (eksen: "lat" | "lng", deger: string) => {
    const sonraki = { ...geoMetni, [eksen]: deger };
    setGeoMetni(sonraki);
    const la = sayi(sonraki.lat);
    const lo = sayi(sonraki.lng);
    const gecerli = gecerliEnlem(la) && gecerliBoylam(lo);
    patchBusiness({ geo: gecerli ? [la as number, lo as number] : undefined });
  };

  const patchBusiness = (part: Partial<NonNullable<Meta["business"]>>) => {
    const next = { ...business, ...part };
    // Adı boşalırsa JSON-LD hiç basılmasın.
    patch({ business: next.name.trim() ? next : undefined });
  };

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col overflow-y-auto border-l border-[#e6e9ec] bg-[#fbfbfc]">
      <header className="flex items-center justify-between border-b border-[#e6e9ec] px-4 py-3">
        <h2 className="text-[13px] font-semibold text-[#181818]">{ui(lang, "metaTitle")}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-[12px] text-[#6b7480] hover:bg-[#eceff2]"
        >
          {ui(lang, "close")}
        </button>
      </header>

      <div className={section}>
        <p className={legend}>{ui(lang, "metaSerpTitle")}</p>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="flex items-center justify-between">
              <span className={rowLabel}>{ui(lang, "metaPageTitle")}</span>
              <Sayac value={meta.title} limit={LIMIT.title} lang={lang} />
            </span>
            {/*
              maxLength ŞART, sayaç yetmiyor.

              Sayaç yalnızca uyarıyordu; 60'ı aşan başlık depoya yazılıyor,
              sonraki açılışta şema (meta.title ≤ 60) siteyi reddediyor ve
              kullanıcı bütün sayfasını kaybediyordu. Sınır artık girişte.
            */}
            <input
              className={control}
              maxLength={LIMIT.title}
              value={meta.title}
              onChange={(e) => patch({ title: e.currentTarget.value })}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="flex items-center justify-between">
              <span className={rowLabel}>{ui(lang, "metaDescription")}</span>
              <Sayac value={meta.description} limit={LIMIT.description} lang={lang} />
            </span>
            <textarea
              className={`${control} min-h-[80px]`}
              maxLength={LIMIT.description}
              value={meta.description}
              onChange={(e) => patch({ description: e.currentTarget.value })}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className={rowLabel}>{ui(lang, "metaLang")}</span>
            <input
              className={control}
              value={meta.lang}
              spellCheck={false}
              onChange={(e) => patch({ lang: e.currentTarget.value })}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className={rowLabel}>{ui(lang, "metaOg")}</span>
            <input
              className={control}
              value={meta.ogImage ?? ""}
              placeholder="https://..."
              spellCheck={false}
              onChange={(e) => patch({ ogImage: e.currentTarget.value || undefined })}
            />
          </label>
        </div>
      </div>

      <div className={section}>
        <p className={legend}>{ui(lang, "metaBusiness")}</p>
        <p className="-mt-2 mb-3 text-[11px] leading-snug text-[#8b949e]">
          {ui(lang, "metaBusinessHint")}
        </p>
        <div className="flex flex-col gap-3">
          {(
            [
              ["name", "metaName"],
              ["phone", "metaPhone"],
              ["address", "metaAddress"],
            ] as const
          ).map(([alanAdi, anahtar]) => (
            <label key={alanAdi} className="flex flex-col gap-1">
              <span className={rowLabel}>{ui(lang, anahtar)}</span>
              <input
                className={control}
                value={business[alanAdi] ?? ""}
                onChange={(e) => patchBusiness({ [alanAdi]: e.currentTarget.value })}
              />
            </label>
          ))}

          {/*
            Koordinat. Demo sitesinden devralınan geo değeri panelde hiç
            görünmediği için kullanıcı Kadıköy adresiyle Zeytinburnu
            koordinatı yayınlayabiliyordu. İkisi de boşsa JSON-LD'ye geo
            hiç yazılmıyor.
          */}
          <div className="flex flex-col gap-1">
            <span className={rowLabel}>{ui(lang, "metaGeo")}</span>
            <div className="flex gap-2">
              {(["lat", "lng"] as const).map((eksen) => (
                <label key={eksen} className="flex flex-1 flex-col gap-1">
                  <span className="text-[10px] text-[#8b949e]">
                    {ui(lang, eksen === "lat" ? "metaLat" : "metaLng")}
                  </span>
                  <input
                    className={control}
                    inputMode="decimal"
                    value={geoMetni[eksen]}
                    placeholder={eksen === "lat" ? "41.0082" : "28.9784"}
                    onChange={(e) => geoYaz(eksen, e.currentTarget.value)}
                  />
                </label>
              ))}
            </div>
            <p className="text-[11px] leading-snug text-[#8b949e]">
              {geoGecersiz ? ui(lang, "metaGeoInvalid") : ui(lang, "metaGeoHint")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
