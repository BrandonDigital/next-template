import type { MetadataRoute } from "next";
import { config } from "../config/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: config.app.name,
    short_name: config.app.shortName,
    description: config.app.description,
    start_url: config.pwa.startUrl,
    display: config.pwa.display,
    background_color: config.pwa.backgroundColor,
    theme_color: config.pwa.themeColor,
    orientation: config.pwa.orientation,
    scope: config.pwa.scope,
    categories: config.manifest.categories,
    lang: config.manifest.lang,
    dir: config.manifest.dir,
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
