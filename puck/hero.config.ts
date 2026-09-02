import type { ComponentConfig } from "@puckeditor/core";
import { HeroSplit, type HeroSplitProps } from "@/blocks/Hero/HeroSplit";
import { AnchorField } from "./fields/AnchorField";
import { ImageField } from "./fields/ImageField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. ZIP'e GİTMEZ. */
export const heroSplitConfig: ComponentConfig<HeroSplitProps> = {
  label: "Bölünmüş",
  fields: {
    title: { type: "text", label: "Başlık" },
    subtitle: { type: "textarea", label: "Alt başlık" },
    image: { type: "custom", label: "Görsel", render: ImageField },
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
    title: "Your headline here",
    subtitle: "One sentence that explains what you do.",
    image: { src: "", alt: "" },
    cta: { label: "Get in touch", href: "#contact" },
    animation: { ...DEFAULT_ANIMATION, type: "slide-up", duration: 700, delay: 80 },
  },
  render: HeroSplit,
};
