import type { ComponentConfig } from "@puckeditor/core";
import { HeaderCentered, type HeaderCenteredProps } from "@/blocks/Header/HeaderCentered";
import { AnchorField } from "./fields/AnchorField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const headerCenteredConfig: ComponentConfig<HeaderCenteredProps> = {
  label: "Ortalanmış",
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
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    logo: "Your company",
    links: [
      { label: "Services", href: "#services" },
      { label: "About", href: "#features" },
      { label: "Contact", href: "#contact" },
    ],
    animation: { ...DEFAULT_ANIMATION, type: "fade", trigger: "load", duration: 400 },
  },
  render: HeaderCentered,
};
