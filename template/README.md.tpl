# {{title}}

Bu bir Next.js projesidir. Hiçbir site kurucusuna bağlı değildir —
`node_modules` dışında dosyaların hepsi sizindir, elle düzenleyebilirsiniz.

## Çalıştırma

```bash
npm install
npm run dev
```

Yayın derlemesi:

```bash
npm run build
npm start
```

## Yapı

```
app/
  layout.tsx     JSON-LD, <html lang>, global stiller
  page.tsx       metadata + sayfa render'ı
  globals.css    Tailwind + animasyon CSS'i
  tokens.css     renk/tipografi değişkenleri
  sitemap.ts     yayın adresinizi buraya yazın
  robots.ts      yayın adresinizi buraya yazın
blocks/          sayfada kullanılan bloklar
lib/             resp(), Reveal, render
content/
  page.json      SAYFANIN İÇERİĞİ — metinleri buradan düzenleyin
```

## Bu sitedeki bloklar

{{blockList}}

Her blok `blocks/` altında tek bir dosya; Kiln'e ait hiçbir şey içermez,
doğrudan düzenleyebilir ya da silebilirsiniz.

## İçeriği değiştirmek

Metinler, görseller ve boşluklar `content/page.json` içindedir.
Dosyayı düzenleyip kaydedin, `npm run dev` açıksa sayfa kendini yeniler.

## Renkleri değiştirmek

`app/tokens.css`. Bloklar sabit renk içermez, hepsi bu değişkenleri okur.

## Boşluk ölçeği

Boşluklar sabit bir ölçekten seçilir: 0, 4, 8, 12, 16, 24, 32, 48, 64, 96.
`page.json` içinde bu ölçeğin dışında bir değer yazarsanız en yakın basamağa
yuvarlanır ve development modunda konsola uyarı düşer.

Yeni bir boşluk değeri kullanacaksanız `app/globals.css` içindeki
`@source inline(...)` satırına da eklemeniz gerekir — yoksa Tailwind o
sınıfı üretmez.

## Notlar

- Yayın adresi tek yerde: `.env.example` dosyasını `.env.local` olarak
  kopyalayıp `NEXT_PUBLIC_SITE_URL` değerini değiştirin. `sitemap.ts`,
  `robots.ts` ve sosyal medya adresleri oradan okur.
- Sosyal medya kartı `app/opengraph-image.tsx` içinde build sırasında
  üretilir. Kendi görselinizi kullanmak isterseniz o dosyayı silip
  `content/page.json` içindeki `meta.ogImage` alanını doldurun.
- Site ikonu `app/icon.svg` ve `app/apple-icon.svg`. Eski Safari sürümleri
  SVG dokunma ikonunu yok sayar; PNG isterseniz aynı adla değiştirin.
