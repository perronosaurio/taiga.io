/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle discord.js on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'zlib-sync': false,
        'undici': false,
      };
    }
    
    // Exclude discord.js from client bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('discord.js');
    }
    
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['discord.js', 'zlib-sync', 'undici'],
  },
};

module.exports = nextConfig;
