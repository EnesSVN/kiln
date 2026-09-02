import { resp } from "@/lib/responsive";
import { bt } from "@/lib/block-text";
import { Reveal } from "@/lib/Reveal";
import { btnPrimary, container, frame, heading, navLink } from "@/lib/styles";
import type { Animation, Responsive } from "@/lib/types";

export type ContactProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  title?: string;
  subtitle?: string;
  /** Formun gideceği e-posta adresi. */
  email: string;
  contact: { phone?: string; email?: string; address?: string; hours?: string };
  /** Harita gömme adresi (ör. OpenStreetMap embed). Boşsa harita çıkmaz. */
  mapEmbedUrl?: string;
  /** Sitenin dili; Render veriyor. Sabit metinler için. */
  lang?: string;
  gonderEtiketi?: string;
  /**
   * Form alanlarının etiketleri.
   *
   * Bloğa gömülüydüler: İngilizce bir site kurup indirdiğinizde form
   * "İsim / Telefon / Mesaj" diyordu ve editörde düzeltilecek yer yoktu.
   */
  formEtiketleri?: { isim?: string; telefon?: string; mesaj?: string };
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
};

const label = "flex flex-col gap-[calc(var(--space)/2)] text-[length:var(--fs-body)]";
// Kenarlık şart: yüzey tek başına "buraya yazılır" demiyor, koyu temada
// alanlar sayfa zeminiyle neredeyse aynı görünüyordu.
const input =
  "min-h-[44px] w-full rounded-[var(--radius)] border border-[color:var(--c-field)] bg-[var(--c-surface)] px-[calc(var(--space)/2)] py-[calc(var(--space)/2)] text-[length:var(--fs-body)] text-[color:var(--c-fg)] outline-none focus-visible:border-[color:var(--c-primary)] focus-visible:ring-2 focus-visible:ring-[var(--c-primary)]";

/**
 * İletişim — solda form, sağda bilgiler + harita.
 *
 * Form JS'SİZ: action="mailto:" ve method="post". Gönder'e basınca
 * tarayıcı kullanıcının e-posta istemcisini açıyor. Arka uç yok (v1 kararı),
 * dolayısıyla tek JS'siz seçenek bu.
 */
export function Contact({
  anchorId,
  title,
  subtitle,
  email,
  contact,
  mapEmbedUrl,
  gonderEtiketi = "Send",
  formEtiketleri,
  padding,
  animation,
  lang,
}: ContactProps) {
  return (
    <section
      id={anchorId || undefined}
      className={`bg-[var(--c-bg)] ${padding === undefined ? "p-[var(--pad-section)]" : resp(padding, "p")}`}
    >
      <Reveal anim={animation} className={`${container} flex flex-col gap-[var(--space-lg)]`}>
        {title || subtitle ? (
          <div className="flex flex-col gap-[var(--space)]">
            {title ? (
              <h2 className={`${heading} text-[length:var(--fs-h2)] text-balance`}>{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="max-w-[65ch] leading-[1.6] text-[length:var(--fs-body)] text-[color:var(--c-muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-[var(--space-lg)] md:grid-cols-2">
          {/* Sol: form */}
          <form
            action={`mailto:${email}`}
            method="post"
            encType="text/plain"
            className="flex flex-col gap-[var(--space)]"
          >
            <label className={label}>
              <span className="text-[color:var(--c-muted)]">{formEtiketleri?.isim || "Name"}</span>
              <input className={input} type="text" name="isim" autoComplete="name" required />
            </label>
            <label className={label}>
              <span className="text-[color:var(--c-muted)]">{formEtiketleri?.telefon || "Phone"}</span>
              <input className={input} type="tel" name="telefon" autoComplete="tel" required />
            </label>
            <label className={label}>
              <span className="text-[color:var(--c-muted)]">{formEtiketleri?.mesaj || "Message"}</span>
              <textarea className={`${input} min-h-[120px]`} name="mesaj" rows={4} required />
            </label>
            <button type="submit" className={`${btnPrimary} w-full sm:w-auto`}>
              {gonderEtiketi}
            </button>
          </form>

          {/* Sağ: bilgiler + harita */}
          <div className="flex flex-col gap-[var(--space-lg)]">
            <ul className="flex flex-col gap-[var(--space)] text-[length:var(--fs-body)] leading-[1.6] text-[color:var(--c-muted)]">
              {contact.phone ? (
                <li>
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className={navLink}>
                    {contact.phone}
                  </a>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`} className={navLink}>
                    {contact.email}
                  </a>
                </li>
              ) : null}
              {contact.address ? <li>{contact.address}</li> : null}
              {contact.hours ? <li>{contact.hours}</li> : null}
            </ul>

            {mapEmbedUrl ? (
              <div className={frame}>
                <iframe
                  src={mapEmbedUrl}
                  title={bt(lang, "locationMap")}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[4/3] w-full border-0"
                />
              </div>
            ) : null}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
