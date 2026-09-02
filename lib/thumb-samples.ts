import landing from "@/data/landing.json";
import { blocks } from "@/blocks";
import { demoIds, loadDemo } from "./demos";
import { parseSite } from "./schema";
import type { SiteNode } from "./types";

/**
 * Küçük resimler için örnek düğümler.
 *
 * Her blok için ayrı örnek metin YAZMIYORUZ: bloklar zaten demolarda
 * gerçek içerikle geçiyor. Örneği oradan almak hem tekrarı önlüyor hem de
 * küçük resmin gerçekten üretilebilecek bir sonucu göstermesini garanti
 * ediyor — uydurma props'la çekilen bir görsel, blok değiştiğinde sessizce
 * yalan söylemeye başlardı.
 *
 * Sadece SUNUCUDA çalışır (lib/demos.ts node:fs kullanıyor).
 */

/** blocks/index.ts'teki kayıt defterinin sırası — çekmecedeki sırayla aynı. */
export function thumbTypes(): string[] {
  return Object.keys(blocks);
}

/** Aynı tip birden çok demoda geçiyorsa en dolu örnek kazanır. */
function richer(a: SiteNode, b: SiteNode): SiteNode {
  return JSON.stringify(b.props).length > JSON.stringify(a.props).length ? b : a;
}

function everyNode(): SiteNode[] {
  const nodes: SiteNode[] = [...parseSite(landing).nodes];
  for (const id of demoIds()) {
    const site = loadDemo(id);
    if (site) nodes.push(...site.nodes);
  }
  return nodes;
}

/**
 * Küçük resim için düzeltmeler.
 *
 * Harita: Contact bloğu canlı bir gömme adresi yüklüyor. Ekran görüntüsü
 * headless tarayıcıda alındığı için harita servisi WebGL bulamayıp hata
 * kutusu basıyor ve o kutu küçük resme gömülüyordu. Küçük resmin işi bloğun
 * DÜZENİNİ göstermek; canlı harita gerektirmiyor.
 */
function thumbIcin(node: SiteNode): SiteNode {
  if (node.type !== "Contact") return node;
  return {
    ...node,
    props: { ...node.props, mapEmbedUrl: "/demo/harita.svg" },
  };
}

export function thumbSample(type: string): SiteNode | null {
  let best: SiteNode | null = null;
  for (const node of everyNode()) {
    if (node.type !== type) continue;
    best = best ? richer(best, node) : node;
  }
  return best ? thumbIcin(best) : null;
}

