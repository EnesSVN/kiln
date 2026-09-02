import { type Lang, ui } from "@/lib/i18n";

/** Editör üst çubuğunda görünen hata/bilgi şeridi. alert() yerine. */
export type NoticeKind = "error" | "info";

export function Notice({
  kind,
  title,
  detail,
  lang,
  action,
  onClose,
}: {
  kind: NoticeKind;
  title: string;
  detail?: string;
  lang: Lang;
  /** Şeridin içinden çalıştırılabilen tek eylem — örn. bozuk kaydı indir. */
  action?: { label: string; onClick: () => void };
  onClose: () => void;
}) {
  const renk =
    kind === "error"
      ? "border-[#e0b4b4] bg-[#fdf3f3] text-[#7a2323]"
      : "border-[#c3c8ce] bg-[#f5f7f9] text-[#22303d]";

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 border-b px-4 py-3 text-[13px] ${renk}`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {detail ? (
          <p className="mt-1 break-words font-mono text-[12px] opacity-80">{detail}</p>
        ) : null}
      </div>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 rounded border border-current px-2 py-1 text-[12px] font-medium hover:opacity-70"
        >
          {action.label}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded px-2 py-1 text-[12px] underline underline-offset-2 hover:opacity-70"
      >
        {ui(lang, "close")}
      </button>
    </div>
  );
}
