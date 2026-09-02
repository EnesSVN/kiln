import { resp } from "@/lib/responsive";
import { Reveal } from "@/lib/Reveal";
import { container, heading, navLink } from "@/lib/styles";
import type { Animation, Link, Responsive } from "@/lib/types";

/* Adresi boş bağlantı BASILMAZ. href="" tıklanınca sayfayı yeniden
   yüklüyor: kullanıcı ölü bir düğmeye basıp hiçbir şey olmadığını
   sanıyordu. Etiket varsa ama adres yoksa bağlantı hiç çıkmıyor. */

export type FooterProps = {
  /**
   * Bölüm kimliği — HTML id niteliği. Sayfa içi çapa bağlantıları
   * (#hizmetler) buna bağlanır. Boşsa nitelik hiç basılmaz.
   */
  anchorId?: string;
  about: { title: string; text: string };
  links: { title: string; items: Link[] };
  contact: {
    title: string;
    phone?: string;
    email?: string;
    address?: string;
    /** Serbest satır — çalışma saatleri, lisans notu vb. */
    hours?: string;
  };
  /** Alt şerit — telif satırı. */
  bottomText?: string;
  /** Verilmezse temanın yoğunluk ayarından gelir. */
  padding?: Responsive<number>;
  animation?: Animation;
};

/** Footer — 3 sütun (hakkında / bağlantılar / iletişim) + alt şerit. */
export function Footer({
  anchorId,
  about,
  links,
  contact,
  bottomText,
  padding,
  animation,
}: FooterProps) {
  const columnTitle = `${heading} text-[length:var(--fs-h3)]`;

  return (
    <footer
      id={anchorId || undefined}
      className={`border-t border-[var(--c-border)] bg-[var(--c-bg)] ${padding === undefined ? "p-[var(--pad-section)]" : resp(padding, "p")}`}
    >
      <Reveal anim={animation} className={container}>
        {/* Mobilde tek sütun (docs/DESIGN.md) */}
        <div className="grid gap-[var(--space-lg)] md:grid-cols-3">
          {/* Başlığı da metni de boş bir sütun ızgarada yer kaplıyor ve
              çıktıda içi boş bir <div> bırakıyordu. */}
          <div className="flex flex-col gap-[var(--space)]">
            {about.title ? <h2 className={columnTitle}>{about.title}</h2> : null}
            {about.text ? (
              <p className="max-w-[65ch] text-[length:var(--fs-body)] leading-[1.6] text-[color:var(--c-muted)]">
                {about.text}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-[var(--space)]">
            {links.title ? <h2 className={columnTitle}>{links.title}</h2> : null}
            <ul className="flex flex-col gap-[var(--space)]">
              {links.items.filter((l) => l.href).map((link) => (
                <li key={link.href + link.label}>
                  <a href={link.href} className={navLink}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-[var(--space)]">
            {contact.title ? <h2 className={columnTitle}>{contact.title}</h2> : null}
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
          </div>
        </div>

        {bottomText ? (
          <div className="mt-[var(--space-lg)] border-t border-[var(--c-border)] pt-[var(--space)]">
            <p className="text-[length:var(--fs-body)] leading-[1.6] text-[color:var(--c-muted)]">
              {bottomText}
            </p>
          </div>
        ) : null}
      </Reveal>
    </footer>
  );
}
