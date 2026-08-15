import type { Dictionary } from "./types";

export const ja: Dictionary = {
  common: {
    backToHome: "← ホームへ",
    signIn: "ログイン",
    signUp: "新規登録",
    signOut: "ログアウト",
    profile: "プロフィール",
    greeting: "{email}さん、こんにちは!",
    showPassword: "パスワードを表示",
    hidePassword: "パスワードを隠す",
  },
  home: {
    heading: "ERPシステムへようこそ",
    description:
      "マスタ管理から営業、物流、会計まで—企業運営に必要なすべての業務を1つのプラットフォームで。",
    loginCta: "ログインして始める",
    categoriesHeading: "主な機能",
    categoriesDescription:
      "大分類メニューごとに提供される主要機能をご確認ください。",
    categories: [
      {
        title: "マスタ管理",
        description:
          "ユーザー、メニュー、権限などシステム運用に必要な基準データを管理します。",
      },
      {
        title: "経営情報",
        description:
          "売上・損益などの主要経営指標をダッシュボードとレポートで確認します。",
      },
      {
        title: "人事給与",
        description: "従業員情報、勤怠、給与精算まで人事業務全般を処理します。",
      },
      {
        title: "Web会計",
        description:
          "伝票入力から財務諸表作成まで会計業務をオンラインで処理します。",
      },
      {
        title: "企画",
        description: "事業計画の策定、予算編成、実績分析業務を支援します。",
      },
      {
        title: "ソーシング",
        description:
          "原副資材の発注と協力会社のソーシングプロセスを管理します。",
      },
      {
        title: "物流",
        description: "入出庫、在庫、配送など物流全般を管理します。",
      },
      {
        title: "協力会社",
        description: "協力会社情報、取引履歴、評価履歴を管理します。",
      },
      {
        title: "営業",
        description: "受注から売上精算まで営業活動全般を管理します。",
      },
      {
        title: "営業管理",
        description: "営業実績、債権、売上現況を管理します。",
      },
      {
        title: "営業企画",
        description: "営業目標の策定とチャネル別戦略を計画します。",
      },
      {
        title: "顧客管理",
        description: "顧客情報と相談履歴を統合管理します。",
      },
      {
        title: "Web POS",
        description: "店舗の販売時点情報をリアルタイムで管理します。",
      },
      {
        title: "C&F",
        description: "通関および貨物輸送(Customs & Freight)業務を管理します。",
      },
      {
        title: "掲示板",
        description: "お知らせや社内情報を掲示・共有します。",
      },
    ],
    footer: {
      about: "next.jsスターターキット3の紹介",
      techStack: "技術スタック",
      componentGallery: "コンポーネントギャラリー",
      iconGallery: "アイコンギャラリー",
      chartGallery: "チャートギャラリー",
      avatarGallery: "アバターギャラリー",
      developedBy: "制作",
    },
  },
  login: {
    title: "ログイン",
    description: "メールアドレスを入力してアカウントにログインしてください。",
    emailLabel: "メールアドレス",
    passwordLabel: "パスワード",
    forgotPassword: "パスワードをお忘れですか?",
    loginButton: "ログイン",
    loggingIn: "ログイン中...",
    noAccount: "アカウントをお持ちでないですか?",
    orSeparator: "または",
    googleContinue: "Googleで続ける",
    googleConnecting: "接続中...",
  },
  signUp: {
    title: "新規登録",
    description: "新しいアカウントを作成します",
    emailLabel: "メールアドレス",
    passwordLabel: "パスワード",
    repeatPasswordLabel: "パスワード（確認）",
    passwordMismatch: "パスワードが一致しません。",
    creatingAccount: "アカウントを作成中...",
    submitButton: "新規登録",
    haveAccount: "すでにアカウントをお持ちですか?",
  },
  signUpSuccess: {
    title: "登録ありがとうございます!",
    description: "メールをご確認ください",
    message:
      "会員登録が完了しました。ログイン前にメールを確認してアカウントを認証してください。",
  },
  forgotPassword: {
    title: "パスワードの再設定",
    description:
      "メールアドレスを入力すると、パスワード再設定用のリンクをお送りします",
    emailLabel: "メールアドレス",
    sendButton: "再設定メールを送信",
    sending: "送信中...",
    haveAccount: "すでにアカウントをお持ちですか?",
    successTitle: "メールをご確認ください",
    successDescription: "パスワード再設定の案内を送信しました",
    successMessage:
      "登録時のメールアドレスとパスワードをお使いの場合、パスワード再設定メールが届きます。",
  },
  updatePassword: {
    title: "パスワードの再設定",
    description: "新しいパスワードを入力してください。",
    newPasswordLabel: "新しいパスワード",
    saveButton: "新しいパスワードを保存",
    saving: "保存中...",
  },
  authError: {
    pageTitle: "問題が発生しました。",
    codes: {
      invalid_credentials: "メールアドレスまたはパスワードが正しくありません。",
      email_not_confirmed:
        "メール認証が完了していません。受信トレイをご確認ください。",
      user_already_exists: "すでに登録済みのメールアドレスです。",
      email_exists: "すでに登録済みのメールアドレスです。",
      identity_already_exists: "すでに登録済みのメールアドレスです。",
      weak_password:
        "パスワードが脆弱です。より安全なパスワードを使用してください。",
      same_password: "新しいパスワードが現在のパスワードと同じです。",
      user_banned:
        "アカウントが停止されています。管理者にお問い合わせください。",
      session_expired:
        "セッションの有効期限が切れました。再度ログインしてください。",
      otp_expired: "認証リンクの有効期限が切れました。もう一度お試しください。",
      over_email_send_rate_limit:
        "メール送信リクエストが多すぎます。しばらくしてから再度お試しください。",
      over_request_rate_limit:
        "リクエストが多すぎます。しばらくしてから再度お試しください。",
      validation_failed: "入力内容をご確認ください。",
      email_address_invalid: "正しいメールアドレスの形式ではありません。",
      signup_disabled: "現在、新規登録は停止されています。",
      missing_token:
        "認証リンクの有効期限が切れているか、無効です。もう一度お試しください。",
      missing_code: "認証コードがありません。もう一度お試しください。",
      default:
        "処理中にエラーが発生しました。しばらくしてから再度お試しください。",
    },
  },
  profile: {
    title: "プロフィール編集",
    description: "会員プロフィール情報を編集します。",
    emailLabel: "メールアドレス",
    nameLabel: "名前",
    saveButton: "保存",
    saving: "保存中...",
    saveSuccess: "プロフィールを保存しました。",
    errorFallback: "エラーが発生しました。",
  },
  erpHome: {
    title: "ERPメイン画面",
    description:
      "上部のメニューバーまたは左側のツリーからメニューを選択してください。",
    sampleDataBadge: "サンプルデータ",
    sampleDataNote:
      "以下の数値とグラフはレイアウト確認用のダミーデータで、実際のデータとは関係ありません。",
    statRevenue: "今月の売上",
    statActiveUsers: "アクティブユーザー",
    statGrowthRate: "前月比成長率",
    chartTitle: "月別売上推移",
    chartDescription: "サンプルデータです — 実データ連携はMVPの範囲外です。",
    chartRevenueLabel: "売上(百万ウォン)",
  },
  roles: {
    user: "一般ユーザー",
    admin: "管理者",
    superadmin: "最高管理者",
  },
  admin: {
    users: {
      pageTitle: "ユーザー管理",
      pageDescription: "全ユーザーを確認し、有効状態・管理者権限を管理します。",
      searchPlaceholder: "メールアドレスまたは名前で検索",
      totalCount: "合計 {count}名",
      columnAvatar: "アバター",
      columnEmail: "メールアドレス",
      columnName: "名前",
      columnRole: "役割",
      columnAdminToggle: "管理者指定",
      columnIsActive: "有効状態",
      columnCreatedAt: "登録日",
      superAdminLabel: "最高管理者",
      promoteButton: "管理者に指定",
      demoteButton: "管理者を解除",
      selfDemoteBlocked: "自分自身の管理者権限は解除できません。",
      promoteConfirmTitle: "管理者に指定しますか?",
      demoteConfirmTitle: "管理者権限を解除しますか?",
      promoteConfirmDescription:
        "{email} に管理者権限を付与します。すべてのメニューにアクセスできるようになります。",
      demoteConfirmDescription:
        "{email} の管理者権限を解除します。このユーザーは管理者画面にアクセスできなくなります。",
      cancel: "キャンセル",
      confirm: "確認",
      activateAriaLabel: "有効化",
      deactivateAriaLabel: "無効化",
      noResults: "検索結果がありません。",
      pageIndicator: "{current} / {total} ページ",
      noPages: "0 / 0 ページ",
      activateToast: "ユーザーを有効化しました。",
      deactivateToast: "ユーザーを無効化しました。",
      promoteToast: "管理者に指定しました。",
      demoteToast: "管理者権限を解除しました。",
    },
    menus: {
      pageTitle: "メニュー管理",
      pageDescription:
        "大・中・小分類のメニューツリーを登録・修正・削除・並び替えします。",
      treeTitle: "メニューツリー",
      addButton: "メニュー登録",
      inactiveBadge: "無効",
      noMenus: "登録されたメニューがありません。",
      level1: "大分類",
      level2: "中分類",
      level3: "小分類",
      moveUp: "上へ",
      moveDown: "下へ",
      edit: "修正",
      addChild: "下位メニュー追加",
      delete: "削除",
      deleteConfirmTitle: "メニューを削除しますか?",
      deleteConfirmDescription:
        "「{name}」メニューを削除します。下位メニューがある場合は一緒に削除され、これらのメニューに付与されたユーザー権限もすべて消えます。この操作は元に戻せません。",
      cancel: "キャンセル",
      useStatus: "使用状態",
      emptyStateDescription:
        "左側のツリーからメニューを選択すると、詳細情報と編集ツールが表示されます。",
      moveUpToast: "並び順を上に移動しました。",
      moveDownToast: "並び順を下に移動しました。",
      deleteToast: "メニューを削除しました。",
      activateToast: "メニューを有効化しました。",
      deactivateToast: "メニューを無効化しました。",
      createTitle: "メニュー登録",
      editTitle: "メニュー修正",
      createDescription: "上位メニューを空欄にすると大分類として登録されます。",
      editDescription:
        "メニュー名・並び順・使用状態を修正します。上位メニューは変更できません。",
      parentLabel: "上位メニュー",
      noneRoot: "なし（大分類）",
      levelLabel: "レベル",
      nameLabel: "メニュー名",
      nameRequired: "メニュー名を入力してください。",
      sortOrderLabel: "並び順",
      useStatusLabel: "使用状態",
      cancelBtn: "キャンセル",
      submitCreate: "登録",
      submitEdit: "修正",
      createToast: "メニューを登録しました。",
      editToast: "メニューを修正しました。",
    },
    permissions: {
      pageTitle: "ユーザー権限管理",
      pageDescription:
        "ユーザーを選択し、アクセス可能なメニューを任意のレベルで付与・回収します。",
      userLabel: "ユーザー",
      searchPlaceholder: "メールアドレスまたは名前で検索",
      noSearchResults: "検索結果がありません。",
      saveButton: "保存",
      noUserSelectedDescription:
        "上でユーザーを検索して選択すると、現在の権限を確認・編集できます。",
      adminNoPermissionDescription:
        "管理者はすべてのメニューにアクセスできるため、個別の権限設定は不要です。",
      loading: "読み込み中...",
      noMenus: "登録されたメニューがありません。",
      unsavedTitle: "保存されていない変更があります",
      unsavedDescription:
        "ユーザーを切り替えると、保存されていない権限の変更は失われます。続行しますか?",
      cancel: "キャンセル",
      switchConfirm: "切り替え",
      loadFailedToast: "権限情報の読み込みに失敗しました。",
      saveSuccessToast: "権限を保存しました。",
      noNameLabel: "（名前なし）",
    },
    actions: {
      activeStatusUpdateFailed: "有効状態の変更に失敗しました。",
      selfDemoteBlocked: "自分自身の管理者権限は解除できません。",
      parentNotFound: "上位メニューが見つかりません。",
      maxLevelExceeded: "メニューは最大3階層（小分類）までしか登録できません。",
      nameRequired: "メニュー名を入力してください。",
      menuCreateFailed: "メニューの登録に失敗しました。",
      menuUpdateFailed: "メニューの修正に失敗しました。",
      menuNotFound: "メニューが見つかりません。",
      siblingQueryFailed: "同階層メニューの照会に失敗しました。",
      cannotMoveFurther: "これ以上移動できません。",
      sortOrderUpdateFailed: "並び順の変更に失敗しました。",
      menuDeleteFailed: "メニューの削除に失敗しました。",
      menuActiveUpdateFailed: "使用状態の変更に失敗しました。",
      permissionSaveFailed: "権限の保存に失敗しました。",
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
      treeAriaLabel: "全メニューツリー",
    },
    tree: {
      selectCategory: "上部で大分類を選択してください。",
      categoryNotFound: "存在しない大分類です。",
      noSubMenu: "下位メニューがありません。",
      ariaLabel: "メニューツリー",
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
