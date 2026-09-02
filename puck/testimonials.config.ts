import type { ComponentConfig } from "@puckeditor/core";
import { Testimonials, type TestimonialsProps } from "@/blocks/Testimonials/Testimonials";
import { AnchorField } from "./fields/AnchorField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const testimonialsConfig: ComponentConfig<TestimonialsProps> = {
  label: "Referanslar",
  fields: {
    title: { type: "text", label: "Bölüm başlığı" },
    subtitle: { type: "textarea", label: "Bölüm açıklaması" },
    items: {
      type: "array",
      label: "Alıntılar",
      arrayFields: {
        quote: { type: "textarea", label: "Alıntı" },
        author: { type: "text", label: "İsim" },
        role: { type: "text", label: "Ünvan / firma" },
      },
      defaultItemProps: { quote: "What the customer said.", author: "Customer name", role: "" },
      getItemSummary: (item) => item.author || "Alıntı",
    },
    columns: {
      type: "radio",
      label: "Sütun sayısı",
      options: [
        { label: "2", value: 2 },
        { label: "3", value: 3 },
      ],
    },
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    anchorId: "testimonials",
    title: "What clients say",
    items: [
      { quote: "What the customer said about working with you.", author: "Customer name", role: "Role or company" },
    ],
    columns: 3,
    animation: { ...DEFAULT_ANIMATION, type: "slide-up", duration: 600, stagger: 90 },
  },
  render: Testimonials,
};
