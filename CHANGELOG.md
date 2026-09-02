# Değişiklik günlüğü

Sürüm notları fazların dökümü değil; her madde kullanıcının gördüğü bir
değişiklik. Tarihler yayın değil geliştirme tarihleri.

## v1.0 — 2026-08

İlk sürüm. Sürükle-bırak ile site kurulur, çıktısı Kiln'e ait tek satır
içermeyen bir Next.js repo'sudur.

### Editör
- 15 blok: 3 başlık, 3 hero, hizmetler, özellikler, galeri, carousel,
  referanslar, SSS, CTA, iletişim, alt bilgi
- Tuvalde doğrudan yazma (metin ve açıklama alanları)
- Tema paneli: 6 renk, 2 font, 4 tipografi boyutu, köşe yuvarlaklığı,
  boşluk yoğunluğu. Dört hazır tema
- Animasyon paneli: tür, süre, gecikme, tetikleyici, kelime/harf bölme
- Görsel yükleme: sürükle-bırak, tarayıcıda 400/800/1600 üretimi ve
  WebP dönüşümü
- Site seçici: aynı tarayıcıda birden çok site, yeniden adlandırma, silme
- Blok kilitleme
- Kaydetme göstergesi ve ⌘S; sekme kapanırken bekleyen kayıt yazılır
- İkinci sekme uyarısı
- Arayüz İngilizce ve Türkçe

### Çıktı
- Yalnızca kullanılan bloklar ve yalnızca kullanılan npm paketleri
- `content/page.json` — tüm içerik tek dosyada
- `app/tokens.css` — renk ve tipografi değişkenleri
- JSON-LD LocalBusiness, sitemap, robots, manifest, site ikonu
- Sosyal medya kartı build sırasında üretilir (`next/og`)
- Yayın adresi tek yerde: `NEXT_PUBLIC_SITE_URL`
- Yüklenen görseller `public/images/` altına gerçek dosya olarak yazılır;
  çıktıda base64 yoktur

### Kalite
- `npm run verify:export` — zip'i açar, `npm install` ve `npm run build`
  çalıştırır, uyarı çıkarsa başarısız olur
- `npm test` — 29 birim test (node:test, ek bağımlılık yok)
- `npm run i18n:check` — çevirisi eksik etiket kalmadığını doğrular
- `npm run thumbs` — çekmecedeki blok küçük resimlerini üretir

### Bilinen sınırlar
- Tek sayfa siteler (çoklu sayfa yok)
- Depolama tarayıcıda: `localStorage`. Sunucu, hesap ve veritabanı yok
- Apple dokunma ikonu SVG; eski Safari sürümleri yok sayar
