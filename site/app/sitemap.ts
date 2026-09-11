import type { MetadataRoute } from "next";
import { SITE } from "@/content/copy";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/tech-specifications/`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
