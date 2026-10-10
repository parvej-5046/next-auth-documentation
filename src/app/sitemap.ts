import type { MetadataRoute } from "next";

import { env } from "@/config/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: env.NEXT_PUBLIC_APP_URL, lastModified: new Date() },
    { url: `${env.NEXT_PUBLIC_APP_URL}/login`, lastModified: new Date() },
  ];
}
