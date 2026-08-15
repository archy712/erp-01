import type { Dictionary } from "./types";

export const zh: Dictionary = {
  common: {
    backToHome: "← 返回首页",
  },
  home: {
    heading: "Next.js 入门套件 3",
    footer: {
      about: "next.js 入门套件3简介",
      techStack: "技术栈",
      componentGallery: "组件展示馆",
      iconGallery: "图标展示馆",
      chartGallery: "图表展示馆",
      avatarGallery: "头像展示馆",
    },
  },
  about: {
    headerTitle: "next.js 入门套件3简介",
    badge: "Starter Kit",
    heroTitle: "next.js starter-kit v3",
    heroDescription:
      "这是一个已经配置好 Next.js 16 和 Supabase Auth 认证的入门套件，让你可以立即开始开发。",
    features: [
      {
        title: "Next.js 16 App Router",
        description:
          '默认启用 Cache Components("use cache") 的最新 App Router 架构。',
      },
      {
        title: "Supabase Auth",
        description:
          "基于 @supabase/ssr 的 Cookie 会话，支持邮箱/密码认证和 Google OAuth 登录。",
      },
      {
        title: "Tailwind CSS v4 + shadcn/ui",
        description: "new-york 风格的 shadcn/ui 组件，默认支持深色模式切换。",
      },
      {
        title: "开发工具自动化",
        description:
          "通过 ESLint、Prettier、Husky、lint-staged、commitlint 自动化提交前检查。",
      },
      {
        title: "响应式 UI",
        description: "从移动端到桌面端，布局都能根据屏幕尺寸自然适配。",
      },
      {
        title: "多语言支持",
        description:
          "支持韩语、英语、日语、中文四种语言，默认语言会根据浏览器/系统语言设置自动选择。",
      },
      {
        title: "深色模式切换",
        description:
          "通过页头的切换按钮，可即时在浅色、深色、跟随系统主题间切换。",
      },
    ],
    galleriesHeading: "展示馆合集",
    galleriesDescription:
      "将组件、图标、头像、图表整理成展示馆形式，帮助你更快搭建界面。",
    galleries: [
      {
        title: "shadcn/ui 组件展示馆",
        description:
          "从 Button、Form、Dialog 等 shadcn/ui 官方组件，到 Tree View、数据表格等扩展组件，一站式浏览。",
        cta: "查看组件展示馆",
      },
      {
        title: "图标展示馆",
        description:
          "搜索本项目内置的全部 lucide-react 图标，一键复制 import 语句。",
        cta: "查看图标展示馆",
      },
      {
        title: "头像展示馆",
        description:
          "尺寸、图片、首字母、状态徽标、分组显示——探索 Avatar 组件的多种用法。",
        cta: "查看头像展示馆",
      },
      {
        title: "图表展示馆",
        description:
          "基于 recharts 的 shadcn/ui Chart 组件实现的柱状图、折线图、面积图、饼图、雷达图等多种图表类型。",
        cta: "查看图表展示馆",
      },
    ],
  },
  gallery: {
    headerTitle: "shadcn/ui 组件展示馆",
    heading: "组件展示馆",
    description:
      "浏览 shadcn/ui 官方注册表中的全部组件，以及实际项目中常用的扩展组件。",
  },
  icons: {
    headerTitle: "lucide-react 图标展示馆",
    heading: "图标展示馆",
    description:
      "搜索本项目内置的全部 lucide-react 图标，立即复制 import 语句。",
  },
  avatars: {
    headerTitle: "头像展示馆",
    heading: "头像展示馆",
    description:
      "尺寸、图片、首字母、状态徽标、分组显示——探索 shadcn/ui Avatar 组件的多种用法。",
  },
  charts: {
    headerTitle: "图表展示馆",
    heading: "图表展示馆",
    description:
      "基于 recharts 的 shadcn/ui Chart 组件实现的多种图表类型合集。",
  },
  techStack: {
    headerTitle: "技术栈",
    heading: "技术栈",
    description: "按类别整理的构成本入门套件的框架、库和开发工具。",
  },
  erp: {
    mobileNav: {
      menuOpen: "打开菜单",
      menuTitle: "ERP 菜单",
    },
    tree: {
      selectCategory: "请在上方选择大类。",
      categoryNotFound: "该大类不存在。",
      noSubMenu: "没有下级菜单。",
    },
    layout: {
      menuLoadError: "菜单加载失败",
    },
    placeholder: {
      description: "此画面将在 MVP 之后的阶段实现实际功能。",
      badge: "即将实现",
    },
    accessDenied: {
      title: "没有访问权限",
      description: "您没有访问此画面的权限。如有需要，请联系管理员。",
      backToHome: "返回首页",
    },
    notFound: {
      title: "未找到菜单",
      description: "请求的菜单不存在或已被删除。",
      backToErpHome: "前往 ERP 主页",
    },
    error: {
      title: "出现问题",
      layoutDescription: "加载菜单信息时发生错误，请重试。",
      pageDescription: "加载画面时发生错误，请重试。",
      retry: "重试",
      backToErpHome: "前往 ERP 主页",
    },
  },
};
