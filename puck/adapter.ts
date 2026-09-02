import type { Data } from "@puckeditor/core";
import type { Site, SiteNode } from "@/lib/types";

/**
 * Site <-> Puck Data çevirisi.
 *
 * İki şeklin tek farkı id'nin nerede durduğu:
 *   Site : { id, type, props }        — id props'un DIŞINDA
 *   Puck : { type, props: { ...props, id } } — id props'un İÇİNDE
 *
 * Şemayı Puck'ın şekline uydurmak kolay olurdu ama çıktı JSON'u
 * Puck'a bağlanırdı. Çeviri burada, sınırda kalıyor.
 *
 * DİKKAT: "id" bloklarda ayrılmış prop adı. Bir blok gerçekten `id` prop'u
 * alırsa bu çeviri onu yutar.
 */

/** meta ve tokens Puck'ta düzenlenmiyor; Site'ta taşınıp aynen geri konuyor. */
export function siteToPuckData(site: Site): Data {
  return {
    root: { props: {} },
    content: site.nodes.map((n) => ({
      type: n.type,
      props: { ...n.props, id: n.id },
    })),
    zones: {},
  };
}

export function puckDataToSite(data: Data, base: Site): Site {
  const content = data.content ?? [];

  const nodes: SiteNode[] = content.map((item, i) => {
    const { id, ...props } = item.props as Record<string, unknown> & {
      id?: string;
    };
    return {
      id: typeof id === "string" && id ? id : `${item.type}-${i}`,
      type: item.type as string,
      props,
    };
  });

  return { ...base, nodes };
}
