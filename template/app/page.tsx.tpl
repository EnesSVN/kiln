import type { Metadata, Viewport } from "next";
import site from "@/content/page.json";
import { Render } from "@/lib/render";
import type { Site } from "@/lib/types";

const data = site as unknown as Site;

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: data.meta.title,
    description: data.meta.description,
    type: "website",
    ...(data.meta.ogImage ? { images: [data.meta.ogImage] } : {}),
  },
  twitter: { card: "summary_large_image" },
};

/**
 * themeColor Next 15'ten beri metadata'da değil viewport'ta duruyor;
 * metadata'ya konursa derleme uyarı veriyor.
 */
export const viewport: Viewport = {
  themeColor: "{{primaryColor}}",
};

/**
 * Sayfanın tamamı sunucuda render edilir. İçeriği değiştirmek için
 * content/page.json'u düzenleyin.
 */
export default function Page() {
  return <Render nodes={data.nodes} lang={data.meta.lang} />;
}
