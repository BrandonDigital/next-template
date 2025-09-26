export const config = {
  app: {
    name: "Next.js PWA Template",
    shortName: "NextPWA",
    description:
      "A Next.js Progressive Web App template with push notifications",
    url: "https://your-website.com",
    email: "your-email@example.com",
  },
  pwa: {
    themeColor: "#000000",
    backgroundColor: "#ffffff",
    display: "standalone" as const,
    orientation: "portrait-primary" as const,
    startUrl: "/",
    scope: "/",
  },
  icons: {
    sizes: [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512],
    maskableSizes: [192, 512],
    appleTouchSizes: [57, 60, 72, 76, 114, 120, 144, 152, 180],
  },
  manifest: {
    categories: ["productivity", "utilities"] as string[],
    lang: "en",
    dir: "ltr",
  },
} as const;

export type Config = typeof config;
