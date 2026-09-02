"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_LANG, isLang, type Lang } from "./i18n";
import { loadLang, saveLang } from "./storage";

/**
 * Editör dili — abone olunabilir küçük depo.
 *
 * theme-store ile aynı desen: dil değişince hem Kiln'in kabuğu hem de Puck
 * config'i (etiketler config ağacına gömülü) yeniden kurulmalı.
 *
 * Site verisi DEĞİL: indirilen repo editörün hangi dilde kullanıldığını
 * bilmez. Bu yüzden Site şemasına değil tarayıcı tercihlerine yazılıyor.
 */

let mevcut: Lang = DEFAULT_LANG;
let okundu = false;
const aboneler = new Set<() => void>();

function ilkOkuma(): Lang {
  if (!okundu && typeof window !== "undefined") {
    const kayitli = loadLang();
    if (isLang(kayitli)) mevcut = kayitli;
    okundu = true;
  }
  return mevcut;
}

export function setLang(next: Lang): void {
  if (next === mevcut) return;
  mevcut = next;
  okundu = true;
  saveLang(next);
  aboneler.forEach((f) => f());
}

export function getLang(): Lang {
  return ilkOkuma();
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (f) => {
      aboneler.add(f);
      return () => aboneler.delete(f);
    },
    () => ilkOkuma(),
    // Sunucuda her zaman varsayılan: hidrasyon farkı çıkmasın.
    () => DEFAULT_LANG,
  );
}
