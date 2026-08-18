import type { Dictionary } from "./types";

export const ko: Dictionary = {
  common: {
    backToHome: "← 홈으로",
    signIn: "로그인",
    signUp: "회원가입",
    signOut: "로그아웃",
    settings: "설정",
    language: "언어",
    theme: "테마",
    userGreeting: "{name}님({time})",
    showPassword: "비밀번호 표시",
    hidePassword: "비밀번호 숨기기",
  },
  home: {
    heading: "ERP 시스템에\n오신 것을 환영합니다",
    description:
      "마스터 관리부터 영업, 물류, 회계까지 — 기업 운영에 필요한 모든 업무를 하나의 플랫폼에서 처리하세요.",
    loginCta: "로그인하고 시작하기",
    dashboardCta: "ERP 대시보드로 이동",
    loginNote: "ERP 서비스는 로그인 후 이용하실 수 있습니다.",
    categoriesHeading: "주요 기능",
    categoriesDescription:
      "ERP 시스템이 기본으로 제공하는 핵심 기능을 살펴보세요.",
    features: [
      {
        title: "다국어 지원",
        description:
          "한국어, 영어, 일본어, 중국어 4개 언어를 지원하며, 브라우저·시스템 언어 설정에 따라 기본 언어가 자동으로 선택됩니다.",
      },
      {
        title: "반응형 지원",
        description:
          "모바일부터 데스크톱까지 화면 크기에 맞춰 자연스럽게 적응하는 반응형 레이아웃을 제공합니다.",
      },
      {
        title: "다크모드 지원",
        description:
          "라이트・다크・시스템 테마를 헤더의 토글 버튼으로 즉시 전환할 수 있습니다.",
      },
    ],
    footer: {
      projectIntro: "프로젝트 소개",
      requirements: "프로젝트 요구사항",
      mvpTask: "초기 MVP 과제",
      componentGallery: "컴포넌트 갤러리",
      iconGallery: "아이콘 갤러리",
      techStack: "기술 스택",
    },
  },
  login: {
    title: "로그인",
    description: "이메일을 입력하여 계정에 로그인하세요.",
    emailLabel: "이메일",
    passwordLabel: "비밀번호",
    forgotPassword: "비밀번호를 잊으셨나요?",
    loginButton: "로그인",
    loggingIn: "로그인 중...",
    noAccount: "계정이 없으신가요?",
    orSeparator: "또는",
    googleContinue: "Google로 계속하기",
    googleConnecting: "연결하는 중...",
  },
  signUp: {
    title: "회원가입",
    description: "새 계정을 만드세요",
    emailLabel: "이메일",
    passwordLabel: "비밀번호",
    repeatPasswordLabel: "비밀번호 확인",
    passwordMismatch: "비밀번호가 일치하지 않습니다.",
    creatingAccount: "계정 만드는 중...",
    submitButton: "회원가입",
    haveAccount: "이미 계정이 있으신가요?",
  },
  signUpSuccess: {
    title: "회원가입을 완료했습니다!",
    description: "이메일을 확인해주세요",
    message:
      "회원가입이 완료되었습니다. 로그인하기 전에 이메일을 확인해 계정을 인증해주세요.",
  },
  forgotPassword: {
    title: "비밀번호 재설정",
    description: "이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다",
    emailLabel: "이메일",
    sendButton: "재설정 이메일 보내기",
    sending: "보내는 중...",
    haveAccount: "이미 계정이 있으신가요?",
    successTitle: "이메일을 확인해주세요",
    successDescription: "비밀번호 재설정 안내를 보냈습니다",
    successMessage:
      "가입 시 이메일과 비밀번호를 사용하셨다면, 비밀번호 재설정 이메일을 받으실 수 있습니다.",
  },
  updatePassword: {
    title: "비밀번호 재설정",
    description: "새 비밀번호를 입력해주세요.",
    newPasswordLabel: "새 비밀번호",
    saveButton: "새 비밀번호 저장",
    saving: "저장 중...",
  },
  authError: {
    pageTitle: "문제가 발생했습니다.",
    codes: {
      invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
      email_not_confirmed:
        "이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해주세요.",
      user_already_exists: "이미 가입된 이메일입니다.",
      email_exists: "이미 가입된 이메일입니다.",
      identity_already_exists: "이미 가입된 이메일입니다.",
      weak_password:
        "비밀번호가 너무 약합니다. 더 안전한 비밀번호를 사용해주세요.",
      same_password: "새 비밀번호가 기존 비밀번호와 동일합니다.",
      user_banned: "차단된 계정입니다. 관리자에게 문의해주세요.",
      session_expired: "세션이 만료되었습니다. 다시 로그인해주세요.",
      otp_expired: "인증 링크가 만료되었습니다. 다시 시도해주세요.",
      over_email_send_rate_limit:
        "이메일 발송 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      over_request_rate_limit:
        "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      validation_failed: "입력값을 확인해주세요.",
      email_address_invalid: "올바른 이메일 형식이 아닙니다.",
      signup_disabled: "현재 회원가입이 비활성화되어 있습니다.",
      missing_token:
        "인증 링크가 만료되었거나 유효하지 않습니다. 다시 시도해주세요.",
      missing_code: "인증 코드가 없습니다. 다시 시도해주세요.",
      default: "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    },
  },
  profile: {
    title: "프로필",
    description: "프로필 정보를 입력해주세요.",
    emailLabel: "이메일",
    nameLabel: "이름",
    departmentLabel: "부서",
    departmentPlaceholder: "부서를 선택하세요",
    phoneLabel: "전화번호",
    phonePlaceholder: "010-0000-0000",
    phoneInvalid: "전화번호 형식이 올바르지 않습니다. (예: 010-0000-0000)",
    avatarLabel: "아바타",
    avatarChangeButton: "아바타 변경",
    avatarDialogTitle: "아바타 선택",
    avatarDialogConfirm: "선택 완료",
    bioLabel: "자기소개",
    saveButton: "저장",
    saving: "저장 중...",
    saveSuccess: "프로필이 저장되었습니다.",
    errorFallback: "오류가 발생했습니다.",
  },
  erpHome: {
    title: "ERP 메인 화면",
    description: "왼쪽 아이콘 레일과 트리에서 메뉴를 선택해 시작하세요.",
    sampleDataBadge: "샘플 데이터",
    sampleDataNote:
      "아래 수치와 그래프는 레이아웃 확인용 더미 데이터이며 실제 데이터와 무관합니다.",
    kpi: {
      revenueToday: "금일 매출",
      revenueMonth: "이번 달 매출",
      customerCount: "금일 객수",
      customerPrice: "금일 객단가",
      achievementRate: "월간 목표 달성률",
      operatingMargin: "영업이익률",
      vsYesterday: "전일 대비 {value}",
      vsLastMonth: "전월 대비 {value}",
    },
    revenueProfit: {
      title: "매출 및 손익 추이",
      description: "최근 12개월 매출과 순이익 추이 (단위: 백만원)",
      revenueLabel: "매출",
      profitLabel: "손익",
    },
    groupAchievement: {
      title: "당월 그룹사 예상 매출 달성률",
      description: "이번 달 그룹 전체 예상 매출 목표 대비 달성 현황",
      detail: "{actual} / {target}",
    },
    companyAchievement: {
      title: "당월 법인별 예상 매출 달성률",
      description: "이번 달 법인별 예상 매출 목표 대비 달성률 (내림차순)",
      valueLabel: "달성률",
    },
    companyRevenueComposition: {
      title: "법인별 매출 구성비",
      description: "이번 달 그룹 전체 매출에서 법인별로 차지하는 비중",
      valueLabel: "매출",
    },
    customerMetrics: {
      title: "객수 · 객단가 추이",
      description: "최근 7일 객수와 평균 객단가 추이",
      countLabel: "객수",
      priceLabel: "객단가",
    },
    brandRevenue: {
      title: "브랜드별 매출 현황",
      description: "이번 달 브랜드별 매출 순위 (단위: 백만원)",
      valueLabel: "매출",
    },
    channelRevenue: {
      title: "채널별 매출 비중",
      description: "이번 달 판매 채널별 매출 비중",
      online: "온라인",
      offline: "오프라인",
      partner: "제휴",
    },
    categoryRevenue: {
      title: "카테고리별 매출 TOP 5",
      description: "이번 달 매출 상위 5개 카테고리",
      apparel: "의류",
      beauty: "뷰티",
      electronics: "가전",
      food: "식품",
      lifestyle: "리빙",
    },
    weeklyRevenue: {
      title: "최근 7일 매출 추이",
      description: "일별 매출 흐름 (단위: 백만원)",
      valueLabel: "매출",
    },
  },
  roles: {
    user: "일반 사용자",
    admin: "관리자",
    superadmin: "최고 관리자",
  },
  admin: {
    users: {
      pageTitle: "사용자 관리",
      pageDescription:
        "전체 사용자를 조회하고 활성 상태·관리자 권한을 관리합니다.",
      searchPlaceholder: "이메일 또는 이름으로 검색",
      totalCount: "총 {count}명",
      columnAvatar: "아바타",
      columnEmail: "이메일",
      columnName: "이름",
      columnRole: "역할",
      columnAdminToggle: "관리자 지정",
      columnIsActive: "활성 여부",
      columnCreatedAt: "가입일",
      superAdminLabel: "최고 관리자",
      promoteButton: "관리자 지정",
      demoteButton: "관리자 해제",
      selfDemoteBlocked: "자기 자신의 관리자 권한은 회수할 수 없습니다.",
      promoteConfirmTitle: "관리자로 지정할까요?",
      demoteConfirmTitle: "관리자 권한을 회수할까요?",
      promoteConfirmDescription:
        "{email} 사용자에게 관리자 권한을 부여합니다. 모든 메뉴에 접근할 수 있게 됩니다.",
      demoteConfirmDescription:
        "{email} 사용자의 관리자 권한을 회수합니다. 이 사용자는 더 이상 관리자 화면에 접근할 수 없습니다.",
      cancel: "취소",
      confirm: "확인",
      activateAriaLabel: "활성화",
      deactivateAriaLabel: "비활성화",
      noResults: "검색 결과가 없습니다.",
      pageIndicator: "{current} / {total} 페이지",
      noPages: "0 / 0 페이지",
      activateToast: "사용자를 활성화했습니다.",
      deactivateToast: "사용자를 비활성화했습니다.",
      promoteToast: "관리자로 지정했습니다.",
      demoteToast: "관리자 권한을 회수했습니다.",
    },
    menus: {
      pageTitle: "메뉴 관리",
      pageDescription: "대/중/소분류 메뉴 트리를 등록·수정·삭제·정렬합니다.",
      treeTitle: "메뉴 트리",
      addButton: "메뉴 등록",
      inactiveBadge: "비활성",
      noMenus: "등록된 메뉴가 없습니다.",
      level1: "대분류",
      level2: "중분류",
      level3: "소분류",
      moveUp: "위로",
      moveDown: "아래로",
      edit: "수정",
      addChild: "하위 메뉴 추가",
      delete: "삭제",
      deleteConfirmTitle: "메뉴를 삭제할까요?",
      deleteConfirmDescription:
        "“{name}” 메뉴를 삭제합니다. 하위 메뉴가 있다면 함께 삭제되고, 이 메뉴들에 부여된 사용자 권한도 모두 사라집니다. 이 작업은 되돌릴 수 없습니다.",
      cancel: "취소",
      useStatus: "사용 여부",
      emptyStateDescription:
        "좌측 트리에서 메뉴를 선택하면 상세 정보와 편집 도구가 표시됩니다.",
      moveUpToast: "정렬순서를 위로 이동했습니다.",
      moveDownToast: "정렬순서를 아래로 이동했습니다.",
      deleteToast: "메뉴를 삭제했습니다.",
      activateToast: "메뉴를 활성화했습니다.",
      deactivateToast: "메뉴를 비활성화했습니다.",
      createTitle: "메뉴 등록",
      editTitle: "메뉴 수정",
      createDescription: "상위 메뉴를 비워두면 대분류로 등록됩니다.",
      editDescription:
        "메뉴명·정렬순서·사용여부를 수정합니다. 상위 메뉴는 변경할 수 없습니다.",
      parentLabel: "상위 메뉴",
      noneRoot: "없음 (대분류)",
      levelLabel: "레벨",
      nameLabel: "메뉴명",
      nameRequired: "메뉴명을 입력해주세요.",
      iconPreviewLabel:
        "메뉴명에 따라 자동으로 선택됩니다. 클릭하면 직접 고를 수 있어요.",
      iconPickerTrigger: "아이콘 선택",
      iconSearchPlaceholder: "아이콘 이름으로 검색 (영문)",
      iconAutoOption: "메뉴명 기반 자동 추천 사용",
      iconSearchEmpty: "검색 결과가 없습니다.",
      sortOrderLabel: "정렬순서",
      useStatusLabel: "사용 여부",
      cancelBtn: "취소",
      submitCreate: "등록",
      submitEdit: "수정",
      createToast: "메뉴를 등록했습니다.",
      editToast: "메뉴를 수정했습니다.",
    },
    permissions: {
      pageTitle: "사용자 권한 관리",
      pageDescription:
        "사용자를 선택해 접근 가능한 메뉴를 임의 레벨에서 부여·회수합니다.",
      userLabel: "사용자",
      searchPlaceholder: "이메일 또는 이름으로 검색",
      noSearchResults: "검색 결과가 없습니다.",
      saveButton: "저장",
      noUserSelectedDescription:
        "위에서 사용자를 검색해 선택하면 현재 권한을 조회하고 편집할 수 있습니다.",
      adminNoPermissionDescription:
        "관리자는 모든 메뉴에 접근하므로 개별 권한 설정이 불필요합니다.",
      loading: "불러오는 중...",
      noMenus: "등록된 메뉴가 없습니다.",
      unsavedTitle: "저장하지 않은 변경사항이 있습니다",
      unsavedDescription:
        "사용자를 전환하면 저장하지 않은 권한 변경사항이 사라집니다. 계속할까요?",
      cancel: "취소",
      switchConfirm: "전환",
      loadFailedToast: "권한 정보를 불러오지 못했습니다.",
      saveSuccessToast: "권한을 저장했습니다.",
      noNameLabel: "(이름 없음)",
    },
    actions: {
      activeStatusUpdateFailed: "활성 상태 변경에 실패했습니다.",
      selfDemoteBlocked: "자기 자신의 관리자 권한은 회수할 수 없습니다.",
      parentNotFound: "상위 메뉴를 찾을 수 없습니다.",
      maxLevelExceeded: "메뉴는 최대 3단계(소분류)까지만 등록할 수 있습니다.",
      nameRequired: "메뉴명을 입력해주세요.",
      menuCreateFailed: "메뉴 등록에 실패했습니다.",
      menuUpdateFailed: "메뉴 수정에 실패했습니다.",
      menuNotFound: "메뉴를 찾을 수 없습니다.",
      siblingQueryFailed: "형제 메뉴 조회에 실패했습니다.",
      cannotMoveFurther: "더 이상 이동할 수 없습니다.",
      sortOrderUpdateFailed: "정렬 순서 변경에 실패했습니다.",
      menuDeleteFailed: "메뉴 삭제에 실패했습니다.",
      menuActiveUpdateFailed: "사용 여부 변경에 실패했습니다.",
      permissionSaveFailed: "권한 저장에 실패했습니다.",
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
    headerTitle: "컴포넌트 갤러리",
    heading: "컴포넌트 갤러리",
    description:
      "shadcn/ui 공식 레지스트리의 모든 컴포넌트와, 실무에서 자주 쓰이는 확장 컴포넌트를 함께 모아 살펴볼 수 있습니다.",
  },
  icons: {
    headerTitle: "아이콘 갤러리",
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
  erp: {
    header: {
      homeAriaLabel: "웹사이트 홈으로 이동",
      logoAriaLabel: "ERP 홈으로 이동",
      orgChartTriggerLabel: "조직도",
      orgChartTriggerAriaLabel: "조직도 보기",
    },
    commandPalette: {
      triggerAriaLabel: "빠른 이동 검색 (⌘K)",
      placeholder: "메뉴 검색 또는 이동할 화면 입력...",
      emptyMessage: "검색 결과가 없습니다.",
      quickActionsGroup: "빠른 이동",
    },
    rail: {
      ariaLabel: "대분류",
    },
    mobileNav: {
      menuOpen: "메뉴 열기",
      menuTitle: "ERP 메뉴",
      treeAriaLabel: "전체 메뉴 트리",
    },
    tree: {
      selectCategory: "왼쪽에서 대분류를 선택하세요.",
      categoryNotFound: "존재하지 않는 대분류입니다.",
      noSubMenu: "하위 메뉴가 없습니다.",
      ariaLabel: "메뉴 트리",
      collapseAriaLabel: "메뉴 트리 패널 접기",
      expandAriaLabel: "메뉴 트리 패널 펼치기",
    },
    layout: {
      menuLoadError: "메뉴를 불러오지 못했습니다",
    },
    footer: {
      copyright: "© {year} ERP",
    },
    placeholder: {
      description: "이 화면은 MVP 이후 단계에서 실제 기능이 구현될 예정입니다.",
      badge: "추후 구현 예정",
    },
    accessDenied: {
      title: "접근 권한이 없습니다",
      description:
        "이 화면에 접근할 수 있는 권한이 없습니다. 필요한 경우 관리자에게 문의하세요.",
      backToHome: "홈으로 돌아가기",
    },
    notFound: {
      title: "메뉴를 찾을 수 없습니다",
      description: "요청하신 메뉴가 존재하지 않거나 삭제되었습니다.",
      backToErpHome: "ERP 메인 화면으로 이동",
    },
    error: {
      title: "문제가 발생했습니다",
      layoutDescription:
        "메뉴 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.",
      pageDescription:
        "화면을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.",
      retry: "다시 시도",
      backToErpHome: "ERP 메인 화면으로 이동",
    },
    passwordNotice: {
      title: "임시 비밀번호를 사용 중입니다.",
      description: "보안을 위해 비밀번호를 변경해 주세요.",
      cta: "비밀번호 변경하기",
      dismissAriaLabel: "닫기",
    },
    changePassword: {
      title: "비밀번호 변경",
      description: "계정 보안을 위해 새 비밀번호를 설정하세요.",
      newPasswordLabel: "새 비밀번호",
      confirmPasswordLabel: "새 비밀번호 확인",
      passwordMismatch: "비밀번호가 일치하지 않습니다.",
      saveButton: "비밀번호 변경",
      saving: "변경 중...",
      successMessage: "비밀번호가 변경되었습니다.",
      errorFallback: "오류가 발생했습니다.",
    },
    settings: {
      rootLabel: "설정",
      navProfile: "프로필",
      navSecurity: "보안",
      navNotifications: "알림",
      themeLabel: "테마",
      languageLabel: "언어",
      navLanguage: "언어",
      navTheme: "테마",
      languageDescription: "표시 언어를 설정합니다.",
      themeDescription: "화면 테마를 설정합니다.",
      notificationsDescription:
        "알림 수신 여부를 채널별로 설정합니다. 알림 설정 기능은 준비 중입니다.",
      notificationsEmailLabel: "이메일 알림",
      notificationsInAppLabel: "인앱 알림",
      notificationsMarketingLabel: "마케팅 정보 수신",
      sessionsTitle: "로그인 세션 관리",
      sessionsDescription:
        "현재 로그인된 기기와 세션 목록을 확인하고 원격으로 로그아웃할 수 있습니다.",
      mfaTitle: "2단계 인증",
      mfaDescription:
        "로그인 시 OTP 등 추가 인증 단계를 요구하도록 설정합니다.",
      connectionsTitle: "연동 계정",
      connectionsDescription:
        "Google 등 소셜 로그인 연동 상태를 확인하고 해제할 수 있습니다.",
    },
  },
};
