/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source:      "/catalog",
        destination: "/products",
        permanent:   true,
      },
      {
        source:      "/catalog/:path*",
        destination: "/products/:path*",
        permanent:   true,
      },
    ]
  },
}

export default nextConfig
