import { FONT_CATALOG, FONT_KEYS } from "@/lib/fonts";
import { ui, type UIKey } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";
import { PRESETS } from "@/lib/presets";
import type { Density, Tokens } from "@/lib/types";

/**
 * Tema paneli. Token'ların tamamı buradan yönetiliyor.
 *
 * Bloklara serbest CSS verilmediği için kullanıcı buradan siteyi
 * "bozamaz" — sadece sistemin izin verdiği eksenlerde oynayabilir.
 */
// Etiketler i18n anahtarı tutuyor; metin render sırasında seçiliyor.
const COLOR_FIELDS: { key: keyof Tokens["colors"]; k: UIKey; ipucu: UIKey }[] = [
  { key: "bg", k: "themeColorBg", ipucu: "themeHintBg" },
  { key: "fg", k: "themeColorFg", ipucu: "themeHintFg" },
  { key: "muted", k: "themeColorMuted", ipucu: "themeHintMuted" },
  { key: "primary", k: "themeColorPrimary", ipucu: "themeHintPrimary" },
  { key: "primaryFg", k: "themeColorPrimaryFg", ipucu: "themeHintPrimaryFg" },
  { key: "border", k: "themeColorBorder", ipucu: "themeHintBorder" },
];

const SCALE_FIELDS: { key: keyof Tokens["scale"]; k: UIKey; min: number; max: number }[] = [
  { key: "h1", k: "themeH1", min: 28, max: 84 },
  { key: "h2", k: "themeH2", min: 22, max: 56 },
  { key: "h3", k: "themeH3", min: 16, max: 36 },
  { key: "body", k: "themeBody", min: 13, max: 22 },
];

const DENSITIES: { key: Density; k: UIKey }[] = [
  { key: "compact", k: "themeDensityCompact" },
  { key: "normal", k: "themeDensityNormal" },
  { key: "wide", k: "themeDensityWide" },
];

/** Preset kimliği -> i18n anahtarı. */
const PRESET_ANAHTAR: Record<string, UIKey> = {
  sade: "presetSade",
  sicak: "presetSicak",
  koyu: "presetKoyu",
  kurumsal: "presetKurumsal",
};

const section = "border-b border-[#e6e9ec] px-4 py-4";
const legend = "mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#6b7480]";
const rowLabel = "text-[12px] text-[#181818]";
const control =
  "w-full rounded border border-[#c3c8ce] bg-white px-2 py-1.5 text-[13px] text-[#181818] outline-none focus:border-[#181818]";
const chip =
  "rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors";

export function ThemePanel({
  tokens,
  onChange,
  onClose,
}: {
  tokens: Tokens;
  onChange: (next: Tokens) => void;
  onClose: () => void;
}) {
  const lang = useLang();
  const patch = (part: Partial<Tokens>) => onChange({ ...tokens, ...part });
  const setColor = (key: keyof Tokens["colors"], value: string) =>
    patch({ colors: { ...tokens.colors, [key]: value } });

  const activePreset = PRESETS.find(
    (p) => JSON.stringify(p.tokens) === JSON.stringify(tokens),
  );

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col overflow-y-auto border-l border-[#e6e9ec] bg-[#fbfbfc]">
      <header className="flex items-center justify-between border-b border-[#e6e9ec] px-4 py-3">
        <h2 className="text-[13px] font-semibold text-[#181818]">{ui(lang, "themeTitle")}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-[12px] text-[#6b7480] hover:bg-[#eceff2]"
        >
          {ui(lang, "close")}
        </button>
      </header>

      {/* Preset'ler */}
      <div className={section}>
        <p className={legend}>{ui(lang, "themePreset")}</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => {
            const on = activePreset?.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange(preset.tokens)}
                className={`${chip} flex items-center gap-2 ${
                  on
                    ? "border-[#181818] bg-white"
                    : "border-[#d8dde2] bg-white hover:border-[#9aa3ad]"
                }`}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                  style={{
                    background: `linear-gradient(135deg, ${preset.tokens.colors.bg} 50%, ${preset.tokens.colors.primary} 50%)`,
                  }}
                />
                {ui(lang, PRESET_ANAHTAR[preset.id] ?? "themePreset")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Renkler */}
      <div className={section}>
        <p className={legend}>{ui(lang, "themeColors")}</p>
        <div className="flex flex-col gap-2.5">
          {COLOR_FIELDS.map((field) => (
            <div key={field.key} className="flex items-center gap-2">
              <input
                type="color"
                aria-label={ui(lang, field.k)}
                value={tokens.colors[field.key]}
                onChange={(e) => setColor(field.key, e.currentTarget.value)}
                className="h-7 w-9 shrink-0 cursor-pointer rounded border border-[#c3c8ce] bg-white p-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className={rowLabel} title={ui(lang, field.ipucu)}>
                  {ui(lang, field.k)}
                </div>
              </div>
              <input
                type="text"
                aria-label={`${ui(lang, field.k)} hex`}
                value={tokens.colors[field.key]}
                onChange={(e) => setColor(field.key, e.currentTarget.value)}
                spellCheck={false}
                className="w-[86px] shrink-0 rounded border border-[#c3c8ce] bg-white px-1.5 py-1 font-mono text-[11px] text-[#181818] outline-none focus:border-[#181818]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fontlar */}
      <div className={section}>
        <p className={legend}>{ui(lang, "themeFont")}</p>
        <div className="flex flex-col gap-2.5">
          {(["heading", "body"] as const).map((slot) => (
            <label key={slot} className="flex flex-col gap-1">
              <span className={rowLabel}>
                {ui(lang, slot === "heading" ? "themeHeadingFont" : "themeBodyFont")}
              </span>
              <select
                className={control}
                value={tokens.font[slot]}
                onChange={(e) =>
                  patch({ font: { ...tokens.font, [slot]: e.currentTarget.value } })
                }
              >
                {!FONT_KEYS.includes(tokens.font[slot]) && (
                  <option value={tokens.font[slot]}>{ui(lang, "themeCustom")}</option>
                )}
                {FONT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {FONT_CATALOG[key as keyof typeof FONT_CATALOG].label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      {/* Tipografi ölçeği */}
      <div className={section}>
        <p className={legend}>{ui(lang, "themeSize")}</p>
        <p className="-mt-2 mb-3 text-[11px] leading-snug text-[#8b949e]">
          {ui(lang, "themeScaleHint")}
        </p>
        <div className="flex flex-col gap-2.5">
          {SCALE_FIELDS.map((field) => (
            <div key={field.key} className="flex items-center gap-2">
              <span className={`${rowLabel} w-[62px] shrink-0`}>{ui(lang, field.k)}</span>
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={tokens.scale[field.key]}
                onChange={(e) =>
                  patch({
                    scale: { ...tokens.scale, [field.key]: e.currentTarget.valueAsNumber },
                  })
                }
                className="min-w-0 flex-1 accent-[#181818]"
              />
              <span className="w-[42px] shrink-0 text-right font-mono text-[11px] text-[#6b7480]">
                {tokens.scale[field.key]}px
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Köşe yuvarlaklığı */}
      <div className={section}>
        <p className={legend}>{ui(lang, "themeRadius")}</p>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={24}
            value={tokens.radius}
            onChange={(e) => patch({ radius: e.currentTarget.valueAsNumber })}
            className="min-w-0 flex-1 accent-[#181818]"
          />
          <span className="w-[42px] shrink-0 text-right font-mono text-[11px] text-[#6b7480]">
            {tokens.radius}px
          </span>
        </div>
      </div>

      {/* Yoğunluk */}
      <div className={section}>
        <p className={legend}>{ui(lang, "themeDensity")}</p>
        <div className="flex gap-2">
          {DENSITIES.map((d) => {
            const on = tokens.spacing === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => patch({ spacing: d.key })}
                className={`${chip} flex-1 ${
                  on
                    ? "border-[#181818] bg-[#181818] text-white"
                    : "border-[#d8dde2] bg-white text-[#181818] hover:border-[#9aa3ad]"
                }`}
              >
                {ui(lang, d.k)}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
