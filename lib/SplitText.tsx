import type { Animation } from "./types";

/**
 * Metni kelime/karakter parçalarına böler ve her parçaya artan gecikme verir.
 *
 * SUNUCUDA çalışır — "use client" YOK, hiçbir hook kullanmaz. Parçalama
 * SSR HTML'inin içinde olup biter, tarayıcıya ek JS gitmez. Görünürlük
 * tetiği hâlâ tek client bileşeni olan <Reveal>'da: o görünür olduğunda
 * `[data-visible] [data-anim]` kuralı içerideki parçaları da açar.
 *
 * ERİŞİLEBİLİRLİK / SEO: parçalar düz <span>, üzerlerinde ARIA yok.
 *
 * İki yanlış denendi: (1) sarmalayıcıya aria-label — ARIA bunu düz span'de
 * yasaklıyor; (2) sr-only kopya + aria-hidden parçalar — metin DOM'da iki
 * kez geçiyordu ve h1.textContent başlığı çift veriyordu.
 *
 * Şimdiki hâlde parçaların metni birleşince tam olarak orijinali veriyor:
 * boşluklar span DIŞINDA ayrı metin düğümü olarak duruyor, ekran okuyucu
 * ve arama motoru kesintisiz okuyor. Fazladan erişilebilirlik niteliği
 * gerekmiyor çünkü gizlenen ya da tekrarlanan bir şey yok.
 */
export function SplitText({
  text,
  anim,
}: {
  /**
   * Yayınlanan sitede her zaman string. Editörde tuval üstü yazma açıkken
   * Puck bu prop'un yerine kendi düzenlenebilir elemanını geçiriyor —
   * o durumda bölme yapılmaz, eleman olduğu gibi render edilir.
   */
  text: React.ReactNode;
  anim?: Animation;
}) {
  const split = anim?.splitBy ?? "none";

  // Bölme yoksa fazladan tek bir DOM düğümü bile üretme.
  if (!anim || anim.type === "none" || split === "none" || typeof text !== "string") {
    return <>{text}</>;
  }

  // Boşluklar ayrı metin düğümü olarak kalıyor: inline-block bir span'in
  // içindeki boşluk çökeceği için kelimeler birbirine yapışırdı.
  const chunks = text.split(/(\s+)/).filter((c) => c !== "");

  const nodes: React.ReactNode[] = [];
  let step = 0;

  const piece = (content: string, key: string) => {
    const delay = anim.delay + step * anim.stagger;
    step += 1;
    return (
      <span
        key={key}
        data-anim={anim.type}
        data-trigger={anim.trigger}
        data-split=""
        style={
          {
            "--d": `${anim.duration}ms`,
            "--delay": `${delay}ms`,
          } as React.CSSProperties
        }
      >
        {content}
      </span>
    );
  };

  chunks.forEach((chunk, i) => {
    if (/^\s+$/.test(chunk)) {
      nodes.push(chunk);
      return;
    }
    if (split === "word") {
      nodes.push(piece(chunk, `w${i}`));
      return;
    }
    [...chunk].forEach((char, j) => nodes.push(piece(char, `c${i}-${j}`)));
  });

  return <>{nodes}</>;
}
