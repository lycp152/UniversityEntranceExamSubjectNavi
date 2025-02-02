/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // セキュリティヘッダーの設定
  async headers() {
    // CSPディレクティブをカテゴリ別に整理
    const cspDirectives = {
      // 基本的なリソースの制御
      defaultSrc: ["'self'"],

      // スクリプト関連の制御
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],

      // スタイル関連の制御
      styleSrc: ["'self'", "'unsafe-inline'"],

      // メディアリソースの制御
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],

      // 通信の制御
      connectSrc: ["'self'"],

      // フレームとナビゲーションの制御
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    };

    // ディレクティブを文字列に変換
    const cspString = Object.entries(cspDirectives)
      .map(([key, values]) => {
        // キャメルケースをケバブケースに変換
        const directive = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        return `${directive} ${values.join(" ")}`;
      })
      .join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspString,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
