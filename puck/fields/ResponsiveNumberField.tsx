import { alan } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";
import { FieldLabel, type CustomFieldRender } from "@puckeditor/core";
import { SPACE_STEPS } from "@/lib/schema";
import type { Responsive } from "@/lib/types";

/**
 * base / md / lg için üç seçim kutusu.
 *
 * Serbest sayı girişi YOK. Kullanıcı sadece ölçek basamaklarını seçebilir,
 * çünkü ölçek dışı bir değer Tailwind'in derlemediği bir sınıf üretir
 * (bkz. lib/responsive.ts ve globals.css'teki güvenli liste).
 * "Kullanıcı siteyi bozamaz" garantisi burada da geçerli.
 */
const BREAKPOINTS = [
  { key: "base" as const, etiket: "bpMobile" as const, hint: "0px+" },
  { key: "md" as const, etiket: "bpTablet" as const, hint: "768px+" },
  { key: "lg" as const, etiket: "bpDesktop" as const, hint: "1024px+" },
];

/** undefined = temadan devral. */
type Value = Responsive<number> | undefined;

function toObject(v: Value | undefined): { base: number; md?: number; lg?: number } {
  if (v === undefined || v === null) return { base: 0 };
  if (typeof v === "number") return { base: v };
  return v;
}

/** md ve lg boşsa düz sayı yaz — JSON gereksiz yere şişmesin. */
function normalize(o: { base: number; md?: number; lg?: number }): Value {
  if (o.md === undefined && o.lg === undefined) return o.base;
  return {
    base: o.base,
    ...(o.md !== undefined ? { md: o.md } : {}),
    ...(o.lg !== undefined ? { lg: o.lg } : {}),
  };
}

const modeChip =
  "flex-1 rounded-md border px-2 py-1.5 text-[12px] font-medium transition-colors";

const selectClass =
  "w-full rounded border border-[#c3c8ce] bg-white px-2 py-1.5 text-[13px] text-[#181818] outline-none focus:border-[#1d1d1d]";

export const ResponsiveNumberField: CustomFieldRender<Value> = ({
  field,
  value,
  onChange,
  readOnly,
}) => {
  const lang = useLang();
  const inherited = value === undefined || value === null;
  const current = toObject(value);

  const set = (key: "base" | "md" | "lg", raw: string) => {
    const next = { ...current };
    if (raw === "") {
      // base zorunlu, sadece md/lg temizlenebilir.
      if (key !== "base") delete next[key];
    } else {
      next[key] = Number(raw);
    }
    onChange(normalize(next));
  };

  return (
    <FieldLabel label={field.label ?? "Padding"}>
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onChange(undefined)}
          className={`${modeChip} ${
            inherited
              ? "border-[#181818] bg-[#181818] text-white"
              : "border-[#d8dde2] bg-white text-[#181818] hover:border-[#9aa3ad]"
          }`}
        >
          {alan(lang, "padInherit")}
        </button>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onChange(normalize(current))}
          className={`${modeChip} ${
            inherited
              ? "border-[#d8dde2] bg-white text-[#181818] hover:border-[#9aa3ad]"
              : "border-[#181818] bg-[#181818] text-white"
          }`}
        >
          {alan(lang, "padCustom")}
        </button>
      </div>

      {inherited ? (
        <p className="text-[11px] leading-snug text-[#8b949e]">
          {alan(lang, "padHint")}
        </p>
      ) : (
      <div className="flex gap-2">
        {BREAKPOINTS.map((bp) => (
          <label key={bp.key} className="flex flex-1 flex-col gap-1">
            <span className="text-[11px] font-medium text-[#5a5a5a]" title={bp.hint}>
              {alan(lang, bp.etiket)}
            </span>
            <select
              className={selectClass}
              disabled={readOnly}
              value={current[bp.key] ?? ""}
              onChange={(e) => set(bp.key, e.currentTarget.value)}
            >
              {bp.key !== "base" && <option value="">—</option>}
              {SPACE_STEPS.map((step) => (
                <option key={step} value={step}>
                  {step}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      )}
    </FieldLabel>
  );
};
