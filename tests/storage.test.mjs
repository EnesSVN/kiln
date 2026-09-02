import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";

/**
 * storage.ts tarayıcı API'sine bağlı. Gerçek bir localStorage taklidi kurup
 * modülü ondan sonra import ediyoruz — modül yüklenirken window'a bakıyor.
 *
 * Buradaki asıl hedef GEÇİŞ (migration): v1'de kayıtlar site BAŞLIĞIYLA
 * anahtarlıydı, v2'de id ile. Geçiş bir kez çalışıyor ve yanlış çalışırsa
 * kullanıcının kayıtlı siteleri görünmez oluyor.
 */

class SahteDepo {
  constructor() {
    this.map = new Map();
    this.kota = Infinity;
  }
  getItem(k) {
    return this.map.has(k) ? this.map.get(k) : null;
  }
  setItem(k, v) {
    const s = String(v);
    if (s.length > this.kota) {
      const e = new Error("quota");
      e.name = "QuotaExceededError";
      throw Object.assign(e, { code: 22 });
    }
    this.map.set(k, s);
  }
  removeItem(k) {
    this.map.delete(k);
  }
}

let depo;
let storage;

beforeEach(async () => {
  depo = new SahteDepo();
  globalThis.window = { localStorage: depo };
  globalThis.crypto ??= { randomUUID: () => "uuid-" + Math.random().toString(16).slice(2) };
  // DOMException Node'da global; kota testinde kullanılıyor.
  storage = await import(`../.test-build/lib/storage.js?t=${Math.random()}`);
});

const site = (id, baslik) => ({
  id,
  version: 1,
  meta: { title: baslik, description: "d", lang: "tr" },
  tokens: {
    colors: { bg: "#fff", fg: "#000", muted: "#666", primary: "#000", primaryFg: "#fff", border: "#eee" },
    font: { heading: "inter", body: "inter" },
    scale: { h1: 65, h2: 33, h3: 21, body: 17 },
    radius: 8,
    spacing: "normal",
  },
  nodes: [],
});

test("kaydedilen site geri okunuyor", () => {
  const s = site("a1", "Deneme");
  assert.deepEqual(storage.saveSite(s), { ok: true });
  assert.equal(storage.loadSite()?.id, "a1");
});

test("listSites id ve başlık veriyor", () => {
  storage.saveSite(site("a1", "Bir"));
  storage.saveSite(site("a2", "İki"));
  const liste = storage.listSites().sort((x, y) => x.id.localeCompare(y.id));
  assert.deepEqual(liste, [
    { id: "a1", title: "Bir" },
    { id: "a2", title: "İki" },
  ]);
});

test("başlıksız kayıt boş başlıkla dönüyor — çeviriyi çağıran yapar", () => {
  // "Adsız site" burada üretiliyordu; depo katmanı arayüz dilini bilmiyor.
  depo.map.set("kiln:schema", "2");
  depo.map.set("kiln:sites", JSON.stringify({ x: { id: "x", meta: {} } }));
  assert.deepEqual(storage.listSites(), [{ id: "x", title: "" }]);
});

test("GEÇİŞ: başlıkla anahtarlı eski kayıtlar id'ye taşınıyor", () => {
  // v1 düzeni: anahtar = başlık, site.id yok
  depo.map.set(
    "kiln:sites",
    JSON.stringify({ "Eski Site": { meta: { title: "Eski Site" }, nodes: [] } }),
  );
  depo.map.set("kiln:current", "Eski Site");

  const liste = storage.listSites();
  assert.equal(liste.length, 1);
  assert.notEqual(liste[0].id, "Eski Site", "anahtar artık başlık değil");
  assert.equal(liste[0].title, "Eski Site", "başlık korunmuş");
  assert.equal(depo.getItem("kiln:schema"), "2", "şema sürümü işaretlendi");
  assert.equal(depo.getItem("kiln:current"), liste[0].id, "geçerli kayıt yeni id'ye çevrildi");
});

test("GEÇİŞ bir kez çalışır, ikinci okumada veri bozulmaz", () => {
  depo.map.set("kiln:sites", JSON.stringify({ "Eski": { meta: { title: "Eski" }, nodes: [] } }));
  const ilk = storage.listSites();
  const ikinci = storage.listSites();
  assert.deepEqual(ilk, ikinci);
});

test("bozuk JSON kullanıcıyı kilitlemiyor", () => {
  depo.map.set("kiln:sites", "{bu json değil");
  assert.deepEqual(storage.listSites(), []);
  assert.equal(storage.loadSite(), null);
});

test("şemadan geçmeyen kayıt null dönüyor ama SESSİZ düşmüyor", () => {
  depo.map.set("kiln:schema", "2");
  depo.map.set("kiln:sites", JSON.stringify({ k: { id: "k", nodes: "dizi değil" } }));
  depo.map.set("kiln:current", "k");
  assert.equal(storage.loadSite(), null);
  // Sessizce düşüyordu: kullanıcı sayfasını kaybettiğini sanıyordu, oysa
  // bayt hâlâ depodaydı. Ham veri geri dönüyor ki indirilebilsin.
  const bozuk = storage.bozukKayit();
  assert.ok(bozuk, "bozuk kayıt bildirilmeli");
  assert.equal(bozuk.ham.id, "k");
  assert.ok(bozuk.sorunlar.length > 0, "gerekçe olmalı");
});

test("sağlam kayıt okunduğunda bozukKayit() temizleniyor", () => {
  depo.map.set("kiln:schema", "2");
  storage.saveSite(site("a1", "Deneme"));
  assert.ok(storage.loadSite());
  assert.equal(storage.bozukKayit(), null);
});

test("kota dolunca ok:false ve çeviri anahtarı dönüyor", () => {
  depo.kota = 10;
  const sonuc = storage.saveSite(site("a1", "Deneme"));
  assert.equal(sonuc.ok, false);
  // Metin değil anahtar: mesaj sabit Türkçeydi, İngilizce arayüzde de
  // Türkçe çıkıyordu. Çeviri çağıranın işi.
  assert.equal(sonuc.hata.anahtar, "storageQuota");
  assert.match(sonuc.hata.veri.mb, /^\d+\.\d$/);
});

test("dil tercihi ayrı anahtarda tutuluyor", () => {
  storage.saveLang("tr");
  assert.equal(storage.loadLang(), "tr");
  assert.equal(depo.getItem("kiln:sites"), null, "dil site verisine karışmıyor");
});
