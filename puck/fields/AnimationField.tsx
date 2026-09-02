import { alan, type AlanKey } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";
import { FieldLabel, type CustomFieldRender } from "@puckeditor/core";
import type { Animation, AnimationType } from "@/lib/types";

/** Animasyon ayarları: type, duration, delay, trigger, once, splitBy, stagger. */
export const DEFAULT_ANIMATION: Animation = {
  type: "none",
  duration: 500,
  delay: 0,
  trigger: "scroll",
  once: true,
  splitBy: "none",
  stagger: 40,
};

// Seçenekler çeviri ANAHTARI tutuyor; metin render sırasında seçiliyor.
const TYPES: { value: AnimationType; k: AlanKey }[] = [
  { value: "none", k: "animNone" },
  { value: "fade", k: "animFade" },
  { value: "slide-up", k: "animSlideUp" },
  { value: "slide-left", k: "animSlideLeft" },
  { value: "scale", k: "animScale" },
  { value: "blur", k: "animBlur" },
];

const TRIGGERS: { value: Animation["trigger"]; k: AlanKey }[] = [
  { value: "scroll", k: "animOnScroll" },
  { value: "load", k: "animOnLoad" },
];

const SPLITS: { value: Animation["splitBy"]; k: AlanKey }[] = [
  { value: "none", k: "animSplitNone" },
  { value: "word", k: "animSplitWord" },
  { value: "char", k: "animSplitChar" },
];

const controlClass =
  "w-full rounded border border-[#c3c8ce] bg-white px-2 py-1.5 text-[13px] text-[#181818] outline-none focus:border-[#1d1d1d]";
const smallLabel = "text-[11px] font-medium text-[#5a5a5a]";

// Blok prop'u `animation?` olduğu için Puck buraya undefined da geçebilir;
// DEFAULT_ANIMATION ile dolduruyoruz.
export const AnimationField: CustomFieldRender<Animation | undefined> = ({
  field,
  value,
  onChange,
  readOnly,
}) => {
  const lang = useLang();
  const anim: Animation = { ...DEFAULT_ANIMATION, ...(value ?? {}) };
  const patch = (p: Partial<Animation>) => onChange({ ...anim, ...p });

  // 0-2000 dışına çıkmak şemadan geçmez; girişte kırpıyoruz.
  const clamp = (n: number) => Math.min(2000, Math.max(0, Number.isFinite(n) ? n : 0));

  return (
    <FieldLabel label={field.label ?? alan(lang, "animType")}>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className={smallLabel}>{alan(lang, "animType")}</span>
          <select
            className={controlClass}
            disabled={readOnly}
            value={anim.type}
            onChange={(e) => patch({ type: e.currentTarget.value as AnimationType })}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {alan(lang, t.k)}
              </option>
            ))}
          </select>
        </label>

        {anim.type !== "none" && (
          <>
            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1">
                <span className={smallLabel}>{alan(lang, "animDuration")}</span>
                <input
                  className={controlClass}
                  type="number"
                  min={0}
                  max={2000}
                  step={50}
                  disabled={readOnly}
                  value={anim.duration}
                  onChange={(e) => patch({ duration: clamp(e.currentTarget.valueAsNumber) })}
                />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className={smallLabel}>{alan(lang, "animDelay")}</span>
                <input
                  className={controlClass}
                  type="number"
                  min={0}
                  max={2000}
                  step={50}
                  disabled={readOnly}
                  value={anim.delay}
                  onChange={(e) => patch({ delay: clamp(e.currentTarget.valueAsNumber) })}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className={smallLabel}>{alan(lang, "animTrigger")}</span>
              <select
                className={controlClass}
                disabled={readOnly}
                value={anim.trigger}
                onChange={(e) =>
                  patch({ trigger: e.currentTarget.value as Animation["trigger"] })
                }
              >
                {TRIGGERS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {alan(lang, t.k)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={anim.once}
                onChange={(e) => patch({ once: e.currentTarget.checked })}
              />
              <span className="text-[13px] text-[#181818]">{alan(lang, "animOnce")}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className={smallLabel}>{alan(lang, "animSplit")}</span>
              <select
                className={controlClass}
                disabled={readOnly}
                value={anim.splitBy}
                onChange={(e) =>
                  patch({ splitBy: e.currentTarget.value as Animation["splitBy"] })
                }
              >
                {SPLITS.map((sp) => (
                  <option key={sp.value} value={sp.value}>
                    {alan(lang, sp.k)}
                  </option>
                ))}
              </select>
            </label>

            {anim.splitBy !== "none" && (
              <label className="flex flex-col gap-1">
                <span className={smallLabel}>{alan(lang, "animStagger")}</span>
                <input
                  className={controlClass}
                  type="number"
                  min={0}
                  max={200}
                  step={10}
                  disabled={readOnly}
                  value={anim.stagger}
                  onChange={(e) =>
                    patch({
                      stagger: Math.min(
                        200,
                        Math.max(
                          0,
                          Number.isFinite(e.currentTarget.valueAsNumber)
                            ? e.currentTarget.valueAsNumber
                            : 0,
                        ),
                      ),
                    })
                  }
                />
              </label>
            )}
          </>
        )}
      </div>
    </FieldLabel>
  );
};
