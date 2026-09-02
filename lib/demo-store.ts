"use client";

import { useSyncExternalStore } from "react";

/**
 * "Demo yükle" eylemi — tuvalden editör kabuğuna uzanan tek düğme.
 *
 * Boş tuval mesajı Puck'ın iframe'i içinde duruyor; oradaki bir düğmenin
 * siteyi değiştirebilmesi için editörün yükleme işlevine erişmesi gerekiyor.
 * Prop olarak geçemiyor: araya Puck'ın override mekanizması giriyor.
 * lang-store ile aynı desen — modül tekili, iki taraf da aynı JS
 * gerçekliğinde olduğu için iframe sınırı sorun değil.
 *
 * Site verisi DEĞİL: hiçbir şey depoya ya da çıktıya yazılmıyor.
 */

type Yukleyici = ((id: string) => void) | null;

let mevcut: Yukleyici = null;
let demolar: string[] = [];
const aboneler = new Set<() => void>();
/** useSyncExternalStore aynı referansı görmeli, yoksa sonsuz döngü olur. */
let anlik: { yukle: Yukleyici; demolar: string[] } = { yukle: null, demolar: [] };

function yayinla() {
  anlik = { yukle: mevcut, demolar };
  aboneler.forEach((f) => f());
}

export function setDemoYukleyici(fn: Yukleyici, idler: string[]): void {
  mevcut = fn;
  demolar = idler;
  yayinla();
}

const BOS = { yukle: null as Yukleyici, demolar: [] as string[] };

export function useDemoYukleyici() {
  return useSyncExternalStore(
    (f) => {
      aboneler.add(f);
      return () => aboneler.delete(f);
    },
    () => anlik,
    () => BOS,
  );
}
