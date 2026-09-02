import assert from "node:assert/strict";
import test from "node:test";
import { bt } from "../.test-build/lib/block-text.js";

/**
 * Bloklardaki sabit metinler ekran okuyucuya gidiyor: yanlış dil sessizce
 * geçer, hiçbir build kırılmaz. Sözleşme buraya bağlandı.
 */

test("site diline göre seçer", () => {
  assert.equal(bt("en", "openMenu"), "Open menu");
  assert.equal(bt("tr", "openMenu"), "Menüyü aç");
});

test("bölgesel etiket birincil alt etikete düşer", () => {
  assert.equal(bt("tr-TR", "mainMenu"), "Ana menü");
  assert.equal(bt("EN-GB", "mainMenu"), "Main menu");
});

test("bilinmeyen dil ve eksik değer İngilizceye düşer", () => {
  assert.equal(bt("de", "closeMenu"), "Close menu");
  assert.equal(bt(undefined, "closeMenu"), "Close menu");
});

test("yer tutucu cümlenin içine giriyor, sonuna eklenmiyor", () => {
  // Sıra dilden dile değişiyor; sayıyı dizeye eklemek Türkçede bozardı.
  assert.equal(bt("en", "goToSlide", { n: 3 }), "Go to slide 3");
  assert.equal(bt("tr", "goToSlide", { n: 3 }), "3. slayta git");
  assert.equal(bt("en", "slideOfTotal", { n: 2, total: 5 }), "Slide 2 of 5");
  assert.equal(bt("tr", "slideOfTotal", { n: 2, total: 5 }), "5 slayttan 2.");
});

test("karşılığı olmayan yer tutucu olduğu gibi kalır", () => {
  assert.equal(bt("en", "goToSlide", { baska: 1 }), "Go to slide {n}");
});
