import { BLOK_ACIKLAMA as BLOK_BILGI } from "./block-info.mjs";

/**
 * Editör dili. STUDIO'YA AİT — çıktı repo'suna gitmez.
 *
 * Varsayılan İngilizce: Kiln'i deneyen çoğu kişi Türkçe bilmiyor. Demolar
 * Türkçe kalıyor çünkü onların işi gerçek bir işletme sitesi gibi durmak.
 *
 * Üç ayrı sözlük var:
 *   PUCK   — Puck'ın kendi arayüzü (Dictionary API ile veriliyor)
 *   UI     — Kiln'in kendi kabuğu (araç çubuğu, paneller, uyarılar)
 *   ETIKET — blok ve alan etiketleri
 *
 * ETIKET neden Türkçe anahtarlı? puck/*.config.ts dosyalarındaki etiketler
 * olduğu gibi kalsın diye: 15 dosyayı çeviri anahtarlarıyla doldurmak yerine
 * config ağacı build sırasında geziliyor ve etiketler bu tablodan çevriliyor
 * (bkz. puck/config.tsx · ceviriyleKur). Eksik anahtar sessizce geçmiyor —
 * development'ta konsola düşüyor ve npm run i18n:check ile denetleniyor.
 */

export type Lang = "en" | "tr";
export const LANGS: Lang[] = ["en", "tr"];
export const DEFAULT_LANG: Lang = "en";

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "tr";
}

/* ------------------------------------------------------ Puck'ın arayüzü */

/** Puck 0.23 Dictionary API. Anahtarlar Puck'ın defaultDictionary'sinden. */
export const PUCK: Record<Lang, Record<string, string>> = {
  en: {},
  tr: {
    "header-undo": "geri al",
    "header-redo": "ileri al",
    "header-toggle-leftsidebar": "Sol paneli aç/kapat",
    "header-toggle-rightsidebar": "Sağ paneli aç/kapat",
    "header-toggle-menubar": "Menü çubuğunu aç/kapat",
    "action-selectparent": "Üst bloğu seç",
    "action-duplicate": "Çoğalt",
    "action-delete": "Sil",
    "label-page": "Sayfa",
    "label-component": "Blok",
    "outline-empty": "Blok yok",
    "outline-item-collapse": "Daralt",
    "outline-item-expand": "Genişlet",
    "outline-header-title": "Yapı",
    "outline-header-collapseall": "Hepsini daralt",
    "outline-item-duplicate": "Çoğalt",
    "outline-item-delete": "Sil",
    "drawer-category-collapse": "{title} — daralt",
    "drawer-category-expand": "{title} — genişlet",
    "drawer-category-other": "Diğer",
    "canvas-noconfig": "{type} için ayar yok",
    "field-readonly": "Salt okunur",
    "field-arrayitem-summary": "{index}. öğe",
    "field-arrayitem-duplicate": "Çoğalt",
    "field-arrayitem-delete": "Sil",
    "viewport-zoom-in": "Yakınlaştır",
    "viewport-zoom-out": "Uzaklaştır",
    "viewport-zoom-auto": "%{zoom} (Oto)",
    "viewport-toggle-menu": "Genişlik menüsü",
    "viewport-switch": "{label} genişliğine geç",
    "viewport-switch-default": "Genişliği değiştir",
    "plugin-blocks": "Bloklar",
    "plugin-outline": "Yapı",
    "plugin-fields": "Ayarlar",
    "plugin-components": "Bloklar",
    "layout-maximize": "büyüt",
    "layout-minimize": "küçült",
    "loader-loading": "yükleniyor",
  },
};

/* ------------------------------------------------------ Kiln'in kabuğu */

const EN = {
  langLabel: "Language",
  download: "Download project",
  downloadJson: "Download JSON",
  uploadJson: "Upload JSON",
  playAnimation: "Play animations once on the canvas",
  playAnimationShort: "Play animations",
  theme: "Theme",
  pageInfo: "Page settings",
  startOver: "Start over",
  preview: "Preview",
  close: "Close",

  saveIdle: "All changes saved",
  saveDirty: "Unsaved changes",
  saveSaving: "Saving…",
  saveSavedAt: "Saved at {time}",
  saveFailed: "Not saved",

  loading: "Loading editor…",
  emptyTitle: "Page is empty",
  emptyBody:
    "Drag a block from the Blocks panel on the left, or click one. Most pages start with a header, then a hero.",
  emptyHint: "To start from a finished site, open a demo file with Upload JSON.",

  noSelectionTitle: "No block selected",
  noSelectionBody: "Click a block on the canvas to edit its settings here.",
  noSelectionHint: "Page title, description and language live in {panel} above.",

  drawerHint: "Click: append to page · Drag: drop anywhere",

  clearedTitle: "Page cleared",
  clearedBody: "Blocks and page details cleared; the theme is kept.",
  startOverConfirm:
    "This removes every block and clears the page title, description and business details. The theme is kept. Continue?",

  h1WarnTitle: "This page has {count} H1 headings.",
  h1WarnBody:
    "Search engines expect a single H1. Keep only one hero block. Export is not blocked.",

  loadedTitle: "Loaded: {title}",
  loadedBody: "{count} blocks",
  jsonError: "Could not load JSON — the file does not match the schema.",
  exportError: "Could not build the project.",
  saveErrorTitle: "Not saved",

  secondTabTitle: "Kiln is open in another tab",
  secondTabBody:
    "Both tabs write to the same browser storage; the one that saves last wins. Close the other tab, or keep editing in only one of them.",

  metaTitle: "Page settings",
  metaPageTitle: "Page title",
  metaDescription: "Description",
  metaLang: "Language code",
  metaOg: "Share image (full URL)",
  metaBusiness: "Business (JSON-LD)",
  metaName: "Name",
  metaPhone: "Phone",
  metaAddress: "Address",

  themeTitle: "Theme",
  themePreset: "Preset",
  themeColors: "Colors",
  themeFont: "Typeface",
  themeSize: "Type size",
  themeRadius: "Corner radius",
  themeDensity: "Spacing density",
  themeCustom: "Custom (from JSON)",
  metaSerpTitle: "Search result",

  sites: "Sites",
  sitesTitle: "Switch between saved sites",
  sitesSaved: "{count} saved in this browser",
  siteNew: "+ New site",
  siteRename: "Rename this site…",
  siteRenamePrompt: "Page title (also the name in this list)",
  siteDelete: "Delete {title}",
  siteDeleteConfirm: "Delete “{title}”? This cannot be undone.",
  siteNewTitle: "Untitled site",

  lockBlock: "Lock this block",
  unlockBlock: "Locked — click to unlock",

  metaBusinessHint:
    "Filling this in adds LocalBusiness markup to the page. Nothing is emitted if the name is empty.",
  metaGeo: "Coordinates (optional)",
  metaGeoHint: "Leave both empty to omit coordinates from the markup.",
  metaLat: "Latitude",
  metaLng: "Longitude",
  metaGeoInvalid: "Enter both, or leave both empty. Latitude −90…90, longitude −180…180.",
  metaTooLong: "cut off in search results",
  brokenRecordTitle: "Your saved site could not be read",
  brokenRecordDownload: "Download it as JSON",
  deadLinkTitle: "{count} link goes nowhere",
  storageQuota: "Browser storage is full ({mb} MB). Your last change was NOT saved. Uploaded images are stored in the browser with the site — remove large images or link them by URL. Use “Download JSON” first so you do not lose your work.",
  storageDenied: "Could not save the site. The browser may be blocking storage.",
  storageDeleteFailed: "Could not delete the site.",
  siteUntitled: "Untitled site",
  previewsTitle: "Demos",
  backToEditor: "Back to the editor",
  blockCount: "{count} blocks",
  previewEmptyTitle: "Nothing to preview yet",
  previewEmptyBody: "This page shows the site you are editing. Add a block in the editor and come back.",
  openEditor: "Open the editor",
  emptyDemoLabel: "Or load a finished demo:",

  themeColorBg: "Background",
  themeColorFg: "Text",
  themeColorMuted: "Secondary text",
  themeColorPrimary: "Accent",
  themeColorPrimaryFg: "On accent",
  themeColorBorder: "Line",
  themeHeadingFont: "Headings",
  themeBodyFont: "Body text",
  themeScaleHint: "Upper limit for headings. Shrinks proportionally on small screens.",
  themeH1: "Heading 1",
  themeH2: "Heading 2",
  themeH3: "Heading 3",
  themeBody: "Body",
  themeDensityCompact: "Compact",
  themeDensityNormal: "Normal",
  themeDensityWide: "Wide",
  presetSade: "Plain",
  presetSicak: "Warm",
  presetKoyu: "Dark",
  presetKurumsal: "Corporate",
  themeHintBg: "The page ground",
  themeHintFg: "Main text colour",
  themeHintMuted: "Descriptions",
  themeHintPrimary: "Buttons, links",
  themeHintPrimaryFg: "Text on buttons",
  themeHintBorder: "Borders",
} as const;

export type UIKey = keyof typeof EN;

const TR: Record<UIKey, string> = {
  langLabel: "Dil",
  download: "Projeyi indir",
  downloadJson: "JSON indir",
  uploadJson: "JSON yükle",
  playAnimation: "Tuvalde animasyonları bir kez oynat",
  playAnimationShort: "Animasyonu oynat",
  theme: "Tema",
  pageInfo: "Sayfa bilgileri",
  startOver: "Sıfırdan başla",
  preview: "Önizleme",
  close: "Kapat",

  saveIdle: "Tüm değişiklikler kaydedildi",
  saveDirty: "Kaydedilmemiş değişiklik",
  saveSaving: "Kaydediliyor…",
  saveSavedAt: "{time}'de kaydedildi",
  saveFailed: "Kaydedilmedi",

  loading: "Editör yükleniyor…",
  emptyTitle: "Sayfa boş",
  emptyBody:
    "Soldaki Bloklar panelinden bir blok sürükleyin ya da üstüne tıklayın. Genelde bir başlık bloğuyla başlanır, sonra hero eklenir.",
  emptyHint: "Hazır bir siteyle başlamak isterseniz JSON yükle ile bir demo dosyası açabilirsiniz.",

  noSelectionTitle: "Blok seçili değil",
  noSelectionBody: "Tuvalde bir bloğa tıklayın; ayarları burada açılır.",
  noSelectionHint: "Sayfa başlığı, açıklaması ve dili üstteki {panel} panelinde.",

  drawerHint: "Tıkla: sayfanın sonuna ekle · Sürükle: istediğin yere bırak",

  clearedTitle: "Sayfa temizlendi",
  clearedBody: "Bloklar ve sayfa bilgileri temizlendi; tema korundu.",
  startOverConfirm:
    "Tüm bloklar silinecek; sayfa başlığı, açıklaması ve işletme bilgileri temizlenecek. Tema korunur. Devam edilsin mi?",

  h1WarnTitle: "Sayfada {count} adet H1 başlığı var.",
  h1WarnBody:
    "Arama motorları sayfada tek H1 bekler. Hero bloklarından yalnızca birini bırakın. Dışa aktarma engellenmiyor.",

  loadedTitle: "Yüklendi: {title}",
  loadedBody: "{count} blok",
  jsonError: "JSON yüklenemedi — dosya şemaya uymuyor.",
  exportError: "Proje üretilemedi.",
  saveErrorTitle: "Kaydedilemedi",

  secondTabTitle: "Kiln başka bir sekmede de açık",
  secondTabBody:
    "İki sekme aynı tarayıcı deposuna yazıyor; en son kaydeden kazanır. Diğer sekmeyi kapatın ya da düzenlemeyi tek sekmede sürdürün.",

  metaTitle: "Sayfa bilgileri",
  metaPageTitle: "Sayfa başlığı",
  metaDescription: "Açıklama",
  metaLang: "Dil kodu",
  metaOg: "Paylaşım görseli (tam adres)",
  metaBusiness: "İşletme (JSON-LD)",
  metaName: "İsim",
  metaPhone: "Telefon",
  metaAddress: "Adres",

  themeTitle: "Tema",
  themePreset: "Hazır tema",
  themeColors: "Renkler",
  themeFont: "Yazı tipi",
  themeSize: "Yazı boyutu",
  themeRadius: "Köşe yuvarlaklığı",
  themeDensity: "Boşluk yoğunluğu",
  themeCustom: "Özel (JSON'dan)",
  metaSerpTitle: "Arama sonucu",

  sites: "Siteler",
  sitesTitle: "Kayıtlı siteler arasında geçiş",
  sitesSaved: "Bu tarayıcıda {count} kayıt",
  siteNew: "+ Yeni site",
  siteRename: "Bu siteyi yeniden adlandır…",
  siteRenamePrompt: "Sayfa başlığı (listede görünen ad da bu)",
  siteDelete: "{title} kaydını sil",
  siteDeleteConfirm: "“{title}” silinsin mi? Geri alınamaz.",
  siteNewTitle: "Adsız site",

  lockBlock: "Bu bloğu kilitle",
  unlockBlock: "Kilitli — açmak için tıklayın",

  metaBusinessHint:
    "Doldurulursa sayfaya LocalBusiness işaretlemesi eklenir. Ad boşsa hiç basılmaz.",
  metaGeo: "Koordinat (isteğe bağlı)",
  metaGeoHint: "İkisini de boş bırakırsanız işaretlemeye koordinat girmez.",
  metaLat: "Enlem",
  metaLng: "Boylam",
  metaGeoInvalid: "İkisini de girin ya da ikisini de boş bırakın. Enlem −90…90, boylam −180…180.",
  metaTooLong: "arama sonucunda kesilir",
  brokenRecordTitle: "Kayıtlı siteniz okunamadı",
  brokenRecordDownload: "JSON olarak indir",
  deadLinkTitle: "{count} bağlantı hiçbir yere gitmiyor",
  storageQuota: "Tarayıcı depolama alanı doldu ({mb} MB). Son değişiklik KAYDEDİLMEDİ. Yüklediğiniz görseller siteyle birlikte tarayıcıda saklanıyor; büyük görselleri kaldırın ya da adresle bağlayın. Çalışmanızı kaybetmemek için önce “JSON indir” deyin.",
  storageDenied: "Site kaydedilemedi. Tarayıcı depolamaya izin vermiyor olabilir.",
  storageDeleteFailed: "Kayıt silinemedi.",
  siteUntitled: "Adsız site",
  previewsTitle: "Demolar",
  backToEditor: "Editöre dön",
  blockCount: "{count} blok",
  previewEmptyTitle: "Henüz önizlenecek bir şey yok",
  previewEmptyBody: "Bu sayfa üzerinde çalıştığınız siteyi gösterir. Editörde bir blok ekleyip geri gelin.",
  openEditor: "Editörü aç",
  emptyDemoLabel: "Ya da bitmiş bir demo yükleyin:",

  themeColorBg: "Arka plan",
  themeColorFg: "Metin",
  themeColorMuted: "İkincil metin",
  themeColorPrimary: "Vurgu",
  themeColorPrimaryFg: "Vurgu üstü",
  themeColorBorder: "Çizgi",
  themeHeadingFont: "Başlıklar",
  themeBodyFont: "Gövde metni",
  themeScaleHint: "Başlıklar için üst sınır. Küçük ekranda orantılı küçülür.",
  themeH1: "Başlık 1",
  themeH2: "Başlık 2",
  themeH3: "Başlık 3",
  themeBody: "Gövde",
  themeDensityCompact: "Kompakt",
  themeDensityNormal: "Normal",
  themeDensityWide: "Geniş",
  presetSade: "Sade",
  presetSicak: "Sıcak",
  presetKoyu: "Koyu",
  presetKurumsal: "Kurumsal",
  themeHintBg: "Sayfanın zemini",
  themeHintFg: "Ana yazı rengi",
  themeHintMuted: "Açıklamalar",
  themeHintPrimary: "Butonlar, linkler",
  themeHintPrimaryFg: "Buton yazısı",
  themeHintBorder: "Kenarlıklar",
};

export const UI: Record<Lang, Record<UIKey, string>> = { en: EN, tr: TR };

/** UI dizesi + {sarmal} yerine koyma. */
export function ui(lang: Lang, key: UIKey, vars?: Record<string, string | number>): string {
  const ham = UI[lang][key];
  if (!vars) return ham;
  return ham.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/* --------------------------------------------- blok ve alan etiketleri */

/**
 * Türkçe etiket -> İngilizce karşılığı.
 *
 * Anahtar Türkçe çünkü config dosyaları Türkçe yazıldı ve öyle kalıyor;
 * çeviri tek bir tabloda toplanıyor. Eksik anahtar sessizce geçmez.
 */
export const ETIKET: Record<string, string> = {
  // blok adları
  Minimal: "Minimal",
  Ortalanmış: "Centered",
  Bölünmüş: "Split",
  "Tam ekran": "Full bleed",
  "Metin odaklı": "Text only",
  Hizmetler: "Services",
  Özellikler: "Features",
  Galeri: "Gallery",
  Carousel: "Carousel",
  Referanslar: "Testimonials",
  SSS: "FAQ",
  CTA: "CTA",
  İletişim: "Contact",
  "Alt bilgi": "Footer",

  // ortak alanlar
  Başlık: "Title",
  "Alt başlık": "Subtitle",
  Açıklama: "Description",
  Metin: "Text",
  Bağlantı: "Link",
  Bağlantılar: "Links",
  Etiket: "Label",
  Buton: "Button",
  "Bölüm başlığı": "Section title",
  "Bölüm açıklaması": "Section description",
  "Bölüm kimliği": "Section id",
  "İç boşluk": "Padding",
  Animasyon: "Animation",
  "Logo metni": "Logo text",
  "Menü bağlantıları": "Menu links",
  "Yeni bağlantı": "New link",
  "Sütun sayısı": "Columns",
  İkon: "Icon",
  Kartlar: "Cards",
  Şeritler: "Strips",

  // görsel
  Görsel: "Image",
  "Görsel (16/9)": "Image (16/9)",
  "Görsel (4/3)": "Image (4/3)",
  "Görseller (1/1 önerilir)": "Images (1/1 recommended)",
  "Slaytlar (16/9)": "Slides (16/9)",

  // butonlar
  "Birincil buton": "Primary button",
  "İkincil buton": "Secondary button",
  "Buton metni (boşsa buton çıkmaz)": "Button text (empty = no button)",
  "Buton metni (boşsa çıkmaz)": "Button text (empty = hidden)",
  "Bağlantı (boşsa kart tıklanmaz)": "Link (empty = card not clickable)",
  "İletişime geç": "Get in touch",
  "Teklif al": "Get a quote",

  // iletişim
  "E-posta": "Email",
  Telefon: "Phone",
  Adres: "Address",
  "Çalışma saatleri": "Opening hours",
  "Formun gideceği e-posta": "Form recipient email",
  "Gönder butonu metni": "Submit button text",
  "Form alan etiketleri": "Form field labels",
  "İsim alanı etiketi": "Name field label",
  "Telefon alanı etiketi": "Phone field label",
  "Mesaj alanı etiketi": "Message field label",
  "Harita gömme adresi (boşsa harita çıkmaz)": "Map embed URL (empty = no map)",
  "İletişim bilgileri": "Contact details",
  "İletişim sütunu": "Contact column",
  "Ek satır (çalışma saatleri vb.)": "Extra line (hours etc.)",

  // footer
  Hakkımızda: "About",
  "Hakkında sütunu": "About column",
  "Bağlantılar sütunu": "Links column",
  "Alt şerit": "Bottom bar",

  // referans / sss
  Alıntı: "Quote",
  Alıntılar: "Quotes",
  İsim: "Name",
  "Ünvan / firma": "Role / company",
  Soru: "Question",
  Sorular: "Questions",
  Cevap: "Answer",
  "Nasıl çalışıyoruz": "How we work",

  // carousel
  "Otomatik oynatma": "Autoplay",
  Kapalı: "Off",
  "3 saniye": "3 seconds",
  "5 saniye": "5 seconds",
  "8 saniye": "8 seconds",

  // ikon adları
  Anahtar: "Wrench",
  Ev: "House",
  Kamyon: "Truck",
  Saat: "Clock",
  Kalkan: "Shield",
  Yıldız: "Star",
  Onay: "Check",

  // sayılar olduğu gibi
  "2": "2",
  "3": "3",
  "4": "4",
  "3'lü": "3 up",
  "4'lü": "4 up",
};

/** Özel alanların (AnchorField, AnimationField, ...) kendi dizeleri. */
const ALAN_EN = {
  anchorPlaceholder: "e.g. services",
  anchorHintSet: "You can link to this section with {slug}.",
  anchorHintEmpty: "Leave empty if nothing links to this section.",
  anchorInvalid: "Only letters and numbers are used; “{raw}” produced an empty id.",
  anchorDuplicate: "Another block already uses this id — links will jump to the first one.",

  padInherit: "Inherit from theme",
  padCustom: "Custom",
  padHint: "Spacing comes from the density setting in the Theme panel.",

  animType: "Type",
  animNone: "None",
  animFade: "Fade",
  animSlideUp: "Slide up",
  animSlideLeft: "Slide in",
  animScale: "Scale",
  animBlur: "Blur",
  animDuration: "Duration (ms)",
  animDelay: "Delay (ms)",
  animTrigger: "Trigger",
  animOnScroll: "When visible",
  animOnLoad: "On page load",
  animOnce: "Play only once",
  animSplit: "Split heading",
  animSplitNone: "Whole",
  animSplitWord: "By word",
  animSplitChar: "By character",
  animStagger: "Delay between parts (ms)",

  imgPick: "Choose file",
  imgRemove: "Remove",
  imgUploading: "Uploading…",
  imgNone: "no image",
  imgDropHint: "Drop an image here. It is resized to 1600px and converted to WebP.",
  imgEmbedded: "Uploaded · {size} · written to {path} in the downloaded repo.",
  imgAlt: "Alt text (required)",
  imgAltPlaceholder: "What is in the image?",
  imgAltWarn: "A project cannot be downloaded with empty alt text (rule 7).",
  imgUrl: "or address (URL)",
  imgNotImage: "This is not an image: {type}",
  imgDecodeFail: "Could not decode the image — the file may be damaged.",
  imgWebpFail: "Could not convert to WebP.",
  imgReadFail: "Could not read the file.",
  imgNoCanvas: "This browser does not support canvas.",
  imgAdd: "+ Add image",
  imgUp: "Move image {n} up",
  imgDown: "Move image {n} down",
  imgDelete: "Delete image {n}",

  linkPlaceholder: "#section, https://…, tel:…, mailto:…",
  linkHint: "{count} section ids on this page are offered as suggestions.",
  linkHintEmpty: "No block on this page has a section id yet.",
  linkUnknownAnchor: "No block on this page has the id “{id}” — this link goes nowhere.",

  bpMobile: "Mobile",
  bpTablet: "Tablet",
  bpDesktop: "Desktop",
  imgUrlPlaceholder: "/demo/photo.svg or https://…",
} as const;

export type AlanKey = keyof typeof ALAN_EN;

const ALAN_TR: Record<AlanKey, string> = {
  anchorPlaceholder: "örn. hizmetler",
  anchorHintSet: "Bu bölüme {slug} ile bağlantı verebilirsiniz.",
  anchorHintEmpty: "Boş bırakılırsa bölüme çapa bağlantısı verilemez.",
  anchorInvalid: "Yalnızca harf ve rakam kullanılır; “{raw}” boş bir kimlik üretti.",
  anchorDuplicate: "Bu kimliği başka bir blok da kullanıyor — bağlantılar ilkine gider.",

  padInherit: "Temadan devral",
  padCustom: "Özelleştir",
  padHint: "Boşluk, Tema panelindeki yoğunluk ayarından geliyor.",

  animType: "Tür",
  animNone: "Yok",
  animFade: "Belirme",
  animSlideUp: "Aşağıdan kayma",
  animSlideLeft: "Yandan kayma",
  animScale: "Büyüme",
  animBlur: "Bulanıklaşma",
  animDuration: "Süre (ms)",
  animDelay: "Gecikme (ms)",
  animTrigger: "Tetikleyici",
  animOnScroll: "Görünürken",
  animOnLoad: "Sayfa açılırken",
  animOnce: "Sadece bir kez oynat",
  animSplit: "Başlığı böl",
  animSplitNone: "Bütün halinde",
  animSplitWord: "Kelime kelime",
  animSplitChar: "Harf harf",
  animStagger: "Parça arası gecikme (ms)",

  imgPick: "Dosya seç",
  imgRemove: "Kaldır",
  imgUploading: "Yükleniyor…",
  imgNone: "görsel yok",
  imgDropHint: "Buraya sürükleyip bırakabilirsiniz. 1600px'e küçültülüp WebP'ye çevrilir.",
  imgEmbedded: "Yüklendi · {size} · indirilen repoda {path} altına yazılır.",
  imgAlt: "Alt metni (zorunlu)",
  imgAltPlaceholder: "Görselde ne görünüyor?",
  imgAltWarn: "Boş alt metniyle proje indirilemez (kural 7).",
  imgUrl: "ya da adres (URL)",
  imgNotImage: "Bu bir görsel değil: {type}",
  imgDecodeFail: "Görsel çözülemedi — dosya bozuk olabilir.",
  imgWebpFail: "WebP'ye çevrilemedi.",
  imgReadFail: "Dosya okunamadı.",
  imgNoCanvas: "Tarayıcı canvas desteklemiyor.",
  imgAdd: "+ Görsel ekle",
  imgUp: "{n}. görseli yukarı taşı",
  imgDown: "{n}. görseli aşağı taşı",
  imgDelete: "{n}. görseli sil",

  linkPlaceholder: "#bolum, https://…, tel:…, mailto:…",
  linkHint: "Sayfadaki {count} bölüm kimliği öneri olarak sunuluyor.",
  linkHintEmpty: "Bu sayfada henüz bölüm kimliği verilmiş blok yok.",
  linkUnknownAnchor: "Sayfada “{id}” kimlikli blok yok — bu bağlantı hiçbir yere gitmiyor.",
  bpMobile: "Mobil",
  bpTablet: "Tablet",
  bpDesktop: "Masaüstü",
  imgUrlPlaceholder: "/demo/gorsel.svg veya https://…",
};

export const ALAN: Record<Lang, Record<AlanKey, string>> = { en: ALAN_EN, tr: ALAN_TR };

export function alan(lang: Lang, key: AlanKey, vars?: Record<string, string | number>): string {
  const ham = ALAN[lang][key];
  if (!vars) return ham;
  return ham.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/** Blok açıklamaları — çekmecedeki tooltip. */
/** Blok açıklamaları — metin lib/block-info.mjs'te (export de okuyor). */
export const BLOK_ACIKLAMA: Record<string, Record<Lang, string>> = BLOK_BILGI;

/** Kategori başlıkları (puck/config.tsx · categories). */
export const KATEGORI: Record<string, Record<Lang, string>> = {
  header: { en: "Header", tr: "Başlık" },
  hero: { en: "Hero", tr: "Hero" },
  icerik: { en: "Content", tr: "İçerik" },
  iletisim: { en: "Contact", tr: "İletişim" },
  footer: { en: "Footer", tr: "Alt bilgi" },
};
