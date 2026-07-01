import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ["http://192.168.18.108:3000"],

  turbopack: {},

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000,
      };
      config.devtool = false;
    }

    return config;
  },
  
  experimental: {
    turbopackFileSystemCacheForDev: true, // nome pode variar por versão, checar changelog
  },
};

export default withNextIntl(nextConfig);
