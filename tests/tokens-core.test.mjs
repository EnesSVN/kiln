import assert from "node:assert/strict";
import test from "node:test";
import { DENSITY, densityOf, fluid, mixHex, tokenVars } from "../lib/tokens-core.mjs";

/**
 * tokens-core studio ile export'un ORTAK hesap motoru. Buradaki bir kayma
 * önizleme ile indirilen sitenin farklı görünmesi demek — sessiz ve
 * yakalanması zor bir hata sınıfı.
 */

test("mixHex iki ucu doğru veriyor", () => {
  assert.equal(mixHex("#000000", "#ffffff", 0), "#ffffff");
  assert.equal(mixHex("#000000", "#ffffff", 1), "#000000");
});

test("mixHex %3 karışım — yüzey rengi", () => {
  // Açık temada yüzey hafif koyulaşır, koyu temada hafif açılır: tek formül.
  assert.equal(mixHex("#14181d", "#ffffff", 0.03), "#f8f8f8");
  assert.equal(mixHex("#ffffff", "#14181d", 0.03), "#1b1f24");
});

test("mixHex kısa hex ve # olmadan da çalışır", () => {
  assert.equal(mixHex("#000", "#fff", 0), "#ffffff");
});

test("fluid clamp üretir ve üst sınır token'ın kendisi", () => {
  assert.equal(fluid(65), "clamp(40px, 6.35vw, 65px)");
  assert.equal(fluid(17, 0.94), "clamp(16px, 1.66vw, 17px)");
});

test("yoğunluk oranları sırayla artıyor", () => {
  // Bölüm arası boşluk (2 x section), blok içi boşluktan (spaceLg) belirgin
  // ayrılmalı — ve Kompakt < Normal < Geniş olmalı.
  const oran = (d) => [d.section.base, d.section.md, d.section.lg].map((s) => (2 * s) / d.spaceLg);
  const k = oran(DENSITY.compact);
  const n = oran(DENSITY.normal);
  const g = oran(DENSITY.wide);
  for (let i = 0; i < 3; i++) {
    assert.ok(k[i] < n[i], `kırılım ${i}: kompakt(${k[i]}) < normal(${n[i]})`);
    assert.ok(n[i] < g[i], `kırılım ${i}: normal(${n[i]}) < geniş(${g[i]})`);
  }
});

test("masaüstünde üç yoğunluk farklı padding veriyor", () => {
  const lg = new Set([DENSITY.compact, DENSITY.normal, DENSITY.wide].map((d) => d.section.lg));
  assert.equal(lg.size, 3, "lg'de üç yoğunluk da ayrı değer üretmeli");
});

test("densityOf bilinmeyen değerde normal'e düşer", () => {
  assert.equal(densityOf("wide"), DENSITY.wide);
  assert.equal(densityOf("bilinmeyen"), DENSITY.normal);
  assert.equal(densityOf(undefined), DENSITY.normal);
});

test("tokenVars tipografi merdivenini 1.25 oranında kuruyor", () => {
  const t = {
    colors: { bg: "#ffffff", fg: "#14181d", muted: "#5c6672", primary: "#000", primaryFg: "#fff", border: "#eee" },
    font: { heading: "inter", body: "inter" },
    scale: { h1: 65, h2: 33, h3: 21, body: 17 },
    radius: 8,
    spacing: "normal",
  };
  const v = tokenVars(t);
  const ust = (s) => Number(/,\s*([\d.]+)px\)$/.exec(s)[1]);
  assert.equal(ust(v["--fs-h1"]), 65);
  assert.equal(ust(v["--fs-h2"]), 33);
  assert.equal(ust(v["--fs-h3"]), 21);
  assert.equal(ust(v["--fs-body"]), 17);
  assert.equal(v["--c-surface"], "#f8f8f8");
});
