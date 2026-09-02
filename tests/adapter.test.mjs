import assert from "node:assert/strict";
import test from "node:test";
import { puckDataToSite, siteToPuckData } from "../.test-build/puck/adapter.js";

/**
 * Adapter, çıktı JSON'unu Puck'a bağlamayan sınır.
 *
 * Site : { id, type, props }        — id props'un DIŞINDA
 * Puck : { type, props: { ...props, id } }
 *
 * Gidiş-dönüşte kayıp olursa kullanıcının içeriği sessizce değişir; testin
 * asıl işi bu.
 */

const site = {
  id: "site-1",
  version: 1,
  meta: { title: "Başlık", description: "açıklama", lang: "tr" },
  tokens: { radius: 8, spacing: "normal" },
  nodes: [
    { id: "n1", type: "HeaderMinimal", props: { logo: "Kiln", links: [{ label: "A", href: "#a" }] } },
    { id: "n2", type: "HeroSplit", props: { title: "Merhaba", image: { src: "/a.svg", alt: "a" } } },
  ],
};

test("gidiş-dönüş içeriği aynen koruyor", () => {
  const geri = puckDataToSite(siteToPuckData(site), site);
  assert.deepEqual(geri.nodes, site.nodes);
});

test("meta ve tokens Puck'a girmiyor ama kayboluyor da değil", () => {
  const data = siteToPuckData(site);
  const dizi = JSON.stringify(data);
  assert.ok(!dizi.includes("açıklama"), "meta Puck verisine sızmamalı");
  const geri = puckDataToSite(data, site);
  assert.deepEqual(geri.meta, site.meta);
  assert.deepEqual(geri.tokens, site.tokens);
  assert.equal(geri.id, site.id);
});

test("id props'un içine girip dönüşte çıkıyor", () => {
  const data = siteToPuckData(site);
  assert.equal(data.content[0].props.id, "n1");
  const geri = puckDataToSite(data, site);
  assert.equal(geri.nodes[0].id, "n1");
  assert.ok(!("id" in geri.nodes[0].props), "id props içinde kalmamalı");
});

test("kök props Puck'ta boş — sahte başlık alanı yok", () => {
  assert.deepEqual(siteToPuckData(site).root, { props: {} });
});

test("id'siz gelen blok tipten türetilmiş kimlik alıyor", () => {
  const data = { root: { props: {} }, content: [{ type: "CTA", props: { title: "x" } }], zones: {} };
  const geri = puckDataToSite(data, site);
  assert.equal(geri.nodes[0].id, "CTA-0");
});

test("boş içerik boş node listesi veriyor", () => {
  const geri = puckDataToSite({ root: { props: {} }, content: [], zones: {} }, site);
  assert.deepEqual(geri.nodes, []);
});
