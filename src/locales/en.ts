// src/locales/en.ts
export const en = {
  repeat: {
    label: "Repeat",
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
    sharedError: "Couldn't share. Please try again.",
    message: "{{name}} wants you to remember: {{text}}",

    pageTitle: "Add to Remi",
    pageSubtitle: "Save this reminder to your account.",
    loading: "Loading…",
    invalidLinkTitle: "Invalid link",
    goHome: "Back to home",
    someone: "Someone",

    due: "Date",
    acceptCta: "Add to Remi",
    accepting: "Adding…",
    acceptError: "Couldn't add it. Please try again.",
    alreadyAccepted: "This link has already been used.",
    expired: "This link has expired.",
    rejected: "This link was rejected.",
    openRemi: "Open Remi",
    missingToken: "Missing link token.",
    loadError: "Couldn't load the link.",
    loginHint:
      "If you're not signed in, we'll ask you to log in or create an account so you can add it.",
    sentIndicator: "Shared task",
    messageLine1: "{{name}} wants you to remember:",
  },

  mentalDump: {
    whyLabel: "Why:",
    detectedLabel: "Detected:",
    detectedManual: "Manual",
    detectedDash: "—",
    habitDetectedLabel: "Habit detected:",
    detectedDefault: "Default",
    habitLabel: "Repeat",
    habitOn: "On",
    habitOff: "Off",

    detectedReminder: {
      DAY_BEFORE_AND_DUE:
        "Detected \"{word}\" → I set it to: day before + due day.",
      DAILY_UNTIL_DUE:
        "Detected \"{word}\" → I set it to: daily until the due date.",
      WEEK_BEFORE_AND_DUE:
        "Detected \"{word}\" → I set it to: 1 week before + due day.",
    },

    why: {
      verbTask: "Detected \"{word}\" → marked it as a task.",
      prefixIdea: "Detected \"{word}\" → marked it as an idea.",
      projectIdea: "Sounds like an idea/project → marked it as an idea.",
      defaultTask: "No clear clue → marked it as a task.",
      defaultIdea: "No clear clue → marked it as an idea.",
      manualTask: "You marked it as a task.",
      manualIdea: "You marked it as an idea.",
    },

    dateLabel: "Date",
    timeLabel: "Time",
    reminderLabel: "Reminder",
    reminderShortLabel: "Alert:",
    reminderOff: "Off",
    reminderDailyUntilDue: "Daily",
    reminderDayBeforeAndDue: "1 day before",
    reminderWeekBeforeAndDue: "1 week before",

    buttonLabel: "Clear your mind",

    title: "Intensive brain dump",
    description:
      "Spend 2–3 minutes emptying your head. Write everything you don't want to forget: tasks, ideas, pending stuff. No need to organize anything—Remi turns it into reminders for you.",

    inputLabel: "Write short phrases, separated by line breaks or commas.",
    placeholder:
      "Examples:\n" +
      "Change the hallway light bulb tomorrow at 10\n" +
      "Call mom on Sunday\n" +
      "Every Monday at 14:00 use Remi\n" +
      "Idea: trip to Italy in spring",

    // Initial summary texts
    summaryNone: "No phrases have been detected yet.",
    summaryPrefix: "We detected",
    summarySuffix: "possible reminders in your text.",

    // Button states
    submitSaving: "Saving...",
    submitToPreview: "Review reminders",
    submitConfirm: "Save to Remi",

    // Preview
    previewTitle: "Review your brain dump",
    previewDescription:
      "Enable or disable the lines you want to save, adjust the texts, and confirm to create tasks and ideas in Remi.",
    previewNoneSelected: "No items selected.",
    previewTaskLabel: "Task",
    previewIdeaLabel: "Idea",
    previewInclude: "Save",
    previewBackToEdit: "Back to editing text",

    // Habits
    habitNone: "No Repeat",
    habitDaily: "Daily repeat",
    habitWeekly: "Weekly repeat",
    habitMonthly: "Monthly repeat",
    habitYearly: "Yearly repeat",

    hints: {
      0: "Just write. Remi organizes it and schedules everything for you, so it reminds you at the right time.",
      1: "Paste or send text from WhatsApp, an email, or a note. Remi turns it into a reminder.",
      2: "Tasks, ideas, errands… everything fits. Remi organizes it and reminds you when it's time.",
      3: "No perfect format needed. Write the way you talk.",
      4: "Did someone tell you something important? Copy & paste. Remi saves it for you.",
      5: "Write dates or times (e.g. \"Tuesday 18:00\", \"Jan 17 at 15:00…\"). Remi detects them.",
      6: "Write \"every day / every week, etc\" if it's a repeating habit.",
      7: "One minute here = a more relaxed day and fewer forgotten things.",
      8: "Quick tip: Write \"Idea\" to save notes without reminders.",
    },
  },

  common: {
    appName: "REMI",
    save: "Save",
    back: "Back",
    menu: "Menu",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    confirm: "Confirm",
    loading: "Loading...",
    speak: "Speak",
    paste: "Paste",
  },

  index: {
    clearMind: "Clear mind",
    reminders: "Reminders",
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
    lists: "Lists",
    status: "Status",
    add: "New",
    holdToTalk: "Press and hold",
    listening: "Listening…",
    dictationNotSupported: "Dictation not supported",
    tasks: "Tasks",
    ideas: "Ideas",
  },

  installPrompt: {
    iosTitle: "Install Remi on your iPhone — FREE",
    iosStep1BeforeShare: "1. Tap the",
    iosShareLabel: "Share",
    iosStep1AfterShare: "button.",
    iosStep2BeforeAction: "2. Choose",
    iosAddToHome: "Add to Home Screen",
    iosStep2AfterAction: "and confirm.",
    defaultTitle: "Install Remi",
    defaultDescription: "Add Remi to your list of apps — FREE!",
    buttonInstall: "Install",
    close: "Close",
  },

  status: {
    back: "Back",
    headerTitle: "Remi status",
    headerSubtitle: "We helped your mind feel a bit lighter today.",

    helperLabel: "Your external memory",
    helperFallback:
      "I'm here to store your tasks, ideas, and reminders so your mind doesn't have to carry everything.",

    mindClearLabel: "Clear mind",
    mindClearDescription:
      "Every thing you save in Remi is one less thing your mind has to carry.",
    relaxMindButton: "Relax your mind",
    relaxSound: "Sound",
    relaxSoundOff: "Sound off",
    relaxPops: "Pops",
    relaxModeTitle: "Bubble Pop Zen",
    relaxModeCalm: "Calm",
    relaxModeEnergy: "Energy",
    relaxDoneTitle: "Reset done",
    relaxDoneSubtitle: "Release tension with simple taps. No thinking.",
    relaxHoldToInhale: "Hold to inhale",
    relaxReleaseToExhale: "Release to exhale",
    relaxAverage: "Average",
    relaxInhaleShort: "In",
    relaxExhaleShort: "Out",
    relaxCycles: "Cycles",
    relaxCapture: "Capture",
    relaxViewCanvas: "View canvas",
    relaxTapToReturn: "Tap to return",
    relaxModalTitle: "Take a deep breath",
    relaxModalSubtitle: "Follow the rhythm for 30 seconds.",
    relaxInhale: "Inhale slowly",
    relaxExhale: "Exhale slowly",
    relaxDone: "Great job",
    relaxCountdownHint: "Stay here until the timer finishes",
    relaxRepeat: "Repeat",
    relaxBetter: "I feel better",

    todaySectionTitle: "What you achieved",
    todaySectionSubtitle: "A quick summary of how we're taking care of your mind.",
    todayTasksLabel: "Completed today",
    todayTasksDescription:
      "{{todayDone}}/{{todayTotal}} tasks due today completed.",

    streakSectionTitle: "Our streak",
    streakValue: "{{streakDays}} days",
    streakDescription:
      "It's been {{streakDays}} days without your mind having to remember everything by itself.",

    memoryDelegatedTitle: "Delegated memory",
    memoryDelegatedValue: "{{tasks}} tasks · {{ideas}} ideas",
    memoryDelegatedDescription:
      "Right now Remi is taking care of {{tasks}} tasks and {{ideas}} ideas.",

    weekSectionTitle: "Our week",
    weekSectionSubtitle:
      "Every day you use Remi, your head carries a bit less.",
    weekActiveLabel: "Active days this week",
    mentalLoadTitle: "Mental load balance",
    mentalLoadSubtitle: "Captured vs resolved in the last 7 days",
    mentalCapturedTooltip: "Captured: {{count}}",
    mentalResolvedTooltip: "Resolved: {{count}}",
    memoryCaptured: "Captured",
    memoryResolved: "Resolved",
    memoryDistributionTitle: "Memory distribution",
    memoryDistributionSubtitle: "What kind of load are you delegating to Remi",
    memoryTasksLabel: "Reminders",
    hourMapTitle: "Hour map",
    hourMapSubtitle: "When you capture more mental load (last 30 days)",
    pieTitle: "General status",
    pieSubtitle: "Captured, notes, lists, closed and overdue (last 30 days)",
    pieCaptured: "Total",
    pieIdeas: "Ideas",
    pieLists: "Lists",
    pieClosed: "Closed",
    pieOverdue: "Overdue",
    usersTitle: "More people caring for their minds",
    usersSubtitle: "Total users on Remi",
    usersUnavailable: "Not available",

    loading: "Updating your Remi summary…",

    // Moods
    moodTitleCelebrate: "Amazing team!",
    moodTitleHappy: "We're doing great today",
    moodTitleCalm: "Everything under control",
    moodTitleWaiting: "I'm ready",
    moodTitleConcerned: "One step at a time",
    moodTitleDefault: "We're in this together",

    moodSubtitleCelebrate:
      "These days we're taking great care of your head. We cleared {{cleared}} tasks today and Remi has {{totalItems}} items saved in total between tasks and ideas.",
    moodSubtitleHappy:
      "We cleared quite a bit from your mind today: you have {{todayTotal}} tasks organized and {{todayDone}} of them are already done.",
    moodSubtitleCalm:
      "Steady progress. We have {{todayTotal}} tasks saved for today and Remi remembers them for you.",
    moodSubtitleWaiting:
      "Your mind is light today, but we can offload a bit more into Remi so you don't have to remember it yourself.",
    moodSubtitleConcerned:
      "Looks like there's still a day ahead. We can start with one small task and let your mind breathe a bit more.",
    moodSubtitleDefault:
      "Every thing you save in Remi is one less thing your mind has to carry.",
  },

  capture: {
    modalPlaceholder: "Clear your mind here…",

    chips: {
      backHint: "Back to shortcuts",
      title: "Smart shortcuts",
      title2: "Date / Repeat",
      title3: "Time",
      title4: "Reminder",
      back: "Shortcuts",
    },

    chip: {
      // ROOT: word inserted into textarea
      buyWord: "Buy",
      callWord: "Call",
      payWord: "Pay",
      birthdayWord: "Birthday",
      apptWord: "Appointment",
      ideaWord: "Idea:",

      buy: "Buy",
      call: "Call",
      pay: "Pay",
      birthday: "Birthday",
      appt: "Appointment",
      idea: "Idea",

      // SCHEDULE
      schedule: {
        el: "on",
        cada: "every",
        antesDel: "before",
        hoy: "today",
        manana: "tomorrow",

        // extras you already had
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

      // TIME
      time: {
        prefix: "at",
        t0900: "09:00",
        t1800: "18:00",
      },

      // REMINDER
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
      0: 'Tip: Say or write "idea" to create notes without a reminder',
      1: "Tip: You can paste text from other apps",
      2: "Tip: Don't worry about formatting—write the way you talk",
      3: "Tip: Press and hold the microphone to dictate",
    },

    paste: {
      title: "Paste the latest copied text?",
      sub: "Tap PASTE to insert it here.",
      button: "PASTE",
      pasting: "Pasting…",
      toastUnavailable:
        "Paste isn't available here. Press and hold and paste manually.",
      toastEmpty: "Clipboard is empty (or I can't read it).",
      toastDenied:
        "I can't read the clipboard. Press and hold and paste manually.",
    },

    toast: {
      micDenied: "Microphone permission denied.",
      noSpeech: "I didn't detect any speech. Try again.",
      dictationError: "Dictation error.",
      dictationStartError: "Couldn't start dictation.",
      pasteUnavailable: "Can't paste here (clipboard not available).",
      clipboardEmpty: "There's no text in the clipboard.",
      pasteError: "Couldn't access the clipboard. Press and hold to paste.",
      writeSomething: "Write something first.",

      pickDateFirst: "Pick a date first.",
    },

    textareaPlaceholderIOS:
      "iPhone/iPad: use the keyboard microphone to dictate.\n" +
      "If it doesn't appear: Settings > General > Keyboard > Enable Dictation.\n" +
      "If it says \"not available\": Settings > Privacy & Security > Microphone (enable your browser).",

    repeatOn: "Enabled",
    repeatOff: "Disabled",
    remindersDisabledByHabit:
      "Repeats create their own reminders using the selected date and time.",
    timeHour: "Hour",
    timeMinute: "Minutes",
    dateTimeLabel: "Date and time",
    dateTimeNoneShort: "No date or time",
    timeUnset: "No time",
    placeholder: "Tap to type",
    noteHint: "Save your memories so you don't lose them",
    masterHint: "Tell Remi what you want to do.",

    title: "Clear your mind",
    subtitle: "Speak, type, or paste text. Remi takes care of it.",
    inlineGuide: "❓ What?  📅 When?  🔔 Reminder?",
    inlineExample: "Ex: Marcos's birthday on June 12 at 1:00 PM. Remind me one week before.",
    examplesTitle: "Examples:",
    exampleVoice: '🎤 "Call mom on Sunday"',
    exampleVoiceIOS: '🎤 "Use the keyboard mic to dictate"',
    examplePaste: '📋 "Every Tuesday at 18:00 we meet"',
    exampleIdea: "💡 Idea: trip to Italy in spring",
    holdToTalk: "Press and hold to speak",
    listening: "Listening…",
    iosKeyboardMicHint: "Use the keyboard microphone to speak.",
    speakHold: "Press and hold to speak",

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
    remindersOnDue: "Only on due day",
    remindersDayBeforeAndDue: "Day before and due day",
    remindersDailyUntilDue: "Every day until due date",
    reminderWeekBeforeAndDue: "One week before until due day",

    back: "Back",
    saveTask: "Save task",

    toastTaskSaved: "Task saved successfully",
    toastTaskError: "Error creating task",
    toastIdeaSaved: "Idea saved successfully",
    toastIdeaError: "Error creating idea",
    type: {
      master: "Remi",
      task: "Reminder",
      note: "Note",
      list: "List",
    },
  },

  pill: {
    type: {
      label: "Type",
      task: "Reminder",
      idea: "Idea",
      list: "List",
    },

    more: "Details",
    less: "Hide",
    detected: "Detected:",
    date: "Date",
    time: "Time",
    reminder: "Reminder",
    habit: "Repeat",
    reminderNone: "No reminder",
    repeatNone: "No repeat",

    on: "On",
    off: "Off",

    remDaily: "Daily",
    remDayBefore: "1 day before",
    remWeekBefore: "1 week before",

    habitDaily: "Daily",
    habitWeekly: "Weekly",
    habitMonthly: "Monthly",
    habitYearly: "Yearly",
  },

  tasks: {
    weekdayLabels: "M|T|W|T|F|S|S",

    editLabel: "Edit",
    editTitle: "Edit task",
    editSubtitle: "Change the text, date and time, reminders, and repeat.",

    fieldTitle: "Task",
    fieldTitlePlaceholder: "Write your task...",

    optionsTitle: "Options",

    dueDateLabel: "Date and time",
    clearDueDate: "Remove",

    reminderLabel: "Reminders",
    reminder: {
      none: "No reminders",
      onDue: "Only on due day",
      dayBeforeAndDue: "Day before and due day",
      dailyUntilDue: "Every day until due date",
      weekBeforeAndDue: "Every day (1 week before)",
    },

    save: "Save",
    footerHint: "You can edit this anytime.",
    updateError: "Error updating task",
  },

  auth: {
    titleLogin: "Sign in to REMI",
    titleRegister: "Create your REMI account",
    subtitleAuth2: "From MIND FULL to MINDFUL",
    email: "Email",
    password: "Password",
    login: "Sign in",
    register: "Sign up",
    logout: "Sign out",

    loginTitle: "Welcome back!",
    registerTitle: "Start your journey!",
    loginSubtitle: "Keep improving every day with REMI",
    registerSubtitle: "Create your account and start achieving your goals",
    emailLabel: "Email",
    emailPlaceholder: "you@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    submitLogin: "Sign in",
    submitRegister: "Create account",
    toggleToRegister: "Don't have an account? Sign up",
    toggleToLogin: "Already have an account? Sign in",
    acceptPrefix: "By creating an account you accept the",
    acceptTerms: "terms and conditions",
    acceptAnd: "and the",
    acceptPrivacy: "privacy policy",

    errorInvalidCredentials:
      "Incorrect credentials. Check your email and password.",
    errorUserAlreadyRegistered:
      "This email is already registered. Try signing in.",
    errorGeneric: "Something went wrong. Please try again.",
    signUpSuccess: "Account created! Now start clearing your mind.",
  },

  today: {
    greetingHello: "Hello,",
    captureSectionTitle: "Clear your mind",
    listsTitle: "Lists",
    listsEmptyTitle: "Create your first list",
    tipsTitle: "Actions",
    openLists: "Open shared lists",

    shareRemindersModal: {
      title: "Share reminders with other people",
      body:
        "Send a reminder or idea as a link so someone else can add it to their Remi in one tap.",
      stepsTitle: "How it works (quick)",
      step1: "On a reminder/idea, tap the Share icon.",
      step2: "Send the link via WhatsApp, email, etc.",
      step3: 'The recipient taps "Add to Remi".',
      examplesTitle: "Examples that work great",
      examplesBody:
        "• \"Buy bread tomorrow\" → I send it to my partner\n• \"Doctor on Tuesday at 14:00\" → I send it to my mom\n• \"Bring charger\" → I send it to my coworker",
      footer:
        "This helps other people remember things that matter to them—and to you.",
      ok: "Got it",
      hideForever: "Don't show again",
    },

    dueLabel: "Due date",

    // Header / general
    greeting: "Hi, {{name}}",
    greetingHeader: "Hello {{name}}!",
    greetingSubheader: "Let's clear your mind",
    tasksToday: "You have {{count}} tasks",
    prioritize: "Prioritize what matters",
    done: "Done",
    delete: "Delete",
    actionEditTitle: "Edit",

    defaultUserName: "User",

    // Tabs
    tabsToday: "Today",
    tabsWeek: "Week",
    tabsNoDate: "No date",

    // States
    loadingTasks: "Loading…",
    noUrgentTitle: "All under control",
    noUrgentSubtitle: "Tap + to start clearing your mind.",

    // Dates / labels
    dueNoDate: "No date",

    // Actions
    actionRescheduleTitle: "Pick date",
    actionPostpone1dTitle: "Postpone: add 1 day to the due date",
    actionDoneTitle: "Mark as completed",
    postponeDayToast: "Postponed",

    // Errors
    errorLoadingTasks: "Error loading tasks",

    // Profile menu
    profileLoggedInAs: "Signed in as {{name}}",
    menuProfile: "Profile",
    menuShareApp: "Share app",
    menuInstallApp: "Install app",

    // Share
    shareText:
      "I use Remi to get tasks and ideas out of my head, and my mind feels much clearer and less stressed.\nI truly recommend it—it helps a lot. Here's the link 🙂",
    shareCopied: "Link copied to clipboard",

    // Push modal + toasts
    pushTitle: "Enable notifications",
    pushBody: "So you get reminders at the right moment.",
    pushEnable: "Enable",
    pushEnabling: "Enabling…",
    pushLater: "Not now",
    pushEnabledToast: "Notifications enabled",
    pushErrorToast: "Couldn't enable push",

    multideviceHelp: {
      title: "Multi-device: forget nothing, wherever you are",
      p1:
        "Remi is designed so you can offload things in 5 seconds, from any device.",
      stepsTitle: "How to use it (quick)",
      step1:
        "Capture anywhere: phone, iPad/tablet, or PC. Type, speak, or paste text.",
      step2:
        "Everything syncs: what you save on one device shows up on the others.",
      step3:
        "Per-device notifications: enable alerts only where you want (e.g., phone ON, PC OFF).",
      examplesTitle: "Examples that work",
      examplesBody:
        "• Phone ON → reminders while you're out\n• PC OFF → zero interruptions while working\n• iPad ON → calm review at the end of the day",
      footer:
        "You offload the mental load in the moment. Remi reminds you when and where it's needed.",
      ok: "Got it",
      hideForever: "Don't show again",
    },

    tip: {
      shareReminders: {
        title: "Team reminders",
        body: "share reminders or ideas.\nOthers add them to their Remi in 1 tap.",
        cta: "See how",
      },
      shareApp: {
        title: "Share Remi",
        body: "Invite someone to try Remi in one tap.",
        cta: "Share",
      },

      multidevice: {
        title: "Remi always with you",
        body:
          "Clear your head wherever you are. Everything syncs, and you choose which devices get notifications.",
        cta: "How it works",
      },

      smartShortcuts: {
        title: "Smart shortcuts",
        body: "Add words in 1 tap.\nE.g. Idea / Buy / at 18:00.",
        cta: "Try now",
        prefill: "Buy: milk, bread, eggs",
      },
      language: {
        title: "Remi in your language",
        body: "Change Remi's language anytime from your profile.",
        cta: "Change language",
      },
      sharedLists: {
        title: "Lists",
        body: "Create a list with someone else and update items in real time.",
        cta: "Open lists",
      },

      install: {
        title: "Install Remi as an app",
        body: "Quick access, notifications, and all the benefits of an app.",
        cta: "Install",
      },

      push: {
        title: "Let Remi remind you",
        body:
          "Enable notifications and drop the mental load. Remi taps you on the shoulder when it's time.",
        cta: "Enable",
      },

      iosDict: {
        title: "Talk with Remi",
        body:
          "If you don't see the mic on the keyboard, enable it in Settings and dictate faster.",
        cta: "See how",
      },

      noDate: {
        title_one: "You have {{count}} task without a date",
        title_other: "You have {{count}} tasks without a date",
        body: "Shall we sort them? In 30s I'll leave your list clean.",
        cta: "View no-date",
      },

      shortcuts: {
        title: "Words that save time",
        body: "An idea = start with 'Idea'.\nA task = start with a verb.",
        cta: "See examples",
      },

      dayClose: {
        title: "60-second wrap-up",
        body: "What's on your mind for tomorrow? Drop it and done.",
        cta: "Offload",
      },

      paste: {
        title: "Paste text",
        body: "Copy anything (WhatsApp, Email, Notes) and let Remi organize it.",
        cta: "Paste now",
      },

      shareToRemi: {
        title: 'Save things with "Share"',
        body:
          "From WhatsApp/Email/Notes: Share → Remi.\nOpens ready to organize.",
        cta: "Try",
        toast:
          "Tip: in another app tap \"Share\" → \"Remi\" to send it directly 🙂",
      },

      natural: {
        title: "Write the way you talk",
        body:
          'E.g. "Pay the electric bill tomorrow at 6pm". Remi handles it and you can relax.',
        cta: "Try example",
        prefill: "Pay the electric bill tomorrow 18:00",
      },

      week: {
        title: "Quick plan",
        body:
          "See your week in one gesture. Urgent first, everything else out of your head.",
        cta: "View week",
      },

      mental: {
        title: "Mini pause",
        body: "Breathe in 4s, breathe out 6s. Your mind doesn't need to do it all today.",
        cta: "Clear mind",
      },

      birthday: {
        title: "Birthday coming up?",
        body: "Write it in 5 seconds and Remi will remind you when it's time.",
        cta: "Add",
        prefill: "___'s birthday on ___",
      },

      feedback: {
        title: "Improve Remi",
        body: "Tell us in 20 seconds what's helping you and what we should improve.",
        cta: "Give feedback",
      },

      cleanNoDate: {
        title: "✅ No tasks without a date",
        body: "Perfect. Now it's easy to prioritize.",
        cta: "View today",
      },
    },

    shareToRemiModal: {
      title: "Share to Remi",
      body: "Save text from any app using \"Share\".",
      iosTitle: "On iPhone (iOS)",
      iosStep1: "Open WhatsApp/Email/Notes.",
      iosStep2: 'Tap "Share".',
      iosStep3: 'If you see "Remi", tap it and it will open ready to organize.',
      iosStep4:
        "If it doesn't appear, use \"Copy\" and then paste in Remi (on iOS it can depend on the system/version).",
      androidTitle: "On Android",
      androidStep1: "Open WhatsApp/Email/Notes.",
      androidStep2: 'Select the text and/or tap "Share".',
      androidStep3: "Choose \"Remi\" and it will open with the text ready to organize.",
      androidStep4:
        "If it doesn't appear, make sure Remi is installed as an app (PWA) and try again.",
      ok: "Got it",
      hideForever: "Don't show again",
    },

    shortcutsModal: {
      title: "See examples",
      body: "Tap an example to open Remi with that text.",
      ex1: "Idea: Trip to Japan in spring",
      ex2: "Idea: Gift for ___",
      ex3: "Call the insurance tomorrow 10:00",
      ex4: "Pay the electric bill tomorrow 18:00",
      ex5: "Send an email to ___ today",
      openEmpty: "Open Remi",
      close: "Close",
    },
    naturalModal: {
      title: "Write the way you talk",
      body: "Remi detects what is needed from the text.",
      reminderTitle: "Reminder with advance alert",
      reminderBody:
        "Create a reminder with date and time. Get alerts from today, 1 week before, or 1 day before.",
      reminderExample:
        'E.g. "Remind me to call the dentist on Tuesday at 2:00 PM, remind me one day before."',
      repeatTitle: "Frequency",
      repeatBody: "Set a daily, weekly, monthly, or yearly alert at roughly the same time.",
      repeatExample: 'E.g. "Remind me every Monday to buy bread at 9:00 AM."',
      noteTitle: "Note",
      noteBody: "Save free text without a date.",
      noteExample: 'E.g. "Note: there is a new market on X street."',
      listUpdateTitle: "Update existing list",
      listUpdateBody: "Add items to an existing list by name.",
      listUpdateExample: 'E.g. "Add book, pencil and eraser to the school list."',
      listCreateTitle: "Create new list",
      listCreateBody: "Create a new list and separate items by commas or line breaks.",
      listCreateExample: 'E.g. "Create the shopping list with bread, milk and sugar."',
      openRemi: "Open Remi",
      close: "Close",
    },

    iosDict: {
      helpTitle: "Enable Dictation on iPhone",
      helpBody:
        "On iOS it's usually: Settings → General → Keyboard → Enable Dictation.",
      helpStepsTitle: "Quick steps",
      step1: "Open Settings",
      step2: "General → Keyboard",
      step3: "Enable \"Enable Dictation\"",
      ok: "Got it",
      hideForever: "Don't show again",
    },
  },

  inbox: {
    title: "Inbox",
    tasksTab: "Reminders",
    ideasTab: "Ideas",
    allTab: "All",
    statusDone: "Done",
    statusActive: "Active",
    statusArchived: "Archived",
    subtitle: "Everything you've cleared from your head shows up here.",
    itemsCount: "{{count}} items",
    loading: "Loading inbox…",
    emptyTitle: "Inbox is empty",
    emptySubtitle: "Add new tasks or ideas from the Today screen.",

    itemTaskPrefix: "Task · ",
    itemIdeaPrefix: "Idea · ",
    errorLoading: "Error loading your inbox",
    errorUpdating: "Error updating your inbox",
    sectionToday: "Today",
    sectionTomorrow: "Tomorrow",
    sectionWeek: "Week",
    sectionNoDate: "No date",
  },

  ideas: {
    title: "Ideas",
    emptyState: "Write down your ideas here to clear your mind.",
    subtitle: "All the ideas you don't want to lose are saved here.",
    loading: "Loading ideas…",
    emptyTitle: "No ideas yet",
    emptySubtitle: "Use the + button on the Today screen to save your ideas.",
    savedAt: "Saved on {{date}}",
    errorLoading: "Error loading your ideas",
    updateError: "Couldn't update the idea.",
    convertError: "Couldn't convert the idea into a reminder.",

    editLabel: "Edit idea",
    editTitle: "Turn this idea into something actionable",
    editSubtitle:
      "Improve the text or convert it into a reminder with a date.",

    fieldTitle: "Idea text",
    fieldTitlePlaceholder: "E.g. buy new shoes for the wedding",

    taskOptionsTitle: "Reminder options",
    dueDateLabel: "Due date and time (optional)",
    reminderLabel: "Reminder",

    reminder: {
      none: "No reminder",
      onDue: "Only on the due date",
      dayBeforeAndDue: "One day before and on the due date",
      dailyUntilDue: "Every day until the due date",
    },

    saveAsIdea: "Save as idea",
    convertToTask: "Convert to reminder",
    confirmConvert: "Convert to reminder now",

    footerHint:
      "Converting an idea into a reminder doesn't duplicate it: the original idea becomes a reminder.",
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
    logout: "Sign out",
    toastSaved: "Profile updated successfully.",
    toastError: "Couldn't save the profile.",

    devicePushTitle: "Notifications on this device",
    devicePushUnsupportedHint:
      "This browser doesn't support push notifications. Try Safari on iPhone or Chrome/Edge on Android/PC.",
    devicePushChecking: "Checking…",
    devicePushUnsupportedLine: "This device/browser does not support push.",
    devicePushDeniedLine:
      "Permission denied on this device (browser settings).",
    devicePushNeedsPermissionLine:
      "You haven't granted permission on this device yet.",
    devicePushNeedsRegisterLine: "Permission OK, but you still need to enable it here.",
    devicePushPaused: "Paused",
    devicePushPausedLine: "Paused on this device",
    devicePushActiveLine: "Active on this device ✅",
    devicePushToggleAria:
      "Enable or pause notifications on this device",
    pushDeviceEnabled: "Notifications enabled on this device",

    back: "Profile",
    memberSince: "Member since {{date}}",

    sectionUserTitle: "User information",
    sectionUserDescription: "Edit your basic details and how REMI is displayed.",

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
      "Share REMI or sign out on this device.",

    feedbackButton: "Leave feedback",
    shareButton: "Share app",
    logoutButton: "Sign out",

    shareText:
      "I'm using Remi to get tasks and ideas out of my head, and my mind feels so much clearer and less stressed.\nI definitely recommend trying it, it really helps. Here's the link. 🙂",
    shareCopied: "REMI link copied to clipboard",
    avatarSelectorOpen: "Choose avatar",
    avatarUploadPick: "Choose image",
    avatarSelectorTitle: "Select avatar",
    avatarSelectorDescription: "Choose an avatar and its background color.",
    avatarSelectorControls: "Choose your avatar and background color",
    avatarSelectorBg: "Background color",
    avatarSelectorAvatars: "Avatars",
    avatarSelectorSave: "Save avatar",
    avatarSelectorSaving: "Saving...",
    avatarSelectorSaved: "Avatar saved.",
    avatarSelectorMissing: "Selected avatar was not found.",

    defaultUserName: "User",

    avatarTooBig: "The image must be under 5 MB.",
    avatarUploadError: "Couldn't upload the image. Please try again.",
    passwordTooShort: "The new password must be at least 6 characters.",
    authUpdateError: "Couldn't update email/password.",
    updateSuccess: "Profile updated successfully.",
    updateError: "Couldn't save changes.",
    logoutError: "Couldn't sign out. Please try again.",
  },

  lists: {
    title: "Lists",
    subtitle: "Create lists and share them to coordinate with others.",
    loading: "Loading lists...",
    empty: "You don't have any lists yet.",
    selectOne: "Select a list to see its items.",
    newPlaceholder: "New list (ex: Buy)",
    create: "Create",
    created: "List created.",
    updated: "List updated.",
    createError: "Could not create the list.",
    confirmDelete: "Delete this list?",
    confirmDeleteItem: "Are you sure you want to delete this item?",
    delete: "Delete",
    deleted: "List deleted.",
    deleteError: "Could not delete the list.",
    onlyOwnerDelete: "Only the owner can delete this list.",
    share: "Share",
    linkCopied: "Link copied.",
    shareError: "Could not create share link.",
    inviteAccepted: "Shared list added.",
    inviteError: "Could not accept invite.",
    notificationsOn: "Notifications enabled for this list.",
    notificationsOff: "Notifications disabled for this list.",
    notificationsOnShort: "Noti ON",
    notificationsOffShort: "Noti OFF",
    notificationsError: "Could not update notifications.",
    newItemPlaceholder: "Add item...",
    itemsPlaceholder: 'Create or update existing lists:\nEx: "Add bread, milk and sugar to the shopping list".',
    itemsEmpty: "No items yet.",
    itemCreateError: "Could not create item.",
    itemUpdateError: "Could not update item.",
    itemDeleteError: "Could not delete item.",
    itemsLoadError: "Could not load items.",
    loadError: "Could not load lists.",
    renameError: "Could not rename list.",
    renamePrompt: "New list name:",
    duplicateConfirm: "Duplicate item. Add anyway?",
    duplicateConfirmDetailed:
      'Duplicate item. "{{item}}" already exists in list "{{list}}". Add anyway?',
    iconPrompt: "Choose an emoji for this list (leave empty to remove):",
    iconAction: "Change icon",
    iconUpdated: "Icon updated.",
    iconUpdateError: "Could not update icon.",
    doneOfTotal: "Completed",
    opened: "Pending",
    completed: "Completed",
    learnedTo: "Completed",
    roleOwner: "Owner",
    roleEditor: "Editor",
    roleViewer: "Viewer",
    assignMe: "Assign to me",
    assignedMe: "Assigned to me",
    assignedOther: "Assigned",
    assignError: "Could not update assignment.",
    searchPlaceholder: "Search list...",
    searchEmpty: "No lists found.",
    reuse: "Reuse",
    reused: "List reused.",
    reuseError: "Could not reuse the list.",
  },

  feedback: {
    title: "Your opinion about Remi",
    q1: "Is Remi helping you?",
    q3: "What do you like the most?",
    q2: "What would you improve?",
    placeholderLike: "Write what you like most...",
    placeholder: "Write a short suggestion...",
    send: "Send feedback",
    later: "Not now",
    thanks: "Thanks for sharing your opinion about Remi.",
    low: "Not at all",
    high: "A lot",
  },

  notifications: {
    dailyReminderTitle: "Your mind is full",
    dailyReminderBody: "Check your tasks for today in REMI and clear your head.",
    dueTodayTitle: "You have tasks due today",
    dueTodayBody: "Open REMI to see what's pending.",
  },

  landing: {
    hero: {
      badge: "Your external memory",
      shareButtonLabel: "Share Remi",
      shareText:
        "I'm using Remi to organize everything I used to keep in my head, and I've greatly reduced stress and mental load. Here's the link:",
      shareCopied: "Remi link copied to clipboard.",
      title: {
        part1: "Remember everything without",
        highlighted: "mental stress",
      },
      description:
        "Get tasks, ideas, and reminders out of your head so you can focus on what really matters. Remi makes sure you remember what you need, right when you need it.",
      ctaPrimary: "Start now",
      ctaSecondary: "See how it works",
      userStatsHighlight: "People who use Remi",
      userStats:
        "say they feel lighter and with much less mental load.",
    },

    features: {
      title: {
        part1: "Designed to",
        highlighted: "free your mind",
      },
      subtitle:
        "Remi combines smart reminders, time management, and fast capture so your head stops being your to-do list.",

      items: {
        reminders: {
          title: "Personalized reminders",
          description:
            "Set the frequency you need: daily, weekly, monthly, or custom. Remi adapts to your rhythm. Only what matters, at the right time.",
        },
        temporal: {
          title: "Time control",
          description:
            "Define until when you want to be reminded of each thing. No endless reminders. Your future self will thank you.",
        },
        mentalLoad: {
          title: "Mental load under control",
          description:
            "Get everything out of your head: big or small tasks, errands, ideas, things you don't want to forget. Remi stores them and brings them back exactly when you need them.",
        },

        quickCapture: {
          title: "Ultra-fast capture",
          description:
            "Write an idea or task in the moment—no complex menus. Open, type, done. Remi organizes the rest.",
        },
      },
    },

    mentalLoad: {
      cardTitle: "Your mind status today",
      cardDate: "Today",
      cardStatus: "Clearer mind",

      example1: "Important bills noted",
      example1Freq: "Every month",
      example2: "Birthday gifts planned",
      example2Freq: "Throughout the year",
      example3: "Daily tasks organized",
      example3Freq: "Every morning",
      badge: "Your external memory",
      headline: "We're doing great today",
      subheadline:
        "Today we cleared quite a bit from your mind: you have 5 tasks organized and 3 of them are already done.",
      clearMindLabel: "Clear mind",
      clearMindHelper:
        "Every thing you save in Remi is one less thing your mind has to carry.",

      title: {
        part1: "Your mind is for creating,",
        highlighted: "Remi is for remembering",
      },
      description:
        "We use our mind as a to-do list, calendar, home management, and storage for pending things. That creates stress and constant mental load. Remi helps you offload that load easily and quickly into an external, clear, reliable place so you can focus on what truly matters.",
      step1Title: "Get it all out of your head",
      step1Description:
        "Whenever something comes to mind—a task, an idea, an errand—you write it in Remi. Don't overthink it: just write it and keep doing what you were doing.",

      step2Title: "Let Remi organize it with you",
      step2Description:
        "If it's an idea, save it with one tap and later you can edit it or convert it into a reminder.\nIf it's a reminder, pick a due date and how you want Remi to remind you, fast and without having to touch it again.",

      step3Title: "Get a clear head again",
      step3Description:
        "Your mind stops being storage and becomes what it should be: space to think, create, and be present—without fear of forgetting something important.",
    },

    cta: {
      badge: "Start with something small today",
      title: {
        part1: "Build, little by little, a more",
        highlighted: "light and calm mind",
      },
      description:
        "You don't need to change your whole life. Just get out of your head what you used to carry inside. Remi doesn't force you to do anything at a specific time: Remi reminds you in time so you can decide when it's best for you—without forgetting.",

      ctaPrimary: "Try Remi now",
      ctaSecondary: "Keep reading first",

      feature1: "Completely free",
      feature2: "Designed for all kinds of people and minds",
      feature3: "Works equally well for reminders and notes",
    },

    footer: {
      description:
        "Remi is your trusted external memory for all those things you don't want to forget—but also don't want to carry in your head all day.",

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

    extra: {
      hero: {
        kicker: "Tell Remi what you don't want to forget.",
        description:
          "Write a sentence. Remi interprets the text and creates reminders or notes. You can also create lists and share them in real time.",
        bullets: {
          a: "Just write: zero formatting, zero friction",
          b: "Remi interprets: dates, times, reminders, and repeat",
          c: "Reminders ready so it doesn't depend on your memory",
          d: "Create lists and share them instantly",
        },
      },

      trustRow: { a: "Fast", b: "Simple", c: "Made to clear your mind" },

      problem: {
        title: "Your brain is not a to-do list.",
        text:
          "Ideas, errands, to-dos… when you carry it all in your head, you pay with stress and forgetfulness.",
        micro: "Remi is your brain dump: write it once and keep going with your day.",
      },

      how: {
        title: "How it works",
        subtitle: "You write. Remi understands. And it reminds you.",
        step1Title: "1) Write what you don't want to forget",
        step1Text:
          "A sentence, just as it comes out. No menus, no thinking about fields.",
        step2Title: "2) Remi interprets it",
        step2Text:
          "It detects date and time, whether it's a habit (repeat), and adjusts the reminder.",
        step3Title: "3) It brings it back when it's time",
        step3Text:
          "Remi puts it in front of you at the right moment so you don't have to carry it.",
      },

      interpret: {
        title: "Text → automatic reminder",
        text:
          "You don't need to configure a thousand things. Remi understands natural language and turns it into a useful reminder.",
        chips: ["Date and time", "Habit / repeat", "Reminder mode"],
        exampleLabel: "Examples",
        examples: [
          "\"Tomorrow at 18:00: call the insurance\"",
          "\"Every Monday: gym\"",
          "\"On the 5th: pay rent\"",
        ],
        helperLine: "Write a sentence and you're done",
      },

      shareFeature: {
        badge: "New",
        title: "Share reminders and notes to reduce mental load",
        text:
          "Help other people free their mind: share a reminder or a note as a link. They can add it and stop carrying \"I can't forget this…\".",
        points: [
          "Useful for family, partners, and teams",
          "Share reminders, errands, and notes in seconds",
          "Perfect to help when someone is stressed or overloaded",
        ],
        exampleLabel: "Example",
        example:
          "\"Add to Remi: 'Tomorrow 18:00 call the insurance' → you receive a link and add it in one tap.\"",
        helperLine: "Quick help, no explanation",
        ctaTry: "Try Remi",
        tag: "Share",
      },

      everywhere: {
        title: "Truly multi-device",
        text:
          "Remi is available wherever you are: work, home, outside. Same access, same reminders.",
        points: [
          "Computer to capture while you work",
          "Phone / iPad / tablet to capture on the go",
          "Use it instantly in the browser or install it as an app (PWA)",
        ],
      },

      install: {
        title: "Install Remi to receive reminders",
        text:
          "To receive notifications for your reminders, install Remi now from your browser (PWA).",
        helper:
          "Enjoy it like a real app: lighter, faster, and always up to date.",
        badge: "App mode",
        bullet1: "Notifications for reminders",
        bullet2: "Home screen icon",
        bullet3: "Full screen, app-like feel",
        mini1: "Light and fast",
        mini2: "Always up to date",
        mini3: "Made for fast capture",
        ctaHint:
          "Tap \"Install now\" and follow the steps for your device.",
        device: {
          desktop: "Computer",
          phone: "Phone",
          tablet: "Tablet",
        },
        pwaCard: {
          subtitle: "Notifications and quick access",
          appLike: "Like an app, but better",
        },
      },

      social: {
        title: "Built with real feedback",
        subtitle:
          "Remi is continuously improved with user tests and comments.",
        note: "",
        testimonials: [
          {
            quote:
              "\"Thanks to my coworker for recommending Remi. Every day I use it, I feel less mental load and I forget fewer things.\"",
            author: "Sarah",
          },
          {
            quote: "\"It's like having a personal memory assistant. I love it!\"",
            author: "Christian",
          },
          {
            quote:
              "\"Very easy to use and very useful—especially the option to share reminders or ideas.\"",
            author: "Erika",
          },
        ],
      },

      modal: {
        installLabel: "Install now",
        title: "Install Remi",
        description:
          "Install Remi from your browser to receive notifications for your reminders and use it like an app.",
        alreadyInstalled:
          "Remi is already installed on this device. Your reminders can arrive as notifications.",
        promptText:
          "Install it to receive notifications for your reminders and get quick access from the icon.",
        sectionIOS: "On iPhone / iPad (Safari)",
        sectionDesktop: "On computer (Chrome/Edge)",
        installRequired:
          "Installation is required to receive notifications for your reminders.",
        iosSteps: [
          "Open the share menu (share icon in Safari).",
          "Tap \"Add to Home Screen\".",
          "Confirm \"Add\".",
        ],
        desktopSteps: [
          "In Chrome/Edge, look for the \"Install\" icon in the address bar or in the menu.",
          "Tap \"Install\".",
        ],
        close: "Close",
        openInBrowser: "Open in browser",
        directInstallHint:
          "If your browser supports direct installation, an install button will appear in this modal.",
      },

      iosBanner: {
        title: "Install Remi on your iPhone — FREE",
        step1: "Tap the Share button",
        step2: "Choose \"Add to Home Screen\" and confirm.",
        closeAria: "Close",
      },
    },
  },
} as const;




