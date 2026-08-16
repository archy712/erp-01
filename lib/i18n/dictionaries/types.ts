export interface Dictionary {
  common: {
    backToHome: string;
    signIn: string;
    signUp: string;
    signOut: string;
    settings: string;
    language: string;
    theme: string;
    /** {name}, {time} 자리표시자를 각각 사용자 이름과 로그인 시각으로 치환해서 사용 */
    userGreeting: string;
    showPassword: string;
    hidePassword: string;
  };
  home: {
    logoAriaLabel: string;
    heading: string;
    description: string;
    loginCta: string;
    dashboardCta: string;
    categoriesHeading: string;
    categoriesDescription: string;
    categories: { title: string; description: string }[];
    footer: {
      about: string;
      techStack: string;
      componentGallery: string;
      iconGallery: string;
      chartGallery: string;
      avatarGallery: string;
      developedBy: string;
    };
  };
  login: {
    title: string;
    description: string;
    emailLabel: string;
    passwordLabel: string;
    forgotPassword: string;
    loginButton: string;
    loggingIn: string;
    noAccount: string;
    orSeparator: string;
    googleContinue: string;
    googleConnecting: string;
  };
  signUp: {
    title: string;
    description: string;
    emailLabel: string;
    passwordLabel: string;
    repeatPasswordLabel: string;
    passwordMismatch: string;
    creatingAccount: string;
    submitButton: string;
    haveAccount: string;
  };
  signUpSuccess: {
    title: string;
    description: string;
    message: string;
  };
  forgotPassword: {
    title: string;
    description: string;
    emailLabel: string;
    sendButton: string;
    sending: string;
    haveAccount: string;
    successTitle: string;
    successDescription: string;
    successMessage: string;
  };
  updatePassword: {
    title: string;
    description: string;
    newPasswordLabel: string;
    saveButton: string;
    saving: string;
  };
  authError: {
    pageTitle: string;
    codes: {
      invalid_credentials: string;
      email_not_confirmed: string;
      user_already_exists: string;
      email_exists: string;
      identity_already_exists: string;
      weak_password: string;
      same_password: string;
      user_banned: string;
      session_expired: string;
      otp_expired: string;
      over_email_send_rate_limit: string;
      over_request_rate_limit: string;
      validation_failed: string;
      email_address_invalid: string;
      signup_disabled: string;
      missing_token: string;
      missing_code: string;
      default: string;
    };
  };
  profile: {
    title: string;
    description: string;
    emailLabel: string;
    nameLabel: string;
    saveButton: string;
    saving: string;
    saveSuccess: string;
    errorFallback: string;
  };
  erpHome: {
    title: string;
    description: string;
    sampleDataBadge: string;
    sampleDataNote: string;
    kpi: {
      revenueToday: string;
      revenueMonth: string;
      customerCount: string;
      customerPrice: string;
      achievementRate: string;
      operatingMargin: string;
      /** {value} 자리표시자, 예: "+3.2%" */
      vsYesterday: string;
      /** {value} 자리표시자 */
      vsLastMonth: string;
    };
    revenueProfit: {
      title: string;
      description: string;
      revenueLabel: string;
      profitLabel: string;
    };
    achievement: {
      title: string;
      description: string;
      dailyLabel: string;
      monthlyLabel: string;
      /** {actual}, {target} 자리표시자 */
      detail: string;
    };
    customerMetrics: {
      title: string;
      description: string;
      countLabel: string;
      priceLabel: string;
    };
    brandRevenue: {
      title: string;
      description: string;
      valueLabel: string;
    };
    channelRevenue: {
      title: string;
      description: string;
      online: string;
      offline: string;
      partner: string;
    };
    categoryRevenue: {
      title: string;
      description: string;
      apparel: string;
      beauty: string;
      electronics: string;
      food: string;
      lifestyle: string;
    };
    weeklyRevenue: {
      title: string;
      description: string;
      valueLabel: string;
    };
  };
  roles: {
    user: string;
    admin: string;
    superadmin: string;
  };
  admin: {
    users: {
      pageTitle: string;
      pageDescription: string;
      searchPlaceholder: string;
      /** {count} 자리표시자 사용 */
      totalCount: string;
      columnAvatar: string;
      columnEmail: string;
      columnName: string;
      columnRole: string;
      columnAdminToggle: string;
      columnIsActive: string;
      columnCreatedAt: string;
      superAdminLabel: string;
      promoteButton: string;
      demoteButton: string;
      selfDemoteBlocked: string;
      promoteConfirmTitle: string;
      demoteConfirmTitle: string;
      /** {email} 자리표시자 사용 */
      promoteConfirmDescription: string;
      /** {email} 자리표시자 사용 */
      demoteConfirmDescription: string;
      cancel: string;
      confirm: string;
      activateAriaLabel: string;
      deactivateAriaLabel: string;
      noResults: string;
      /** {current}/{total} 자리표시자 사용 */
      pageIndicator: string;
      noPages: string;
      activateToast: string;
      deactivateToast: string;
      promoteToast: string;
      demoteToast: string;
    };
    menus: {
      pageTitle: string;
      pageDescription: string;
      treeTitle: string;
      addButton: string;
      inactiveBadge: string;
      noMenus: string;
      level1: string;
      level2: string;
      level3: string;
      moveUp: string;
      moveDown: string;
      edit: string;
      addChild: string;
      delete: string;
      deleteConfirmTitle: string;
      /** {name} 자리표시자 사용 */
      deleteConfirmDescription: string;
      cancel: string;
      useStatus: string;
      emptyStateDescription: string;
      moveUpToast: string;
      moveDownToast: string;
      deleteToast: string;
      activateToast: string;
      deactivateToast: string;
      createTitle: string;
      editTitle: string;
      createDescription: string;
      editDescription: string;
      parentLabel: string;
      noneRoot: string;
      levelLabel: string;
      nameLabel: string;
      nameRequired: string;
      sortOrderLabel: string;
      useStatusLabel: string;
      cancelBtn: string;
      submitCreate: string;
      submitEdit: string;
      createToast: string;
      editToast: string;
    };
    permissions: {
      pageTitle: string;
      pageDescription: string;
      userLabel: string;
      searchPlaceholder: string;
      noSearchResults: string;
      saveButton: string;
      noUserSelectedDescription: string;
      adminNoPermissionDescription: string;
      loading: string;
      noMenus: string;
      unsavedTitle: string;
      unsavedDescription: string;
      cancel: string;
      switchConfirm: string;
      loadFailedToast: string;
      saveSuccessToast: string;
      noNameLabel: string;
    };
    actions: {
      activeStatusUpdateFailed: string;
      selfDemoteBlocked: string;
      parentNotFound: string;
      maxLevelExceeded: string;
      nameRequired: string;
      menuCreateFailed: string;
      menuUpdateFailed: string;
      menuNotFound: string;
      siblingQueryFailed: string;
      cannotMoveFurther: string;
      sortOrderUpdateFailed: string;
      menuDeleteFailed: string;
      menuActiveUpdateFailed: string;
      permissionSaveFailed: string;
    };
  };
  about: {
    headerTitle: string;
    badge: string;
    heroTitle: string;
    heroDescription: string;
    features: { title: string; description: string }[];
    galleriesHeading: string;
    galleriesDescription: string;
    galleries: { title: string; description: string; cta: string }[];
  };
  gallery: {
    headerTitle: string;
    heading: string;
    description: string;
  };
  icons: {
    headerTitle: string;
    heading: string;
    description: string;
  };
  avatars: {
    headerTitle: string;
    heading: string;
    description: string;
  };
  charts: {
    headerTitle: string;
    heading: string;
    description: string;
  };
  techStack: {
    headerTitle: string;
    heading: string;
    description: string;
  };
  erp: {
    header: {
      logoAriaLabel: string;
    };
    rail: {
      ariaLabel: string;
    };
    mobileNav: {
      menuOpen: string;
      menuTitle: string;
      treeAriaLabel: string;
    };
    tree: {
      selectCategory: string;
      categoryNotFound: string;
      noSubMenu: string;
      ariaLabel: string;
      collapseAriaLabel: string;
      expandAriaLabel: string;
    };
    layout: {
      menuLoadError: string;
    };
    footer: {
      /** {year} 자리표시자 사용 */
      copyright: string;
    };
    placeholder: {
      description: string;
      badge: string;
    };
    accessDenied: {
      title: string;
      description: string;
      backToHome: string;
    };
    notFound: {
      title: string;
      description: string;
      backToErpHome: string;
    };
    error: {
      title: string;
      layoutDescription: string;
      pageDescription: string;
      retry: string;
      backToErpHome: string;
    };
    passwordNotice: {
      title: string;
      description: string;
      cta: string;
      dismissAriaLabel: string;
    };
    changePassword: {
      title: string;
      description: string;
      newPasswordLabel: string;
      confirmPasswordLabel: string;
      passwordMismatch: string;
      saveButton: string;
      saving: string;
      successMessage: string;
      errorFallback: string;
    };
    settings: {
      rootLabel: string;
      navProfile: string;
      navPreferences: string;
      navAvatar: string;
      navContact: string;
      navSecurity: string;
      navNotifications: string;
      preferencesDescription: string;
      themeLabel: string;
      languageLabel: string;
      avatarDescription: string;
      contactDescription: string;
      contactPhoneLabel: string;
      contactBioLabel: string;
      notificationsDescription: string;
      notificationsEmailLabel: string;
      notificationsInAppLabel: string;
      notificationsMarketingLabel: string;
      sessionsTitle: string;
      sessionsDescription: string;
      mfaTitle: string;
      mfaDescription: string;
      connectionsTitle: string;
      connectionsDescription: string;
    };
  };
}
