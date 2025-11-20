import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-expect-error - serverActions is valid but type definition may not be updated
  serverActions: {
    bodySizeLimit: "5mb",
  },
};

export default nextConfig;
