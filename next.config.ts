import type { NextConfig } from "next";

// Next가 next.config.ts 평가 전에 .env.local을 이미 로드해두므로 여기서
// process.env로 프로젝트 ref를 읽을 수 있다. 값이 있는 경우에만 상품 이미지
// Storage 버킷(product-images, Task 028) 경로를 next/image 허용 목록에 추가한다
// — env가 없으면 lib/utils.ts의 hasEnvVars도 false가 되어 앱이 이미 튜토리얼
// 모드로 폴백하므로 이 설정도 조용히 비워둔다.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
