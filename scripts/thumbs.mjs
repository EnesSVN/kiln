#!/usr/bin/env node
/**
 * Blok küçük resimleri — public/thumbs/<Blok>.webp (320x200).
 *
 * Elle ekran görüntüsü alınmaz: `npm run thumbs` 15 bloğu da yeniden üretir.
 * Yeni bir blok eklendiğinde tek yapılacak iş bu komutu çalıştırmak.
 *
 * BAĞIMLILIK YOK. İş bölümü:
 *   · app/thumb/[type] bloğu 1280x800'lük sabit bir çerçevede izole render eder
 *   · Chrome --headless --screenshot çerçeveyi webp olarak yazar
 *   · yine Chrome, canvas ile 320x200'e indirger (aşağıya bakın)
 *
 * Neden iki geçiş? Chrome'un cihaz ölçeği 0.5'in altına inmiyor, yani
 * 1280 genişlikte bir tuvalden doğrudan 320'lik bir görüntü alınamıyor.
 * Pencereyi 320'ye düşürmek de çözüm değil: medya sorguları viewport'a
 * bakıyor, blok masaüstü değil mobil düzeniyle çıkardı. Bu yüzden kadraj
 * 1280'de alınıp ikinci bir Chrome geçişinde canvas'ta küçültülüyor.
 *
 * Kullanım:
 *   node scripts/thumbs.mjs                 # kendi üretim sunucusunu başlatır
 *   node scripts/thumbs.mjs --url=...       # ayakta bir ÜRETİM sunucusu
 *   CHROME_PATH=/yol/chrome node scripts/thumbs.mjs
 */
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "thumbs");

/** Küçük resim ölçüsü. app/thumb/[type] çerçevesiyle aynı en boy oranı. */
const W = 320;
const H = 200;
/**
 * Kadraj ölçüsü — çerçevenin CSS boyutu.
 *
 * 1280 değil 1024: Tailwind'in en geniş kırılımı lg (min-width:1024px) ve
 * bloklar xl kullanmıyor, yani düzen aynı kalıyor. Dar kadraj ölçek oranını
 * 0.25'ten 0.3125'e çıkarıyor — küçük resimde içerik %25 daha büyük.
 */
const FRAME_W = 1024;
const FRAME_H = 640;

/**
 * Blok bazlı kadraj.
 *
 * Başlıklar ~80px'lik bir şerit; 1024x640'lık kadrajda küçük resmin neredeyse
 * tamamı boş kalıyor ve üç başlık birbirinden ayırt edilemiyordu. Kadrajı
 * kısaltmak boşluğu atıyor, daralttmak da ölçeği büyütüyor: 320/768 = 0.42,
 * 320/1024 = 0.31. 768 hâlâ masaüstü düzeni (Tailwind md = 768px), yani logo
 * ve menü ikisi de kadrajda kalıyor.
 */
const KADRAJ = {
  // Üç başlık da menüyü lg (1024) kırılımında açıyor; kadraj 1024'ün
  // altına inerse hamburger moduna düşüp üçü de aynı görünür.
  HeaderMinimal: { w: 1024, h: 200 },
  HeaderCentered: { w: 1024, h: 260 },
  HeaderSplit: { w: 1024, h: 220 },
};
const kadraj = (type) => KADRAJ[type] ?? { w: FRAME_W, h: FRAME_H };
const QUALITY = 0.82;
/** Kadraj arka planı — app/thumb rotası "Sade" presetini sabitliyor. */
const BG = "#ffffff";

const arg = (name) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

/* ---------------------------------------------------------------- Chrome */

const CHROME_CANDIDATES = {
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ],
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ],
};

function findChrome() {
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv) {
    if (!existsSync(fromEnv)) {
      throw new Error(`CHROME_PATH gösterdiği dosya yok: ${fromEnv}`);
    }
    return fromEnv;
  }
  const found = (CHROME_CANDIDATES[process.platform] ?? []).find((p) => existsSync(p));
  if (found) return found;
  throw new Error(
    "Chrome bulunamadı. Küçük resimler bir tarayıcı motoru istiyor (yeni npm\n" +
      "paketi eklememek için sistemdeki Chrome kullanılıyor).\n" +
      "Kurulu bir Chrome/Chromium/Edge yolunu şöyle verebilirsiniz:\n" +
      "  CHROME_PATH=/yol/chrome npm run thumbs",
  );
}

/**
 * Chrome'u çalıştırır. Kullanıcının kendi profiline ASLA dokunmaz.
 *
 * Bekçi şart: --user-data-dir verildiğinde Chrome işi bitirdikten sonra
 * (ekran görüntüsünü yazdıktan, DOM'u bastıktan sonra) kendiliğinden
 * çıkmıyor, süresiz asılı kalıyor. İzolasyondan vazgeçmek yerine işin
 * bittiğini kendimiz anlayıp süreci sonlandırıyoruz.
 */
function chrome(bin, args, { profileDir, outFile, untilStdout, timeoutMs = 60_000 }) {
  return new Promise((resolve, reject) => {
    const p = spawn(
      bin,
      [
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        `--user-data-dir=${profileDir}`,
        ...args,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    let out = "";
    let err = "";
    let bitti = false;
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));

    const kapat = (fn) => {
      if (bitti) return;
      bitti = true;
      clearInterval(nabiz);
      clearTimeout(saat);
      p.kill("SIGKILL");
      fn();
    };

    let oncekiBoyut = -1;
    const nabiz = setInterval(() => {
      if (untilStdout && out.includes(untilStdout)) return kapat(() => resolve(out));
      if (!outFile) return;
      if (!existsSync(outFile)) return;
      // Boyut iki ölçümde aynıysa yazma bitmiştir.
      const boyut = statSync(outFile).size;
      if (boyut > 0 && boyut === oncekiBoyut) return kapat(() => resolve(out));
      oncekiBoyut = boyut;
    }, 200);

    const saat = setTimeout(
      () => kapat(() => reject(new Error(`Chrome ${timeoutMs} ms içinde bitirmedi`))),
      timeoutMs,
    );

    p.on("error", (e) => kapat(() => reject(e)));
    p.on("close", (code) =>
      kapat(() =>
        code === 0 || bitti
          ? resolve(out)
          : reject(new Error(`Chrome ${code}: ${err.slice(-400)}`)),
      ),
    );
  });
}

/* ---------------------------------------------------------------- sunucu */

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitFor(url, ms) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      // sunucu henüz ayakta değil
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`sunucu ${ms} ms içinde yanıt vermedi: ${url}`);
}

/**
 * Üretim sunucusu — dev DEĞİL.
 *
 * `next dev` ile çalışmıyor: HMR bağlantısı hiç kapanmadığı için Chrome'un
 * --virtual-time-budget saati "bekleyen ağ isteği var" diye ilerlemiyor ve
 * ekran görüntüsü sonsuza kadar asılı kalıyor. Üretim sunucusunda böyle bir
 * bağlantı yok; ayrıca küçük resimler zaten kullanıcının göreceği üretim
 * çıktısını göstermeli.
 */
async function startProdServer(probePath) {
  const bin = join(ROOT, "node_modules", ".bin", "next");
  if (!existsSync(bin)) throw new Error("next bulunamadı — önce `npm install`");

  if (!existsSync(join(ROOT, ".next", "BUILD_ID"))) {
    console.log("[thumbs] üretim derlemesi yok, `next build` çalıştırılıyor…");
    await new Promise((resolve, reject) => {
      const b = spawn(bin, ["build"], { cwd: ROOT, stdio: "inherit" });
      b.on("error", reject);
      b.on("close", (c) => (c === 0 ? resolve() : reject(new Error("next build başarısız"))));
    });
  }

  const port = await freePort();
  const proc = spawn(bin, ["start", "-p", String(port)], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  let log = "";
  proc.stdout.on("data", (d) => (log += d));
  proc.stderr.on("data", (d) => (log += d));

  const base = `http://127.0.0.1:${port}`;
  try {
    await waitFor(base + probePath, 60_000);
  } catch (err) {
    proc.kill("SIGKILL");
    throw new Error(`${err.message}\n--- next start çıktısı ---\n${log.slice(-1200)}`);
  }
  return { base, stop: () => proc.kill("SIGKILL") };
}

/* ------------------------------------------------------------ küçültücü */

/**
 * 1280x800 webp'leri tek Chrome geçişinde 320x200'e indirger.
 *
 * Sonucu geri almanın yolu --dump-dom: sayfa data URI'leri DOM'a yazıyor,
 * biz de basılan HTML'den okuyoruz. Chrome'a komut göndermek WebSocket
 * isterdi, Node 20'de yerleşik WebSocket yok — bu yüzden tek yönlü kanal.
 */
async function downscale(bin, profileDir, workDir, names) {
  const page = `<!doctype html><meta charset="utf-8"><body><div id="out"></div>
<script>
const NAMES = ${JSON.stringify(names)};
const W = ${W}, H = ${H}, Q = ${QUALITY}, BG = "${BG}";
(async () => {
  const sonuc = {};
  for (const ad of NAMES) {
    const img = new Image();
    await new Promise((ok, hata) => {
      img.onload = ok;
      img.onerror = () => hata(new Error("okunamadı: " + ad));
      img.src = "./" + ad + ".webp";
    });
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // Kadrajlar artık aynı en boy oranında değil (başlıklar kısa). Genişliğe
    // göre sığdırıp kalan yeri sayfa arka planıyla dolduruyoruz; esnetmek
    // bloğu çarpıtırdı.
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    const k = W / img.width;
    const dh = Math.round(img.height * k);
    ctx.drawImage(img, 0, Math.round((H - dh) / 2), W, dh);
    sonuc[ad] = c.toDataURL("image/webp", Q);
  }
  document.getElementById("out").textContent = JSON.stringify(sonuc);
})().catch((e) => {
  document.getElementById("out").textContent = "HATA:" + e.message;
});
</script></body>`;

  const pagePath = join(workDir, "kucult.html");
  writeFileSync(pagePath, page);

  const dom = await chrome(
    bin,
    [
      "--allow-file-access-from-files",
      "--virtual-time-budget=30000",
      "--dump-dom",
      `file://${pagePath}`,
    ],
    { profileDir, untilStdout: "</html>", timeoutMs: 120_000 },
  );

  const m = dom.match(/<div id="out">([\s\S]*?)<\/div>/);
  if (!m) throw new Error("küçültme sayfası sonuç üretmedi");
  if (m[1].startsWith("HATA:")) throw new Error(`küçültme: ${m[1].slice(5)}`);

  const map = JSON.parse(m[1]);
  return Object.fromEntries(
    Object.entries(map).map(([ad, dataUri]) => [
      ad,
      Buffer.from(dataUri.split(",", 2)[1], "base64"),
    ]),
  );
}

/* ------------------------------------------------------------------ main */

async function main() {
  const bin = findChrome();

  // Blok listesini uygulamadan değil, kayıt defterinden okuyoruz: tek kaynak.
  const registry = readFileSync(join(ROOT, "blocks", "index.ts"), "utf8");
  const body = registry.match(/export const blocks[^{]*\{([\s\S]*?)\n\};/);
  if (!body) throw new Error("blocks/index.ts içindeki kayıt defteri okunamadı");
  const types = body[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!types.length) throw new Error("kayıt defterinde blok yok");

  const reuse = arg("url");
  const server = reuse
    ? { base: reuse.replace(/\/$/, ""), stop: () => {} }
    : await startProdServer(`/thumb/${types[0]}`);
  if (reuse) await waitFor(`${server.base}/thumb/${types[0]}`, 30_000);

  const workDir = mkdtempSync(join(tmpdir(), "kiln-thumbs-"));
  const profileDir = join(workDir, "profil");

  try {
    console.log(`[thumbs] ${types.length} blok · ${server.base}`);

    for (const type of types) {
      const url = `${server.base}/thumb/${type}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(
          `${type}: /thumb/${type} ${res.status} döndü — bu blok hiçbir demoda ` +
            `geçmiyor olabilir (lib/thumb-samples.ts örneği demolardan seçiyor)`,
        );
      }
      const hedef = join(workDir, `${type}.webp`);
      const k = kadraj(type);
      await chrome(
        bin,
        [`--window-size=${k.w},${k.h}`, `--screenshot=${hedef}`, `${url}?w=${k.w}&h=${k.h}`],
        { profileDir, outFile: hedef, timeoutMs: 60_000 },
      );
      if (!existsSync(hedef)) throw new Error(`${type}: ekran görüntüsü yazılmadı`);
      process.stdout.write(`  · ${type}\n`);
    }

    const kucuk = await downscale(bin, profileDir, workDir, types);

    mkdirSync(OUT_DIR, { recursive: true });
    let toplam = 0;
    for (const type of types) {
      const buf = kucuk[type];
      if (!buf) throw new Error(`${type}: küçültülmüş görsel dönmedi`);
      writeFileSync(join(OUT_DIR, `${type}.webp`), buf);
      toplam += buf.length;
    }

    console.log(
      `[thumbs] ${types.length} küçük resim · ${W}x${H} · ` +
        `${(toplam / 1024).toFixed(1)} KB · public/thumbs/`,
    );
  } finally {
    server.stop();
    rmSync(workDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(`[thumbs] ${err.message}`);
  process.exit(1);
});
