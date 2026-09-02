import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "{{title}}",
    short_name: "{{shortTitle}}",
    description: "{{description}}",
    start_url: "/",
    display: "standalone",
    background_color: "{{bgColor}}",
    theme_color: "{{primaryColor}}",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  };
}
