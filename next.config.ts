/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'dbueyvwsrhxbwuxwlspo.supabase.co',
      'img.icons8.com',
      'encrypted-tbn0.gstatic.com',
      'lh3.googleusercontent.com',   // Google profile photos
      'avatars.githubusercontent.com', // GitHub
      'secure.gravatar.com',        // Gravatar
      'gravatar.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dbueyvwsrhxbwuxwlspo.supabase.co',
        pathname: '/storage/v1/object/public/recipes/**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dbueyvwsrhxbwuxwlspo.supabase.co',
        pathname: '/storage/v1/object/sign/image-user/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'dbueyvwsrhxbwuxwlspo.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com', // 👈 Optional: Add this for stricter matching
        pathname: '/images**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/images**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gravatar.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
