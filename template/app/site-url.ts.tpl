/**
 * Yayın adresi — TEK KAYNAK.
 *
 * sitemap.ts, robots.ts ve metadata.metadataBase buradan okur. Önceden
 * adres iki ayrı dosyada sabit yazılıydı; biri güncellenip diğeri unutulunca
 * site "example.com" diyen bir sitemap yayınlıyordu.
 *
 * .env.local içindeki NEXT_PUBLIC_SITE_URL ile değiştirin.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"
).replace(/\/$/, "");
