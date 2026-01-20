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


  shareInvite: {
    share: "Share",
    sharedOk: "Done. Link copied/shared.",
    sharedError: "Could not share. Please try again.",
    message: "{{name}} wants you to remember: {{text}}",

     pageTitle: "Add to Remi",
    pageSubtitle: "Save this reminder to your account.",
    loading: "Loading…",
    invalidLinkTitle: "Invalid link",
    goHome: "Go to home",
    someone: "Someone",
    due: "Due",
    acceptCta: "Add to Remi",
    accepting: "Adding…",
    acceptError: "Could not add. Please try again.",
    alreadyAccepted: "This link has already been used.",
    expired: "This link has expired.",
    rejected: "This link was rejected.",
    openRemi: "Open Remi",
      missingToken: "Missing link token.",
  loadError: "Failed to load the link.",
  loginHint: "If you’re not logged in, you’ll be asked to sign in or create an account to add it.",
sentIndicator: "Shared by you",
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

// dentro de capture: { ... }
chips: {
  backHint: "Back to shortcuts",
  title: "Smart shortcuts",
    title2: "Date / habit",
    title3: "Time",
    title4: "Reminder",
    back: "Shortcuts",
},
chip: {
  buyWord: "Buy",
  callWord: "Call",
  payWord: "Pay",
  birthdayWord: "Birthday",
  apptWord: "Meeting",
  ideaWord: "Idea:",
       buy: "Buy",
      call: "Call",
      pay: "Pay",
      birthday: "Birthday",
      appt: "Appointment",
      idea: "Idea",

  schedule: {
   
      on: "on",
        every: "every",
        before: "before",
        today: "today",
        tomorrow: "tomorrow",
        am: "at",
        jeden: "every",
        vor: "before",
        heute: "today",
        morgen: "tomorrow",
  },

  time: {
    prefix: "at",
    t0900: "9:00",
    t1800: "18:00",
  },

  reminder: {
     dailyLabel: "Every day",
        dailyInsert: "remind every day",
     standardLabel: "Standard",
      dayBeforeLabel: "day before",
      noneLabel: "No reminders",

      standardInsert: "remind",
      dayBeforeInsert: "remind the day before",
      noneInsert: "no reminders",
  },
},


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
    greeting: "Hi, {{name}}",
    tasksToday: "You have {{count}} tasks",
    prioritize: "Focus on what matters",
    done: "Done",
    delete: "Delete",
     actionEditTitle: "Edit",

    defaultUserName: "User",

    tabsToday: "Today",
    tabsWeek: "Week",
    tabsNoDate: "No date",

    loadingTasks: "Loading…",
    noUrgentTitle: "All under control",
    noUrgentSubtitle: "Nothing urgent right now",

    dueNoDate: "No date",

    actionPostpone1dTitle: "Postpone: add 1 day to the due date",
    actionDoneTitle: "Mark as done",
    postponeDayToast: "Postponed",

    errorLoadingTasks: "Error loading tasks",

    profileLoggedInAs: "Signed in as {{name}}",
    menuProfile: "Profile",
    menuShareApp: "Share app",
    menuInstallApp: "Install app",

    shareText:
      "I’m using Remi to get tasks and ideas out of my head, and my mind feels much clearer and less stressed.\nI really recommend trying it — it helps a lot. Here’s the link 🙂",
    shareCopied: "Link copied to clipboard",

    pushTitle: "Enable notifications",
    pushBody: "So you get reminders at the right moment.",
    pushEnable: "Enable",
    pushEnabling: "Enabling…",
    pushLater: "Not now",
    pushEnabledToast: "Notifications enabled",
    pushErrorToast: "Couldn’t enable notifications",

    multideviceHelp: {
      title: "Multi-device: don’t forget anything, wherever you are",
      p1: "Remi is built so you can offload things in 5 seconds, from any device.",
      stepsTitle: "How to use it (quick)",
      step1: "Capture wherever you are: phone, iPad/tablet or PC. Type, speak or paste text.",
      step2: "Everything syncs: what you save on one device appears on the others.",
      step3: "Per-device notifications: enable alerts only where you want (e.g. phone ON, PC OFF).",
      examplesTitle: "Examples that work",
      examplesBody:
        "• Phone ON → reminders on the go\n• PC OFF → zero interruptions while working\n• iPad ON → calm end-of-day review",
      footer: "You offload the mental load in the moment. Remi nudges you when it’s time.",
      ok: "Got it",
      hideForever: "Don’t show again",
    },


    tip: {

      multidevice: {
        title: "Remi on your phone, iPad/tablet and PC",
        body: "Offload your mind anywhere. Everything syncs, and you choose which devices should receive notifications.",
        cta: "How it works",
      },


      smartShortcuts: {
            title: "Smart shortcuts (save 10s)",
            body: "Add words with 1 tap.\nE.g. Idea / Buy / at 6:00 PM.",
            cta: "Try now",
            prefill: "Buy: milk, bread, eggs",
          },

      install: {
        title: "Install Remi as an app",
        body: "Quick access, notifications, and all the benefits of an app.",
        cta: "Install",
      },

      push: {
        title: "Let Remi remind you",
        body: "Enable notifications and drop the mental load. Remi taps your shoulder when it’s time.",
        cta: "Enable",
      },

      iosDict: {
        title: "Enable the keyboard mic",
        body: "If you don’t see the mic on the keyboard, enable it in Settings to dictate faster.",
        cta: "Show me",
      },

      noDate: {
        title_one: "You have {{count}} task with no date",
        title_other: "You have {{count}} tasks with no date",
        body: "Want to sort them? I’ll clean the list up in 30s.",
        cta: "View no date",
      },

      shortcuts: {
        title: "Words that save time",
        body: "An idea = start with ‘Idea’. \nA task = start with a verb.",
        cta: "See examples",
      },

      dayClose: {
        title: "60-second wrap-up",
        body: "What’s on your mind for tomorrow? Drop it and done.",
        cta: "Drop it",
      },

      paste: {
        title: "Have you tried pasting text?",
        body: "Copy anything (WhatsApp, email, notes) and let Remi organize it.",
        cta: "Paste now",
      },

      shareToRemi: {
        title: "Save things using Share",
        body: "From WhatsApp/Mail/Notes: Share → Remi. \nIt opens ready to organize.",
        cta: "Try",
        toast: "Tip: in another app tap “Share” → “Remi” to send it directly 🙂",
      },

      natural: {
        title: "Write like you speak",
        body: "Example: “Pay the electricity bill tomorrow at 6pm”. Remi handles it, and you can rest.",
        cta: "Try example",
        prefill: "Pay the electricity bill tomorrow 18:00",
      },

      week: {
        title: "Quick plan",
        body: "See your week in one gesture. Urgent first — the rest out of your head.",
        cta: "View week",
      },

      mental: {
        title: "Mini break",
        body: "Breathe in 4s, out 6s. Your mind doesn’t have to do everything today.",
        cta: "Empty mind",
      },

      birthday: {
        title: "Birthday coming up?",
        body: "Write it in 5 seconds and Remi will remind you when it’s time.",
        cta: "Add",
        prefill: "___’s birthday on ___",
      },

      cleanNoDate: {
        title: "✅ No undated tasks",
        body: "Perfect. Prioritizing is easy now.",
        cta: "View today",
      },
    },

    // en
shareToRemiModal: {
  title: "Share to Remi",
  body: "Save text from any app using “Share”.",
  iosTitle: "On iPhone (iOS)",
  iosStep1: "Open WhatsApp/Mail/Notes.",
  iosStep2: "Tap “Share”.",
  iosStep3: "If you see “Remi”, tap it and it will open ready to organize.",
  iosStep4:
    "If it doesn’t appear, use “Copy” and then paste into Remi (on iOS it can depend on the system/version).",
  androidTitle: "On Android",
  androidStep1: "Open WhatsApp/Mail/Notes.",
  androidStep2: "Select the text and/or tap “Share”.",
  androidStep3: "Choose “Remi” and it will open with the text ready to organize.",
  androidStep4:
    "If it doesn’t appear, make sure Remi is installed as an app (PWA) and try again.",
  ok: "Got it",
  hideForever: "Don’t show again",
},


    shortcutsModal: {
      title: "See examples",
      body: "Tap an example to open Remi with that text.",
      ex1: "Idea: Trip to Japan in spring",
      ex2: "Idea: Gift for ___",
      ex3: "Call the insurance tomorrow 10:00",
      ex4: "Pay the electricity bill tomorrow 18:00",
      ex5: "Send an email to ___ today",
      openEmpty: "Open Remi",
      close: "Close",
    },

    iosDict: {
      helpTitle: "Enable Dictation on iPhone",
      helpBody:
        "On iOS it’s usually here: Settings → General → Keyboard → Enable Dictation.",
      helpStepsTitle: "Quick steps",
      step1: "Open Settings",
      step2: "General → Keyboard",
      step3: "Enable “Enable Dictation”",
      ok: "Got it",
      hideForever: "Don’t show again",
    },
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

     devicePushTitle: "Notifications on this device",
  devicePushUnsupportedHint:
    "This browser doesn’t support push notifications. Try Safari on iPhone or Chrome/Edge on Android/desktop.",
    devicePushChecking: "Checking…",
  devicePushUnsupportedLine: "This device/browser doesn’t support push.",
  devicePushDeniedLine: "Permission denied on this device (browser settings).",
  devicePushNeedsPermissionLine: "You haven’t granted permission on this device yet.",
  devicePushNeedsRegisterLine: "Permission OK, but you still need to enable it here.",
  devicePushActiveLine: "Active on this device ✅",
   devicePushToggleAria: "Enable or pause notifications on this device",
  pushDeviceEnabled: "Notifications enabled on this device",

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