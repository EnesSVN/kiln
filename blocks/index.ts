import { CTA } from "./CTA/CTA";
import { Carousel } from "./Carousel/Carousel";
import { Contact } from "./Contact/Contact";
import { FAQ } from "./FAQ/FAQ";
import { Features } from "./Features/Features";
import { Footer } from "./Footer/Footer";
import { Gallery } from "./Gallery/Gallery";
import { HeaderCentered } from "./Header/HeaderCentered";
import { HeaderMinimal } from "./Header/HeaderMinimal";
import { HeaderSplit } from "./Header/HeaderSplit";
import { HeroFull } from "./Hero/HeroFull";
import { HeroSplit } from "./Hero/HeroSplit";
import { HeroText } from "./Hero/HeroText";
import { Services } from "./Services/Services";
import { Testimonials } from "./Testimonials/Testimonials";

export {
  CTA,
  Carousel,
  Contact,
  FAQ,
  Features,
  Footer,
  Gallery,
  HeaderCentered,
  HeaderMinimal,
  HeaderSplit,
  HeroFull,
  HeroSplit,
  HeroText,
  Services,
  Testimonials,
};

export type { CTAProps } from "./CTA/CTA";
export type { CarouselProps } from "./Carousel/Carousel";
export type { ContactProps } from "./Contact/Contact";
export type { FAQProps } from "./FAQ/FAQ";
export type { FeaturesProps } from "./Features/Features";
export type { FooterProps } from "./Footer/Footer";
export type { GalleryProps } from "./Gallery/Gallery";
export type { HeaderCenteredProps } from "./Header/HeaderCentered";
export type { HeaderMinimalProps } from "./Header/HeaderMinimal";
export type { HeaderSplitProps } from "./Header/HeaderSplit";
export type { HeroFullProps } from "./Hero/HeroFull";
export type { HeroSplitProps } from "./Hero/HeroSplit";
export type { HeroTextProps } from "./Hero/HeroText";
export type { ServicesProps } from "./Services/Services";
export type { TestimonialsProps } from "./Testimonials/Testimonials";

/**
 * Blok kayıt defteri. site.json'daki `type` alanı buradaki anahtarla eşleşir.
 *
 * Props tipi burada kayboluyor çünkü JSON<->bileşen sınırı dinamik: her bloğun
 * props'u farklı. Doğrulama şemanın işi (lib/schema.ts), bileşen sınırının değil.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blocks: Record<string, React.ComponentType<any>> = {
  HeaderMinimal,
  HeaderCentered,
  HeaderSplit,
  HeroSplit,
  HeroFull,
  HeroText,
  Services,
  Features,
  Gallery,
  Testimonials,
  FAQ,
  Carousel,
  CTA,
  Contact,
  Footer,
};
