/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      'dbueyvwsrhxbwuxwlspo.supabase.co',
      'your-project.supabase.co', // Add this if you are using a different Supabase project domain
      'img.icons8.com',
      'encrypted-tbn0.gstatic.com',
      'lh3.googleusercontent.com',   // Google profile photos
      'avatars.githubusercontent.com', // GitHub
      'secure.gravatar.com',        // Gravatar
      'gravatar.com',
      // Add more specific domains as needed
    ],
    remotePatterns: [
      // Support for Supabase storage
      {
        protocol: 'https',
        hostname: 'dbueyvwsrhxbwuxwlspo.supabase.co',
        pathname: '/storage/v1/object/public/**',  // Allow any public storage path
      },
      {
        protocol: 'https',
        hostname: 'your-project.supabase.co',  // Another Supabase domain
        pathname: '/storage/v1/object/public/**',
      },

      // Support for Icons8
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        pathname: '/**',  // Allow all paths on icons8.com
      },

      // Support for Google images
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/images**',  // Allow image paths
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',  // Allow all paths (e.g., profile photos)
      },

      // Support for Gravatar
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        pathname: '/**',  // Allow all paths
      },
      {
        protocol: 'https',
        hostname: 'gravatar.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/images**',
      }      
    ],
  },
};

module.exports = nextConfig;
