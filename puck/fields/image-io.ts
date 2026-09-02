/**
 * Tarayıcıda görsel küçültme ve WebP dönüşümü.
 *
 * puck/ altında duruyor çünkü studio'ya ait: ZIP'e girmez, blocks/ bunu
 * bilmez. Yeni bağımlılık yok — canvas API yetiyor.
 *
 * Sonuç data URI olarak site JSON'una gömülür. Export sırasında
 * lib/export-core.mjs bunları public/images/ altına gerçek dosya yazar;
 * base64 çıktıya GİTMEZ.
 */

/** Uzun kenar değil, GENİŞLİK sınırı: bloklar genişliğe göre yerleşiyor. */
export const MAX_WIDTH = 1600;
export const QUALITY = 0.82;

/**
 * srcset basamakları.
 *
 * Telefonda 1600px'lik bir görsel indirmenin anlamı yok: 375px'lik ekranda
 * 2x yoğunlukta bile 800 yetiyor. Üç basamak üretiliyor, tarayıcı `sizes`
 * bilgisiyle hangisini indireceğini kendi seçiyor.
 */
export const WIDTHS = [400, 800, 1600] as const;

/**
 * Hata METNİ değil ANAHTAR taşıyor: bu dosya dil bilmiyor, mesajı gösteren
 * ImageField çeviriyor. Önce burada sabit Türkçe metinler vardı ve
 * İngilizce arayüzde de öyle çıkıyorlardı.
 */
export class GorselHatasi extends Error {
  constructor(
    readonly anahtar: "imgNotImage" | "imgDecodeFail" | "imgWebpFail" | "imgReadFail" | "imgNoCanvas",
    readonly veri?: Record<string, string>,
  ) {
    super(anahtar);
  }
}

/** data:...;base64,XXX -> baytların sayısı (base64 çözmeden). */
export function dataUriBoyut(src: string): number {
  const i = src.indexOf("base64,");
  if (i === -1) return 0;
  const b64 = src.slice(i + 7);
  const dolgu = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - dolgu;
}

export function insanBoyut(bayt: number): string {
  if (bayt < 1024) return `${bayt} B`;
  if (bayt < 1024 * 1024) return `${(bayt / 1024).toFixed(0)} KB`;
  return `${(bayt / 1024 / 1024).toFixed(1)} MB`;
}

export function gomuluMu(src: string | undefined): boolean {
  return !!src && src.startsWith("data:");
}

function blobDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new GorselHatasi("imgReadFail"));
    fr.readAsDataURL(blob);
  });
}

/** Tek bir genişlikte WebP üretir. */
async function olcekle(bitmap: ImageBitmap, hedefGenislik: number): Promise<string> {
  const olcek = Math.min(1, hedefGenislik / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * olcek));
  const h = Math.max(1, Math.round(bitmap.height * olcek));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new GorselHatasi("imgNoCanvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/webp", QUALITY),
  );
  if (!blob) throw new GorselHatasi("imgWebpFail");
  return blobDataUri(blob);
}

export type YuklenenGorsel = {
  src: string;
  sources?: { w: number; src: string }[];
};

/**
 * Dosyayı gömülebilir data URI'lere çevirir.
 *
 * SVG rasterleştirilmez: vektörü piksele çevirmek net kayıp olur ve zaten
 * her ölçekte keskin. Diğer biçimlerde 400/800/1600 üretilir — kaynak
 * görselden GENİŞ olan basamaklar atlanır, büyütme yapılmaz.
 */
export async function dosyadanGorsel(file: File): Promise<YuklenenGorsel> {
  if (!file.type.startsWith("image/")) {
    throw new GorselHatasi("imgNotImage", { type: file.type || file.name });
  }

  if (file.type === "image/svg+xml") {
    return { src: await blobDataUri(file) };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new GorselHatasi("imgDecodeFail");
  }

  try {
    const basamaklar = WIDTHS.filter((w) => w <= bitmap.width);
    // Kaynak en küçük basamaktan da darsa kendi genişliğinde tek sürüm.
    const hedefler = basamaklar.length ? basamaklar : [bitmap.width];

    const sources: { w: number; src: string }[] = [];
    for (const hedef of hedefler) {
      sources.push({ w: Math.min(hedef, bitmap.width), src: await olcekle(bitmap, hedef) });
    }
    // En büyüğü ana kaynak: srcset desteklemeyen yerde o kullanılır.
    const enBuyuk = sources[sources.length - 1];
    return { src: enBuyuk.src, sources: sources.length > 1 ? sources : undefined };
  } finally {
    bitmap.close();
  }
}

/** Sürüklenen veriden ilk görsel dosyasını alır. */
export function ilkGorselDosyasi(dt: DataTransfer | null): File | null {
  if (!dt) return null;
  const dosyalar = Array.from(dt.files);
  return dosyalar.find((f) => f.type.startsWith("image/")) ?? null;
}
