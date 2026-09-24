import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "All-time — Local AI",
    short_name: "All-time",
    description:
      "A browser-first local AI workspace for testing compact open models.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#070b11",
    theme_color: "#0b1420",
    lang: "en",
    categories: ["productivity", "developer", "utilities"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
