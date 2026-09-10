/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root; a stray lockfile in a parent dir otherwise makes
  // Next guess the wrong root.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // Character portraits are served from third-party CDNs; `next/image`
    // refuses remote hosts that are not listed here. Hosts are mirrored in
    // `src/features/team-builder/characterAssets.ts` (AVATAR_CDN_HOST /
    // AVATAR_FALLBACK_CDN_HOST) — change both together.
    remotePatterns: [
      { protocol: "https", hostname: "api.lunaris.moe", pathname: "/data/assets/**" },
      { protocol: "https", hostname: "gi.yatta.moe", pathname: "/assets/**" },
    ],
  },
};

export default nextConfig;
