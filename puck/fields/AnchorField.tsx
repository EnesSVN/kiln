import { FieldLabel, type CustomFieldRender, usePuck } from "@puckeditor/core";
import { useState } from "react";
import { alan } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";

/**
 * Bölüm kimliği — sayfa içi çapa hedefi (#hizmetler).
 *
 * Girilen metni otomatik slug'a çevirir: Türkçe karakterler sadeleşir,
 * boşluk tireye döner. Kullanıcı "Hizmetler" yazar, alan "hizmetler"
 * saklar ve altında "#hizmetler" olarak gösterir.
 *
 * İki sessiz hata burada yakalanıyor:
 *  · yalnızca simge/emoji girilirse slug boş kalıyor ve id hiç basılmıyordu
 *  · aynı kimlik iki blokta kullanılırsa tarayıcı ilkine gidiyor, diğerine
 *    verilen bağlantılar sessizce yanlış yere düşüyordu
 */
const MAP: Record<string, string> = {
  ğ: "g", ü: "u", ş: "s", ı: "i", ö: "o", ç: "c",
  Ğ: "g", Ü: "u", Ş: "s", İ: "i", Ö: "o", Ç: "c",
};

export function slugify(value: string): string {
  return value
    .replace(/[ğüşıöçĞÜŞİÖÇ]/g, (c) => MAP[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const control =
  "w-full rounded border border-[#c3c8ce] bg-white px-2 py-1.5 text-[13px] text-[#181818] outline-none focus:border-[#181818]";
const uyari = "mt-1 rounded bg-[#fdf3e7] px-2 py-1 text-[11px] leading-snug text-[#7a4a12]";

export const AnchorField: CustomFieldRender<string | undefined> = ({
  field,
  value,
  onChange,
  readOnly,
}) => {
  const lang = useLang();
  const { appState, selectedItem } = usePuck();
  const slug = value ?? "";
  // Kullanıcının yazdığı ham metin: "###" ya da yalnızca emoji girildiğinde
  // slug boş kalıyor ve id hiç basılmıyordu — sessiz kalmasın.
  const [ham, setHam] = useState("");
  const gecersiz = ham.trim().length > 0 && slug.length === 0;

  // Aynı kimliği kullanan BAŞKA bir blok var mı?
  const cakisma =
    !!slug &&
    (appState.data.content ?? []).some((item) => {
      const props = item.props as { id?: string; anchorId?: string };
      const kendisi = props.id === (selectedItem?.props as { id?: string } | undefined)?.id;
      return !kendisi && props.anchorId === slug;
    });

  return (
    <FieldLabel label={field.label ?? "Section id"}>
      <input
        className={control}
        type="text"
        disabled={readOnly}
        value={slug}
        placeholder={alan(lang, "anchorPlaceholder")}
        spellCheck={false}
        onChange={(e) => {
          setHam(e.currentTarget.value);
          onChange(slugify(e.currentTarget.value));
        }}
      />
      <p className="mt-1 text-[11px] leading-snug text-[#8b949e]">
        {slug
          ? alan(lang, "anchorHintSet", { slug: `#${slug}` })
          : alan(lang, "anchorHintEmpty")}
      </p>
      {gecersiz ? (
        <p className={uyari}>{alan(lang, "anchorInvalid", { raw: ham.slice(0, 20) })}</p>
      ) : null}
      {cakisma ? <p className={uyari}>{alan(lang, "anchorDuplicate")}</p> : null}
    </FieldLabel>
  );
};
