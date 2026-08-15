import type { Dictionary } from "./types";

export const ja: Dictionary = {
  common: {
    backToHome: "← ホームへ",
  },
  home: {
    heading: "Next.js スターターキット3",
    footer: {
      about: "next.jsスターターキット3の紹介",
      techStack: "技術スタック",
      componentGallery: "コンポーネントギャラリー",
      iconGallery: "アイコンギャラリー",
      chartGallery: "チャートギャラリー",
      avatarGallery: "アバターギャラリー",
    },
  },
  about: {
    headerTitle: "next.jsスターターキット3の紹介",
    badge: "Starter Kit",
    heroTitle: "next.js starter-kit v3",
    heroDescription:
      "Next.js 16とSupabase Authによる認証まで整った状態から、すぐに開発を始められるスターターキットです。",
    features: [
      {
        title: "Next.js 16 App Router",
        description:
          'Cache Components("use cache")を有効化した最新のApp Routerアーキテクチャを標準搭載しています。',
      },
      {
        title: "Supabase Auth",
        description:
          "メール/パスワード認証とGoogle OAuthログインを、@supabase/ssrベースのCookieセッションでサポートします。",
      },
      {
        title: "Tailwind CSS v4 + shadcn/ui",
        description:
          "new-yorkスタイルのshadcn/uiコンポーネントとダークモード切り替えを標準提供します。",
      },
      {
        title: "開発ツールの自動化",
        description:
          "ESLint、Prettier、Husky、lint-staged、commitlintでコミット前チェックを自動化しました。",
      },
      {
        title: "レスポンシブUI",
        description:
          "モバイルからデスクトップまで、画面サイズに合わせて自然に適応するレスポンシブレイアウトを提供します。",
      },
      {
        title: "多言語対応",
        description:
          "韓国語・英語・日本語・中国語の4言語に対応し、ブラウザ/システムの言語設定に応じて既定言語が自動で選択されます。",
      },
      {
        title: "ダークモード切り替え",
        description:
          "ヘッダーのトグルボタンでライト・ダーク・システムテーマを即座に切り替えられます。",
      },
    ],
    galleriesHeading: "ギャラリー集",
    galleriesDescription:
      "UIを素早く組み立てられるよう、コンポーネント・アイコン・アバター・チャートをギャラリー形式でまとめました。",
    galleries: [
      {
        title: "shadcn/ui コンポーネントギャラリー",
        description:
          "Button、Form、DialogなどshadcnUI公式コンポーネントから、Tree Viewやデータテーブルなどの拡張コンポーネントまで一か所で確認できます。",
        cta: "コンポーネントギャラリーを見る",
      },
      {
        title: "アイコンギャラリー",
        description:
          "このプロジェクトに含まれるlucide-reactアイコン全体を検索し、ワンクリックでimport文をコピーできます。",
        cta: "アイコンギャラリーを見る",
      },
      {
        title: "アバターギャラリー",
        description:
          "サイズ、画像、イニシャル、ステータスバッジ、グループ表示まで、Avatarコンポーネントの多様な活用方法をまとめました。",
        cta: "アバターギャラリーを見る",
      },
      {
        title: "チャートギャラリー",
        description:
          "rechartsベースのshadcn/ui Chartコンポーネントで実装した棒・線・面・円・レーダーなど多様なチャートタイプを確認できます。",
        cta: "チャートギャラリーを見る",
      },
    ],
  },
  gallery: {
    headerTitle: "shadcn/ui コンポーネントギャラリー",
    heading: "コンポーネントギャラリー",
    description:
      "shadcn/ui公式レジストリの全コンポーネントと、実務でよく使われる拡張コンポーネントを一緒に確認できます。",
  },
  icons: {
    headerTitle: "lucide-react アイコンギャラリー",
    heading: "アイコンギャラリー",
    description:
      "このプロジェクトに含まれるlucide-reactの全アイコンを検索し、すぐにimport文をコピーできます。",
  },
  avatars: {
    headerTitle: "アバターギャラリー",
    heading: "アバターギャラリー",
    description:
      "サイズ、画像、イニシャル、ステータスバッジ、グループ表示まで、shadcn/ui Avatarコンポーネントの多様な活用方法を確認できます。",
  },
  charts: {
    headerTitle: "チャートギャラリー",
    heading: "チャートギャラリー",
    description:
      "rechartsベースのshadcn/ui Chartコンポーネントで実装した多様なチャートタイプをまとめました。",
  },
  techStack: {
    headerTitle: "技術スタック",
    heading: "技術スタック",
    description:
      "このスターターキットを構成するフレームワーク、ライブラリ、開発ツールを分野別に整理しました。",
  },
  erp: {
    mobileNav: {
      menuOpen: "メニューを開く",
      menuTitle: "ERPメニュー",
    },
    tree: {
      selectCategory: "上部で大分類を選択してください。",
      categoryNotFound: "存在しない大分類です。",
      noSubMenu: "下位メニューがありません。",
    },
    layout: {
      menuLoadError: "メニューを読み込めませんでした",
    },
    placeholder: {
      description: "この画面はMVP以降の段階で実際の機能が実装される予定です。",
      badge: "実装予定",
    },
    accessDenied: {
      title: "アクセス権限がありません",
      description:
        "この画面にアクセスする権限がありません。必要な場合は管理者にお問い合わせください。",
      backToHome: "ホームに戻る",
    },
    notFound: {
      title: "メニューが見つかりません",
      description: "リクエストされたメニューが存在しないか削除されました。",
      backToErpHome: "ERPメイン画面へ移動",
    },
    error: {
      title: "問題が発生しました",
      layoutDescription:
        "メニュー情報の読み込み中にエラーが発生しました。もう一度お試しください。",
      pageDescription:
        "画面の読み込み中にエラーが発生しました。もう一度お試しください。",
      retry: "再試行",
      backToErpHome: "ERPメイン画面へ移動",
    },
  },
};
