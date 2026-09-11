import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // hayesx.net serves /tech-specifications/ with a trailing slash; keep the
  // existing URLs so inbound links and search rankings carry over.
  trailingSlash: true,
};

export default config;
