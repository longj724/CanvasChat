/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['img.clerk.com', 'utfs.io', 'mwbkkujllezvgvvudxer.supabase.co'],
  },
};

export default nextConfig;
