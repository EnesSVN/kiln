# Tasarım Yönü

## Referanslar
1. https://vitsoe.com — boşluk çok cömert, bölümler nefes alıyor, hiç sıkışık değil
2. https://basecamp.com — başlıklar beklenenden büyük, gövde metni küçük ve soluk gri
3. https://cal.com — kartlarda gölge yok, sade ve temiz grid
4. https://normcph.com — görseller tam genişlik, kenar boşluğu yok, metin az

## Kararlar
- Kartlar: kenarlık YOK. Ayrım için --c-bg'den %3 sapan hafif tonlu yüzey.
- Gölge: yok.
- Görseller: kenara sıfır yapışık, iç boşluk yok.
- Başlıklar cömert boyutta, gövde metni soluk (--c-muted).
- Bölüm arası boşluk, blok içi boşluktan belirgin şekilde büyük olsun.

## Tipografi
- Başlık/gövde oranı: 1.25
- Başlık ağırlığı 600, gövde 400
- Satır yüksekliği: başlık 1.15, gövde 1.6
- Maksimum metin genişliği: 65ch

## Görseller
- Hero 16/9, kart 4/3, galeri 1/1
- object-fit: cover

## Butonlar
- Birincil dolu, ikincil kenarlıklı, 44px yükseklik, iki varyant

## Grid
- İçerik genişliği 1200px, sütun boşluğu var(--space-lg), mobilde tek sütun
