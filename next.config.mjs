/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "**.replicate.delivery" },
      { protocol: "https", hostname: "replicate.delivery" },
    ],
  },
}

export default nextConfig
