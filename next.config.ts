import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // The app is local-first: every screen renders from IndexedDB in the browser,
  // so there is nothing to server-render and nothing to revalidate.
  outputFileTracingExcludes: { "*": ["./prototype/**", "./docs/**"] },
};

export default config;
