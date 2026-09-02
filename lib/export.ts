import JSZip from "jszip";
import * as bundle from "@/generated/files";
import { buildZip, slugify } from "./export-core.mjs";
import type { Site } from "./types";

/**
 * Tarayıcıda zip üretir. Arka uç yok.
 *
 * Asıl iş lib/export-core.mjs'te; scripts/verify-export.mjs de aynı kodu
 * koşuyor, yani CI'da doğrulanan zip ile kullanıcının indirdiği zip aynı
 * yoldan çıkıyor.
 *
 * PAKET BÜTÜN OLARAK GEÇİLİYOR (`import * as bundle`).
 *
 * Önce burada elle bir nesne kuruluyordu:
 *   const bundle = { FILES, BLOCK_FILES, RESP_USAGE, DEPS, SCALE };
 * PUBLIC_ASSETS ve BLOCK_DEPS listede yoktu, export-core da ikisini `{}`
 * varsayıyordu. Sonuç: tarayıcıdan indirilen her projede varsayılan
 * görseller (public/demo/*) eksik kalıyor, Carousel kullanan projeler ise
 * embla bağımlılığı package.json'a hiç yazılmadığı için derlenmiyordu.
 * verify:export bunu göremiyordu çünkü paketi bütün import ediyor —
 * yani CI'nin doğruladığı yol ile kullanıcının yolu tam da burada
 * ayrılıyordu. Namespace import'u bu ayrımı kökten kaldırıyor; ayrıca
 * verify'da assert var (bkz. "tarayıcı yolu" adımı).
 */
export function exportSite(site: Site): Promise<Blob> {
  return buildZip(site, bundle, JSZip).generateAsync({ type: "blob" });
}

export function exportFileName(site: Site): string {
  return `${slugify(site.meta.title)}.zip`;
}
