import type { ComponentConfig } from "@puckeditor/core";
import { HeroText, type HeroTextProps } from "@/blocks/Hero/HeroText";
import { AnchorField } from "./fields/AnchorField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const heroTextConfig: ComponentConfig<HeroTextProps> = {
  label: "Metin odaklı",
  fields: {
    title: { type: "text", label: "Başlık" },
    subtitle: { type: "textarea", label: "Alt başlık" },
    cta: {
      type: "object",
      label: "Birincil buton",
      objectFields: {
        label: { type: "text", label: "Buton metni (boşsa çıkmaz)" },
        href: { type: "text", label: "Bağlantı" },
      },
    },
    secondaryCta: {
      type: "object",
      label: "İkincil buton",
      objectFields: {
        label: { type: "text", label: "Buton metni (boşsa çıkmaz)" },
        href: { type: "text", label: "Bağlantı" },
      },
    },
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    title: "Your headline here",
    subtitle: "One sentence that explains what you do.",
    cta: { label: "Get a quote", href: "#contact" },
    secondaryCta: { label: "How it works", href: "#services" },
    animation: { ...DEFAULT_ANIMATION, type: "slide-up", duration: 650 },
  },
  render: HeroText,
};
