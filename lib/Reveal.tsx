import type { Animation } from "./types";

/**
 * Animasyon sarmalayıcı. SUNUCU BİLEŞENİ — "use client" YOK, hook yok.
 *
 * Görünürlük tetiği <head>'deki satır içi script'te (bkz. app/layout.tsx ·
 * REVEAL_BOOTSTRAP). Neden orada:
 *
 * Eskiden burası bir client bileşeniydi ve IntersectionObserver'ı useEffect
 * içinde kuruyordu. Ekranın üst kısmındaki bloklar hidrasyona kadar
 * opacity:0 kalıyor, LCP hidrasyon süresine kilitleniyordu — Lighthouse'ta
 * ölçüldü: LCP 5.3 sn, render delay 4.9 sn. Satır içi script HTML ayrıştırılır
 * ayrıştırılmaz koştuğu için içerik React'i beklemiyor.
 *
 * Sonuç: çıktı repo'sunda animasyon kaynaklı client bileşeni SIFIR.
 */
export function Reveal({
  anim,
  children,
  className,
}: {
  anim?: Animation;
  children: React.ReactNode;
  className?: string;
}) {
  // Animasyon yoksa fazladan DOM düğümü de yok.
  if (!anim || anim.type === "none") {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  return (
    <div
      className={className}
      data-anim={anim.type}
      data-trigger={anim.trigger}
      data-once={anim.once ? "true" : "false"}
      style={
        {
          "--d": `${anim.duration}ms`,
          "--delay": `${anim.delay}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
