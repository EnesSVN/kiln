import assert from "node:assert/strict";
import test from "node:test";
import { resp } from "../.test-build/lib/responsive.js";

/**
 * resp() sistemin kalbi: JSON'daki sayı Tailwind sınıfına burada dönüyor.
 * Yanlış yuvarlama sessizce yanlış boşluk üretir — build kırılmaz, sayfa
 * bozulur. Bu yüzden yuvarlama davranışı teste bağlandı.
 */

test("tek sayı tek sınıf üretir", () => {
  assert.equal(resp(16, "p"), "p-4");
  assert.equal(resp(0, "p"), "p-0");
});

test("kırılım noktaları md/lg önekiyle çıkar", () => {
  assert.equal(resp({ base: 16, md: 32, lg: 96 }, "p"), "p-4 md:p-8 lg:p-24");
});

test("eksik kırılım noktası sınıf üretmez", () => {
  assert.equal(resp({ base: 24 }, "gap"), "gap-6");
  assert.equal(resp({ base: 24, lg: 48 }, "gap"), "gap-6 lg:gap-12");
});

test("ölçek dışı değer en yakın basamağa yuvarlanır", () => {
  // SCALE: 0 4 8 12 16 24 32 48 64 96
  assert.equal(resp(17, "p"), "p-4", "17 -> 16");
  // 20 iki basamağa da eşit uzaklıkta; reduce ilk bulduğu kalıyor (16).
  assert.equal(resp(20, "p"), "p-4", "20 -> 16");
  assert.equal(resp(1000, "p"), "p-24", "sınırın üstü en büyük basamağa");
  assert.equal(resp(-5, "p"), "p-0", "negatif en küçük basamağa");
});

test("undefined sınıf üretmez", () => {
  assert.equal(resp(undefined, "p"), "");
});

test("prefix her basamağa uygulanır", () => {
  assert.equal(resp({ base: 8, md: 8 }, "gap-x"), "gap-x-2 md:gap-x-2");
});
