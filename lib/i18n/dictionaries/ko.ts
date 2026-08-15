import type { Dictionary } from "./types";

export const ko: Dictionary = {
  common: {
    backToHome: "← 홈으로",
  },
  home: {
    heading: "Next.js 스타터킷 3",
    footer: {
      about: "next.js 스타터킷3 소개",
      techStack: "기술 스택",
      componentGallery: "컴포넌트 갤러리",
      iconGallery: "아이콘 갤러리",
      chartGallery: "차트 갤러리",
      avatarGallery: "아바타 갤러리",
    },
  },
  about: {
    headerTitle: "next.js 스타터킷3 소개",
    badge: "Starter Kit",
    heroTitle: "next.js starter-kit v3",
    heroDescription:
      "Next.js 16과 Supabase Auth로 인증까지 준비된 상태에서 바로 개발을 시작할 수 있는 스타터킷입니다.",
    features: [
      {
        title: "Next.js 16 App Router",
        description:
          'Cache Components("use cache")를 활성화한 최신 App Router 아키텍처를 기본으로 제공합니다.',
      },
      {
        title: "Supabase Auth",
        description:
          "이메일/비밀번호 인증과 Google OAuth 로그인을 @supabase/ssr 기반 쿠키 세션으로 지원합니다.",
      },
      {
        title: "Tailwind CSS v4 + shadcn/ui",
        description:
          "new-york 스타일의 shadcn/ui 컴포넌트와 다크모드 전환을 기본 제공합니다.",
      },
      {
        title: "개발 도구 자동화",
        description:
          "ESLint, Prettier, Husky, lint-staged, commitlint로 커밋 전 검사를 자동화했습니다.",
      },
      {
        title: "반응형 UI",
        description:
          "모바일부터 데스크톱까지 화면 크기에 맞춰 자연스럽게 적응하는 반응형 레이아웃을 제공합니다.",
      },
      {
        title: "다국어 지원",
        description:
          "한국어, 영어, 일본어, 중국어 4개 언어를 지원하며, 브라우저·시스템 언어 설정에 따라 기본 언어가 자동으로 선택됩니다.",
      },
      {
        title: "다크모드 토글",
        description:
          "라이트・다크・시스템 테마를 헤더의 토글 버튼으로 즉시 전환할 수 있습니다.",
      },
    ],
    galleriesHeading: "갤러리 모음",
    galleriesDescription:
      "UI를 빠르게 조립할 수 있도록 컴포넌트·아이콘·아바타·차트를 갤러리 형태로 모아두었습니다.",
    galleries: [
      {
        title: "shadcn/ui 컴포넌트 갤러리",
        description:
          "Button, Form, Dialog 같은 shadcn/ui 공식 컴포넌트부터 Tree View·데이터 테이블 같은 확장 컴포넌트까지 한 곳에서 살펴볼 수 있습니다.",
        cta: "컴포넌트 갤러리 보기",
      },
      {
        title: "아이콘 갤러리",
        description:
          "이 프로젝트에 포함된 lucide-react 아이콘 전체를 검색하고 클릭 한 번으로 import 구문을 복사할 수 있습니다.",
        cta: "아이콘 갤러리 보기",
      },
      {
        title: "아바타 갤러리",
        description:
          "크기, 이미지, 이니셜, 상태 배지, 그룹 표시까지 Avatar 컴포넌트의 다양한 활용 방법을 모아볼 수 있습니다.",
        cta: "아바타 갤러리 보기",
      },
      {
        title: "차트 갤러리",
        description:
          "recharts 기반 shadcn/ui Chart 컴포넌트로 구현한 막대·선·영역·파이·레이더 등 다양한 차트 유형을 살펴볼 수 있습니다.",
        cta: "차트 갤러리 보기",
      },
    ],
  },
  gallery: {
    headerTitle: "shadcn/ui 컴포넌트 갤러리",
    heading: "컴포넌트 갤러리",
    description:
      "shadcn/ui 공식 레지스트리의 모든 컴포넌트와, 실무에서 자주 쓰이는 확장 컴포넌트를 함께 모아 살펴볼 수 있습니다.",
  },
  icons: {
    headerTitle: "lucide-react 아이콘 갤러리",
    heading: "아이콘 갤러리",
    description:
      "이 프로젝트에 포함된 lucide-react의 모든 아이콘을 검색하고 바로 import 구문을 복사할 수 있습니다.",
  },
  avatars: {
    headerTitle: "아바타 갤러리",
    heading: "아바타 갤러리",
    description:
      "크기, 이미지, 이니셜, 상태 배지, 그룹 표시까지 shadcn/ui Avatar 컴포넌트의 다양한 활용 방법을 모아 살펴볼 수 있습니다.",
  },
  charts: {
    headerTitle: "차트 갤러리",
    heading: "차트 갤러리",
    description:
      "recharts 기반 shadcn/ui Chart 컴포넌트로 구현한 다양한 차트 유형을 모아 살펴볼 수 있습니다.",
  },
  techStack: {
    headerTitle: "기술 스택",
    heading: "기술 스택",
    description:
      "이 스타터킷을 구성하는 프레임워크, 라이브러리, 개발 도구를 분야별로 정리했습니다.",
  },
};
