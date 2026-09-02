"use client";

import { useSyncExternalStore } from "react";

/**
 * Kilitli bloklar — abone olunabilir depo.
 *
 * Neden ayrı depo? Puck'ın `resolvePermissions` çağrısı config içinden
 * çalışıyor ve React durumuna erişemiyor; theme-store ile aynı desen
 * kullanılıyor. Kaynak veri Site.locked, bu depo onun canlı kopyası.
 *
 * Kilit EDİTÖR durumu: blok props'una konsa indirilen content/page.json'a
 * sızardı. Site.locked ayrı alanda duruyor ve export sırasında siliniyor.
 */

let kilitli = new Set<string>();
const aboneler = new Set<() => void>();
/** useSyncExternalStore referans eşitliği istiyor: her değişimde yeni dizi. */
let anlik: string[] = [];

function yayinla() {
  anlik = [...kilitli].sort();
  aboneler.forEach((f) => f());
}

export function setLocked(ids: string[] | undefined): void {
  kilitli = new Set(ids ?? []);
  yayinla();
}

export function toggleLock(id: string): void {
  if (kilitli.has(id)) kilitli.delete(id);
  else kilitli.add(id);
  yayinla();
}

export function isLocked(id: string): boolean {
  return kilitli.has(id);
}

export function lockedIds(): string[] {
  return anlik;
}

export function useLockedIds(): string[] {
  return useSyncExternalStore(
    (f) => {
      aboneler.add(f);
      return () => aboneler.delete(f);
    },
    () => anlik,
    () => anlik,
  );
}
