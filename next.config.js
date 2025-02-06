const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  reactStrictMode: process.env.REACT_STRICT_MODE === "true",
});

// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;
