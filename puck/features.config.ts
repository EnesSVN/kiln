import type { ComponentConfig } from "@puckeditor/core";
import { Features, type FeaturesProps } from "@/blocks/Features/Features";
import { AnchorField } from "./fields/AnchorField";
import { ImageField } from "./fields/ImageField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const featuresConfig: ComponentConfig<FeaturesProps> = {
  label: "Özellikler",
  fields: {
    title: { type: "text", label: "Bölüm başlığı" },
    subtitle: { type: "textarea", label: "Bölüm açıklaması" },
    items: {
      type: "array",
      label: "Şeritler",
      arrayFields: {
        title: { type: "text", label: "Başlık" },
        text: { type: "textarea", label: "Açıklama" },
        image: { type: "custom", label: "Görsel (4/3)", render: ImageField },
      },
      defaultItemProps: {
        title: "New step",
        text: "Describe this step in a sentence or two.",
        image: { src: "", alt: "" },
      },
      getItemSummary: (item) => item.title || "Şerit",
    },
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    anchorId: "features",
    title: "How it works",
    items: [
      {
        title: "Step title",
        text: "Describe this step in a sentence or two.",
        image: { src: "", alt: "" },
      },
    ],
    animation: { ...DEFAULT_ANIMATION, type: "slide-up", duration: 600, stagger: 90 },
  },
  render: Features,
};
