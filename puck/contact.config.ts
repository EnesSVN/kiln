import type { ComponentConfig } from "@puckeditor/core";
import { Contact, type ContactProps } from "@/blocks/Contact/Contact";
import { AnchorField } from "./fields/AnchorField";
import { AnimationField, DEFAULT_ANIMATION } from "./fields/AnimationField";
import { ResponsiveNumberField } from "./fields/ResponsiveNumberField";

/** Sadece alan tanımları. Bileşen blocks/ altında ve Puck'ı bilmiyor. ZIP'E GİTMEZ. */
export const contactConfig: ComponentConfig<ContactProps> = {
  label: "İletişim",
  fields: {
    title: { type: "text", label: "Bölüm başlığı" },
    subtitle: { type: "textarea", label: "Bölüm açıklaması" },
    email: { type: "text", label: "Formun gideceği e-posta" },
    contact: {
      type: "object",
      label: "İletişim bilgileri",
      objectFields: {
        phone: { type: "text", label: "Telefon" },
        email: { type: "text", label: "E-posta" },
        address: { type: "textarea", label: "Adres" },
        hours: { type: "text", label: "Çalışma saatleri" },
      },
    },
    mapEmbedUrl: { type: "text", label: "Harita gömme adresi (boşsa harita çıkmaz)" },
    gonderEtiketi: { type: "text", label: "Gönder butonu metni" },
    formEtiketleri: {
      type: "object",
      label: "Form alan etiketleri",
      objectFields: {
        isim: { type: "text", label: "İsim alanı etiketi" },
        telefon: { type: "text", label: "Telefon alanı etiketi" },
        mesaj: { type: "text", label: "Mesaj alanı etiketi" },
      },
    },
    anchorId: { type: "custom", label: "Bölüm kimliği", render: AnchorField },
    padding: { type: "custom", label: "İç boşluk", render: ResponsiveNumberField },
    animation: { type: "custom", label: "Animasyon", render: AnimationField },
  },
  defaultProps: {
    anchorId: "contact",
    title: "Contact",
    email: "",
    contact: { phone: "", email: "", address: "", hours: "" },
    mapEmbedUrl: "",
    gonderEtiketi: "Send",
    formEtiketleri: { isim: "Name", telefon: "Phone", mesaj: "Message" },
    animation: { ...DEFAULT_ANIMATION, type: "fade", duration: 500 },
  },
  render: Contact,
};
