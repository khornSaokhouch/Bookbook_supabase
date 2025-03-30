/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "").split(".")[0] + ".supabase.co",
        port: '',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com', // Add this pattern for img.icons8.com
        port: '',
        pathname: '**', // You can further specify the path if needed
      },
    ],
  },
};

module.exports = nextConfig;