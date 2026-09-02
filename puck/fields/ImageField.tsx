import { FieldLabel } from "@puckeditor/core";
import { alan } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";
import { useId, useRef, useState } from "react";
import type { Image } from "@/lib/types";
import {
  GorselHatasi,
  dataUriBoyut,
  dosyadanGorsel,
  gomuluMu,
  ilkGorselDosyasi,
  insanBoyut,
} from "./image-io";

/**
 * Görsel alanı: dosya seç / sürükle-bırak / adres yapıştır — üçü bir arada,
 * önizleme ve alt metniyle birlikte.
 *
 * Alt metni ayrı bir alan DEĞİL: kural 7 alt'ı zorunlu tutuyor, ayrı alan
 * olduğunda kullanıcı görseli değiştirip alt metnini eski haliyle bırakıyordu.
 * İkisi aynı kutuda durunca "bu görselin açıklaması" ilişkisi görünür oluyor.
 *
 * ZIP'e GİTMEZ (puck/ studio'ya ait).
 */

const control =
  "w-full rounded border border-[#c3c8ce] bg-white px-2 py-1.5 text-[13px] text-[#181818] outline-none focus:border-[#181818]";
const hint = "mt-1 text-[11px] leading-snug text-[#8b949e]";
const dugme =
  "rounded border border-[#c3c8ce] bg-white px-2 py-1 text-[12px] text-[#181818] hover:border-[#181818] disabled:opacity-50";

const BOS: Image = { src: "", alt: "" };

function Onizleme({ src }: { src: string }) {
  const lang = useLang();
  if (!src) {
    return (
      <div className="grid h-14 w-[88px] shrink-0 place-items-center rounded border border-dashed border-[#c3c8ce] bg-[#f7f8f9] text-[10px] text-[#8b949e]">
        {alan(lang, "imgNone")}
      </div>
    );
  }
  return (
    // Studio içi önizleme — kural 7'nin alt zorunluluğu render edilen siteye
    // ait; buradaki kopya dekoratif, alt="" bilinçli.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="h-14 w-[88px] shrink-0 rounded border border-[#e4e8ec] bg-white object-cover"
    />
  );
}

export function GorselSecici({
  value,
  onChange,
  readOnly,
}: {
  value: Image | undefined;
  onChange: (v: Image) => void;
  readOnly?: boolean;
}) {
  const lang = useLang();
  const gorsel = value ?? BOS;
  const [uzerinde, setUzerinde] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const dosyaRef = useRef<HTMLInputElement>(null);
  const alanId = useId();

  const yukle = async (file: File | null) => {
    if (!file || readOnly) return;
    setHata(null);
    setYukleniyor(true);
    try {
      const { src, sources } = await dosyadanGorsel(file);
      /*
        Yeni görsel = YENİ alt metni. Eskisi KORUNMUYOR.

        Korunuyordu: kepenk fotoğrafının alt metni ("Yarı açık otomatik
        çelik kepenk…") yerine başka bir fotoğraf yüklendiğinde olduğu
        gibi kalıyordu. Yanlış alt, boş alttan kötü — boş olan hem
        editörde uyarı veriyor hem export'ta duruyor, yanlış olan sessizce
        doğru görünüyor. Dosya adı yalnızca bir başlangıç.
      */
      const alt = file.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 80);
      onChange({ src, alt, ...(sources ? { sources } : {}) });
    } catch (err) {
      setHata(
        err instanceof GorselHatasi
          ? alan(lang, err.anahtar, err.veri)
          : alan(lang, "imgDecodeFail"),
      );
    } finally {
      setYukleniyor(false);
    }
  };

  const gomulu = gomuluMu(gorsel.src);
  const altEksik = Boolean(gorsel.src.trim()) && !gorsel.alt.trim();

  return (
    <div
      onDragOver={(e) => {
        if (readOnly) return;
        e.preventDefault();
        setUzerinde(true);
      }}
      onDragLeave={() => setUzerinde(false)}
      onDrop={(e) => {
        e.preventDefault();
        setUzerinde(false);
        void yukle(ilkGorselDosyasi(e.dataTransfer));
      }}
      className={`rounded border p-2 ${
        uzerinde ? "border-[#181818] bg-[#f2f4f6]" : "border-[#e4e8ec] bg-white"
      }`}
    >
      <div className="flex items-start gap-2">
        <Onizleme src={gorsel.src} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              className={dugme}
              disabled={readOnly || yukleniyor}
              onClick={() => dosyaRef.current?.click()}
            >
              {yukleniyor ? alan(lang, "imgUploading") : alan(lang, "imgPick")}
            </button>
            {gorsel.src && (
              <button
                type="button"
                className={dugme}
                disabled={readOnly}
                onClick={() => onChange({ src: "", alt: gorsel.alt })}
              >
                {alan(lang, "imgRemove")}
              </button>
            )}
          </div>
          <p className={hint}>
{gomulu
              ? alan(lang, "imgEmbedded", {
                  size: insanBoyut(dataUriBoyut(gorsel.src)),
                  path: "public/images/",
                })
              : alan(lang, "imgDropHint")}
          </p>
        </div>
      </div>

      <input
        ref={dosyaRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void yukle(e.currentTarget.files?.[0] ?? null);
          e.currentTarget.value = "";
        }}
      />

      {hata && (
        <p className="mt-2 rounded bg-[#fdeeee] px-2 py-1 text-[11px] text-[#a3251f]">
          {hata}
        </p>
      )}

      {/* Uyarı yalnızca gerçek bir görsel varken: görselsiz blokta boş alt
          doğru, kırmızı kenarlık yeni bırakılan her bloğu hatalı gösteriyordu. */}
      <label
        htmlFor={`${alanId}-alt`}
        className="mt-2 block text-[11px] font-medium text-[#5c6672]"
      >
        {alan(lang, "imgAlt")}
      </label>
      <input
        id={`${alanId}-alt`}
        className={`${control} ${altEksik ? "border-[#d99]" : ""}`}
        type="text"
        disabled={readOnly}
        value={gorsel.alt}
        placeholder={alan(lang, "imgAltPlaceholder")}
        onChange={(e) => onChange({ ...gorsel, alt: e.currentTarget.value })}
      />
      {altEksik && <p className={hint}>{alan(lang, "imgAltWarn")}</p>}

      {!gomulu && (
        <>
          <label
            htmlFor={`${alanId}-src`}
            className="mt-2 block text-[11px] font-medium text-[#5c6672]"
          >
            {alan(lang, "imgUrl")}
          </label>
          <input
            id={`${alanId}-src`}
            className={control}
            type="text"
            disabled={readOnly}
            value={gorsel.src}
            placeholder={alan(lang, "imgUrlPlaceholder")}
            spellCheck={false}
            onChange={(e) =>
              // Elle adres yazılınca üretilmiş boyutlar geçersiz kalır.
              onChange({ alt: gorsel.alt, src: e.currentTarget.value })
            }
          />
        </>
      )}
    </div>
  );
}

/**
 * Alan props'u YAPISAL yazıldı, CustomFieldRender<T> ile değil.
 *
 * CustomField<T> kendi render'ını içerdiği için tip değişmez (invariant)
 * hale geliyor: CustomFieldRender<Image> ile CustomFieldRender<Image |
 * undefined> birbirine atanamıyor. Bazı bloklarda görsel zorunlu (Features),
 * bazılarında opsiyonel (Hero) — yapısal props ikisini de karşılıyor.
 */
type AlanProps<T> = {
  // Okurken geniş (değer boş gelebilir), yazarken dar (boş değer yazmayız):
  // Puck'ın hem zorunlu hem opsiyonel imzasına bu şekilde oturuyor.
  field: { label?: string };
  value: T | undefined;
  onChange: (value: T) => void;
  readOnly?: boolean;
};

/** Tek görsel — hero, hero-full, features şeritleri. */
export function ImageField({
  field,
  value,
  onChange,
  readOnly,
}: AlanProps<Image>) {
  return (
    <FieldLabel label={field.label ?? "Image"}>
      <GorselSecici value={value} onChange={onChange} readOnly={readOnly} />
    </FieldLabel>
  );
}

/**
 * Görsel listesi — galeri ve carousel.
 *
 * Puck'ın array alanı yerine tek özel alan: özel alan yalnızca kendi
 * değerini görüyor, dolayısıyla dizi elemanının src'si ile alt'ını aynı
 * kutuda göstermenin başka yolu yok. Veri şekli değişmiyor (Image[]).
 */
export function ImageListField({
  field,
  value,
  onChange,
  readOnly,
}: AlanProps<Image[]>) {
  const lang = useLang();
  const liste = value ?? [];

  const degistir = (i: number, yeni: Image) =>
    onChange(liste.map((g, j) => (j === i ? yeni : g)));

  const tasi = (i: number, yon: -1 | 1) => {
    const hedef = i + yon;
    if (hedef < 0 || hedef >= liste.length) return;
    const kopya = [...liste];
    [kopya[i], kopya[hedef]] = [kopya[hedef], kopya[i]];
    onChange(kopya);
  };

  return (
    <FieldLabel label={field.label ?? "Images"}>
      <div className="flex flex-col gap-2">
        {liste.map((gorsel, i) => (
          <div key={`gorsel-${i}`}>
            <div className="mb-1 flex items-center justify-between text-[11px] text-[#8b949e]">
              <span>{i + 1}.</span>
              <span className="flex gap-1">
                <button
                  type="button"
                  className={dugme}
                  disabled={readOnly || i === 0}
                  onClick={() => tasi(i, -1)}
                  aria-label={alan(lang, "imgUp", { n: i + 1 })}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={dugme}
                  disabled={readOnly || i === liste.length - 1}
                  onClick={() => tasi(i, 1)}
                  aria-label={alan(lang, "imgDown", { n: i + 1 })}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={dugme}
                  disabled={readOnly}
                  onClick={() => onChange(liste.filter((_, j) => j !== i))}
                  aria-label={alan(lang, "imgDelete", { n: i + 1 })}
                >
                  {alan(lang, "imgRemove")}
                </button>
              </span>
            </div>
            <GorselSecici
              value={gorsel}
              onChange={(yeni) => degistir(i, yeni)}
              readOnly={readOnly}
            />
          </div>
        ))}

        <button
          type="button"
          className={dugme}
          disabled={readOnly}
          onClick={() => onChange([...liste, { ...BOS }])}
        >
          {alan(lang, "imgAdd")}
        </button>
      </div>
    </FieldLabel>
  );
}
