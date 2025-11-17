/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.fallback = {
          fs: false,
        };
        return config;
      },
      images: {
        domains: [
            'localhost',
            // Extraer dominio de la variable de entorno si existe
            ...(process.env.NEXT_PUBLIC_API_URL 
                ? [new URL(process.env.NEXT_PUBLIC_API_URL).hostname]
                : []
            ),
        ].filter(Boolean),
    },
};

export default nextConfig;
