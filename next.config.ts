import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // permite baixar via fetch de outras origens (ex.: App Store Connect, ao anexar a captura)
        source: "/assinatura-review.png",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
      {
        // vídeos de resposta ao App Review (temporários) — mesmo truque de anexo via fetch
        source: "/review-video-:n.mp4",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
