import { FieldLabel, type CustomFieldRender, usePuck } from "@puckeditor/core";
import { useId } from "react";
import { alan } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";

/**
 * Bağlantı alanı — sayfadaki mevcut bölüm kimliklerini önerir.
 *
 * Ölü çapaların hepsi buradan çıkıyordu: nav ve footer bağlantıları serbest
 * metindi, kullanıcı "#hizmetler" yazıyor ama bölüme o kimliği vermeyi
 * unutuyordu. Artık alan sayfada gerçekten var olan kimlikleri listeliyor ve
 * yazılan çapa hiçbir bölümle eşleşmiyorsa altında uyarı çıkıyor.
 *
 * <datalist> seçim ZORUNLU KILMAZ: dış adres (https://, tel:, mailto:)
 * yazmak hâlâ serbest.
 */
const control =
  "w-full rounded border border-[#c3c8ce] bg-white px-2 py-1.5 text-[13px] text-[#181818] outline-none focus:border-[#181818]";
const uyari = "mt-1 rounded bg-[#fdf3e7] px-2 py-1 text-[11px] leading-snug text-[#7a4a12]";

export const LinkField: CustomFieldRender<string | undefined> = ({
  field,
  value,
  onChange,
  readOnly,
}) => {
  const lang = useLang();
  const listeId = useId();
  const { appState } = usePuck();
  const href = value ?? "";

  const capalar = (appState.data.content ?? [])
    .map((item) => (item.props as { anchorId?: string }).anchorId)
    .filter((a): a is string => !!a && a.trim().length > 0);
  const benzersiz = [...new Set(capalar)].sort();

  const capaMi = href.startsWith("#") && href.length > 1;
  const bilinmiyor = capaMi && !benzersiz.includes(href.slice(1));

  return (
    <FieldLabel label={field.label ?? "Link"}>
      <input
        className={control}
        type="text"
        list={benzersiz.length ? listeId : undefined}
        disabled={readOnly}
        value={href}
        placeholder={alan(lang, "linkPlaceholder")}
        spellCheck={false}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
      {benzersiz.length ? (
        <datalist id={listeId}>
          {benzersiz.map((a) => (
            <option key={a} value={`#${a}`} />
          ))}
        </datalist>
      ) : null}

      {bilinmiyor ? (
        <p className={uyari}>{alan(lang, "linkUnknownAnchor", { id: href })}</p>
      ) : (
        <p className="mt-1 text-[11px] leading-snug text-[#8b949e]">
          {benzersiz.length
            ? alan(lang, "linkHint", { count: benzersiz.length })
            : alan(lang, "linkHintEmpty")}
        </p>
      )}
    </FieldLabel>
  );
};
