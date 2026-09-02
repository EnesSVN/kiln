"use client";

import { Puck, type Data, type Viewports } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import atolyeJson from "@/data/demos/atolye.json";
import bahceJson from "@/data/demos/bahce.json";
import kepenkJson from "@/data/demos/kepenk.json";
import mimarlikJson from "@/data/demos/mimarlik.json";
import { exportFileName, exportSite } from "@/lib/export";
import { allFontVariables } from "@/lib/fonts";
import { parseSite } from "@/lib/schema";
import { SITES_STORAGE_KEY, bozukKayit, loadSite, openSite, saveSite } from "@/lib/storage";
import { LANGS, PUCK, type Lang, ui } from "@/lib/i18n";
import { getLang, setLang, useLang } from "@/lib/lang-store";
import { setDemoYukleyici } from "@/lib/demo-store";
import { PRESETS } from "@/lib/presets";
import { playAnimations, useReplayState } from "@/lib/replay-store";
import { setThemeTokens } from "@/lib/theme-store";
import { lockedIds, setLocked, useLockedIds } from "@/lib/lock-store";
import type { Meta, Site, Tokens } from "@/lib/types";
import { puckDataToSite, siteToPuckData } from "@/puck/adapter";
import { createPuckConfig, puckOverrides } from "@/puck/config";
import { MetaPanel } from "./MetaPanel";
import { SiteSwitcher } from "./SiteSwitcher";
import { Notice, type NoticeKind } from "./Notice";
import { ThemePanel } from "./ThemePanel";

const SAVE_DEBOUNCE_MS = 500;

/**
 * Kaydetme göstergesi.
 *
 * localStorage'a yazan bir üründe kullanıcının en çok merak ettiği şey bu:
 * önceden 500 ms'lik debounce tamamen sessiz çalışıyordu ve çalışmanın
 * saklanıp saklanmadığına dair hiçbir işaret yoktu.
 */
function KayitGostergesi({
  durum,
  sonKayit,
  lang,
}: {
  durum: "temiz" | "kirli" | "yaziliyor" | "hata";
  sonKayit: string | null;
  lang: Lang;
}) {
  const nokta =
    durum === "hata" ? "#c0392b" : durum === "temiz" ? "#2f9e44" : "#d9a441";
  const metin =
    durum === "hata"
      ? ui(lang, "saveFailed")
      : durum === "yaziliyor"
        ? ui(lang, "saveSaving")
        : durum === "kirli"
          ? ui(lang, "saveDirty")
          : sonKayit
            ? ui(lang, "saveSavedAt", { time: sonKayit })
            : ui(lang, "saveIdle");

  return (
    <span
      className="flex items-center gap-1.5 whitespace-nowrap px-1 text-[12px] text-[#5c6672]"
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: nokta }}
      />
      {metin}
    </span>
  );
}

const VIEWPORTS: Viewports = [
  { width: 375, height: "auto", label: "375", icon: "Smartphone" },
  { width: 768, height: "auto", label: "768", icon: "Tablet" },
  { width: 1280, height: "auto", label: "1280", icon: "Monitor" },
];

/**
 * Puck varsayılan olarak listedeki İLK viewport'u seçiyor; liste küçükten
 * büyüğe sıralı olduğu için editör mobilde açılıyordu. Başlangıcı masaüstüne
 * sabitliyoruz, sıralama bozulmasın.
 */
const INITIAL_UI = {
  viewports: {
    current: { width: 1280, height: "auto" as const },
    controlsVisible: true,
    options: VIEWPORTS,
  },
};

const buttonClass =
  "rounded-md border border-[#c3c8ce] bg-white px-3 py-1.5 text-[13px] font-medium text-[#181818] hover:border-[#181818]";

const primaryButtonClass =
  "rounded-md border border-[#181818] bg-[#181818] px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50";

/**
 * zod hatasını okunur hale getirir.
 * Ham `error.message` bir JSON dökümü — kullanıcıya gösterilecek şey değil.
 */
function hataMetni(err: unknown): string {
  const issues = (
    err as { issues?: { path: (string | number)[]; message: string }[] }
  ).issues;
  if (Array.isArray(issues)) {
    return issues
      .slice(0, 4)
      .map((i) => `${i.path.join(".") || "(kök)"}: ${i.message}`)
      .join(" · ");
  }
  return err instanceof Error ? err.message : String(err);
}

function fileName(title: string): string {
  const slug =
    title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "site";
  return `${slug}.json`;
}

/**
 * Demolar istemci paketinde: editör bir sunucu bileşeni değil ve
 * lib/demos.ts node:fs kullanıyor. Yalnızca studio'ya giriyor, indirilen
 * repoya değil.
 */
const DEMOLAR: Record<string, unknown> = {
  kepenk: kepenkJson,
  atolye: atolyeJson,
  bahce: bahceJson,
  mimarlik: mimarlikJson,
};

/**
 * Depo boşken açılan site — BOŞ, demo değil.
 *
 * Kepenk demosu açılıyordu: yeni kullanıcının ilk gördüğü ekran, İstanbul'da
 * bir kepenkçinin bitmiş Türkçe sitesiydi. Kendi sitesi sandığı için üstüne
 * yazıyor, "Siteler" menüsü aynı anda "0 kayıt" diyordu. Demolar artık boş
 * tuvaldeki düğmelerden yükleniyor.
 */
function bosSite(lang: Lang): Site {
  return {
    id: crypto.randomUUID(),
    version: 1,
    meta: { title: ui(lang, "siteNewTitle"), description: "", lang },
    tokens: PRESETS[0].tokens,
    nodes: [],
  };
}

export default function EditPage() {
  const [site, setSite] = useState<Site | null>(null);
  // İçe aktarmada Puck'ı yeni veriyle yeniden kurmak için.
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  // Panel kontrolleri için; tuval token'ları theme-store'dan okuyor.
  // alert() yerine: hata üst çubukta görünür ve kopyalanabilir kalır.
  const [notice, setNotice] = useState<{
    kind: NoticeKind;
    title: string;
    detail?: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);
  // Birden fazla h1 SEO'yu bozar; engellemiyoruz, uyarıyoruz (Kk4).
  const [h1Sayisi, setH1Sayisi] = useState(1);
  const [oluGizli, setOluGizli] = useState(false);
  /** "temiz" = her şey kaydedildi · "kirli" = bekleyen değişiklik var */
  const [kayitDurumu, setKayitDurumu] = useState<"temiz" | "kirli" | "yaziliyor" | "hata">("temiz");
  const [sonKayit, setSonKayit] = useState<string | null>(null);
  const [ikinciSekme, setIkinciSekme] = useState(false);
  const lang = useLang();
  const kilitliler = useLockedIds();
  const replay = useReplayState();

  // Güncel site onChange'de burada tutuluyor: her tuşa basışta setState
  // yaparsak Puck'ı kendi durumuyla yarıştırırız.
  const siteRef = useRef<Site | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // localStorage sadece istemcide var; ilk render'dan sonra okunmalı.
    const kayitli = loadSite();
    /*
      Şemadan geçmeyen kayıt SESSİZ DÜŞMEZ.

      Düşüyordu: 60 karakteri aşan bir başlık siteyi okunamaz yapıyor,
      editör demoyu açıyor, kullanıcı sayfasını kaybettiğini sanıyordu —
      oysa bayt hâlâ depodaydı. Şerit hem neyin bozuk olduğunu söylüyor
      hem de ham kaydı JSON olarak indirtiyor; kurtarmanın tek yolu bu.
    */
    const bozuk = bozukKayit();
    if (bozuk) {
      setNotice({
        kind: "error",
        title: ui(lang, "brokenRecordTitle"),
        detail: bozuk.sorunlar.join(" · "),
        action: {
          label: ui(lang, "brokenRecordDownload"),
          onClick: () =>
            downloadBlobRef.current?.(
              new Blob([JSON.stringify(bozuk.ham, null, 2)], {
                type: "application/json",
              }),
              "kiln-kurtarma.json",
            ),
        },
      });
    }
    const initial = kayitli ?? bosSite(getLang());
    siteRef.current = initial;
    // Panellerin AYRI meta/tokens kopyası YOK. Vardı ve şu hatayı üretiyordu:
    // "Sıfırdan başla" site nesnesini temizliyor ama panelin kopyasına
    // dokunmuyordu; kullanıcı başlığı değiştirince panel eski müşterinin
    // işletme adını, telefonunu, adresini ve koordinatını geri yazıyordu.
    setThemeTokens(initial.tokens);
    setLocked(initial.locked);
    setSite(initial);
  }, []);


  /**
   * Kaydet + başarısızlığı göster.
   *
   * saveSite sessizce yutuyordu: kota dolduğunda kullanıcı yazmaya devam
   * ediyor, hiçbir şey kaydedilmiyordu. Görsel yükleme geldiğinden beri
   * kotayı doldurmak çok daha kolay.
   */
  const kaydet = useCallback(
    (s: Site) => {
      setKayitDurumu("yaziliyor");
      const sonuc = saveSite(s);
      if (!sonuc.ok) {
        setKayitDurumu("hata");
        setNotice({
          kind: "error",
          title: ui(lang, "saveErrorTitle"),
          detail: ui(lang, sonuc.hata.anahtar, "veri" in sonuc.hata ? sonuc.hata.veri : undefined),
        });
        return false;
      }
      setKayitDurumu("temiz");
      setSonKayit(
        new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      return true;
    },
    [lang],
  );

  /**
   * Bekleyen kaydı diske yaz.
   *
   * React'in unmount temizliği SEKME KAPANIRKEN ÇALIŞMAZ; tek başına
   * bırakıldığında 500 ms'lik debounce penceresindeki her şey kayboluyordu.
   * beforeunload + visibilitychange ikilisi gerçek çıkışı yakalıyor
   * (mobil tarayıcılarda beforeunload hiç tetiklenmeyebiliyor, sekme
   * gizlenmesi orada tek güvenilir sinyal).
   */
  const flush = useCallback(() => {
    if (!timer.current || !siteRef.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    kaydet(siteRef.current);
  }, [kaydet, lang]);

  useEffect(() => {
    const gizlendi = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", gizlendi);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", gizlendi);
      flush();
    };
  }, [flush]);

  /** ⌘S / Ctrl+S — tarayıcının "sayfayı kaydet" penceresi yerine bizim kaydımız. */
  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        flush();
      }
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, [flush]);

  /**
   * İkinci sekme. İki /edit aynı tarayıcı deposuna yazıyor ve en son
   * kaydeden kazanıyor — sessiz veri kaybı. storage olayı YALNIZCA diğer
   * sekmelerden tetiklenir, kendi yazdığımızda gelmez.
   */
  useEffect(() => {
    const baska = (e: StorageEvent) => {
      if (e.key === SITES_STORAGE_KEY) setIkinciSekme(true);
    };
    window.addEventListener("storage", baska);
    return () => window.removeEventListener("storage", baska);
  }, []);

  const scheduleSave = useCallback(
    (next: Site) => {
      siteRef.current = next;
      setKayitDurumu("kirli");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        kaydet(next);
      }, SAVE_DEBOUNCE_MS);
    },
    [kaydet],
  );

  const handleChange = useCallback(
    (data: Data) => {
      const base = siteRef.current;
      if (!base) return;
      const next = puckDataToSite(data, base);
      // Kilit listesi editör durumu; site nesnesine burada yazılıyor ki
      // tarayıcı deposuna gitsin. Export sırasında yeniden siliniyor.
      const kilit = lockedIds();
      next.locked = kilit.length ? kilit : undefined;
      scheduleSave(next);
    },
    [scheduleSave],
  );

  /** Tema değişimi: tuval anında, kayıt gecikmeli. İçeriğe DOKUNULMAZ. */
  const handleTokens = useCallback(
    (next: Tokens) => {
      const base = siteRef.current;
      if (!base) return;
      setThemeTokens(next);
      const guncel = { ...base, tokens: next };
      setSite(guncel);
      scheduleSave(guncel);
    },
    [scheduleSave],
  );

  const handleMeta = useCallback(
    (next: Meta) => {
      const base = siteRef.current;
      if (!base) return;
      const guncel = { ...base, meta: next };
      setSite(guncel);
      scheduleSave(guncel);
    },
    [scheduleSave],
  );

  /** Sıfırdan başla — onay ister (E2). */
  const sifirla = useCallback(() => {
    const base = siteRef.current;
    if (!base) return;
    if (
      !window.confirm(
        ui(lang, "startOverConfirm"),
      )
    )
      return;

    /**
     * Sayfa bilgileri de temizleniyor.
     *
     * Önce yalnızca bloklar siliniyordu: yeni müşteri için açılan sayfa
     * eski müşterinin başlığını, telefonunu, adresini ve JSON-LD
     * koordinatını taşımaya devam ediyordu. Tema bilerek KALIYOR —
     * kullanıcı renk/font seçimini yeniden yapmak istemiyor.
     */
    const bos: Site = {
      ...base,
      meta: {
        ...base.meta,
        title: ui(lang, "siteNewTitle"),
        description: "",
        lang,
        ogImage: undefined,
        business: undefined,
      },
      nodes: [],
      locked: undefined,
    };
    siteRef.current = bos;
    setSite(bos);
    setReloadKey((k) => k + 1);
    kaydet(bos);
    setNotice({
      kind: "info",
      title: ui(lang, "clearedTitle"),
      detail: ui(lang, "clearedBody"),
    });
  }, [kaydet, lang]);

  // Kilit değişimi Puck'ın onChange'ini tetiklemiyor; ayrıca kaydediyoruz.
  useEffect(() => {
    const s = siteRef.current;
    if (!s) return;
    const yeni = kilitliler.length ? kilitliler : undefined;
    if (JSON.stringify(s.locked ?? null) === JSON.stringify(yeni ?? null)) return;
    scheduleSave({ ...s, locked: yeni });
  }, [kilitliler, scheduleSave]);

  /** Kayıtlı bir siteyi aç. Bekleyen kayıt önce diske yazılır. */
  const siteAc = useCallback(
    (id: string) => {
      flush();
      const acilan = openSite(id);
      if (!acilan) {
        setNotice({ kind: "error", title: ui(lang, "jsonError") });
        return;
      }
      siteRef.current = acilan;
      setThemeTokens(acilan.tokens);
      setLocked(acilan.locked);
      setSite(acilan);
      setReloadKey((k) => k + 1);
      setKayitDurumu("temiz");
    },
    [flush, lang],
  );

  /** Boş bir site — mevcut temayı devralır, kendi kimliğini alır. */
  const yeniSite = useCallback(() => {
    flush();
    const temel = siteRef.current;
    if (!temel) return;
    const yeni: Site = {
      ...temel,
      id: crypto.randomUUID(),
      /*
        Dil ARAYÜZ dilinden geliyor, devralınmıyor.

        Devralınıyordu: İngilizce arayüzde açılan her yeni site, tohum
        demo Türkçe olduğu için lang="tr" doğuyordu — çıktıda Türkçe
        <html lang>, Türkçe aria etiketleri, Türkçe yer tutucu.
      */
      meta: {
        ...temel.meta,
        title: ui(lang, "siteNewTitle"),
        description: "",
        lang,
        ogImage: undefined,
        business: undefined,
      },
      nodes: [],
      locked: undefined,
    };
    siteRef.current = yeni;
    setSite(yeni);
    setReloadKey((k) => k + 1);
    kaydet(yeni);
  }, [flush, kaydet, lang]);

  const yenidenAdlandir = useCallback(
    (baslik: string) => {
      const temel = siteRef.current;
      if (!temel) return;
      const yeni: Site = { ...temel, meta: { ...temel.meta, title: baslik } };
      siteRef.current = yeni;
      setSite(yeni);
      kaydet(yeni);
    },
    [kaydet],
  );

  /*
    Açılış effect'i downloadBlob'dan ÖNCE çalışıyor (tanım aşağıda).
    Bozuk kayıt şeridinin indirme eylemi bu ref üzerinden bağlanıyor;
    tanım sırasını değiştirip başka bağımlılıkları kırmaya gerek yok.
  */
  const downloadBlobRef = useRef<((blob: Blob, name: string) => void) | null>(null);

  const downloadBlob = useCallback((blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);
  downloadBlobRef.current = downloadBlob;

  const download = useCallback(() => {
    const current = siteRef.current;
    if (!current) return;
    downloadBlob(
      new Blob([JSON.stringify(current, null, 2)], {
        type: "application/json",
      }),
      fileName(current.meta.title),
    );
  }, [downloadBlob]);

  const downloadProject = useCallback(async () => {
    const current = siteRef.current;
    if (!current) return;

    setBusy(true);
    try {
      downloadBlob(await exportSite(current), exportFileName(current));
    } catch (err) {
      setNotice({
        kind: "error",
        title: ui(lang, "exportError"),
        detail: hataMetni(err),
      });
    } finally {
      setBusy(false);
    }
  }, [downloadBlob]);

  /** Boş tuvaldeki "demo yükle" düğmeleri buraya bağlanıyor. */
  const demoYukle = useCallback(
    (id: string) => {
      const ham = DEMOLAR[id];
      if (!ham) return;
      const parsed = parseSite(ham);
      // Yeni kimlik: demo kullanıcının kendi kaydı olur, üstüne yazabilir.
      const yeni: Site = { ...parsed, id: crypto.randomUUID() };
      siteRef.current = yeni;
      setThemeTokens(yeni.tokens);
      setLocked(yeni.locked);
      setSite(yeni);
      setReloadKey((k) => k + 1);
      kaydet(yeni);
    },
    [kaydet],
  );

  useEffect(() => {
    setDemoYukleyici(demoYukle, Object.keys(DEMOLAR));
    return () => setDemoYukleyici(null, []);
  }, [demoYukle]);

  const upload = useCallback(async (file: File) => {
    try {
      const parsed = parseSite(JSON.parse(await file.text()));
      siteRef.current = parsed;
      setThemeTokens(parsed.tokens);
      setSite(parsed);
      setReloadKey((k) => k + 1);
      kaydet(parsed);
      setNotice({
        kind: "info",
        title: ui(lang, "loadedTitle", { title: parsed.meta.title }),
        detail: ui(lang, "loadedBody", { count: parsed.nodes.length }),
      });
    } catch (err) {
      setNotice({
        kind: "error",
        title: ui(lang, "jsonError"),
        detail: hataMetni(err),
      });
    }
  }, [kaydet, lang]);

  // Token almıyor: tema theme-store'dan canlı okunuyor, böylece renk
  // değiştirmek Puck'ın config'ini yeniden kurmuyor.
  // Tuvaldeki h1 sayısını izle. Veriden türetmek yerine DOM'dan sayıyoruz;
  // böylece ileride h1 basan yeni bir blok eklenince liste güncellemeye
  // gerek kalmıyor.
  useEffect(() => {
    const say = () => {
      const doc = document.querySelector("iframe")?.contentDocument;
      if (doc) setH1Sayisi(doc.querySelectorAll("h1").length);
    };
    const t = setInterval(say, 1200);
    return () => clearInterval(t);
  }, []);

  /**
   * Ölü bağlantılar — h1 uyarısıyla aynı desen: engellemiyoruz, söylüyoruz.
   *
   * İki tür var: adresi boş olan (blok artık basmıyor ama kullanıcı
   * çekmecede etiketi görüyor ve çalıştığını sanıyor) ve sayfada karşılığı
   * olmayan bir çapaya işaret eden (#hizmetler yazılmış, o kimlikte bölüm
   * yok). İkincisi sessiz: bağlantı basılıyor, tıklanınca hiçbir şey olmuyor.
   */
  const oluBaglantilar = useMemo(() => {
    if (!site) return [];
    const capalar = new Set<string>();
    const baglantilar: { label: string; href: string }[] = [];
    const gez = (v: unknown) => {
      if (Array.isArray(v)) return v.forEach(gez);
      if (!v || typeof v !== "object") return;
      const o = v as Record<string, unknown>;
      if (typeof o.label === "string" && typeof o.href === "string") {
        baglantilar.push({ label: o.label, href: o.href });
      }
      Object.values(o).forEach(gez);
    };
    for (const n of site.nodes) {
      const a = (n.props as { anchorId?: unknown }).anchorId;
      if (typeof a === "string" && a) capalar.add(a);
      capalar.add(`kiln-basi-${n.id}`);
      gez(n.props);
    }
    return baglantilar.filter(
      (l) =>
        l.label.trim() &&
        (!l.href.trim() || (l.href.startsWith("#") && !capalar.has(l.href.slice(1)))),
    );
  }, [site]);

  // Etiketler config ağacına gömülü: dil değişince yeniden kurulmalı.
  // site burada henüz null olabilir (ilk kare, localStorage okunmadan);
  // hook'lar erken dönemeyeceği için varsayılana düşüyor.
  const siteDili = site?.meta.lang ?? "en";
  const config = useMemo(
    () => createPuckConfig(lang, siteDili),
    [lang, siteDili],
  );

  const data = useMemo(() => (site ? siteToPuckData(site) : null), [site]);

  if (!site || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-[#5a5a5a]">
        {ui(lang, "loading")}
      </main>
    );
  }

  return (
    // Tema panelinde font değiştirince önizleme anında dönsün diye
    // katalogdaki sekiz font da burada bağlı. Landing/preview bunu yapmaz.
    <div className={`${allFontVariables} flex h-screen overflow-hidden`}>
      <div className="flex min-w-0 flex-1 flex-col">
        {notice ? (
          <Notice
            kind={notice.kind}
            title={notice.title}
            detail={notice.detail}
            action={notice.action}
            lang={lang}
            onClose={() => setNotice(null)}
          />
        ) : null}
        {ikinciSekme ? (
          <Notice
            kind="error"
            title={ui(lang, "secondTabTitle")}
            detail={ui(lang, "secondTabBody")}
            lang={lang}
            onClose={() => setIkinciSekme(false)}
          />
        ) : null}
        {h1Sayisi > 1 ? (
          <Notice
            kind="error"
            title={ui(lang, "h1WarnTitle", { count: h1Sayisi })}
            detail={ui(lang, "h1WarnBody")}
            lang={lang}
            onClose={() => setH1Sayisi(1)}
          />
        ) : null}
        {oluBaglantilar.length && !oluGizli ? (
          <Notice
            kind="error"
            title={ui(lang, "deadLinkTitle", { count: oluBaglantilar.length })}
            detail={oluBaglantilar
              .map((l) => `${l.label} → ${l.href || "—"}`)
              .join(" · ")}
            lang={lang}
            onClose={() => setOluGizli(true)}
          />
        ) : null}
        <div className="min-h-0 flex-1">
          <Puck
            key={reloadKey}
            config={config}
            data={data}
            onChange={handleChange}
            overrides={puckOverrides}
            dictionary={PUCK[lang]}
            viewports={VIEWPORTS}
            ui={INITIAL_UI}
            headerTitle={site.meta.title}
            headerPath="/preview/current"
            renderHeaderActions={() => (
              <div className="flex items-center gap-2">
                <KayitGostergesi
                  durum={kayitDurumu}
                  sonKayit={sonKayit}
                  lang={lang}
                />
                <SiteSwitcher
                  currentId={site.id}
                  currentTitle={site.meta.title}
                  onOpen={siteAc}
                  onCreate={yeniSite}
                  onRename={yenidenAdlandir}
                  className={buttonClass}
                />
                <select
                  className={`${buttonClass} cursor-pointer`}
                  aria-label={ui(lang, "langLabel")}
                  value={lang}
                  onChange={(e) => setLang(e.currentTarget.value as Lang)}
                >
                  {LANGS.map((l) => (
                    <option key={l} value={l}>
                      {l.toUpperCase()}
                    </option>
                  ))}
                </select>
                <input
                  ref={fileInput}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    // Aynı dosya tekrar seçilebilsin diye input sıfırlanıyor.
                    e.currentTarget.value = "";
                    if (file) void upload(file);
                  }}
                />
                <button
                  type="button"
                  className={primaryButtonClass}
                  onClick={() => void downloadProject()}
                  disabled={busy}
                >
                  {busy ? "…" : ui(lang, "download")}
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={download}
                >
                  {ui(lang, "downloadJson")}
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => fileInput.current?.click()}
                >
                  {ui(lang, "uploadJson")}
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  disabled={replay !== "off"}
                  onClick={() => playAnimations(siteRef.current)}
                  title={ui(lang, "playAnimation")}
                >
                  {replay === "off" ? ui(lang, "playAnimationShort") : "…"}
                </button>
                <button
                  type="button"
                  className={themeOpen ? primaryButtonClass : buttonClass}
                  onClick={() => {
                    setThemeOpen((v) => !v);
                    setMetaOpen(false);
                  }}
                >
                  {ui(lang, "theme")}
                </button>
                <button
                  type="button"
                  className={metaOpen ? primaryButtonClass : buttonClass}
                  onClick={() => {
                    setMetaOpen((v) => !v);
                    setThemeOpen(false);
                  }}
                >
                  {ui(lang, "pageInfo")}
                </button>
                <button type="button" className={buttonClass} onClick={sifirla}>
                  {ui(lang, "startOver")}
                </button>
                <a
                  className={buttonClass}
                  href="/preview/current"
                  target="_blank"
                  rel="noreferrer"
                >
                  {ui(lang, "preview")}
                </a>
              </div>
            )}
          />
        </div>
      </div>

      {metaOpen ? (
        <MetaPanel
          meta={site.meta}
          onChange={handleMeta}
          onClose={() => setMetaOpen(false)}
        />
      ) : null}

      {themeOpen ? (
        <ThemePanel
          tokens={site.tokens}
          onChange={handleTokens}
          onClose={() => setThemeOpen(false)}
        />
      ) : null}
    </div>
  );
}
