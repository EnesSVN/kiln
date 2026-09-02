import { blocks } from "@/blocks";
import type { SiteNode } from "./types";

/**
 * 15 satırlık renderer. Studio önizlemesinde ve indirilen repo'da
 * aynı dosya, aynı davranış.
 */
export function Render({ nodes, lang }: { nodes: SiteNode[]; lang?: string }) {
  return (
    <>
      {nodes.map((n) => {
        const Block = blocks[n.type];
        if (!Block) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[render] bilinmeyen blok: ${n.type}`);
          }
          return null;
        }
        // id prop olarak da geçiliyor: bazı bloklar (mobil menü) sayfada
        // benzersiz bir CSS hedefi (#id) üretmek için buna ihtiyaç duyuyor.
        // Puck tuvalinde aynı prop'u Puck'ın kendisi veriyor, yani iki
        // ortamda da aynı isimle geliyor.
        //
        // lang SPREAD'DEN SONRA: sitenin dili blok verisiyle ezilemesin.
        // Bloklar bunu yalnızca kendi sabit metinleri için kullanıyor
        // (lib/block-text.ts); kullanıcının yazdığı hiçbir şey buna bakmaz.
        return <Block key={n.id} id={n.id} {...n.props} lang={lang} />;
      })}
    </>
  );
}
