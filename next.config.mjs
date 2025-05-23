/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'rvkgyxbusmlcyqgkdypb.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/images/**',
            },
            {
                protocol: 'https',
                hostname: 'rxcstiahrsnvjgneykml.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            }
        ]
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
