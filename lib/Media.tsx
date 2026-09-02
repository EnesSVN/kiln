import { bt } from "./block-text";
import type { Image } from "./types";

/**
 * Görsel — kural 7'yi tek yerde uygular: alt zorunlu, lazy varsayılan.
 *
 * src boşken kırık görsel simgesi yerine yer tutucu çiziyor. Editörde
 * yeni blok eklendiğinde adres henüz girilmemiş oluyor; kırık simge
 * kullanıcıya bir şeyin bozulduğunu düşündürüyordu.
 *
 * width/height ZORUNLU. Gerçek piksel ölçüsü değil, bloğun dayattığı
 * oran: yerleşimi CSS (aspect-*) yapıyor, öznitelikler yalnızca tarayıcıya
 * "bu kutu şu oranda" diyor. Olmadığında görsel inene kadar yükseklik sıfır
 * kalıp altındaki her şeyi zıplatıyordu (CLS).
 */
export function Media({
  image,
  className,
  width,
  height,
  sizes,
  eager = false,
  lang,
}: {
  image?: Image;
  className: string;
  /** Bloğun dayattığı oran — örn. 16/9 için 1600x900. */
  width: number;
  height: number;
  /**
   * Görselin sayfada kapladığı genişlik. srcset'in işe yaraması için şart:
   * tarayıcı hangi basamağı indireceğine buna bakarak karar veriyor.
   * Blok kendi yerleşimini bildiği için değeri o veriyor.
   */
  sizes?: string;
  /** Hero gibi ilk ekranda görünen görseller için. */
  eager?: boolean;
  /** Sitenin dili — yer tutucu metni için. */
  lang?: string;
}) {
  if (!image?.src) {
    /*
      Yer tutucu metni bt()'den geliyor — CSS'ten DEĞİL.

      Önce :lang() ile CSS ::after basıyordu. İki mekanizma iki farklı
      cevap veriyordu: tuvalin iframe'i lang="en" olduğu için editörde
      "No image", çıktıda (lang="tr") "Görsel eklenmedi" görünüyordu.
      Aynı sınıf metin artık tek yoldan, bloklara geçen lang ile.

      role="img" YOK: adres girilmemiş bir görsel içerik değil, yazım
      sırasında kalan bir boşluk. Ekran okuyucuya bildirecek bir şey yok.
    */
    return (
      <div
        aria-hidden="true"
        style={{ aspectRatio: `${width} / ${height}` }}
        className={`${className} kiln-img-empty grid place-items-center bg-[var(--c-surface)] text-[length:var(--fs-body)] text-[color:var(--c-muted)]`}
      >
        {bt(lang, "noImage")}
      </div>
    );
  }

  // Studio'da yüklenen fotoğraflarda üç basamak var; adresle bağlanan ya da
  // SVG olan görsellerde yok — o zaman tek kaynakla eski davranış sürüyor.
  const srcSet = image.sources?.length
    ? image.sources.map((s) => `${s.src} ${s.w}w`).join(", ")
    : undefined;

  return (
    <img
      src={image.src}
      srcSet={srcSet}
      sizes={srcSet ? (sizes ?? "100vw") : undefined}
      alt={image.alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className={className}
    />
  );
}
