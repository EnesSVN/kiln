# Kiln

Sürükle-bırak ile site kurulan, çıktısı temiz Next.js repo'su olan bir araç.

## Kurallar

1. blocks/ altındaki dosyalar Puck'tan HİÇBİR ŞEY import etmez.
   Puck ayarları puck/ klasöründe durur.
2. Bloklarda sabit renk yok. Sadece var(--c-bg), var(--c-fg), var(--c-primary) gibi.
3. Bloklarda sabit padding yok. padding prop'u OPSİYONEL:
   verilmişse resp(props.padding, "p"), verilmemişse temadan gelen
   p-[var(--pad-section)] / p-[var(--pad-band)].
4. Her blok animation prop'u alır ve içeriğini <Reveal> ile sarar.
5. Framer Motion KULLANMA. Animasyon = CSS + IntersectionObserver.
6. "use client" sadece Carousel ve mobil menüde. Başka yerde bana sor.
7. Görsellerde alt zorunlu, loading="lazy" zorunlu.
8. Yeni npm paketi eklemeden önce sor.
9. Google fontlarında subsets her zaman ["latin","latin-ext"].
   latin tek başına Türkçe'yi taşımaz — ğ ş ı İ latin-ext'te.

## Stack

Next.js 16 App Router · TypeScript strict · Tailwind · zod · jszip
Veritabanı YOK. API route YOK. Depolama localStorage.
