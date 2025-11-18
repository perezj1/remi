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

  index: {
  clearMind: "Clear mind",
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
  status: "status"
},

installPrompt: {
  iosTitle: "Install Remi on your iPhone - FREE",
  iosStep1BeforeShare: "1. Tap the",
  iosShareLabel: "Share",
  iosStep1AfterShare: "button.",
  iosStep2BeforeAction: "2. Choose",
  iosAddToHome: "Add to Home Screen",
  iosStep2AfterAction: "and confirm.",
  defaultTitle: "Install Remi",
  defaultDescription: "Add Remi to your apps — FREE!",
  buttonInstall: "Install",
  close: "Close",
},


 status: {
    back: "Back",
    headerTitle: "Remi’s status",
    headerSubtitle: "We’ve helped your mind feel a little lighter today.",

    helperLabel: "Your memory helper",
    helperFallback:
      "I’m here to store your tasks, ideas and reminders so your mind doesn’t have to carry everything.",

    mindClearLabel: "Clear mind",
    mindClearDescription:
      "Everything you save in Remi is one thing less your head has to hold.",

    todaySectionTitle: "What we’ve achieved today",
    todaySectionSubtitle:
      "A quick summary of how we’ve looked after your mind in the last hours.",
    todayTasksLabel: "Today’s tasks",
    todayTasksDescription:
      "Today we’ve organised {{todayTotal}} tasks so they don’t depend only on your memory.",

    streakSectionTitle: "Our streak",
    streakValue: "{{streakDays}} days",
    streakDescription:
      "We’ve spent {{streakDays}} days taking care of your tasks together, so your mind doesn’t have to remember everything alone.",

    memoryDelegatedTitle: "Delegated memory",
    memoryDelegatedValue: "{{tasks}} tasks · {{ideas}} ideas",
    memoryDelegatedDescription:
      "Right now Remi is looking after {{tasks}} tasks and {{ideas}} ideas for you. Your mind doesn’t need to hold them all.",

    weekSectionTitle: "Our week",
    weekSectionSubtitle:
      "Every day you use Remi, your mind carries a little less weight.",
    weekActiveLabel: "Active days this week",

    loading: "Updating your summary with Remi…",

    // Moods
    moodTitleCelebrate: "Amazing team!",
    moodTitleHappy: "We’re doing great today",
    moodTitleCalm: "Everything under control",
    moodTitleWaiting: "I’m ready whenever you are",
    moodTitleConcerned: "Let’s go step by step",
    moodTitleDefault: "We’re in this together",

    moodSubtitleCelebrate:
      "These days we’re taking very good care of your head. We’ve unloaded {{cleared}} tasks for today and Remi is holding {{totalItems}} things in total between tasks and ideas.",
    moodSubtitleHappy:
      "We’ve cleared a good part of your mind today: you have {{todayTotal}} tasks organised and {{todayDone}} of them are already done.",
    moodSubtitleCalm:
      "We’re moving forward without rushing. We have {{todayTotal}} tasks saved for today and Remi will remember them for you.",
    moodSubtitleWaiting:
      "Your mind feels light today. If you want, we can unload a few more things into Remi so you don’t have to remember them yourself.",
    moodSubtitleConcerned:
      "It looks like there’s still a day ahead. We can start with one small task and let your mind breathe a bit more.",
    moodSubtitleDefault:
      "Every thing you keep in Remi is one less thing your mind has to carry.",
  },

capture: {
  title: "Empty your mind",
  subtitle: "Write what's on your mind and decide if it's a task or an idea.",
  textareaPlaceholder: "E.g. Send the email, ask mum for the recipe...",

  ideaButton: "Idea",
  taskButton: "Task",

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
  tasksToday: "You have {{count}} active tasks",
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
  updateError: "We couldn’t update this idea.",
    convertError: "We couldn’t convert this idea into a task.",

    editLabel: "Edit idea",
    editTitle: "Turn this idea into something actionable",
    editSubtitle:
      "Refine the text or turn it into a task with a due date and reminder.",

    fieldTitle: "Idea text",
    fieldTitlePlaceholder: "E.g. buy new shoes for the wedding",

    taskOptionsTitle: "Task options",
    dueDateLabel: "Due date and time (optional)",
    reminderLabel: "Reminder",

    reminder: {
      none: "No reminder",
      onDue: "Only on the due date",
      dayBeforeAndDue: "One day before and on the due date",
      dailyUntilDue: "Every day until the due date",
    },

    saveAsIdea: "Save as idea",
    convertToTask: "Convert to task",
    confirmConvert: "Convert to task now",

    footerHint:
      "Converting an idea into a task doesn’t duplicate it: the original idea becomes a task.",
  
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
