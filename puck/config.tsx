import { type Config, type Overrides, usePuck } from "@puckeditor/core";
import { useState } from "react";
import { useReplayState } from "@/lib/replay-store";
import {
  BLOK_ACIKLAMA,
  ETIKET,
  KATEGORI,
  type Lang,
  ui,
} from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";
import { isLocked, toggleLock, useLockedIds } from "@/lib/lock-store";
import { EmptyState } from "./EmptyState";
import { LinkField } from "./fields/LinkField";
import { useThemeTokens } from "@/lib/theme-store";
import { tokensToCss } from "@/lib/tokens";
import { carouselConfig } from "./carousel.config";
import { contactConfig } from "./contact.config";
import { ctaConfig } from "./cta.config";
import { faqConfig } from "./faq.config";
import { featuresConfig } from "./features.config";
import { footerConfig } from "./footer.config";
import { galleryConfig } from "./gallery.config";
import { headerCenteredConfig } from "./header-centered.config";
import { headerSplitConfig } from "./header-split.config";
import { headerMinimalConfig } from "./header.config";
import { heroFullConfig } from "./hero-full.config";
import { heroTextConfig } from "./hero-text.config";
import { heroSplitConfig } from "./hero.config";
import { servicesConfig } from "./services.config";
import { testimonialsConfig } from "./testimonials.config";

/**
 * Tuvalde animasyonlar kapalı.
 *
 * Puck tuvali iframe içinde ve iframe'in kendisi KAYDIRILMIYOR — dışardaki
 * kapsayıcı kayıyor. Dolayısıyla iframe'in ilk ekranının altında kalan bir
 * bloğun IntersectionObserver'ı hiç tetiklenmiyor ve blok sonsuza kadar
 * opacity:0 kalıyor. Her blok içeriğini <Reveal> ile sardığı için (kural 4)
 * bu, editörü kullanılamaz hale getiriyordu.
 *
 * Bloklar Puck'ı bilemeyeceği için (kural 1) çözüm tuvalde: burada
 * animasyonu görsel olarak devre dışı bırakıyoruz. Gerçek animasyon
 * /preview'de görünür. Faz 5'te "animasyonu oynat" düğmesi eklenebilir.
 */
const CANVAS_CSS = `
[data-anim] {
  opacity: 1 !important;
  transform: none !important;
  filter: none !important;
  transition: none !important;
}
`;

/**
 * Oynatma sırasında kullanılan CSS.
 *
 * Geçiş kuralını burada tekrar tanımlıyoruz çünkü globals.css'teki kural
 * `.js` sınıfına bağlı ve iframe'in kendi <html>'inde o sınıf yok.
 */
const REPLAY_TRANSITION_CSS = `
[data-anim] {
  transition-property: opacity, transform, filter;
  transition-duration: var(--d, 500ms);
  transition-delay: var(--delay, 0ms);
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
[data-split] { display: inline-block; }
`;

/** Geçişsiz gizleme — oynatmanın başlangıç karesi. */
const REPLAY_ARM_CSS = `
[data-anim] { transition: none !important; }
[data-anim="fade"] { opacity: 0 !important; }
[data-anim="slide-up"] { opacity: 0 !important; transform: translateY(24px) !important; }
[data-anim="slide-left"] { opacity: 0 !important; transform: translateX(24px) !important; }
[data-anim="scale"] { opacity: 0 !important; transform: scale(0.96) !important; }
[data-anim="blur"] { opacity: 0 !important; filter: blur(8px) !important; }
`;

function canvasAnimationCss(replay: "off" | "arm" | "run"): string {
  if (replay === "arm") return `${REPLAY_TRANSITION_CSS}\n${REPLAY_ARM_CSS}`;
  if (replay === "run") return REPLAY_TRANSITION_CSS;
  return CANVAS_CSS;
}

/**
 * Tuvalin kökü. Token'ları iframe'in kendi belgesine <style> olarak basar —
 * CSS değişkenleri belge sınırını geçmediği için host'a basmak yetmezdi.
 */
function CanvasRoot({ children }: { children?: React.ReactNode }) {
  const tokens = useThemeTokens();
  const replay = useReplayState();
  const animCss = canvasAnimationCss(replay);
  // Boş sayfa yönlendirmesi TUVALİN İÇİNDE duruyor. Editör kabuğunun
  // içinde kardeş eleman olarak durduğunda kendi yüksekliğini (60vh)
  // araç çubuğundan ve çekmeceden çalıyordu: sayfa boşken editörün alt
  // yarısı ekran dışına taşıyordu.
  const { appState } = usePuck();
  const bos = (appState.data.content?.length ?? 0) === 0;

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      <style
        dangerouslySetInnerHTML={{
          __html: tokens ? `${tokensToCss(tokens)}\n${animCss}` : animCss,
        }}
      />
      {bos ? <EmptyState /> : null}
      {children}
    </div>
  );
}

/**
 * Çekmece etiketleri kısa: kategori başlığı zaten "Başlık"/"Hero" diyor,
 * isme tekrar koymak satırı taşırıp adı kesiyordu (15 bloğun 7'sinde).
 * Uzun tanım tooltip'e taşındı — bilgi kayboldu değil, yer değiştirdi.
 * Metinler lib/i18n.ts · BLOK_ACIKLAMA.
 */

/** Puck'ın kök bölgesi — insert action bunu istiyor. */
const KOK_BOLGE = "root:default-zone";

/**
 * Çekmecedeki bloğa TIKLAYINCA sayfanın sonuna eklenir.
 *
 * Puck varsayılan olarak yalnızca sürüklemeyi destekliyor; tıklamak hiçbir
 * şey yapmıyor ve geri bildirim de vermiyordu. İlk kullanıcının ilk refleksi
 * tıklamak olduğu için sürükleme tek yol olarak kalmamalı.
 */
function TiklanabilirCekmeceOgesi({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  const { dispatch, appState } = usePuck();
  const lang = useLang();
  // Küçük resim henüz üretilmemişse (yeni blok, `npm run thumbs`
  // çalıştırılmamış) kırık simge göstermek yerine sessizce çekiliyoruz.
  const [kucukResimVar, setKucukResimVar] = useState(true);

  return (
    <div
      className="flex items-center gap-2"
      onClick={() =>
        dispatch({
          type: "insert",
          componentType: name,
          destinationIndex: appState.data.content.length,
          destinationZone: KOK_BOLGE,
        })
      }
      title={`${BLOK_ACIKLAMA[name]?.[lang] ?? ""}\n\n${ui(lang, "drawerHint")}`.trim()}
    >
      {kucukResimVar && (
        <img
          src={`/thumbs/${name}.webp`}
          alt=""
          width={64}
          height={40}
          loading="lazy"
          onError={() => setKucukResimVar(false)}
          className="h-10 w-16 shrink-0 rounded border border-[#e4e8ec] bg-white object-cover"
        />
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * Sağ panel: hiçbir blok seçili değilken Puck kendi kök alanlarını gösteriyor.
 * Kök alanı boşalttığımız için (createPuckConfig · root.fields) orada
 * yapacak bir şey yok; boş panel yerine başlığın gerçekten nerede
 * düzenlendiğini söylüyoruz.
 *
 * Daha önce burada "title" adında bir alan duruyordu: yazılan değer
 * adapter'da atılıyordu (puckDataToSite kök props'unu hiç okumuyor), yani
 * kullanıcı sayfa başlığını değiştirdiğini sanıp hiçbir şey değiştirmiyordu.
 */
function SecimYok() {
  const lang = useLang();
  const [once, sonra] = ui(lang, "noSelectionHint", { panel: "\u0000" }).split("\u0000");
  return (
    <div className="p-4 text-[13px] leading-relaxed text-[#5c6672]">
      <p className="font-semibold text-[#181818]">{ui(lang, "noSelectionTitle")}</p>
      <p className="mt-2">{ui(lang, "noSelectionBody")}</p>
      <p className="mt-3 text-[12px] text-[#8b949e]">
        {once}
        <strong className="text-[#5c6672]">{ui(lang, "pageInfo")}</strong>
        {sonra}
      </p>
    </div>
  );
}

/**
 * Seçili bloğun üstündeki kilit düğmesi.
 *
 * Kilitliyken Puck alanları salt okunur gösteriyor; düğme kilidi açan tek
 * yol olduğu için ayarlar panelinin en üstünde duruyor.
 */
function KilitDugmesi() {
  const lang = useLang();
  const { selectedItem, refreshPermissions } = usePuck();
  useLockedIds(); // kilit değişince yeniden çiz
  const id = (selectedItem?.props as { id?: string } | undefined)?.id;
  if (!id) return null;
  const kilitli = isLocked(id);

  return (
    <button
      type="button"
      onClick={() => {
        toggleLock(id);
        // Puck izinleri VERİYE göre önbelleğe alıyor; kilit veriyi
        // değiştirmediği için yeniden hesaplamasını kendimiz istiyoruz.
        refreshPermissions({ item: selectedItem ?? undefined }, true);
      }}
      className={`flex w-full items-center gap-2 border-b border-[#e4e8ec] px-4 py-2 text-left text-[12px] ${
        kilitli ? "bg-[#fdf3e7] text-[#7a4a12]" : "text-[#5c6672] hover:bg-[#f2f4f6]"
      }`}
    >
      <span aria-hidden="true">{kilitli ? "🔒" : "🔓"}</span>
      {ui(lang, kilitli ? "unlockBlock" : "lockBlock")}
    </button>
  );
}

export const puckOverrides: Partial<Overrides> = {
  drawerItem: ({ children, name }) => (
    <TiklanabilirCekmeceOgesi name={name}>{children}</TiklanabilirCekmeceOgesi>
  ),
  fields: ({ children, itemSelector }) =>
    itemSelector ? (
      <>
        <KilitDugmesi />
        {children}
      </>
    ) : (
      <SecimYok />
    ),
};

/**
 * Etiket çevirisi — config AĞACI geziliyor.
 *
 * 15 config dosyasını çeviri anahtarlarıyla doldurmak yerine etiketler
 * Türkçe kalıyor ve burada çevriliyor. Tablo tek yerde (lib/i18n.ts ·
 * ETIKET), eksik anahtar sessizce geçmiyor.
 *
 * Aynı gezinti sırasında metin alanlarına contentEditable veriliyor:
 * kullanıcı tuvalde doğrudan yazabilsin. Adres/kaynak alanları hariç —
 * onların değeri sayfada metin olarak görünmüyor.
 */
const DUZ_YAZILMAZ = new Set(["href", "src", "mapEmbedUrl", "email", "icon", "logoHref"]);

const eksikCeviri = new Set<string>();

function cevir(etiket: string, lang: Lang): string {
  if (lang === "tr") return etiket;
  const karsilik = ETIKET[etiket];
  if (karsilik === undefined) {
    eksikCeviri.add(etiket);
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] İngilizce karşılığı yok: "${etiket}" (lib/i18n.ts · ETIKET)`);
    }
    return etiket;
  }
  return karsilik;
}

/** Çeviri tablosunda karşılığı olmayan etiketler — npm run i18n:check okur. */
export function eksikCevirileri(): string[] {
  return [...eksikCeviri].sort();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function alaniCevir(anahtar: string, alan: any, lang: Lang, ustDuzey: boolean): any {
  if (!alan || typeof alan !== "object") return alan;
  const kopya: Record<string, unknown> = { ...alan };

  if (typeof kopya.label === "string") kopya.label = cevir(kopya.label, lang);

  if (anahtar === "href" && kopya.type === "text") {
    // Serbest metin yerine sayfadaki çapaları öneren alan.
    kopya.type = "custom";
    kopya.render = LinkField;
    delete kopya.placeholder;
  } else if (
    ustDuzey &&
    (kopya.type === "text" || kopya.type === "textarea") &&
    !DUZ_YAZILMAZ.has(anahtar)
  ) {
    kopya.contentEditable = true;
  }

  if (Array.isArray(kopya.options)) {
    kopya.options = kopya.options.map((o: { label?: string; value: unknown }) =>
      typeof o?.label === "string" ? { ...o, label: cevir(o.label, lang) } : o,
    );
  }
  for (const ic of ["objectFields", "arrayFields"] as const) {
    const grup = kopya[ic] as Record<string, unknown> | undefined;
    if (grup) {
      kopya[ic] = Object.fromEntries(
        Object.entries(grup).map(([k, v]) => [k, alaniCevir(k, v, lang, false)]),
      );
    }
  }
  return kopya;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blogunuCevir(cfg: any, lang: Lang, siteDili: string): any {
  return {
    ...cfg,
    /**
     * Tuval de bir renderer: lib/render.tsx bloklara site dilini geçiyor,
     * burada Puck geçiyor. İkisi de geçmezse blok sabit metinleri
     * varsayılana (İngilizce) düşer ve tuval çıktıdan farklı görünür.
     * `lang` yayılımdan SONRA — blok verisi sitenin dilini ezmesin.
     */
    render: (props: Record<string, unknown>) =>
      cfg.render({ ...props, lang: siteDili }),
    /**
     * Kilitli blok sürüklenemez, silinemez, çoğaltılamaz ve alanları
     * salt okunur olur. Durum lib/lock-store'dan geliyor — Puck bu
     * fonksiyonu config içinden çağırdığı için React durumuna erişemez.
     */
    resolvePermissions: (data: { props?: { id?: string } }) =>
      data?.props?.id && isLocked(data.props.id)
        ? { drag: false, delete: false, duplicate: false, edit: false }
        : {},
    label: typeof cfg.label === "string" ? cevir(cfg.label, lang) : cfg.label,
    fields: Object.fromEntries(
      Object.entries(cfg.fields ?? {}).map(([k, v]) => [k, alaniCevir(k, v, lang, true)]),
    ),
  };
}

/**
 * Tüm blok tanımlarını birleştirir. Token almıyor: tema lib/theme-store'dan
 * canlı okunuyor. Dil ALIYOR çünkü etiketler config ağacına gömülü — dil
 * değişince config yeniden kurulmalı.
 *
 * siteDili AYRI bir eksen: arayüz İngilizceyken Türkçe bir site
 * kurulabiliyor. Blokların sabit metinleri (lib/block-text.ts) sitenin
 * diline bakar, arayüzünkine değil.
 *
 * Bu dosya (ve tüm puck/ klasörü) app/edit dışından import EDİLMEZ ve
 * ZIP'E GİTMEZ.
 */
export function createPuckConfig(lang: Lang = "en", siteDili = "en"): Config {
  const ham = {
    HeaderMinimal: headerMinimalConfig,
    HeaderCentered: headerCenteredConfig,
    HeaderSplit: headerSplitConfig,
    HeroSplit: heroSplitConfig,
    HeroFull: heroFullConfig,
    HeroText: heroTextConfig,
    Services: servicesConfig,
    Features: featuresConfig,
    Gallery: galleryConfig,
    Testimonials: testimonialsConfig,
    FAQ: faqConfig,
    Carousel: carouselConfig,
    CTA: ctaConfig,
    Contact: contactConfig,
    Footer: footerConfig,
  };

  const k = (id: keyof typeof KATEGORI) => KATEGORI[id][lang];

  return {
    components: Object.fromEntries(
      Object.entries(ham).map(([ad, cfg]) => [ad, blogunuCevir(cfg, lang, siteDili)]),
    ) as Config["components"],
    categories: {
      header: { title: k("header"), components: ["HeaderMinimal", "HeaderCentered", "HeaderSplit"] },
      hero: { title: k("hero"), components: ["HeroSplit", "HeroFull", "HeroText"] },
      icerik: {
        title: k("icerik"),
        components: ["Services", "Features", "Gallery", "Carousel", "Testimonials", "FAQ", "CTA"],
      },
      iletisim: { title: k("iletisim"), components: ["Contact"] },
      footer: { title: k("footer"), components: ["Footer"] },
    },
    // Kök alan YOK: sayfa başlığı Site.meta'da duruyor ve
    // "Sayfa bilgileri" panelinden düzenleniyor.
    root: { render: CanvasRoot, fields: {} },
  };
}
