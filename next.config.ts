import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El proyecto vive dentro de un directorio con otros repos: fija la raíz
  // para que Turbopack no busque el lockfile más arriba.
  turbopack: { root: path.resolve(process.cwd()) },
  experimental: {
    serverActions: {
      // La convocatoria admite archivos de hasta 25 MB.
      bodySizeLimit: "26mb",
    },
  },
};

export default nextConfig;
