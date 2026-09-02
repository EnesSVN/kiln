import { useSyncExternalStore } from "react";
import type { Tokens } from "./types";

/**
 * Tuvalin okuduğu canlı tema.
 *
 * Neden ayrı bir depo: token'ları Puck'ın `config` prop'una gömersek her
 * renk değişiminde yeni bir config nesnesi üretmek gerekir ve Puck'ı kendi
 * durumuyla yarıştırma riski doğar. Depo sayesinde config bir kez kuruluyor,
 * tuval ise token değişimine kendi aboneliğiyle tepki veriyor.
 *
 * Sadece editör içi. İçerik burada tutulmuyor — o Puck'ta.
 */
let current: Tokens | null = null;
const listeners = new Set<() => void>();

export function setThemeTokens(tokens: Tokens): void {
  current = tokens;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const snapshot = () => current;

export function useThemeTokens(): Tokens | null {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
