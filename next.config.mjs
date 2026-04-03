/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 100],
    remotePatterns: [
      {
        // Supabase storage (replace YOUR_PROJECT_REF with your actual project ref)
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Allow any https image (for blog post images from external sources)
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
