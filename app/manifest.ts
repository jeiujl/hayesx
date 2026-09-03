import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HayesX — HayesX-250 Pilot App",
    short_name: "HayesX",
    description:
      "Preflight checklist, digital logbook and manuals for the HayesX-250.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbfbf9",
    theme_color: "#fbfbf9",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
