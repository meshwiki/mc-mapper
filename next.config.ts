import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    cacheComponents: true,
    allowedDevOrigins: ["192.168.2.5", "192.168.2.40"],
    logging: {
        fetches: {
            fullUrl: true,
            hmrRefreshes: true,
        },
        serverFunctions: true,
        browserToTerminal: true,
    },
};

export default nextConfig;
