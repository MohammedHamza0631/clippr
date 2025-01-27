/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hndxrumxkadaokymltup.supabase.co', // Replace with your Supabase bucket's hostname
        port: '',
        pathname: '/storage/v1/object/public/**', // Adjust to match the bucket structure
      },
    ],
  },
};

export default nextConfig;
