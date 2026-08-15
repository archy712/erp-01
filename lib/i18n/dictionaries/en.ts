import type { Dictionary } from "./types";

export const en: Dictionary = {
  common: {
    backToHome: "← Home",
  },
  home: {
    heading: "Next.js Starter Kit 3",
    footer: {
      about: "About next.js starter-kit3",
      techStack: "Tech Stack",
      componentGallery: "Component Gallery",
      iconGallery: "Icon Gallery",
      chartGallery: "Chart Gallery",
      avatarGallery: "Avatar Gallery",
    },
  },
  about: {
    headerTitle: "About next.js starter-kit3",
    badge: "Starter Kit",
    heroTitle: "next.js starter-kit v3",
    heroDescription:
      "A starter kit that comes with Next.js 16 and Supabase Auth already wired up, so you can start building right away.",
    features: [
      {
        title: "Next.js 16 App Router",
        description:
          'A modern App Router architecture with Cache Components ("use cache") enabled by default.',
      },
      {
        title: "Supabase Auth",
        description:
          "Email/password sign-in and Google OAuth login, backed by @supabase/ssr cookie sessions.",
      },
      {
        title: "Tailwind CSS v4 + shadcn/ui",
        description:
          "shadcn/ui components in the new-york style, with dark mode switching built in.",
      },
      {
        title: "Automated Dev Tooling",
        description:
          "ESLint, Prettier, Husky, lint-staged, and commitlint automate checks before every commit.",
      },
      {
        title: "Responsive UI",
        description:
          "A responsive layout that adapts naturally to every screen size, from mobile to desktop.",
      },
      {
        title: "Multi-language Support",
        description:
          "Supports Korean, English, Japanese, and Chinese, with the default language chosen automatically from your browser/system settings.",
      },
      {
        title: "Dark Mode Toggle",
        description:
          "Switch instantly between light, dark, and system themes with the toggle in the header.",
      },
    ],
    galleriesHeading: "Gallery Collection",
    galleriesDescription:
      "Components, icons, avatars, and charts collected as galleries so you can assemble UI faster.",
    galleries: [
      {
        title: "shadcn/ui Component Gallery",
        description:
          "From official shadcn/ui components like Button, Form, and Dialog to extensions like Tree View and data tables, all in one place.",
        cta: "View Component Gallery",
      },
      {
        title: "Icon Gallery",
        description:
          "Search every lucide-react icon bundled with this project and copy its import statement with one click.",
        cta: "View Icon Gallery",
      },
      {
        title: "Avatar Gallery",
        description:
          "Sizes, images, initials, status badges, and grouping — explore every way to use the Avatar component.",
        cta: "View Avatar Gallery",
      },
      {
        title: "Chart Gallery",
        description:
          "Bar, line, area, pie, radar and more — chart types built with recharts-based shadcn/ui Chart components.",
        cta: "View Chart Gallery",
      },
    ],
  },
  gallery: {
    headerTitle: "shadcn/ui Component Gallery",
    heading: "Component Gallery",
    description:
      "Browse every component in the official shadcn/ui registry alongside extension components commonly used in real projects.",
  },
  icons: {
    headerTitle: "lucide-react Icon Gallery",
    heading: "Icon Gallery",
    description:
      "Search every lucide-react icon bundled with this project and copy its import statement instantly.",
  },
  avatars: {
    headerTitle: "Avatar Gallery",
    heading: "Avatar Gallery",
    description:
      "Sizes, images, initials, status badges, and grouping — explore every way to use the shadcn/ui Avatar component.",
  },
  charts: {
    headerTitle: "Chart Gallery",
    heading: "Chart Gallery",
    description:
      "A collection of chart types built with recharts-based shadcn/ui Chart components.",
  },
  techStack: {
    headerTitle: "Tech Stack",
    heading: "Tech Stack",
    description:
      "The frameworks, libraries, and dev tools that make up this starter kit, organized by category.",
  },
};
