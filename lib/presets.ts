import type { Tokens } from "./types";

/**
 * Hazır temalar.
 *
 * Kullanıcıların çoğu preset seçip devam edecek — bu yüzden dördü de
 * tek başına bitmiş görünmeli, "başlangıç noktası" gibi durmamalı.
 * Preset SADECE token'ları değiştirir; node'lara dokunmaz.
 */
export type Preset = { id: string; label: string; tokens: Tokens };

/**
 * Tipografi ölçeği docs/DESIGN.md'deki 1.25 oranına oturur:
 *   h3 = gövde × 1.25      h2 = gövde × 1.25³      h1 = gövde × 1.25⁶
 *
 * h1 bir basamak fazla: docs/DESIGN.md · Kararlar "başlıklar cömert boyutta".
 * Basamak indeksleri tüm presetlerde aynı; temalar gövde boyu, renk, font
 * ve yoğunlukla ayrışıyor — ölçek ritmiyle değil.
 */

export const PRESETS: Preset[] = [
  {
    id: "sade",
    label: "Sade",
    tokens: {
      colors: {
        bg: "#ffffff",
        fg: "#14181d",
        muted: "#5c6672",
        primary: "#14181d",
        primaryFg: "#ffffff",
        border: "#e4e8ec",
      },
      font: { heading: "inter", body: "inter" },
      scale: { h1: 65, h2: 33, h3: 21, body: 17 },
      radius: 8,
      spacing: "normal",
    },
  },
  {
    id: "sicak",
    label: "Sıcak",
    tokens: {
      colors: {
        bg: "#fdfaf6",
        fg: "#241c15",
        muted: "#6d5d4e",
        primary: "#c2410c",
        primaryFg: "#ffffff",
        border: "#e9ddd0",
      },
      font: { heading: "sourceSerif", body: "figtree" },
      scale: { h1: 65, h2: 33, h3: 21, body: 17 },
      radius: 14,
      spacing: "wide",
    },
  },
  {
    id: "koyu",
    label: "Koyu",
    tokens: {
      colors: {
        bg: "#0e1116",
        fg: "#f2f5f8",
        muted: "#98a3b0",
        primary: "#5b9cff",
        primaryFg: "#0e1116",
        border: "#242c36",
      },
      font: { heading: "spaceGrotesk", body: "inter" },
      scale: { h1: 61, h2: 31, h3: 20, body: 16 },
      radius: 10,
      spacing: "normal",
    },
  },
  {
    id: "kurumsal",
    label: "Kurumsal",
    tokens: {
      colors: {
        bg: "#ffffff",
        fg: "#0f1f33",
        muted: "#54677f",
        primary: "#12467f",
        primaryFg: "#ffffff",
        border: "#dbe3ec",
      },
      font: { heading: "manrope", body: "dmSans" },
      scale: { h1: 61, h2: 31, h3: 20, body: 16 },
      radius: 4,
      spacing: "compact",
    },
  },
];
