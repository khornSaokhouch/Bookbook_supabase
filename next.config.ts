/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all hostnames for HTTPS
        port: '', // Allow any port
        pathname: '**', // Allow all paths
      },
      {
        protocol: 'http',
        hostname: '**', // Allow all hostnames for HTTP
        port: '', // Allow any port
        pathname: '**', // Allow all paths
      },
    ],
  },
};

module.exports = nextConfig;
