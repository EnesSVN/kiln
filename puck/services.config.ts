import type { ComponentConfig } from "@puckeditor/core";
import { Services, type ServicesProps } from "@/blocks/Services/Services";
import { AnchorField } from "./fields/AnchorField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const servicesConfig: ComponentConfig<ServicesProps> = {
  label: "Hizmetler",
  fields: {
    title: { type: "text", label: "Bölüm başlığı" },
    subtitle: { type: "textarea", label: "Bölüm açıklaması" },
    items: {
      type: "array",
      label: "Kartlar",
      arrayFields: {
        icon: {
          type: "select",
          label: "İkon",
          options: [
            { label: "Onay", value: "onay" },
            { label: "Kalkan", value: "kalkan" },
            { label: "Saat", value: "saat" },
            { label: "Anahtar", value: "anahtar" },
            { label: "Telefon", value: "telefon" },
            { label: "Kamyon", value: "kamyon" },
            { label: "Ev", value: "ev" },
            { label: "Yıldız", value: "yildiz" },
          ],
        },
        title: { type: "text", label: "Başlık" },
        text: { type: "textarea", label: "Açıklama" },
        href: { type: "text", label: "Bağlantı (boşsa kart tıklanmaz)" },
      },
      defaultItemProps: { icon: "onay", title: "New service", text: "One or two sentences about this service.", href: "" },
      getItemSummary: (item) => item.title || "Hizmet",
    },
    columns: {
      type: "radio",
      label: "Sütun sayısı",
      options: [
        { label: "3'lü", value: 3 },
        { label: "4'lü", value: 4 },
      ],
    },
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    anchorId: "services",
    title: "What we do",
    items: [
      { icon: "kalkan", title: "Service name", text: "One or two sentences about this service." },
      { icon: "saat", title: "Service name", text: "One or two sentences about this service." },
      { icon: "anahtar", title: "Service name", text: "One or two sentences about this service." },
    ],
    columns: 3,
    animation: { ...DEFAULT_ANIMATION, type: "slide-up", duration: 600, stagger: 90 },
  },
  render: Services,
};
