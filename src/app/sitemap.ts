import { MetadataRoute } from "next";

export default async function sitemap() {
  const baseUrl = "https://iba-website-i8fy.vercel.app";

  const staticPages = [
    { url: "", changefreq: "weekly", priority: 1 },
    { url: "/events", changefreq: "monthly", priority: 0.8 },
    { url: "/membership", changefreq: "monthly", priority: 0.7 },
    { url: "/about", changefreq: "monthly", priority: 0.7 },
    { url: "/dashboard", changefreq: "monthly", priority: 0.6 },
  ];

  return staticPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq,
    priority: page.priority,
  }));
}