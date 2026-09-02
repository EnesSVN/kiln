import { SiteSchema } from "./schema";
import type { Site } from "./types";

/**
 * Depolama sınırı.
 *
 * "localStorage" kelimesi uygulamada SADECE bu dosyada geçer. Faz 3'te
 * export, ileride başka bir arka uç gelirse orası da bu üç fonksiyonu
 * değiştirmeden çalışmalı.
 *
 * Kayıtlar site.id ile anahtarlanır. Başlıkla anahtarlamak yanlıştı:
 * kullanıcı başlığı değiştirdiğinde eski kayıt öksüz kalıp yenisi
 * oluşuyordu.
 */
const SITES_KEY = "kiln:sites";
const CURRENT_KEY = "kiln:current";
const SCHEMA_KEY = "kiln:schema";

/** 1 = başlıkla anahtarlı (eski) · 2 = id ile anahtarlı */
const SCHEMA_VERSION = "2";

/** SSR'da localStorage yok. Sunucuda çağrılırsa sessizce boş dönmeli. */
function available(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readRaw(): Record<string, unknown> {
  try {
    const raw = window.localStorage.getItem(SITES_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    // Bozuk JSON kullanıcıyı kilitlemesin.
    return {};
  }
}

/**
 * Tek seferlik geçiş: başlıkla anahtarlı kayıtları id'ye taşır.
 *
 * Eski kayıtlarda site.id yok; her birine kimlik üretip haritayı yeniden
 * anahtarlıyoruz. kiln:current da eski başlıktan yeni id'ye çevriliyor.
 */
function migrateOnce(): void {
  if (window.localStorage.getItem(SCHEMA_KEY) === SCHEMA_VERSION) return;

  try {
    const old = readRaw();
    const oldCurrent = window.localStorage.getItem(CURRENT_KEY);
    const next: Record<string, unknown> = {};
    let nextCurrent: string | null = null;

    for (const [key, value] of Object.entries(old)) {
      if (!value || typeof value !== "object") continue;
      const site = value as Record<string, unknown>;
      const id =
        typeof site.id === "string" && site.id ? site.id : crypto.randomUUID();

      next[id] = { ...site, id };
      if (key === oldCurrent) nextCurrent = id;
    }

    window.localStorage.setItem(SITES_KEY, JSON.stringify(next));
    if (nextCurrent) window.localStorage.setItem(CURRENT_KEY, nextCurrent);
    else if (oldCurrent && !next[oldCurrent]) window.localStorage.removeItem(CURRENT_KEY);
  } catch (err) {
    console.error("[storage] geçiş başarısız", err);
  }

  window.localStorage.setItem(SCHEMA_KEY, SCHEMA_VERSION);
}

function readAll(): Record<string, unknown> {
  if (!available()) return {};
  migrateOnce();
  return readRaw();
}

/**
 * Okunamayan kayıt.
 *
 * `null` dönmek yetmiyordu: şemadan geçmeyen site sessizce yok sayılıyor,
 * editör demoyu açıyor ve kullanıcı sayfasının silindiğini sanıyordu. Bayt
 * hâlâ oradaydı — kimse söylemiyordu. Artık ham veri ve gerekçe geri
 * dönüyor, editör bunu şeritte gösterip JSON olarak indirtebiliyor.
 */
export type BozukKayit = {
  /** Şemadan geçmeyen ham nesne — indirilebilsin diye saklanıyor. */
  ham: unknown;
  /** "meta.title: Too big…" gibi, kullanıcıya gösterilecek kadar kısa. */
  sorunlar: string[];
};

let sonBozukKayit: BozukKayit | null = null;

/** loadSite() null döndüyse sebebini verir; sağlamsa null. */
export function bozukKayit(): BozukKayit | null {
  return sonBozukKayit;
}

/**
 * Geçerli siteyi döndürür. Kayıt yoksa ya da bozuksa null.
 * Şemadan geçmeyen veri ASLA döndürülmez — bozuk localStorage yüzünden
 * editör beyaz ekrana düşmesin. Ama sessizce de düşmez: bozukKayit()
 * ham veriyi ve gerekçeyi tutuyor.
 */
export function loadSite(): Site | null {
  sonBozukKayit = null;
  if (!available()) return null;

  const all = readAll();
  const current = window.localStorage.getItem(CURRENT_KEY);
  const raw = current ? all[current] : undefined;
  if (raw === undefined) return null;

  const result = SiteSchema.safeParse(raw);
  if (!result.success) {
    const sorunlar = result.error.issues.map(
      (i) => `${i.path.join(".") || "(kök)"}: ${i.message}`,
    );
    console.warn("[storage] kayıtlı site şemadan geçmedi", sorunlar);
    sonBozukKayit = { ham: raw, sorunlar };
    return null;
  }
  return result.data;
}

/**
 * Kayıt sonucu.
 *
 * void dönmek yetmiyordu: kota dolduğunda kullanıcı yazmaya devam ediyor,
 * hiçbir şey kaydedilmiyor ve bunu ancak sayfayı yenileyince fark ediyordu.
 * Sessiz veri kaybı en kötü hata türü.
 */
/**
 * Hata ANAHTAR olarak dönüyor, metin olarak değil.
 *
 * Metin dönüyordu ve sabit Türkçeydi: İngilizce arayüzde kota uyarısı,
 * "Site kaydedilemedi" ve "Kayıt silinemedi" Türkçe çıkıyordu. Bu dosya
 * arayüz dilini bilmiyor (bilmemeli de) — çeviriyi çağıran yapıyor.
 */
export type StorageHata =
  | { anahtar: "storageQuota"; veri: { mb: string } }
  | { anahtar: "storageDenied" }
  | { anahtar: "storageDeleteFailed" };

export type SaveResult = { ok: true } | { ok: false; hata: StorageHata };

/**
 * Kota hatası mı?
 *
 * `instanceof DOMException` ile bakılıyordu; test bunun fazla dar olduğunu
 * gösterdi. Safari'nin özel gezinti modu gibi ortamlar farklı bir hata
 * sınıfı fırlatabiliyor — sınıfa değil ADA ve KODA bakmak daha sağlam.
 */
function kotaMi(err: unknown): boolean {
  const e = err as { name?: unknown; code?: unknown } | null;
  if (!e || typeof e !== "object") return false;
  return (
    e.name === "QuotaExceededError" ||
    e.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    e.code === 22
  );
}

/** Siteyi id'siyle kaydeder ve geçerli kayıt yapar. */
export function saveSite(site: Site): SaveResult {
  if (!available()) return { ok: true };

  const all = readAll();
  all[site.id] = site;

  try {
    window.localStorage.setItem(SITES_KEY, JSON.stringify(all));
    window.localStorage.setItem(CURRENT_KEY, site.id);
    return { ok: true };
  } catch (err) {
    console.error("[storage] kaydedilemedi", err);
    if (kotaMi(err)) {
      const mb = (JSON.stringify(all).length / 1024 / 1024).toFixed(1);
      return { ok: false, hata: { anahtar: "storageQuota", veri: { mb } } };
    }
    return { ok: false, hata: { anahtar: "storageDenied" } };
  }
}

/**
 * Belirli bir siteyi id'siyle açar ve geçerli kayıt yapar.
 *
 * loadSite() yalnızca "geçerli" siteyi biliyordu; site seçici için hangi
 * kaydın açılacağını dışarıdan söyleyebilmek gerekiyor.
 */
export function openSite(id: string): Site | null {
  if (!available()) return null;
  const raw = readAll()[id];
  if (raw === undefined) return null;

  const result = SiteSchema.safeParse(raw);
  if (!result.success) {
    console.warn("[storage] kayıt şemadan geçmedi", result.error.issues);
    return null;
  }
  try {
    window.localStorage.setItem(CURRENT_KEY, id);
  } catch {
    // Geçerli kayıt işaretlenemese de site açılabilir.
  }
  return result.data;
}

/**
 * Siteyi siler. Silinen site geçerli kayıtsa işaret de kaldırılır —
 * yoksa editör var olmayan bir id'yi açmaya çalışıp demoya düşerdi.
 */
export function deleteSite(id: string): SaveResult {
  if (!available()) return { ok: true };
  const all = readAll();
  if (!(id in all)) return { ok: true };
  delete all[id];

  try {
    window.localStorage.setItem(SITES_KEY, JSON.stringify(all));
    if (window.localStorage.getItem(CURRENT_KEY) === id) {
      window.localStorage.removeItem(CURRENT_KEY);
    }
    return { ok: true };
  } catch (err) {
    console.error("[storage] silinemedi", err);
    return { ok: false, hata: { anahtar: "storageDeleteFailed" } };
  }
}

/** Kayıtlı siteler: seçim arayüzü hem kimliği hem görünen adı ister. */
export function listSites(): { id: string; title: string }[] {
  return Object.entries(readAll()).map(([id, value]) => {
    const site = value as { meta?: { title?: unknown } } | null;
    const title = site?.meta?.title;
    return {
      id,
      // Başlıksız kayıt: çeviri burada YOK, id'yi gösteren tarafa bırakılıyor.
      title: typeof title === "string" && title.trim() ? title : "",
    };
  });
}

/* ---------------------------------------------------- editör tercihleri */

/**
 * Dil tercihi site verisi değil, tarayıcı tercihi: indirilen repo editörün
 * hangi dilde kullanıldığını bilmez. Yine de buraya yazılıyor çünkü
 * "localStorage" kelimesi uygulamanın geri kalanında geçmemeli — sınır bu
 * dosya. Site API'si (loadSite/saveSite/listSites) değişmedi.
 */
const LANG_KEY = "kiln:lang";

export function loadLang(): string | null {
  if (!available()) return null;
  try {
    return window.localStorage.getItem(LANG_KEY);
  } catch {
    return null;
  }
}

export function saveLang(lang: string): void {
  if (!available()) return;
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Tercih kaydedilemezse çalışmaya devam: oturum boyunca bellekte durur.
  }
}

/** İkinci sekme uyarısı ve harici değişiklikler için ham anahtar. */
export const SITES_STORAGE_KEY = SITES_KEY;
