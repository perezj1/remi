// src/locales/en.ts
export const en = {
  common: {
    appName: "REMI",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    confirm: "Confirm",
    loading: "Loading...",
  },
  nav: {
    today: "Today",
    inbox: "Inbox",
    ideas: "Ideas",
    profile: "Profile",
  },

  bottomNav: {
  today: "Today",
  inbox: "Inbox",
},


capture: {
  title: "Empty your mind",
  subtitle: "Write what's on your mind and decide if it's a task or an idea.",
  textareaPlaceholder: "E.g. Send the email, ask mum for the recipe...",

  ideaButton: "It's an idea",
  taskButton: "It's a task",

  dueLabel: "Due date",
  dueToday: "Today",
  dueTomorrow: "Tomorrow",
  dueWeek: "1 week",
  dueNone: "No date",
  dueHint: "You can adjust date and time manually.",

  remindersLabel: "Reminders",
  remindersNone: "No reminders",
  remindersOnDue: "Only on due date",
  remindersDayBeforeAndDue: "Day before and due date",
  remindersDailyUntilDue: "Every day until due date",

  back: "Back",
  saveTask: "Save task",

  toastTaskSaved: "Task saved successfully",
  toastTaskError: "Error creating the task",
  toastIdeaSaved: "Idea saved successfully",
  toastIdeaError: "Error creating the idea",
},


  auth: {
    titleLogin: "Log in to REMI",
    titleRegister: "Create your REMI account",
    email: "Email",
    password: "Password",
    login: "Log in",
    register: "Sign up",
    logout: "Log out",
     loginTitle: "Welcome back!",
  registerTitle: "Start your journey!",
  loginSubtitle: "Keep improving every day with REMI",
  registerSubtitle: "Create your account and start reaching your goals",
  emailLabel: "Email",
  emailPlaceholder: "you@email.com",
  passwordLabel: "Password",
  passwordPlaceholder: "••••••••",
  submitLogin: "Log in",
  submitRegister: "Create account",
  toggleToRegister: "Don't have an account? Sign up",
  toggleToLogin: "Already have an account? Log in",

  errorInvalidCredentials:
    "Incorrect credentials. Please check your email and password.",
  errorUserAlreadyRegistered:
    "This email is already registered. Try logging in instead.",
  errorGeneric: "Something went wrong. Please try again.",
  signUpSuccess: "Account created! Let's set up your first goal.",
  },

  today: {
    title: "Today",
    emptyState: "You don't have tasks for today.",
    addTask: "Add task",
    streak: "Streak",
    

  greeting: "Hi, {{name}} 👋",
  tasksToday: "You have {{count}} tasks today",
  prioritize: "Let's focus only on what matters.",

  tabsToday: "Today",
  tabsWeek: "Week",
  tabsMonth: "Month",

  loadingTasks: "Loading tasks…",
  noUrgentTitle: "Nothing urgent for today 🎉",
  noUrgentSubtitle: "Use the + button to add your first task.",
  dueLabel: "Due · ",
  dueNoDate: "No due date",
  errorLoadingTasks: "Error loading your tasks",

  pushTitle: "Turn on your reminders",
  pushBody:
    "REMI can send you notifications with your 3 most important tasks of the day and warn you when one is about to expire.",
  pushEnable: "Enable reminders",
  pushEnabling: "Enabling...",
  pushLater: "Later",
  pushEnabledToast: "Notifications enabled for your tasks ✨",
  pushErrorToast: "Couldn't enable notifications.",

  profileLoggedInAs: "Signed in as {{name}}",
  menuProfile: "Profile",
  menuShareApp: "Share app",
  menuLogout: "Log out",

  shareText: "I'm trying REMI to organise my daily tasks 🙂",
  shareCopied: "Link copied to clipboard",

  defaultUserName: "User",
  },

  inbox: {
    title: "Inbox",
    tasksTab: "Tasks",
    ideasTab: "Ideas",
    allTab: "All",
    statusDone: "Done",
    statusActive: "Active",
    statusArchived: "Archived",    
  subtitle: "Everything you've emptied from your mind appears here.",
  itemsCount: "{{count}} items",
  loading: "Loading inbox…",
  emptyTitle: "Empty inbox",
  emptySubtitle:
    "Add new tasks or ideas from the Today screen.",

  itemTaskPrefix: "Task · ",
  itemIdeaPrefix: "Idea · ",
  errorLoading: "Error loading your inbox",
  errorUpdating: "Error updating your inbox",
  },
  ideas: {
    title: "Ideas",
    emptyState: "Write your ideas here to free your mind.",    
  subtitle: "All the ideas you don't want to lose are saved here.",
  loading: "Loading ideas…",
  emptyTitle: "No ideas yet",
  emptySubtitle:
    "Use the + button on the Today screen to save your ideas.",
  savedAt: "Saved on {{date}}",
  errorLoading: "Error loading your ideas",
  },
  profile: {
    title: "Profile",
    username: "Username",
    email: "Email",
    language: "Language",
    notifications: "Notifications",
    notificationsOn: "Enabled",
    notificationsOff: "Disabled",
    changeAvatar: "Change avatar",
    save: "Save changes",
    shareProfile: "Share profile",
    logout: "Log out",
    toastSaved: "Profile updated successfully.",
    toastError: "Could not save profile.",
    
  back: "Profile",
  memberSince: "Member since {{date}}",

  sectionUserTitle: "User information",
  sectionUserDescription:
    "Edit your basic details and how REMI is displayed.",

  usernameLabel: "Username",
  usernamePlaceholder: "Your name in REMI",

  emailLabel: "Email",
  emailPlaceholder: "you@email.com",

  passwordLabel: "New password",
  passwordPlaceholder: "Leave empty if you don't want to change it",

  languageLabel: "Language",
  languageSpanish: "🇪🇸 Spanish",
  languageEnglish: "🇬🇧 English",
  languageGerman: "🇩🇪 German",

  notificationsLabel: "Notifications",
  notificationsDescription: "Reminders for important tasks.",

  saving: "Saving...",
  saveChanges: "Save changes",

  sectionAccountTitle: "Account actions",
  sectionAccountDescription:
    "Share REMI or log out on this device.",

  shareButton: "Share app",
  logoutButton: "Log out",

  shareText: "I'm using REMI to organise my daily tasks 🚀",
  shareCopied: "REMI link copied to clipboard",

  defaultUserName: "User",

  avatarTooBig: "The image must be smaller than 2 MB.",
  avatarUploadError: "The image could not be uploaded. Please try again.",
  passwordTooShort: "The new password must be at least 6 characters.",
  authUpdateError: "Email/password could not be updated.",
  updateSuccess: "Profile updated successfully.",
  updateError: "Changes could not be saved.",
  logoutError: "Could not log out. Please try again.",
  },
  notifications: {
    dailyReminderTitle: "Your mind is full",
    dailyReminderBody:
      "Check your tasks for today in REMI and clear your head.",
    dueTodayTitle: "You have tasks today",
    dueTodayBody: "Open REMI to see what's pending.",
  },
} as const;
