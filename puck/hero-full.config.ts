import type { ComponentConfig } from "@puckeditor/core";
import { HeroFull, type HeroFullProps } from "@/blocks/Hero/HeroFull";
import { AnchorField } from "./fields/AnchorField";
import { ImageField } from "./fields/ImageField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const heroFullConfig: ComponentConfig<HeroFullProps> = {
  label: "Tam ekran",
  fields: {
    title: { type: "text", label: "Başlık" },
    subtitle: { type: "textarea", label: "Alt başlık" },
    image: { type: "custom", label: "Görsel (16/9)", render: ImageField },
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
    image: { src: "", alt: "" },
    cta: { label: "Get in touch", href: "#contact" },
    secondaryCta: { label: "Services", href: "#services" },
    animation: { ...DEFAULT_ANIMATION, type: "fade", duration: 700 },
  },
  render: HeroFull,
};
