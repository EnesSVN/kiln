import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { demoIds, loadDemo } from "@/lib/demos";
import { Render } from "@/lib/render";
import { fontVariablesFor } from "@/lib/fonts";
import { tokensToCss } from "@/lib/tokens";

/** Her demo build zamanında statik sayfaya dönüşür. */
export function generateStaticParams() {
  return demoIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/preview/[id]">): Promise<Metadata> {
  const { id } = await params;
  const site = loadDemo(id);
  if (!site) return {};
  return { title: site.meta.title, description: site.meta.description };
}

export default async function PreviewPage({ params }: PageProps<"/preview/[id]">) {
  const { id } = await params;
  const site = loadDemo(id);
  if (!site) notFound();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: tokensToCss(site.tokens) }} />
      {/*
        Demolar Türkçe, studio kabuğu İngilizce: <html lang> kök layout'ta
        tek değer taşıyabildiği için sayfa kendi dilini burada bildiriyor.
        Eleman düzeyindeki lang geçerli HTML; hem ekran okuyucu hem de
        text-transform bunu dikkate alıyor.
      */}
      <div lang={site.meta.lang} className={`${fontVariablesFor(site.tokens.font)} min-h-screen bg-[var(--c-bg)] font-[family-name:var(--font-body)] text-[length:var(--fs-body)] text-[color:var(--c-fg)]`}>
        <Render nodes={site.nodes} lang={site.meta.lang} />
      </div>
    </>
  );
}
