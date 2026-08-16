import type { Dictionary } from "./types";

export const en: Dictionary = {
  common: {
    backToHome: "← Home",
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    userGreeting: "{name} ({time})",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
  home: {
    heading: "Welcome to the ERP System",
    description:
      "From master data to sales, logistics, and accounting — manage every part of your business on one platform.",
    loginCta: "Log in to get started",
    dashboardCta: "Go to ERP dashboard",
    loginNote: "You need to log in to use the ERP service.",
    categoriesHeading: "Key Features",
    categoriesDescription:
      "Explore the core capabilities built into the ERP system.",
    features: [
      {
        title: "Multi-language Support",
        description:
          "Supports Korean, English, Japanese, and Chinese, automatically selecting the default language based on your browser or system settings.",
      },
      {
        title: "Responsive Support",
        description:
          "A responsive layout that adapts naturally from mobile to desktop screens.",
      },
      {
        title: "Dark Mode Support",
        description:
          "Instantly switch between light, dark, and system themes with the toggle in the header.",
      },
    ],
    footer: {
      about: "About next.js starter-kit3",
      techStack: "Tech Stack",
      componentGallery: "Component Gallery",
      iconGallery: "Icon Gallery",
      chartGallery: "Chart Gallery",
      avatarGallery: "Avatar Gallery",
      developedBy: "Developed by",
    },
  },
  login: {
    title: "Login",
    description: "Enter your email below to login to your account",
    emailLabel: "Email",
    passwordLabel: "Password",
    forgotPassword: "Forgot your password?",
    loginButton: "Login",
    loggingIn: "Logging in...",
    noAccount: "Don't have an account?",
    orSeparator: "or",
    googleContinue: "Continue with Google",
    googleConnecting: "Connecting...",
  },
  signUp: {
    title: "Sign up",
    description: "Create a new account",
    emailLabel: "Email",
    passwordLabel: "Password",
    repeatPasswordLabel: "Repeat Password",
    passwordMismatch: "Passwords do not match.",
    creatingAccount: "Creating an account...",
    submitButton: "Sign up",
    haveAccount: "Already have an account?",
  },
  signUpSuccess: {
    title: "Thank you for signing up!",
    description: "Check your email to confirm",
    message:
      "You've successfully signed up. Please check your email to confirm your account before signing in.",
  },
  forgotPassword: {
    title: "Reset Your Password",
    description:
      "Type in your email and we'll send you a link to reset your password",
    emailLabel: "Email",
    sendButton: "Send reset email",
    sending: "Sending...",
    haveAccount: "Already have an account?",
    successTitle: "Check Your Email",
    successDescription: "Password reset instructions sent",
    successMessage:
      "If you registered using your email and password, you will receive a password reset email.",
  },
  updatePassword: {
    title: "Reset Your Password",
    description: "Please enter your new password below.",
    newPasswordLabel: "New password",
    saveButton: "Save new password",
    saving: "Saving...",
  },
  authError: {
    pageTitle: "Sorry, something went wrong.",
    codes: {
      invalid_credentials: "Incorrect email or password.",
      email_not_confirmed:
        "Your email hasn't been verified yet. Please check your inbox.",
      user_already_exists: "This email is already registered.",
      email_exists: "This email is already registered.",
      identity_already_exists: "This email is already registered.",
      weak_password: "This password is too weak. Please use a stronger one.",
      same_password: "The new password matches your current password.",
      user_banned: "This account has been banned. Please contact an admin.",
      session_expired: "Your session has expired. Please log in again.",
      otp_expired: "This link has expired. Please try again.",
      over_email_send_rate_limit:
        "Too many email requests. Please try again later.",
      over_request_rate_limit: "Too many requests. Please try again later.",
      validation_failed: "Please check your input.",
      email_address_invalid: "Please enter a valid email address.",
      signup_disabled: "Sign-ups are currently disabled.",
      missing_token: "This link has expired or is invalid. Please try again.",
      missing_code: "Missing verification code. Please try again.",
      default: "Something went wrong. Please try again later.",
    },
  },
  profile: {
    title: "Profile",
    description: "Please enter your profile information.",
    emailLabel: "Email",
    nameLabel: "Name",
    departmentLabel: "Department",
    departmentPlaceholder: "Select a department",
    phoneLabel: "Phone Number",
    phonePlaceholder: "010-0000-0000",
    phoneInvalid: "Invalid phone number format. (e.g. 010-0000-0000)",
    avatarLabel: "Avatar",
    avatarChangeButton: "Change avatar",
    avatarDialogTitle: "Choose an avatar",
    bioLabel: "Bio",
    saveButton: "Save",
    saving: "Saving...",
    saveSuccess: "Profile saved.",
    errorFallback: "An error occurred.",
  },
  erpHome: {
    title: "ERP Home",
    description: "Select a menu from the left icon rail and tree to begin.",
    sampleDataBadge: "Sample Data",
    sampleDataNote:
      "The figures and chart below are dummy data for layout preview only and are unrelated to real data.",
    kpi: {
      revenueToday: "Today's Revenue",
      revenueMonth: "Revenue This Month",
      customerCount: "Today's Transactions",
      customerPrice: "Today's Avg. Order Value",
      achievementRate: "Monthly Goal Achievement",
      operatingMargin: "Operating Margin",
      vsYesterday: "{value} vs. yesterday",
      vsLastMonth: "{value} vs. last month",
    },
    revenueProfit: {
      title: "Revenue & Profit Trend",
      description:
        "Revenue and net profit over the last 12 months (millions KRW)",
      revenueLabel: "Revenue",
      profitLabel: "Profit",
    },
    achievement: {
      title: "Goal Achievement",
      description: "Daily and monthly revenue goal achievement",
      dailyLabel: "Daily Achievement",
      monthlyLabel: "Monthly Achievement",
      detail: "{actual} / {target}",
    },
    customerMetrics: {
      title: "Transactions & Avg. Order Value",
      description:
        "Daily transaction count and average order value over the last 7 days",
      countLabel: "Transactions",
      priceLabel: "Avg. Order Value",
    },
    brandRevenue: {
      title: "Revenue by Brand",
      description: "This month's revenue ranking by brand (millions KRW)",
      valueLabel: "Revenue",
    },
    channelRevenue: {
      title: "Revenue by Channel",
      description: "This month's revenue share by sales channel",
      online: "Online",
      offline: "Offline",
      partner: "Partner",
    },
    categoryRevenue: {
      title: "Top 5 Categories by Revenue",
      description: "This month's top 5 revenue-generating categories",
      apparel: "Apparel",
      beauty: "Beauty",
      electronics: "Electronics",
      food: "Food",
      lifestyle: "Lifestyle",
    },
    weeklyRevenue: {
      title: "Last 7 Days Revenue Trend",
      description: "Daily revenue flow (millions KRW)",
      valueLabel: "Revenue",
    },
  },
  roles: {
    user: "User",
    admin: "Admin",
    superadmin: "Super Admin",
  },
  admin: {
    users: {
      pageTitle: "User Management",
      pageDescription:
        "View all users and manage their active status and admin permissions.",
      searchPlaceholder: "Search by email or name",
      totalCount: "{count} total",
      columnAvatar: "Avatar",
      columnEmail: "Email",
      columnName: "Name",
      columnRole: "Role",
      columnAdminToggle: "Admin",
      columnIsActive: "Active",
      columnCreatedAt: "Joined",
      superAdminLabel: "Super Admin",
      promoteButton: "Make Admin",
      demoteButton: "Remove Admin",
      selfDemoteBlocked: "You cannot remove your own admin permission.",
      promoteConfirmTitle: "Make this user an admin?",
      demoteConfirmTitle: "Remove admin permission?",
      promoteConfirmDescription:
        "This grants {email} admin permission. They will be able to access every menu.",
      demoteConfirmDescription:
        "This removes {email}'s admin permission. They will no longer be able to access admin screens.",
      cancel: "Cancel",
      confirm: "Confirm",
      activateAriaLabel: "Activate",
      deactivateAriaLabel: "Deactivate",
      noResults: "No results found.",
      pageIndicator: "Page {current} of {total}",
      noPages: "Page 0 of 0",
      activateToast: "User activated.",
      deactivateToast: "User deactivated.",
      promoteToast: "Granted admin permission.",
      demoteToast: "Removed admin permission.",
    },
    menus: {
      pageTitle: "Menu Management",
      pageDescription:
        "Create, edit, delete, and reorder the top/mid/sub-category menu tree.",
      treeTitle: "Menu Tree",
      addButton: "Add Menu",
      inactiveBadge: "Inactive",
      noMenus: "No menus registered.",
      level1: "Top Category",
      level2: "Mid Category",
      level3: "Sub Category",
      moveUp: "Move Up",
      moveDown: "Move Down",
      edit: "Edit",
      addChild: "Add Submenu",
      delete: "Delete",
      deleteConfirmTitle: "Delete this menu?",
      deleteConfirmDescription:
        'This deletes the menu "{name}". Any submenus and user permissions granted on them will be deleted as well. This action cannot be undone.',
      cancel: "Cancel",
      useStatus: "Active",
      emptyStateDescription:
        "Select a menu from the tree on the left to view its details and edit it.",
      moveUpToast: "Moved up in sort order.",
      moveDownToast: "Moved down in sort order.",
      deleteToast: "Menu deleted.",
      activateToast: "Menu activated.",
      deactivateToast: "Menu deactivated.",
      createTitle: "Add Menu",
      editTitle: "Edit Menu",
      createDescription:
        "Leave the parent menu empty to register a top category.",
      editDescription:
        "Edit the menu name, sort order, and active status. The parent menu cannot be changed.",
      parentLabel: "Parent Menu",
      noneRoot: "None (Top Category)",
      levelLabel: "Level",
      nameLabel: "Menu Name",
      nameRequired: "Please enter a menu name.",
      sortOrderLabel: "Sort Order",
      useStatusLabel: "Active",
      cancelBtn: "Cancel",
      submitCreate: "Create",
      submitEdit: "Save",
      createToast: "Menu created.",
      editToast: "Menu updated.",
    },
    permissions: {
      pageTitle: "User Permission Management",
      pageDescription:
        "Select a user to grant or revoke access to menus at any level.",
      userLabel: "User",
      searchPlaceholder: "Search by email or name",
      noSearchResults: "No results found.",
      saveButton: "Save",
      noUserSelectedDescription:
        "Search for and select a user above to view and edit their current permissions.",
      adminNoPermissionDescription:
        "Admins can access every menu, so individual permissions don't apply.",
      loading: "Loading...",
      noMenus: "No menus registered.",
      unsavedTitle: "You have unsaved changes",
      unsavedDescription:
        "Switching users will discard your unsaved permission changes. Continue?",
      cancel: "Cancel",
      switchConfirm: "Switch",
      loadFailedToast: "Failed to load permission data.",
      saveSuccessToast: "Permissions saved.",
      noNameLabel: "(No name)",
    },
    actions: {
      activeStatusUpdateFailed: "Failed to update active status.",
      selfDemoteBlocked: "You cannot remove your own admin permission.",
      parentNotFound: "Parent menu not found.",
      maxLevelExceeded: "Menus can only be registered up to 3 levels deep.",
      nameRequired: "Please enter a menu name.",
      menuCreateFailed: "Failed to create menu.",
      menuUpdateFailed: "Failed to update menu.",
      menuNotFound: "Menu not found.",
      siblingQueryFailed: "Failed to look up sibling menus.",
      cannotMoveFurther: "Cannot move any further.",
      sortOrderUpdateFailed: "Failed to update sort order.",
      menuDeleteFailed: "Failed to delete menu.",
      menuActiveUpdateFailed: "Failed to update active status.",
      permissionSaveFailed: "Failed to save permissions.",
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
  erp: {
    header: {
      logoAriaLabel: "Go to ERP home",
    },
    rail: {
      ariaLabel: "Categories",
    },
    mobileNav: {
      menuOpen: "Open menu",
      menuTitle: "ERP Menu",
      treeAriaLabel: "Full menu tree",
    },
    tree: {
      selectCategory: "Select a category on the left.",
      categoryNotFound: "This category does not exist.",
      noSubMenu: "No submenu items.",
      ariaLabel: "Menu tree",
      collapseAriaLabel: "Collapse menu tree panel",
      expandAriaLabel: "Expand menu tree panel",
    },
    layout: {
      menuLoadError: "Failed to load the menu",
    },
    footer: {
      copyright: "© {year} ERP",
    },
    placeholder: {
      description: "This screen will be implemented in a later MVP phase.",
      badge: "Coming soon",
    },
    accessDenied: {
      title: "Access denied",
      description:
        "You don't have permission to access this screen. Please contact an administrator if needed.",
      backToHome: "Back to home",
    },
    notFound: {
      title: "Menu not found",
      description: "The requested menu doesn't exist or has been deleted.",
      backToErpHome: "Go to ERP home",
    },
    error: {
      title: "Something went wrong",
      layoutDescription:
        "An error occurred while loading menu information. Please try again.",
      pageDescription:
        "An error occurred while loading this screen. Please try again.",
      retry: "Try again",
      backToErpHome: "Go to ERP home",
    },
    passwordNotice: {
      title: "You're using a temporary password.",
      description: "Please change your password to keep your account secure.",
      cta: "Change password",
      dismissAriaLabel: "Dismiss",
    },
    changePassword: {
      title: "Change password",
      description: "Set a new password to keep your account secure.",
      newPasswordLabel: "New password",
      confirmPasswordLabel: "Confirm new password",
      passwordMismatch: "Passwords do not match.",
      saveButton: "Change password",
      saving: "Saving...",
      successMessage: "Your password has been changed.",
      errorFallback: "Something went wrong.",
    },
    settings: {
      rootLabel: "Settings",
      navProfile: "Profile",
      navSecurity: "Security",
      navNotifications: "Notifications",
      themeLabel: "Theme",
      languageLabel: "Language",
      navLanguage: "Language",
      navTheme: "Theme",
      languageDescription: "Set your display language.",
      themeDescription: "Set your display theme.",
      notificationsDescription:
        "Choose which notifications you receive, by channel. This isn't available yet.",
      notificationsEmailLabel: "Email notifications",
      notificationsInAppLabel: "In-app notifications",
      notificationsMarketingLabel: "Marketing emails",
      sessionsTitle: "Login sessions",
      sessionsDescription:
        "View devices and sessions currently signed in, and sign them out remotely.",
      mfaTitle: "Two-factor authentication",
      mfaDescription:
        "Require an extra verification step (e.g. OTP) when signing in.",
      connectionsTitle: "Connected accounts",
      connectionsDescription:
        "View and disconnect linked accounts such as Google sign-in.",
    },
  },
};
