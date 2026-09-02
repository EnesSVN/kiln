import type { Responsive } from "./types";

/**
 * resp() — sistemin kalbi.
 *
 * Kullanıcı media query yazmaz, {base, md, lg} yazar. Burası onu
 * Tailwind sınıflarına çevirir.
 *
 * Ölçek SABİT. Keyfi değer `p-[37px]` üretir; o sınıf kaynak dosyalarda
 * geçmediği için Tailwind onu ne studio'da ne de çıktı repo'sunda derler.
 * Bu yüzden ölçek dışı sayılar en yakın basamağa yuvarlanır.
 *
 * Bu sınıflar JSON'dan runtime'da üretildiği için Tailwind'in tarayıcısı
 * onları göremez — app/globals.css içindeki `@source inline(...)` satırı
 * hepsini güvenli listeye alır. Yeni bir prefix kullanacaksan oraya da ekle.
 */
const SCALE: Record<number, string> = {
  0: "0",
  4: "1",
  8: "2",
  12: "3",
  16: "4",
  24: "6",
  32: "8",
  48: "12",
  64: "16",
  96: "24",
};

const STEPS = Object.keys(SCALE).map(Number);

/**
 * Ölçek dışı değeri en yakın basamağa çeker.
 *
 * Sessizce yuvarlamak tehlikeli: editörden geçmeyen elle yazılmış bir JSON'da
 * `padding: 20` yazarsan 16'ya düşer ve bunu hiç fark etmezsin. Development'ta
 * uyarı basıyoruz; production'da uyarı yok, davranış aynı.
 */
function step(v: number, prefix: string): string {
  const hit = SCALE[v];
  if (hit !== undefined) return hit;

  const nearest = STEPS.reduce((a, b) =>
    Math.abs(b - v) < Math.abs(a - v) ? b : a,
  );

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[resp] "${prefix}" için ölçek dışı değer: ${v} → ${nearest} olarak yuvarlandı. ` +
        `İzin verilen basamaklar: ${STEPS.join(", ")}`,
    );
  }

  return SCALE[nearest];
}

export function resp(
  v: Responsive<number> | undefined,
  prefix: string,
): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "number") return `${prefix}-${step(v, prefix)}`;

  return [
    v.base !== undefined && `${prefix}-${step(v.base, prefix)}`,
    v.md !== undefined && `md:${prefix}-${step(v.md, prefix)}`,
    v.lg !== undefined && `lg:${prefix}-${step(v.lg, prefix)}`,
  ]
    .filter(Boolean)
    .join(" ");
}
