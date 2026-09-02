import type { ComponentConfig } from "@puckeditor/core";
import { Footer, type FooterProps } from "@/blocks/Footer/Footer";
import { AnchorField } from "./fields/AnchorField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const footerConfig: ComponentConfig<FooterProps> = {
  label: "Alt bilgi",
  fields: {
    about: {
      type: "object",
      label: "Hakkında sütunu",
      objectFields: {
        title: { type: "text", label: "Başlık" },
        text: { type: "textarea", label: "Metin" },
      },
    },
    links: {
      type: "object",
      label: "Bağlantılar sütunu",
      objectFields: {
        title: { type: "text", label: "Başlık" },
        items: {
          type: "array",
          label: "Bağlantılar",
          arrayFields: {
            label: { type: "text", label: "Etiket" },
            href: { type: "text", label: "Bağlantı" },
          },
          defaultItemProps: { label: "New link", href: "#contact" },
          getItemSummary: (item) => item.label || "Bağlantı",
        },
      },
    },
    contact: {
      type: "object",
      label: "İletişim sütunu",
      objectFields: {
        title: { type: "text", label: "Başlık" },
        phone: { type: "text", label: "Telefon" },
        email: { type: "text", label: "E-posta" },
        address: { type: "textarea", label: "Adres" },
        hours: { type: "text", label: "Ek satır (çalışma saatleri vb.)" },
      },
    },
    bottomText: { type: "text", label: "Alt şerit" },
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    about: { title: "About", text: "One or two sentences about the business." },
    links: {
      title: "Links",
      items: [
        { label: "Services", href: "#services" },
        { label: "Contact", href: "#contact" },
      ],
    },
    contact: { title: "Contact", phone: "", email: "", address: "", hours: "" },
    bottomText: "© 2026 Your company",
    animation: { ...DEFAULT_ANIMATION, type: "fade", duration: 500 },
  },
  render: Footer,
};
