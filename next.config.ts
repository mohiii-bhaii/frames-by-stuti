import type { NextConfig } from "next";

// Photos published from the editor are served from this project's Supabase Storage bucket.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    // 75 is the default; photographs are served at 85 to keep fine detail (skin, lace, hair).
    qualities: [75, 85],
    remotePatterns: supabaseUrl ? [new URL("/storage/v1/object/public/site-photos/**", supabaseUrl)] : [],
  },
  // The old Services page now lives at /pricing. Temporary on purpose, until the new pages are confirmed.
  async redirects() {
    return [
      // The Portfolio page is now Galleries. A permanent (301) redirect keeps old links and search results working.
      { source: "/portfolio", destination: "/galleries", statusCode: 301 },
      { source: "/portfolio/:path*", destination: "/galleries", statusCode: 301 },
      { source: "/services", destination: "/pricing", permanent: false },
      // The pricing pages also answer to the /investments addresses.
      { source: "/investments", destination: "/pricing", permanent: false },
      { source: "/investments/lifestyle-family", destination: "/pricing/lifestyle", permanent: false },
      { source: "/investments/:slug(maternity|newborn|milestones|lifestyle|events|bundle)", destination: "/pricing/:slug", permanent: false },
    ];
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
