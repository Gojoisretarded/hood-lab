/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // keep the dev badge clear of the style switcher (bottom-left)
  devIndicators: { position: "bottom-right" },
  // the chain history used to live at /flight; keep old links working
  async redirects() {
    return [{ source: "/flight", destination: "/history", permanent: true }];
  },
};

export default nextConfig;
