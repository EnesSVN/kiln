import type { Animation } from "./types";

/**
 * Kart/şerit listelerinde sıralı beliriş.
 *
 * Her öğeye kendi --delay'ini verir; görünürlük tetiği yine <Reveal>'da.
 * CSS tarafında `[data-visible] [data-anim]` kuralı içerideki öğeleri
 * açıyor — SplitText ile aynı mekanizma, ek JS yok.
 */
export function staggerProps(
  anim: Animation | undefined,
  index: number,
): { "data-anim"?: string; style?: React.CSSProperties } {
  if (!anim || anim.type === "none") return {};

  return {
    "data-anim": anim.type,
    style: {
      "--d": `${anim.duration}ms`,
      "--delay": `${anim.delay + index * anim.stagger}ms`,
    } as React.CSSProperties,
  };
}
