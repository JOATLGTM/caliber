import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { NextConfig } from "next";

const here = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: here,
};

export default nextConfig;
