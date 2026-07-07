import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // permite baixar via fetch de outras origens (ex.: App Store Connect, ao anexar a captura)
        source: "/assinatura-review.png",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
