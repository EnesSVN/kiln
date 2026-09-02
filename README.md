# Kiln

Sürükle bırak, elle yazılmış gibi görünen bir Next.js repo'su indir.

![Kiln editörü](docs/demo.gif)
<!-- TODO: /edit ekranında blok sürükleme + tema değiştirme + Projeyi indir
     akışını gösteren ~15 saniyelik GIF. docs/demo.gif olarak koy. -->

**Canlı demo:** https://kiln.dev <!-- TODO: Vercel adresiyle değiştir -->

```bash
npm install
npm run dev
```

`/` landing · `/edit` editör · `/preview/kepenk` demo siteler

---

## Neden

Site kurucuları çalışan siteler üretir ama çıktıları kendilerine aittir:
runtime, gömülü sınıf isimleri, kilitli şablonlar. Kiln'in çıktısında Kiln
yoktur.

> **The files you download are the exact files the studio runs.
> No transformation, no codegen, byte-for-byte.**

Bu bir slogan değil, test edilen bir iddia. `scripts/verify-export.mjs`
her koşuda zip'i açıp indirilen `blocks/**` ve `lib/**` dosyalarını studio'daki
kaynaklarla karşılaştırır; ayrıca `npm i && npm run build` çalıştırıp build'in
**uyarısız** geçtiğini doğrular:

```bash
npm run verify:export
```

## Mimari

```
                 ┌──────────────┐
                 │  blocks/     │  saf React. Puck'tan HİÇBİR ŞEY import etmez.
                 │  lib/        │  resp(), Reveal, SplitText, render
                 └──────┬───────┘
                        │ aynı dosyalar, iki yöne
          ┌─────────────┴─────────────┐
          ▼                           ▼
   ┌─────────────┐            ┌───────────────┐
   │  puck/      │            │  template/    │  .tpl iskelet
   │  alan       │            │  package.json │
   │  tanımları  │            │  layout/page  │
   └──────┬──────┘            └───────┬───────┘
          │ ZIP'E GİTMEZ              │
          ▼                           ▼
     ┌─────────┐   site.json    ┌───────────┐
     │  /edit  │ ─────────────► │ lib/export│ ──► site.zip
     │  Puck   │                │  + jszip  │
     └─────────┘                └───────────┘
          │                           │
          ▼                           ▼
    localStorage              npm i && npm run dev
```

Veri akışı:

```
[edit]     Puck → onChange → Site → localStorage (500ms debounce)
[preview]  data/demos/*.json → generateStaticParams → SSR
[export]   generated/files.ts + Site → JSZip → Blob → indir
```

Sunucu yok. API route yok. Veritabanı yok.

## Ne var

- **15 blok** — 3 header, 3 hero, hizmetler, özellikler, galeri, carousel,
  referanslar, SSS, CTA, iletişim, footer
- **Şemadan responsive** — `{base, md, lg}` yazarsınız, media query değil.
  Ölçek sabit; keyfi değer Tailwind'in derlemediği sınıf üretmesin diye
  en yakın basamağa yuvarlanır ve development'ta uyarı basar.
- **Tema paneli** — 6 renk, 2 font (next/font, CDN değil), 4 tipografi
  boyutu, radius, yoğunluk. Dört hazır tema.
- **0 KB animasyon** — scroll reveal ve kelime kelime beliren başlıklar
  saf CSS geçişiyle. Animasyon için **client bileşeni yok**: `Reveal` ve
  `SplitText` sunucuda çalışır, görünürlük tetiği `<body>` sonundaki ~15
  satırlık satır içi script. Ham HTML'de başlık kesintisiz durur.
- **Görsel yükleme** — dosya seçin ya da alana sürükleyin; tarayıcıda
  1600px'e küçültülüp WebP'ye çevrilir. Studio'da site JSON'una gömülür,
  **indirdiğiniz repoda `public/images/` altında gerçek dosyadır** —
  çıktıda base64 yoktur (`verify:export` bunu denetler).
- **Temiz export** — sadece kullandığınız bloklar, sadece kullandığınız
  npm paketleri, kullandığınız boşluk sınıfları kadar `@source inline`.

## Ne yok (v1)

Bilerek yok, sonra eklenecek diye değil — v1'in sınırı bu:

- Kullanıcı hesabı, oturum, sunucu, veritabanı
- Çoklu sayfa (tek sayfa siteler)
- CMS / koleksiyon / dinamik içerik
- Görsel yükleme — URL yapıştırırsınız
- Özel JavaScript, özel CSS, iç içe kolon editörü
- Çoklu dil, AI, tema marketi

## Belgeler

- [docs/DESIGN.md](docs/DESIGN.md) — görsel kararlar: tipografi ölçeği,
  boşluk ritmi, kart ve görsel tercihleri. Bloklar buna göre yazıldı.
- [CONTRIBUTING.md](CONTRIBUTING.md) — kurulum, yeni blok ekleme, testler
- [CHANGELOG.md](CHANGELOG.md) — sürüm notları

## Lisans

MIT — `LICENSE`. Katkı için `CONTRIBUTING.md`.

## Notlar

**Fontlar preload edilmiyor.** Tema paneli sekiz font sunduğu için hepsini
preload etmek her sayfaya ~450 KB bağlıyordu ve LCP'yi 5.6 sn'ye çıkarıyordu.
Artık fontlar CSS onlara başvurunca yükleniyor (`display: swap`). İndirilen
sitede bu sorun yok: orada yalnızca seçtiğiniz iki font tanımlanır.

**Build ağ ister.** `next/font/google` fontları derleme sırasında indirir;
ilk build'den sonra `.next/cache` devreye girer. Çevrimdışı ortamda hem
studio hem export build'i düşer.

**Vercel:** ek ayar gerekmez. `npm run build` yeterli — `prebuild` paketleyiciyi
kendi çalıştırır. Build makinesinin `fonts.googleapis.com`'a erişmesi gerekir
(Vercel'de varsayılan olarak erişir).
