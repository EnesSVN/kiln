import type { ComponentConfig } from "@puckeditor/core";
import { HeaderSplit, type HeaderSplitProps } from "@/blocks/Header/HeaderSplit";
import { AnchorField } from "./fields/AnchorField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const headerSplitConfig: ComponentConfig<HeaderSplitProps> = {
  label: "Bölünmüş",
  fields: {
    logo: { type: "text", label: "Logo metni" },
    links: {
      type: "array",
      label: "Menü bağlantıları",
      arrayFields: {
        label: { type: "text", label: "Etiket" },
        href: { type: "text", label: "Bağlantı" },
      },
      defaultItemProps: { label: "New link", href: "#contact" },
      getItemSummary: (item) => item.label || "Bağlantı",
    },
    cta: {
      type: "object",
      label: "Buton",
      objectFields: {
        label: { type: "text", label: "Buton metni (boşsa buton çıkmaz)" },
        href: { type: "text", label: "Bağlantı" },
      },
    },
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    logo: "Your company",
    links: [
      { label: "Services", href: "#services" },
      { label: "Testimonials", href: "#testimonials" },
    ],
    cta: { label: "Get a quote", href: "#contact" },
    animation: { ...DEFAULT_ANIMATION, type: "fade", trigger: "load", duration: 400 },
  },
  render: HeaderSplit,
};
