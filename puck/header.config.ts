import type { ComponentConfig } from "@puckeditor/core";
import { HeaderMinimal, type HeaderMinimalProps } from "@/blocks/Header/HeaderMinimal";
import { AnchorField } from "./fields/AnchorField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/**
 * Sadece alan tanımları. Bileşenin kendisi blocks/ altında ve Puck'ı bilmiyor.
 * Bu dosya ZIP'e GİTMEZ.
 */
export const headerMinimalConfig: ComponentConfig<HeaderMinimalProps> = {
  label: "Minimal",
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
      { label: "Contact", href: "#contact" },
    ],
    animation: { ...DEFAULT_ANIMATION, type: "fade", trigger: "load", duration: 400 },
  },
  render: HeaderMinimal,
};
