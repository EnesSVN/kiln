import { ImageResponse } from "next/og";
import site from "@/content/page.json";
import type { Site } from "@/lib/types";

/**
 * Sosyal medya kartı — build sırasında üretilir.
 *
 * Ayrı bir görsel dosyası tutmak yerine sayfa başlığı ve tema renkleriyle
 * çiziliyor: başlığı değiştirince kart da değişir, senkron tutulacak ikinci
 * bir varlık olmaz. `next/og` Next paketinin içinde geliyor — yeni bağımlılık
 * yok, özel font da gerekmiyor.
 *
 * Kendi görselinizi kullanmak isterseniz bu dosyayı silip
 * content/page.json içindeki meta.ogImage alanını doldurun.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "{{title}}";

const data = site as unknown as Site;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "{{bgColor}}",
          color: "{{fgColor}}",
          padding: 80,
          fontSize: 64,
          fontWeight: 600,
          letterSpacing: -1.5,
        }}
      >
        <div style={{ display: "flex", maxWidth: 1000, lineHeight: 1.15 }}>
          {data.meta.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 28, fontWeight: 400 }}>
          <div style={{ width: 96, height: 12, background: "{{primaryColor}}", borderRadius: 6 }} />
          <div style={{ display: "flex", color: "{{mutedColor}}" }}>{data.meta.description}</div>
        </div>
      </div>
    ),
    size,
  );
}
