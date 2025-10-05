import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // evita gerar sourcemaps de produção
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ["http://192.168.18.108:3000"],

  webpack: (config, { dev }) => {
    if (dev) {
      // Evita escanear node_modules e reduz frequência de rebuild
      config.watchOptions = {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000, // ou undefined se quiser polling nativo
      };

      // Desliga sourcemaps no dev (alivio no DevTools)
      // (se preferir apenas reduzir, mude para um valor como 'eval')
      config.devtool = false;
    }

    return config;
  },
};

export default nextConfig;
