import type { ComponentConfig } from "@puckeditor/core";
import { FAQ, type FAQProps } from "@/blocks/FAQ/FAQ";
import { AnchorField } from "./fields/AnchorField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const faqConfig: ComponentConfig<FAQProps> = {
  label: "SSS",
  fields: {
    title: { type: "text", label: "Bölüm başlığı" },
    subtitle: { type: "textarea", label: "Bölüm açıklaması" },
    items: {
      type: "array",
      label: "Sorular",
      arrayFields: {
        question: { type: "text", label: "Soru" },
        answer: { type: "textarea", label: "Cevap" },
      },
      defaultItemProps: { question: "New question", answer: "The answer goes here." },
      getItemSummary: (item) => item.question || "Soru",
    },
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    anchorId: "faq",
    title: "Frequently asked",
    items: [{ question: "Your question here", answer: "The answer goes here." }],
    animation: { ...DEFAULT_ANIMATION, type: "fade", duration: 500, stagger: 60 },
  },
  render: FAQ,
};
