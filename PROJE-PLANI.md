# Proje Planı — Görsel Site Kurucu → Gerçek Next.js Çıktısı

**Sahibi:** Enes Seven
**Amaç:** Teknik itibar. Gelir hedefi yok.
**Süre:** ~16 hafta (yarım zamanlı), lansman dahil.

---

## 1. Konumlandırma

### Tek cümle

> Sürükle-bırak ile site kur, elle yazılmış gibi görünen bir Next.js repo'su indir.

### Kime

| Kitle                                  | Neden umursar                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Birincil: freelancer / küçük ajans** | Kepenkçiye site yapıyor, her seferinde sıfırdan başlamak istemiyor, çıktının kendi repo'su olmasını istiyor |
| **İkincil: küçük işletme sahibi**      | Ajansın kurduğu siteyi kısıtlı panelden kendi güncelliyor                                                   |
| **Üçüncül: HN / Reddit okuru**         | Ürünü kullanmayacak ama mimariyi ilginç bulacak — asıl PR kitlen bu                                         |

Kepenkçiyi doğrudan hedefleme. O müşteri değil, **ajansın müşterisi.**

### Farklılaşma — üç iddia

1. **Çıktı gerçekten temiz.** İndirilen repo'da builder'a ait tek satır yok.
2. **Şemadan responsive.** Kullanıcı media query görmüyor, `{base, md, lg}` yazıyor.
3. **0 KB animasyon.** Scroll reveal, yazı animasyonu — Framer Motion yok, saf CSS.

Üçünün de ölçülebilir kanıtı var. Pazarlama bunun üstüne kurulacak.

### İsim

Kriterler: 5-7 harf, İngilizce telaffuz edilebilir, "builder/site/web" içermesin, `.dev` alınabilir olsun.

Aday: **Zemin** · **Katman** · **Stak** · **Blokk** · **Kesit**

Karar verirken npm + GitHub + domain'i aynı gün kontrol et.

---

## 2. Karar Özeti

| Konu         | v1 kararı                   | Gerekçe                                 |
| ------------ | --------------------------- | --------------------------------------- |
| Framework    | Next.js 16, App Router      | Hem studio hem çıktı                    |
| Dil          | TypeScript strict           | Şema doğruluğu kritik                   |
| Stil         | Tailwind + CSS değişkenleri | Token sistemi CSS değişkenlerinden      |
| Editör       | `@puckeditor/core`          | Sürükle-bırak motoru yazmak boşa iş     |
| Doğrulama    | zod                         | Şema tek doğruluk kaynağı               |
| Zip          | jszip (tarayıcıda)          | Backend gerekmesin                      |
| Depolama     | localStorage + JSON dosya   | Veritabanı v1'de yok                    |
| Backend      | **Yok**                     | API route yok, auth yok                 |
| Animasyon    | Kendi CSS sistemi           | Framer Motion performans tezini çürütür |
| Sayfa sayısı | **Tek sayfa**               | Çoklu sayfa v2                          |
| Lisans       | MIT                         | Kullanım istiyorsun, engel değil        |
| Deploy       | Vercel (statik)             | Studio'nun kendisi statik çalışabilir   |

**v1'de olmayacaklar:** kullanıcı hesabı, veritabanı, çoklu sayfa, CMS/koleksiyon, custom JavaScript, görsel yükleme (URL yapıştırılır), iç içe layout/kolon editörü, çoklu dil, AI.

---

## 3. Sistem Mimarisi

### Klasör yapısı

```
zemin/
├─ app/
│  ├─ page.tsx                    # landing (lansman için)
│  ├─ edit/page.tsx               # editör — "use client"
│  └─ preview/page.tsx            # server component önizleme
│
├─ blocks/                        # ⚠️ Puck'tan HİÇBİR ŞEY import etmez
│  ├─ Header/
│  │  ├─ HeaderMinimal.tsx
│  │  ├─ HeaderCentered.tsx
│  │  └─ HeaderSplit.tsx
│  ├─ Hero/ Services/ Gallery/ Carousel/ ...
│  └─ index.ts                    # registry: { HeaderMinimal, Hero, ... }
│
├─ puck/                          # ⚠️ ZIP'E GİTMEZ
│  ├─ header.config.ts            # sadece alan tanımları
│  ├─ hero.config.ts
│  └─ config.ts                   # hepsini birleştirir
│
├─ lib/
│  ├─ schema.ts                   # zod şemaları + TS tipleri
│  ├─ responsive.ts               # resp() — tüm sistemin kalbi
│  ├─ tokens.ts                   # token → CSS değişkeni
│  ├─ Reveal.tsx                  # animasyon sarmalayıcı
│  ├─ render.tsx                  # 15 satırlık renderer
│  ├─ storage.ts                  # loadSite/saveSite/listSites
│  └─ export.ts                   # zip üretimi
│
├─ template/                      # çıktı iskeleti (.tpl uzantılı)
│  ├─ package.json.tpl
│  ├─ next.config.mjs.tpl
│  ├─ tailwind.config.ts.tpl
│  ├─ app/layout.tsx.tpl
│  ├─ app/page.tsx.tpl
│  ├─ app/sitemap.ts.tpl
│  ├─ app/robots.ts.tpl
│  └─ README.md.tpl
│
├─ generated/
│  └─ files.ts                    # prebuild ile üretilir (dosyalar string olarak)
│
└─ scripts/
   └─ bundle.mjs                  # blocks/ + lib/ + template/ → generated/files.ts
```

### Veri akışı

```
[edit]  Puck → onChange → setState → localStorage (debounce 500ms)
[preview] localStorage → parse → <Render nodes /> → SSR HTML
[export] generated/files.ts + site.json → JSZip → Blob → <a download>
```

Sunucu yok. Studio `next build && next export` ile statik deploy edilebilir.

### Kritik ayrım

`blocks/Hero.tsx` saf React'tir, Puck bilmez:

```tsx
// blocks/Hero/HeroSplit.tsx  → ZIP'E GİDER
import { resp } from "@/lib/responsive";
import { Reveal } from "@/lib/Reveal";

export function HeroSplit({
  title,
  subtitle,
  image,
  padding,
  animation,
}: HeroSplitProps) {
  return (
    <section className={`grid md:grid-cols-2 gap-8 ${resp(padding, "p")}`}>
      <Reveal anim={animation}>
        <h1 className="text-[var(--fs-h1)] text-[var(--c-fg)]">{title}</h1>
        <p className="text-[var(--c-muted)]">{subtitle}</p>
      </Reveal>
      <img src={image.src} alt={image.alt} loading="lazy" />
    </section>
  );
}
```

```ts
// puck/hero.config.ts  → ZIP'E GİTMEZ
import { HeroSplit } from "@/blocks/Hero/HeroSplit";

export const heroSplitConfig = {
  label: "Hero — Bölünmüş",
  fields: {
    title: { type: "text" },
    subtitle: { type: "textarea" },
    image: {
      type: "object",
      objectFields: { src: { type: "text" }, alt: { type: "text" } },
    },
    padding: { type: "custom", render: ResponsiveNumberField },
    animation: { type: "custom", render: AnimationField },
  },
  defaultProps: {
    /* ... */
  },
  render: HeroSplit,
};
```

Bu ayrım **projenin en önemli kuralı.** Bozarsan "temiz çıktı" iddiası çöker.

---

## 4. Şema

```ts
// lib/schema.ts
import { z } from "zod";

export type Responsive<T> = T | { base: T; md?: T; lg?: T };

export const Animation = z.object({
  type: z.enum(["none", "fade", "slide-up", "slide-left", "scale", "blur"]),
  duration: z.number().min(0).max(2000).default(500),
  delay: z.number().min(0).max(2000).default(0),
  trigger: z.enum(["load", "scroll"]).default("scroll"),
  once: z.boolean().default(true),
  splitBy: z.enum(["none", "word", "char"]).default("none"),
  stagger: z.number().min(0).max(200).default(40),
});

export const Tokens = z.object({
  colors: z.object({
    bg: z.string(),
    fg: z.string(),
    muted: z.string(),
    primary: z.string(),
    primaryFg: z.string(),
    border: z.string(),
  }),
  font: z.object({ heading: z.string(), body: z.string() }),
  scale: z.object({
    h1: z.number(),
    h2: z.number(),
    h3: z.number(),
    body: z.number(),
  }),
  radius: z.number(),
  spacing: z.number(),
});

export const Node = z.object({
  id: z.string(),
  type: z.string(), // "HeroSplit"
  props: z.record(z.unknown()),
});

export const Site = z.object({
  version: z.literal(1),
  meta: z.object({
    title: z.string().max(60),
    description: z.string().max(160),
    ogImage: z.string().optional(),
    lang: z.string().default("tr"),
    business: z
      .object({
        // JSON-LD LocalBusiness için
        name: z.string(),
        phone: z.string().optional(),
        address: z.string().optional(),
        geo: z.tuple([z.number(), z.number()]).optional(),
      })
      .optional(),
  }),
  tokens: Tokens,
  nodes: z.array(Node),
});
```

### resp() — sistemin kalbi

```ts
// lib/responsive.ts
const SCALE: Record<number, string> = {
  0: "0",
  4: "1",
  8: "2",
  12: "3",
  16: "4",
  24: "6",
  32: "8",
  48: "12",
  64: "16",
  96: "24",
};

export function resp<T extends number>(
  v: Responsive<T>,
  prefix: string,
): string {
  if (typeof v === "number") return `${prefix}-${SCALE[v] ?? v}`;
  return [
    v.base !== undefined && `${prefix}-${SCALE[v.base]}`,
    v.md !== undefined && `md:${prefix}-${SCALE[v.md]}`,
    v.lg !== undefined && `lg:${prefix}-${SCALE[v.lg]}`,
  ]
    .filter(Boolean)
    .join(" ");
}
```

Sabit ölçek şart — keyfi değer `p-[37px]` üretir, Tailwind JIT çıktıda derlemez.

### Renderer

```tsx
// lib/render.tsx
import * as B from "@/blocks";

export function Render({ nodes }: { nodes: Node[] }) {
  return (
    <>
      {nodes.map((n) => {
        const C = (B as any)[n.type];
        return C ? <C key={n.id} {...n.props} /> : null;
      })}
    </>
  );
}
```

Bu dosya hem studio önizlemesinde hem indirilen repo'da aynen çalışır.

---

## 5. Blok Kütüphanesi

**15 blok. Sayı değil, kalite belirleyici.** Projeyi öldürecek şey mimari değil, çirkin bloklar.

| #   | Blok        | Varyant                                    |
| --- | ----------- | ------------------------------------------ |
| 1-3 | Header      | Minimal · Ortalanmış · Bölünmüş (CTA'lı)   |
| 4-6 | Hero        | Bölünmüş · Tam ekran görsel · Metin odaklı |
| 7   | Hizmetler   | 3'lü / 4'lü ikon kart grid                 |
| 8   | Özellikler  | Sıralı metin + görsel şeritleri            |
| 9   | Galeri      | Masonry / eşit grid                        |
| 10  | Carousel    | Embla tabanlı, otomatik oynatma opsiyonlu  |
| 11  | Referanslar | Alıntı kartları                            |
| 12  | SSS         | Accordion (`<details>` — JS'siz)           |
| 13  | CTA bandı   | Tek satır + buton                          |
| 14  | İletişim    | Form + harita embed                        |
| 15  | Footer      | Sütunlu / minimal                          |

### Blok tasarım kuralları

- Sabit renk yok. Sadece `var(--c-*)`.
- Sabit padding yok. Sadece `resp(props.padding)`.
- Her blok `animation` prop'unu kabul eder.
- Her blok bir `<section>` döndürür, kendi dış boşluğunu yönetmez.
- Görsellerde `loading="lazy"` + zorunlu `alt`.
- Client component gerektiren tek bloklar: Carousel ve mobil menü. Diğerleri saf server.
- Her bloğun sayfada tek `h1` kuralına uyduğunu şema doğrular.

### Bağımlılıklar

- Carousel: `embla-carousel-react` (hafif, SSR uyumlu)
- İkonlar: `lucide-react`
- Başka UI kütüphanesi yok. shadcn kullanma — çıktıya 40 dosya taşır.

---

## 6. Animasyon Sistemi

### Reveal

```tsx
// lib/Reveal.tsx
"use client";
import { useEffect, useRef } from "react";

export function Reveal({
  anim,
  children,
}: {
  anim: Animation;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || anim.type === "none") return;
    if (anim.trigger === "load") {
      el.dataset.visible = "true";
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.visible = "true";
          if (anim.once) io.disconnect();
        } else if (!anim.once) {
          delete el.dataset.visible;
        }
      },
      { threshold: 0.15 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [anim]);

  if (anim.type === "none") return <>{children}</>;

  return (
    <div
      ref={ref}
      data-anim={anim.type}
      style={
        {
          "--d": `${anim.duration}ms`,
          "--delay": `${anim.delay}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
```

### CSS

```css
/* globals.css */
[data-anim] {
  transition-property: opacity, transform, filter;
  transition-duration: var(--d, 500ms);
  transition-delay: var(--delay, 0ms);
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

[data-anim="fade"] {
  opacity: 0;
}
[data-anim="slide-up"] {
  opacity: 0;
  transform: translateY(24px);
}
[data-anim="slide-left"] {
  opacity: 0;
  transform: translateX(24px);
}
[data-anim="scale"] {
  opacity: 0;
  transform: scale(0.96);
}
[data-anim="blur"] {
  opacity: 0;
  filter: blur(8px);
}

[data-anim][data-visible] {
  opacity: 1;
  transform: none;
  filter: none;
}

@media (prefers-reduced-motion: reduce) {
  [data-anim] {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    transition: none !important;
  }
}
```

### Yazı animasyonu

`splitBy: "word" | "char"` seçilirse `SplitText` bileşeni metni span'lara böler:

```tsx
{
  parts.map((p, i) => (
    <span
      key={i}
      data-anim={anim.type}
      style={{ "--delay": `${anim.delay + i * anim.stagger}ms` }}
    >
      {p}
    </span>
  ));
}
```

**Kritik:** `Reveal` client olsa da `children` server'dan geliyor. Metin SSR HTML'inde duruyor. Animasyon SEO'yu etkilemiyor — bu, yazacağın makalenin ana argümanı.

---

## 7. Tema Sistemi

Token'lar `<html>` üzerinde inline style olarak basılır:

```tsx
<html style={{
  "--c-bg": tokens.colors.bg,
  "--c-primary": tokens.colors.primary,
  "--fs-h1": `${tokens.scale.h1}px`,
  "--radius": `${tokens.radius}px`,
}}>
```

Editörde tek panel: 6 renk, 2 font, 4 tipografi boyutu, radius, spacing yoğunluğu.

Kullanıcı renk değiştirir → tüm site değişir. **"Kullanıcı siteyi bozamaz" garantisi tam olarak buradan geliyor** — bloklara serbest CSS verilmiyor.

Hazır 4 tema preset'i koy (Sade, Sıcak, Koyu, Kurumsal). Kullanıcıların %80'i preset seçip devam edecek.

---

## 8. Export

### prebuild script

```js
// scripts/bundle.mjs — "prebuild": "node scripts/bundle.mjs"
// blocks/**, lib/{responsive,tokens,Reveal,render}.tsx, template/** okunur
// generated/files.ts üretilir:
//   export const FILES: Record<string,string> = { "components/Hero/HeroSplit.tsx": "...", ... }
```

### Zip üretimi

```ts
// lib/export.ts
export async function exportSite(site: Site): Promise<Blob> {
  const zip = new JSZip();
  const used = new Set(site.nodes.map((n) => n.type));

  // 1. Sadece kullanılan bloklar
  for (const [path, content] of Object.entries(FILES)) {
    if (path.startsWith("components/") && !isUsed(path, used)) continue;
    zip.file(path, render(content, site)); // .tpl değişkenleri doldurulur
  }

  // 2. İçerik
  zip.file("content/page.json", JSON.stringify(site, null, 2));

  // 3. Token CSS
  zip.file("app/tokens.css", tokensToCss(site.tokens));

  return zip.generateAsync({ type: "blob" });
}
```

### Çıktı repo yapısı

```
kepenkci-site/
├─ app/
│  ├─ layout.tsx          # token'lar, font, JSON-LD
│  ├─ page.tsx            # generateMetadata + <Render>
│  ├─ sitemap.ts
│  ├─ robots.ts
│  ├─ globals.css
│  └─ tokens.css
├─ components/            # sadece kullanılan bloklar
├─ lib/{responsive,render,Reveal}.tsx
├─ content/page.json
├─ package.json           # next, react, tailwind, embla, lucide — o kadar
├─ tailwind.config.ts
└─ README.md              # "npm i && npm run dev"
```

**Kabul kriteri:** `unzip → npm i → npm run dev` hatasız çalışacak. `npm run build` uyarısız geçecek. Lighthouse 4 kategoride de 95+.

Bunu bir CI testi haline getir. Her commit'te zip üret, kur, build et, Lighthouse çalıştır. Bu test yeşil kaldığı sürece projenin iddiası ayakta.

---

## 9. SEO Paketi

```tsx
// app/page.tsx (çıktıda)
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: site.meta.title,
    description: site.meta.description,
    openGraph: { title, description, images: [ogImage], type: "website" },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
  };
}
```

- `sitemap.ts` ve `robots.ts` otomatik
- `layout.tsx` içinde JSON-LD `LocalBusiness` scriptı (işletme bilgisi girildiyse)
- Editörde canlı SEO paneli: başlık uzunluğu, açıklama uzunluğu, h1 sayısı, eksik alt metinler
- **Şema seviyesinde zorunluluk:** alt metni olmayan görselle export edilemez

---

## 10. Yapım Planı

### Faz 0 — Kağıt üstünde (2 gün, kod yok)

Bir kepenkçi sitesini elle `site.json` olarak yaz. Sonra aynı siteyi elle Next.js projesi olarak yaz. İki dosya arasındaki mesafe = emitter'ın işi.

**Bunu atlarsan şemayı yanlış tasarlarsın ve 3 ay sonra hepsini atarsın.**

### Faz 1 — İskelet (Hafta 1-2)

- Next.js kurulum, Tailwind, TS strict
- `lib/schema.ts` + `resp()` + `render.tsx`
- 2 blok: `HeaderMinimal`, `HeroSplit`
- `/preview` sayfası — elle yazılmış JSON'u render eder

**Çıktı:** JSON değiştir → sayfa değişiyor.

### Faz 2 — Editör (Hafta 3-4)

- Puck entegrasyonu, `puck/config.ts`
- localStorage kaydet/yükle, JSON indir/yükle
- Viewport değiştirici
- Özel alan bileşenleri: `ResponsiveNumberField`, `AnimationField`

**Çıktı:** Sürükle-bırak çalışıyor.

### Faz 3 — Export (Hafta 5-6) ⭐

- `scripts/bundle.mjs`
- `lib/export.ts` + JSZip
- `template/` dosyaları
- CI testi: zip → npm i → build → Lighthouse

**Çıktı: Zip indiriliyor ve çalışıyor. Proje bu gün gerçek oluyor.**

Buraya kadar geldiysen projenin bittiğinin %70'i tamam. Buraya gelemezsen projenin hiçbir kısmı bitmemiş demektir. **Export'u erken bitir.**

### Faz 4 — Tema (Hafta 7-8)

- Token sistemi, CSS değişkenleri, tema paneli, 4 preset

### Faz 5 — Animasyon (Hafta 9-10)

- `Reveal`, CSS animasyonları, `SplitText`, editör sekmesi
- `prefers-reduced-motion` testi

### Faz 6 — Blok kütüphanesi (Hafta 11-14) ⏳

15 bloğu tamamla. **En uzun ve en sıkıcı faz. Projeyi belirleyen faz.**

Bloklara başlamadan önce Figma'da (ya da referans toplayarak) tasarım yönünü netleştir. Kodlarken tasarlama.

### Faz 7 — Cila (Hafta 15)

- SEO paneli, hata durumları, boş durumlar
- Geri al/ileri al
- Landing sayfası
- README + demo GIF
- Canlı demo deploy

### Faz 8 — Lansman (Hafta 16)

Aşağıdaki takvim.

---

## 11. Claude Code ile Çalışma Düzeni

### Repo'ya koyacakların

```
CLAUDE.md          # aşağıdaki kurallar
docs/SCHEMA.md     # şema referansı
docs/BLOCKS.md     # blok yazma rehberi + örnek blok
```

### CLAUDE.md içeriği

```markdown
# Kurallar

1. blocks/ altındaki hiçbir dosya Puck'tan import ETMEZ. Puck config'leri puck/ altındadır.
2. Bloklarda sabit renk yok — sadece var(--c-\*).
3. Bloklarda sabit padding yok — sadece resp(props.x, "p").
4. Yeni blok = blocks/X/X.tsx + puck/x.config.ts + blocks/index.ts'e export.
5. Her blok animation prop'u alır ve <Reveal> ile sarar.
6. Görsellerde alt zorunlu, loading="lazy" zorunlu.
7. "use client" sadece Carousel ve mobil menüde. Başka yerde gerekçe iste.
8. Yeni npm paketi eklemeden önce sor.
9. Şema değişikliği zod + TS tipi + migration birlikte gelir.
```

### Prompt düzeni

Faz faz ilerle, "tüm projeyi yaz" deme:

- ✅ "Faz 1'i yap: schema.ts, responsive.ts, render.tsx ve HeroSplit bloğu. docs/SCHEMA.md'ye uy."
- ✅ "GalleryMasonry bloğunu docs/BLOCKS.md'deki örneği taklit ederek yaz."
- ❌ "Bana bir website builder yap."

**Her fazdan sonra sen elle test et.** Claude Code hızlı yazar; kalite kontrolü sende.

---

## 12. Lansman Planı

### Gerçekler

<!-- Kaynak: Show HN istatistikleri, 2026 Q1 -->

- Show HN gönderilerinin %2,3'ü ana sayfaya çıkıyor
- Medyan puan: 2
- 50 puan = en iyi %6
- İlk saatte 30-50 upvote gerekiyor
- **Oy manipülasyonu tespit ediliyor ve cezalandırılıyor.** Arkadaşlarına upvote attırma.

Yani lansman şansa bırakılamaz, ama zorlanamaz da. Yapılabilecek tek şey: **iyi hazırlanmak ve birden fazla kanal denemek.**

### Takvim

**T-30 gün — Kanal ısıtma**
İlk makale (Medium/dev.to): _"Why visual builders produce bad code — and what I'm doing about it"_
Ürünü tanıtma, problemi anlat. Google'ın indekslemesi için erken yayınla.

**T-14 gün — Teknik makale**
_"0 KB animations: scroll reveals in Next.js without Framer Motion"_
Kod paylaş, bundle karşılaştırması koy. Bu makale ürün olmadan da değerli — en çok okunacak olan bu.

**T-7 gün — Repo hazır**

- README üstünde 30 saniyelik demo GIF
- Canlı demo linki, en üstte
- Kurulum 2 satır
- Mimari diyagramı
- Ekran görüntüleri

**T-2 gün — Ana makale**
_"I built a page builder that exports real Next.js code — the architecture"_
Lansman gününden önce indekslenmesi için.

**T-0 — Lansman günü**

| Saat (TSİ)  | Aksiyon                                                                            |
| ----------- | ---------------------------------------------------------------------------------- |
| 15:00       | Show HN gönder ("Show HN: Zemin – Visual builder that exports clean Next.js code") |
| 15:00-19:00 | **Yorumlara canlı cevap ver.** Puandan çok bu belirleyici.                         |
| 16:00       | r/nextjs                                                                           |
| 17:00       | r/webdev                                                                           |
| 18:00       | X/Twitter thread + demo videosu                                                    |

**T+1 — İkinci dalga**
LinkedIn'de Türkçe versiyonu. Türk geliştirici ve ajans kitlesi burada.

**T+7 — Yorumlardan çıkanları uygula**
İlk hafta gelen geri bildirimlerle bir sürüm çıkar, "yorumlardaki şunları ekledim" diye paylaş. İkinci dalga trafik genelde buradan gelir.

**T+30 — Uzun kuyruk**

- Makale: _"What I learned launching an open source builder"_
- Awesome-nextjs, awesome-selfhosted listelerine PR
- Puck ve Webstudio Discord'larında paylaş (ilan gibi değil, katkı gibi)

### Show HN metni taslağı

```
Show HN: Zemin – Visual site builder that exports clean Next.js code

I'm a frontend dev in Istanbul. I've spent the last few years on Core Web
Vitals work for high-traffic sites, and kept hitting the same thing: visual
builders produce output nobody wants to maintain.

So I built one where the export is the point. You drag blocks, pick a theme,
add scroll animations, hit download — you get a Next.js repo with only the
components you used, no builder runtime, no wrapper div soup. Animations are
CSS + IntersectionObserver, so nothing extra ships.

Responsive values are part of the schema ({base, md, lg}) rather than
media queries, which is what keeps the generated Tailwind readable.

No database, no account — it runs entirely in the browser.

Demo: [link]  Repo: [link]

Happy to answer anything about the architecture.
```

**Kural: mütevazı ol, kod göster, abartma.** HN abartıyı cezalandırır.

---

## 13. Başarı Metrikleri

Bunu gelir için yapmıyorsun. Başarı şu:

| Metrik                 | Zayıf | İyi     | Harika |
| ---------------------- | ----- | ------- | ------ |
| GitHub yıldız (30 gün) | <100  | 300-800 | 1500+  |
| HN puanı               | <10   | 50+     | 200+   |
| Makale okunma (toplam) | <2K   | 10K     | 40K+   |
| "Bunu kullandım" diyen | 0     | 3-5     | 20+    |
| İş/danışmanlık teklifi | 0     | 1-2     | 5+     |

**En önemli metrik listede yok:** altı ay sonra biri "Enes Seven" arattığında ne bulacağı. Proje + 3 iyi makale + CV, tutarlı tek bir hikâye anlatmalı: _Next.js ve web performansı konusunda derin düşünen adam._

---

## 14. Riskler

| Risk                                   | Olasılık | Karşı hamle                                                                                                      |
| -------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| **Blok tasarımları vasat kalır**       | Yüksek   | Faz 6'dan önce tasarım yönünü netleştir. Gerekirse bir tasarımcıyla 2 günlük iş yap. Projenin en büyük riski bu. |
| Faz 6'da motivasyon biter              | Yüksek   | Export'u Faz 3'te bitir — elinde çalışan bir şey olsun. 15 bloğu 5+5+5 diye böl.                                 |
| Lansman sessiz geçer                   | Orta     | Makaleler tek başına değerli. Üç kanal dene. Bir hafta sonra ikinci dalga.                                       |
| Kapsam kayması                         | Orta     | "Yapmayacaklar" listesi sabit. Gelen her istek v2 backlog'una.                                                   |
| Webstudio/Puck aynı şeyi yapar         | Düşük    | Zaten yapıyorlar. Senin farkın çıktı kalitesi ve animasyon sistemi — o iddiayı koru.                             |
| Tailwind çıktıda class'ları purge eder | Orta     | Sabit ölçek kullan, dinamik string üretme. CI testi bunu yakalar.                                                |

---

## 15. v2 Backlog

Sırayla, talebe göre:

1. Çoklu sayfa + routing
2. Görsel yükleme (Vercel Blob)
3. Paylaşılabilir önizleme linki (burada backend gerekir)
4. Roller: "içerik modu" vs "tasarımcı modu" — **ajanslara satılabilir hale getiren şey bu**
5. İç içe layout / kolon sistemi
6. Astro emitter (ikinci hedef Angular değil Astro olmalı — brochure site için doğru olan o)
7. AI: prompt → geçerli `site.json`. AI'ı rakip değil, blok kütüphanenin giriş kapısı yap.
8. Çoklu dil

---

## Bugün yapılacak tek şey

Faz 0. Bir kepenkçi sitesinin `site.json`'ını elle yaz.

Kod yazma. İki gün sürer, üç ay kazandırır.
