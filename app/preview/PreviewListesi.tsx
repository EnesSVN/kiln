"use client";

import Link from "next/link";
import { ui } from "@/lib/i18n";
import { useLang } from "@/lib/lang-store";

/**
 * Demo listesinin arayüz kabuğu.
 *
 * Sayfanın kendisi sunucu bileşeni kalıyor — demo JSON'ları istemci
 * paketine girmesin. Yalnızca çeviri ve gezinme burada, çünkü arayüz dili
 * localStorage'da ve sunucu onu göremiyor. Başlık ve "blok" sözcüğü sabit
 * Türkçeydi: İngilizce arayüzde de "Önizlemeler · 8 blok" yazıyordu.
 */
export function PreviewListesi({
  demolar,
}: {
  demolar: { id: string; baslik: string; blok: number }[];
}) {
  const lang = useLang();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {ui(lang, "previewsTitle")}
        </h1>
        {/* Buraya gelen kullanıcının çıkışı yoktu; tek yol geri düğmesiydi. */}
        <Link
          href="/edit"
          className="rounded border border-[var(--c-border)] px-3 py-1.5 text-sm hover:border-[var(--c-fg)]"
        >
          {ui(lang, "backToEditor")}
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {demolar.map((d) => (
          <li key={d.id}>
            <Link
              href={`/preview/${d.id}`}
              className="block rounded-lg border border-[var(--c-border)] p-4 hover:border-[var(--c-fg)]"
            >
              <span className="font-medium">{d.baslik}</span>
              <span className="block text-sm text-[color:var(--c-muted)]">
                /preview/{d.id} · {ui(lang, "blockCount", { count: d.blok })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
