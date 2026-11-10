import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www\\.findamine\\.app" }],
        destination: "https://findamine.app/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        // Supabase Storage (hero scene images)
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
