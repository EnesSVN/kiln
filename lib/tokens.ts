import { fontStack } from "./fonts";
import { tokenCss, tokenVars } from "./tokens-core.mjs";
import type { Tokens } from "./types";

/**
 * Token → CSS (React tarafı).
 *
 * Hesap lib/tokens-core.mjs'te; export betiği de aynı dosyayı kullanıyor.
 * Fark şu: studio font değişkenlerini next/font'un ürettiği aile adına
 * çevirip basar, export ise basmaz — çıktıda o iş next/font'a ait.
 *
 * Satır içi style DEĞİL metin döndürüyoruz: padding kırılım noktasına göre
 * değişiyor ve inline style'da @media yazılamıyor.
 */
export function tokensToCss(t: Tokens, selector = ":root"): string {
  return tokenCss(t, selector, { resolveFont: fontStack });
}

