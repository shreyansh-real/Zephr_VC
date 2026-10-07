/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Firebase Hosting
  output: "export",

  // Trailing slash for static hosting compatibility
  trailingSlash: true,

  // Disable image optimization (not supported with static export;
  // we compress client-side anyway before upload)
  images: {
    unoptimized: true,
  },

  // TypeScript errors must be fixed before shipping
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
