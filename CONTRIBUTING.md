# Katkı

## Kurulum

```bash
npm install
npm run dev
```

`npm run dev` ve `npm run build` öncesinde `scripts/bundle.mjs` otomatik koşar
ve `generated/` klasörünü üretir. Bu klasör versiyon kontrolünde değildir.

## Mimarinin tek kuralı

`blocks/` altındaki dosyalar Puck'tan **hiçbir şey** import etmez. Puck alan
tanımları `puck/` klasöründe durur ve zip'e gitmez. Bu ayrım bozulursa
"temiz çıktı" iddiası çöker — `npm run verify:export` bunu kontrol eder.

## Yeni blok eklerken

1. `blocks/<Grup>/<Ad>.tsx` — saf React, Puck importu yok
2. `puck/<ad>.config.ts` — sadece alan tanımları
3. `blocks/index.ts` kayıt defterine ekle
4. `puck/config.tsx` içindeki `components` ve `categories`'e ekle
5. `npm run thumbs` — çekmecedeki küçük resmi üretir

Blok kuralları `CLAUDE.md`'de, görsel kararlar `docs/DESIGN.md`'de.
Özetle: sabit renk yok (`var(--c-*)`), sabit padding yok (opsiyonel `padding`
prop'u ya da temadan gelen `--pad-section`), her blok `animation` alır ve
içeriğini `<Reveal>` ile sarar, görsellerde `alt` zorunlu.

Paylaşılan bir `lib/` dosyası eklerseniz `scripts/bundle.mjs` ve
`lib/export-core.mjs` içindeki listelere de ekleyin — unutursanız paketleyici
hata verir, zip sessizce bozulmaz.

Blok yeni bir npm paketi kullanırsa paketleyici bunu kendisi bulur ve o paket
**yalnızca** o blok kullanıldığında çıktının `package.json`'ına girer.

## Küçük resimler

```bash
npm run thumbs
```

Her bloğu `/thumb/<Blok>` rotasında izole render eder, 320x200 WebP olarak
`public/thumbs/` altına yazar. Ekran görüntüsü elle alınmaz; görselin blokla
uyumsuz kalması mümkün olmasın diye tek kaynak bu komut. Örnek içerik
demolardan seçilir (`lib/thumb-samples.ts`), yani küçük resim gerçekten
üretilebilecek bir sonucu gösterir.

Sistemdeki Chrome kullanılır — yeni npm paketi yok. Başka bir yol için
`CHROME_PATH=/yol/chrome npm run thumbs`. Üretim sunucusu gerekir; betik
gerekirse `next build`'i kendisi çalıştırır.

## Testler

```bash
npm run typecheck
npm run verify:export                      # varsayılan demo
npm run verify:export data/demos/bahce.json  # belirli bir site
```

`verify:export` zip üretir, geçici klasöre açar, `npm i` ve `npm run build`
koşar; build hata **veya uyarı** verirse çıkış kodu 1. Ayrıca şunları
doğrular: studio bağımlılıkları sızmamış, kullanılmayan bloklar ve
bağımlılıklar çıktıda yok, tüm metin JS'siz HTML'de, fontlar kendi alanından
servis ediliyor, `prefers-reduced-motion` ve `scripting: none` korumaları
yerinde, client bileşenleri beklenen kümede (yalnızca Carousel, o da kullanılırsa).

## Pull request

`npm run typecheck` ve `npm run verify:export` yeşil olsun. Görsel değişiklik
yaptıysanız 375 / 768 / 1280 ekran görüntüsü ekleyin.
