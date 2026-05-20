import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "carrera.arte7.net" }],
        destination: "https://carrera.proyectoarte7.net/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
