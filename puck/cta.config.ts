import type { ComponentConfig } from "@puckeditor/core";
import { CTA, type CTAProps } from "@/blocks/CTA/CTA";
import { AnchorField } from "./fields/AnchorField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const ctaConfig: ComponentConfig<CTAProps> = {
  label: "CTA",
  fields: {
    title: { type: "text", label: "Başlık" },
    cta: {
      type: "object",
      label: "Buton",
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
    title: "Ready to start?",
    cta: { label: "Get in touch", href: "#contact" },
    animation: { ...DEFAULT_ANIMATION, type: "slide-up", duration: 600 },
  },
  render: CTA,
};
