import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/profile", "/post-auth", "/auth/"],
    },
    sitemap: "https://wazo-digital.com/sitemap.xml",
  };
}
