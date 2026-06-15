import type { MetadataRoute } from "next";

const BASE = "https://wazo-digital.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/tarifs", "/register", "/login", "/app"];
  return pages.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
