import { useSyncExternalStore } from "react";
import type { Site } from "./types";

/**
 * Tuvalde animasyonu bir kez oynatma.
 *
 * Normalde tuvalde animasyon KAPALI (bkz. puck/config.tsx): iframe
 * kaydırılmadığı için IntersectionObserver tetiklenmiyor ve bloklar
 * görünmez kalıyordu.
 *
 * Oynatma JS ile değil CSS ile yapılıyor — Reveal'ın observer'ını yeniden
 * kurmaya çalışmıyoruz (once:true ile zaten kopmuş olabilir):
 *
 *   arm  : her şeyi geçişsiz biçimde gizle (anlık sıfırlama)
 *   run  : gizlemeyi kaldır -> CSS geçişleri kendi --delay'leriyle akar
 *   off  : normale dön, tuval yine düzenlenebilir
 */
export type ReplayState = "off" | "arm" | "run";

let state: ReplayState = "off";
const listeners = new Set<() => void>();
let timers: ReturnType<typeof setTimeout>[] = [];

function set(next: ReplayState): void {
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const snapshot = () => state;

export function useReplayState(): ReplayState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Sitedeki en uzun animasyon — oynatmanın ne kadar süreceğini bilelim. */
function longestMs(site: Site | null): number {
  if (!site) return 1500;

  let longest = 0;
  for (const node of site.nodes) {
    const anim = node.props?.animation as
      | { duration?: number; delay?: number; stagger?: number; splitBy?: string }
      | undefined;
    if (!anim) continue;

    const parts = anim.splitBy && anim.splitBy !== "none" ? 24 : 1;
    const stagger = anim.splitBy && anim.splitBy !== "none" ? (anim.stagger ?? 0) : 0;
    longest = Math.max(
      longest,
      (anim.delay ?? 0) + (parts - 1) * stagger + (anim.duration ?? 500),
    );
  }
  return Math.min(8000, longest + 600);
}

export function playAnimations(site: Site | null): void {
  for (const t of timers) clearTimeout(t);
  timers = [];

  set("arm");
  // İki kare: tarayıcı gizli durumu boyasın, sonra geçiş başlasın.
  timers.push(setTimeout(() => set("run"), 80));
  timers.push(setTimeout(() => set("off"), 80 + longestMs(site)));
}
