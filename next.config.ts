import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The chat route reads the assistant's knowledge file at runtime, so ship it with the serverless function.
  outputFileTracingIncludes: { "/api/chat": ["./content/profile.md"] },
  async headers() {
    return [
      {
        source: "/resume/:file*",
        headers: [
          { key: "Content-Disposition", value: 'attachment; filename="resume.pdf"' },
          { key: "Content-Type", value: "application/pdf" },
        ],
      },
    ];
  },
};

export default nextConfig;
