import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators : false,
  images : {
    remotePatterns : [
      {
        protocol: 'https',
        hostname: 'iiedtt3r8m.ufs.sh',
      }
    ]
  }
};

export default nextConfig;
