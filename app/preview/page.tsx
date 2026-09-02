import { demoIds, loadDemo } from "@/lib/demos";
import { PreviewListesi } from "./PreviewListesi";

/**
 * Demoların listesi. Asıl önizleme /preview/[id]'de.
 *
 * Sayfa başlığı sabit "Önizlemeler — Kiln" idi. Sekme başlığı sunucuda
 * üretiliyor ve arayüz dilini göremiyor; iki dili de taşıyan nötr bir ad
 * kaldı, sayfanın içindeki metin PreviewListesi'nde çevriliyor.
 */
export const metadata = { title: "Kiln — demo" };

export default function PreviewIndex() {
  const demolar = demoIds().map((id) => {
    const site = loadDemo(id);
    return { id, baslik: site?.meta.title ?? id, blok: site?.nodes.length ?? 0 };
  });

  return <PreviewListesi demolar={demolar} />;
}
