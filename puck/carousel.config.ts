import type { ComponentConfig } from "@puckeditor/core";
import { Carousel, type CarouselProps } from "@/blocks/Carousel/Carousel";
import { AnchorField } from "./fields/AnchorField";
import { ImageListField } from "./fields/ImageField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const carouselConfig: ComponentConfig<CarouselProps> = {
  label: "Carousel",
  fields: {
    title: { type: "text", label: "Bölüm başlığı" },
    subtitle: { type: "textarea", label: "Bölüm açıklaması" },
    items: { type: "custom", label: "Slaytlar (16/9)", render: ImageListField },
    autoplayMs: {
      type: "select",
      label: "Otomatik oynatma",
      options: [
        { label: "Kapalı", value: 0 },
        { label: "3 saniye", value: 3000 },
        { label: "5 saniye", value: 5000 },
        { label: "8 saniye", value: 8000 },
      ],
    },
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    title: "Slides",
    items: [{ src: "", alt: "" }],
    autoplayMs: 0,
    animation: { ...DEFAULT_ANIMATION, type: "fade", duration: 600 },
  },
  render: Carousel,
};
