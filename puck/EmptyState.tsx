import { useDemoYukleyici } from "@/lib/demo-store";
import { ui } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";

/**
 * Tuval boşken gösterilen yönlendirme.
 *
 * Puck boş içerikte tamamen boş bir alan gösteriyor; kullanıcı ne yapacağını
 * anlamıyor. TUVALİN İÇİNDE duruyor: editör kabuğunda kardeş eleman olarak
 * durduğunda kendi yüksekliğini araç çubuğundan çalıyordu.
 */
export function EmptyState() {
  const lang = useLang();
  const { yukle, demolar } = useDemoYukleyici();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-[15px] font-semibold text-[#181818]">{ui(lang, "emptyTitle")}</p>
      <p className="max-w-[46ch] text-[13px] leading-relaxed text-[#5a5a5a]">
        {ui(lang, "emptyBody")}
      </p>
      <p className="max-w-[46ch] text-[12px] text-[#8b949e]">{ui(lang, "emptyHint")}</p>

      {/*
        Demo yükleme buradan. Editör eskiden kepenk demosuyla AÇILIYORDU;
        yeni kullanıcı başkasının bitmiş sitesini kendi sayfası sanıyordu.
        Demo artık isteyenin bastığı bir düğme.
      */}
      {yukle && demolar.length ? (
        <div className="mt-2 flex flex-col items-center gap-2">
          <p className="text-[12px] text-[#8b949e]">{ui(lang, "emptyDemoLabel")}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {demolar.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => yukle(id)}
                className="rounded border border-[#c3c8ce] bg-white px-3 py-1.5 text-[12px] text-[#181818] hover:border-[#181818]"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
