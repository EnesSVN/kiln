import type { ComponentConfig } from "@puckeditor/core";
import { Gallery, type GalleryProps } from "@/blocks/Gallery/Gallery";
import { AnchorField } from "./fields/AnchorField";
import { ImageListField } from "./fields/ImageField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const galleryConfig: ComponentConfig<GalleryProps> = {
  label: "Galeri",
  fields: {
    title: { type: "text", label: "Bölüm başlığı" },
    subtitle: { type: "textarea", label: "Bölüm açıklaması" },
    items: { type: "custom", label: "Görseller (1/1 önerilir)", render: ImageListField },
    columns: {
      type: "radio",
      label: "Sütun sayısı",
      options: [
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
      ],
    },
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    anchorId: "gallery",
    title: "Gallery",
    items: [{ src: "", alt: "" }],
    columns: 3,
    animation: { ...DEFAULT_ANIMATION, type: "slide-up", duration: 600, stagger: 90 },
  },
  render: Gallery,
};
