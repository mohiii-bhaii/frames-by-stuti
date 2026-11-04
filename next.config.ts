import type { NextConfig } from "next";

// Photos published from the editor are served from this project's Supabase Storage bucket.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseUrl ? [new URL("/storage/v1/object/public/site-photos/**", supabaseUrl)] : [],
  },
  // The old Services page now lives at /pricing. Temporary on purpose, until the new pages are confirmed.
  async redirects() {
    return [{ source: "/services", destination: "/pricing", permanent: false }];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
