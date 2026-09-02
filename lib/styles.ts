/**
 * docs/DESIGN.md kararlarının tek kaynağı.
 *
 * 15 bloğun tutarlı görünmesi mimariden değil bu dosyadan gelecek. Blok
 * yazarken ölçü uydurma — buradan al. Bir karar değişecekse burada değişsin.
 *
 * Sabit renk/boyut YOK: hepsi token değişkenlerini okur (kural 2).
 */

/** Grid: maksimum içerik genişliği 1200px. */
export const container = "mx-auto w-full max-w-[1200px]";

/** Tipografi: başlık ağırlığı 600, satır yüksekliği 1.15. */
export const heading =
  "font-[family-name:var(--font-heading)] font-semibold leading-[1.15] tracking-tight text-[color:var(--c-fg)]";

/** Gövde: ağırlık 400, satır yüksekliği 1.6, en fazla 65ch. */

/**
 * Butonlar: SADECE iki varyant, üçüncüsü yok.
 * Yükseklik 44px — dokunma hedefi.
 */
const btnBase =
  "inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius)] px-6 text-[length:var(--fs-body)] font-medium transition-opacity";

export const btnPrimary = `${btnBase} bg-[var(--c-primary)] text-[color:var(--c-primary-fg)] hover:opacity-90`;

export const btnSecondary = `${btnBase} border border-[var(--c-border)] bg-transparent text-[color:var(--c-fg)] hover:border-[var(--c-fg)]`;

/**
 * Kart yüzeyi — KENARLIK YOK (docs/DESIGN.md · Kararlar).
 *
 * Ayrımı çizgi değil, arka plandan %3 sapan ton yapıyor. Gölge de yok:
 * kartlar sayfadan "kalkmıyor", sadece zeminden ayrışıyor.
 */
export const surface = "rounded-[var(--radius)] bg-[var(--c-surface)]";

/**
 * Görsel çerçevesi — kenarlık yok, iç boşluk yok.
 * Görsel kutunun kenarına sıfır yapışır (docs/DESIGN.md · Kararlar).
 */
export const frame = "overflow-hidden rounded-[var(--radius)]";

/** Görseller: object-fit cover her zaman. Oran çağrı yerinde verilir. */
export const image = "w-full object-cover";

/**
 * Bağlantı: gövde metniyle aynı boy, vurguya döner.
 * 44px dokunma hedefi (docs/DESIGN.md) — 375px'te nav linkleri 23px
 * yüksekliğindeydi, parmakla ıskalanıyordu.
 */
export const navLink =
  "inline-flex min-h-[44px] items-center text-[length:var(--fs-body)] text-[color:var(--c-muted)] transition-colors hover:text-[color:var(--c-primary)]";

/** Logo bağlantısı — başlık stili + dokunma hedefi. */
export const logoLink = `${heading} inline-flex min-h-[44px] items-center text-[length:var(--fs-h3)]`;
