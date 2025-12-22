// src/locales/en.ts
export const en = {

  repeat: {
   label: "Habit",
help: "Turn this task into a habit that Remi will always remind you of at the chosen time.",
 
  options: {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  },
},


// ENGLISH
mentalDump: {
  whyLabel: "Why:",
  detectedLabel: "Detected:",
  detectedManual: "Manual",
  detectedDash: "—",
  habitDetectedLabel: "Detected habit:",
  detectedDefault: "Default",
  habitLabel: "Habit",
  habitOn: "On",
  habitOff: "Off",

detectedReminder: {
  DAY_BEFORE_AND_DUE: "I detected “{word}” → I marked it as: day before + due date.",
  DAILY_UNTIL_DUE: "I detected “{word}” → I marked it as: daily until the due date.",
},

  why: {
    verbTask: "I detected “{word}” → I marked it as a task.",
    prefixIdea: "I detected “{word}” → I marked it as an idea.",
    projectIdea: "It sounds like an idea/project → I marked it as an idea.",
    defaultTask: "I didn’t see a clear clue → I marked it as a task.",
    defaultIdea: "I didn’t see a clear clue → I marked it as an idea.",
    manualTask: "You marked it as a task.",
    manualIdea: "You marked it as an idea.",
  },

  dateLabel: "Date",
  timeLabel: "Time",
  reminderLabel: "Reminder",
  reminderShortLabel: "Alert:",
  reminderOff: "Off",
  reminderDailyUntilDue: "Daily notification (until the due date)",
  reminderDayBeforeAndDue: "Notification (day before + due date)",

  buttonLabel: "Clear your mind",
  

  title: "Intensive brain dump",
  description:
    "Spend 2–3 minutes emptying your head. Write down everything you don’t want to forget: tasks, ideas, loose ends. You don’t need to organize anything: Remi turns it into reminders for you.",

  inputLabel:
    "Write short sentences, separated by line breaks or commas.",
  placeholder:
    "Examples:\n" +
    "Change hallway light bulb tomorrow at 10\n" +
    "Call mum on Sunday\n" +
    "Use Remi every Monday at 14:00\n" +
    "Trip idea to Italy in spring",

  // Summary texts
  summaryNone: "No sentences detected yet.",
  summaryPrefix: "Detected",
  summarySuffix: "possible reminders in your text.",

  // Button states
  submitSaving: "Saving...",
  submitToPreview: "Review reminders",
  submitConfirm: "Save to Remi",

  // Preview
  previewTitle: "Review your brain dump",
  previewDescription:
    "Turn on or off the lines you want to keep, adjust the texts and confirm to create tasks and ideas in Remi.",
  previewNoneSelected: "No item selected.",
  previewTaskLabel: "Task",
  previewIdeaLabel: "Idea",
  previewInclude: "Save",
  previewBackToEdit: "Back to edit text",

  // Habits
  habitNone: "No habit",
  habitDaily: "Daily habit",
  habitWeekly: "Weekly habit",
  habitMonthly: "Monthly habit",
  habitYearly: "Yearly habit",

  // Rotating hints
hints: {
  0: "Just write. Remi organizes and schedules everything for you, and reminds you when it’s time.",
  1: "Paste or send text from WhatsApp, an email, or a note. Remi turns it into a reminder.",
  2: "Tasks, ideas, errands… everything fits. Remi organizes it and reminds you when it’s time.",
  3: "You don’t need perfect formatting. Write the way you speak.",
  4: "Did someone tell you something important? Copy & paste. Remi saves it for you.",
  5: "Write dates or times (e.g., “Tuesday 18:00, January 17 at 15:00…”). Remi detects them.",
  6: "Write “every day / every week, etc.” if it’s a repeating habit.",
  7: "One minute here = a calmer day and fewer forgotten things.",
  8: "Quick tip: Write “Idea” to save notes without reminders.",
}

},


  common: {
    appName: "REMI",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    confirm: "Confirm",
    loading: "Loading...",
    paste: "Paste",
    speak: "Speak",
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
  status: "status",
  holdToTalk: "Hold to talk",
  listening: "Listening…",
  dictationNotSupported: "Dictation not supported",
   tasks: "Tasks",
    ideas: "Ideas",
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
  headerTitle: "Remi status",
  headerSubtitle: "Today we helped your mind feel a little lighter.",

  helperLabel: "Your external memory",
  helperFallback:
    "I'm here to store your tasks, ideas and reminders so your mind doesn’t have to carry everything.",

  mindClearLabel: "Clear mind",
  mindClearDescription:
    "Every thing you store in Remi is one less thing your mind has to carry.",

  todaySectionTitle: "What we’ve achieved",
  todaySectionSubtitle:
    "A summary of how we’re taking care of your mind.",
  todayTasksLabel: "Today’s tasks",
  todayTasksDescription:
    "Today we’ve organised {{todayTotal}} tasks.",

  streakSectionTitle: "Our streak",
  streakValue: "{{streakDays}} days",
  streakDescription:
    "We’ve gone {{streakDays}} days without your mind having to remember everything on its own.",

  memoryDelegatedTitle: "Delegated memory",
  memoryDelegatedValue: "{{tasks}} tasks · {{ideas}} ideas",
  memoryDelegatedDescription:
    "Right now Remi is taking care of {{tasks}} tasks and {{ideas}} ideas for you.",

  weekSectionTitle: "Our week",
  weekSectionSubtitle:
    "Every day you use Remi, your head carries a little less weight.",
  weekActiveLabel: "Active days this week",

  loading: "Updating your summary with Remi…",

  // Moods
  moodTitleCelebrate: "Amazing team!",
  moodTitleHappy: "We’re doing great today",
  moodTitleCalm: "Everything under control",
  moodTitleWaiting: "I’m ready",
  moodTitleConcerned: "Let’s take it step by step",
  moodTitleDefault: "We’re in this together",

  moodSubtitleCelebrate:
    "These days we’re taking great care of your mind. We’ve cleared {{cleared}} tasks for today and Remi is storing {{totalItems}} things in total between tasks and ideas.",
  moodSubtitleHappy:
    "We’ve cleared a good part of your mind today: you have {{todayTotal}} tasks organised and {{todayDone}} of them are already done.",
  moodSubtitleCalm:
    "We’re moving forward without rushing. We’ve saved {{todayTotal}} tasks for today and Remi is remembering them for you.",
  moodSubtitleWaiting:
    "Today your mind is light, but we can still offload a few more things into Remi so you don’t have to remember them yourself.",
  moodSubtitleConcerned:
    "Looks like there’s still some day ahead. We can start with one small task and let your mind breathe a bit more.",
  moodSubtitleDefault:
    "Every thing you store in Remi is one less thing your mind has to carry.",
},


capture: {
  tips: {
    0: "Tip: Say or type “idea” to create notes without reminders",
    1: "Tip: You can paste text from other apps",
    2: "Tip: Don’t worry about formatting—write like you speak",
    3: "Tip: Press and hold the microphone to dictate",
  },

 paste: {
    title: "Paste what you last copied?",
    sub: "Tap PASTE to insert it here.",
    button: "PASTE",
    pasting: "Pasting…",
    toastUnavailable: "Paste isn’t available here. Long-press and paste manually.",
    toastEmpty: "Clipboard is empty (or I can’t read it).",
    toastDenied: "I can’t read the clipboard. Long-press and paste manually.",
  },

   toast: {
      micDenied: "Microphone permission denied.",
      noSpeech: "I didn’t catch any speech. Try again.",
      dictationError: "Dictation error.",
      dictationStartError: "I couldn’t start dictation.",
      pasteUnavailable: "Paste isn’t available here (clipboard not available).",
      clipboardEmpty: "Your clipboard is empty.",
      pasteError: "I couldn’t access the clipboard. Press and hold, then paste.",
      writeSomething: "Write something first.",
    },

 textareaPlaceholderIOS:
    "iPhone/iPad: use the keyboard microphone to dictate.\n" +
    "If it’s missing: Settings > General > Keyboard > Enable Dictation.\n" +
    "If it says “not available”: Settings > Privacy & Security > Microphone (enable your browser).",

  repeatOn: "On",
  repeatOff: "Off",
  remindersDisabledByHabit: "Habits create their own reminders using the selected date and time.",
  timeHour: "Hour",
  timeMinute: "Minutes",
  dateTimeLabel: "Date & time",
  dateTimeNoneShort: "No date or time",
  placeholder: "Write here…",
  

  title: "Clear your mind",
  subtitle: "Speak, write, or paste text. Remi takes care of it.",
  examplesTitle: "Examples:",
  exampleVoice: "🎤 “Call mom on Sunday”",
  exampleVoiceIOS: '🎤 “Use your keyboard microphone to dictate”',
  examplePaste: "📋 “Every Tuesday at 18:00 we meet up”",
  exampleIdea: "💡 Idea: trip to Italy in spring",
  holdToTalk: "Press and hold to talk",
  listening: "Listening…",
  iosKeyboardMicHint: "On iPhone: use the keyboard microphone to speak.",
speakHold: "Hold to talk",

  textareaPlaceholder: "Examples:",

  ideaButton: "Idea",
  taskButton: "Task",

  dueLabel: "Due date",
  dueToday: "Today",
  dueTomorrow: "Tomorrow",
  dueWeek: "1 week",
  dueNone: "No date",
  dueHint: "You can adjust date and time manually.",
  duePlaceholder: "Choose date and time",

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

tasks: {
  weekdayLabels: "Mon|Tue|Wed|Thu|Fri|Sat|Sun",

  editLabel: "Edit",
  editTitle: "Edit task",
  editSubtitle: "Change the text, date & time, reminders and repeat.",

  fieldTitle: "Task",
  fieldTitlePlaceholder: "Write your task...",

  optionsTitle: "Options",

  dueDateLabel: "Date & time",
  clearDueDate: "Clear",

  reminderLabel: "Reminders",
  reminder: {
    none: "No reminders",
    onDue: "Only on due date",
    dayBeforeAndDue: "Day before and due date",
    dailyUntilDue: "Every day until due date",
  },

  save: "Save",
  footerHint: "You can edit this anytime.",
  updateError: "Error updating task",
},



  auth: {
    titleLogin: "Log in to REMI",
    titleRegister: "Create your REMI account",
    subtitleAuth2:"From MIND FULL to MINDFUL" ,

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
    menuInstallApp: "Install app",
    actionDoneTitle: "Mark as done",
      actionPostpone1d: "+1",
  actionPostpone1dTitle: "Postpone: add 1 day to the due date",
  actionDone: " ",
  
    

  greeting: "Hi, {{name}} 👋",
  tasksToday: "You have {{count}} active tasks",
  prioritize: "Let's focus only on what matters.",
  postponeDayToast: "You added one more day to your task.",

  tabsToday: "Today",
  tabsWeek: "Week",
  tabsMonth: "Month",
  tabsNext: "Upcoming tasks",
 
tabsAll: "All",
tabsNoDate: "No date",


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

  shareText: "I’m using Remi to get tasks and ideas out of my head, and my mind feels so much clearer and less stressed.\nI definitely recommend trying it, it really helps. Here’s the link. 🙂",
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

  sectionToday: "Today",
  sectionTomorrow: "Tomorrow",
  sectionNoDate: "No date",

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

  shareText: "I’m using Remi to get tasks and ideas out of my head, and my mind feels so much clearer and less stressed.\nI definitely recommend trying it, it really helps. Here’s the link. 🙂",
  shareCopied: "REMI link copied to clipboard",

  defaultUserName: "User",

  avatarTooBig: "The image must be smaller than 5 MB.",
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

landing: {
  hero: {
    badge: "Your external memory",
    shareButtonLabel: "Share Remi",
    shareText:
      "I'm using Remi to organize everything I used to carry in my head, and I've greatly reduced my stress and mental load. Here’s the link:",
    shareCopied: "Remi link copied to clipboard.",
    title: {
      part1: "Remember everything without",
      highlighted: "mental stress",
    },
    description:
      "Take tasks, ideas and reminders out of your head so you can focus on what really matters. Remi makes sure you remember what you need at exactly the right moment.",
    ctaPrimary: "Start now",
    ctaSecondary: "See how it works",
    userStatsHighlight: "People who use Remi",
    userStats:
      "say they feel lighter and under much less mental load.",
  },

  features: {
    title: {
      part1: "Designed to",
      highlighted: "free your mind",
    },
    subtitle:
"Remi combines smart reminders, time management and quick capture so your head stops being your to-do list.",

    items: {
      reminders: {
        title: "Personalized reminders",
        description:
          "Set whatever frequency you need: daily, weekly, monthly or custom. Remi adapts to your rhythm. Only what matters, at the right time.",
      },
      temporal: {
        title: "Time control",
        description:
          "Decide how long you want to remember each thing. No more endless reminders. Your future self will thank you.",
      },
      mentalLoad: {
        title: "Mental load under control",
        description:
          "Get everything that’s on your mind out of your head: big or small tasks, errands, ideas, things you don’t want to forget. Remi stores them and brings them back exactly when you need them.",
      },

      quickCapture: {
        title: "Ultra-fast capture",
        description:
          "Write down an idea or a task in a moment, without complicated menus. Open, type, done. Remi takes care of the rest.",
      },
    },
  },

  mentalLoad: {
    cardTitle: "How your mind is today",
    cardDate: "Today",
    cardStatus: "Clearer mind",

    example1: "Important bills written down",
    example1Freq: "Every month",
    example2: "Birthday gifts planned",
    example2Freq: "Throughout the year",
    example3: "Today’s tasks organized",
    example3Freq: "Every morning",

    badge: "Your external memory",
    headline: "We’re doing great today",
    subheadline:
      "Today we’ve cleared your mind quite a bit: you have 5 tasks organized and 3 of them are already done.",
    clearMindLabel: "Clear mind",
    clearMindHelper:
      "Every thing you save in Remi is one less thing weighing on your mind.",

    title: {
      part1: "Your mind is for creating,",
      highlighted: "Remi is for remembering",
    },
    description:
      "We use our mind as a to-do list, a calendar, home management and storage for everything that’s pending. That creates stress and a constant feeling of mental load. Remi helps you unload that burden easily and quickly into an external, clear and reliable place so you can dedicate your attention to what really matters.",
    step1Title: "Get everything out of your head",
    step1Description:
      "Whenever something comes to mind —a task, an idea, an errand— you write it down in Remi. Without overthinking it: just write it and go back to what you were doing.",

    step2Title: "Let Remi organize it with you",
    step2Description:
      "If it’s an idea, you save it with one click and can edit it later or turn it into a task.\nIf it’s a task, you choose a due date and how you want Remi to remind you — fast and without having to touch it again.",

    step3Title: "Get a clear head again",
    step3Description:
      "Your mind stops being a storage room and becomes what it should be: a space to think, create and be present, without the fear of forgetting anything important.",
  },

  cta: {
    badge: "Start with something small today",
    title: {
      part1: "Little by little, build a",
      highlighted: "lighter, calmer mind",
    },
    description:
        "You don't need to change your whole life. Just take out of your head what you used to carry inside. Remi doesn't force you to do things at a specific time: Remi simply reminds you in time so you can choose when it suits you best, without forgetting.",

    ctaPrimary: "Try Remi now",
    ctaSecondary: "Keep reading first",

    feature1: "Completely free",
    feature2: "Designed for all kinds of people and minds",
    feature3: "Works equally well for tasks and ideas",
  },

  footer: {
    description:
      "Remi is your trusted external memory for all those things you don’t want to forget, but don’t want to carry in your head all day either.",

    product: "Product",
    productLinks: {
      features: "Features",
      pricing: "Pricing",
      useCases: "Use cases",
      roadmap: "Roadmap",
    },

    company: "Company",
    companyLinks: {
      about: "About Remi",
      blog: "Blog",
      careers: "Careers",
      contact: "Contact",
    },

    legal: "Legal",
    legalLinks: {
      privacy: "Privacy policy",
      terms: "Terms of use",
      cookies: "Cookies",
      licenses: "Licenses",
    },

    copyright: "© Remi 2025. All rights reserved.",
  },



},
} as const;