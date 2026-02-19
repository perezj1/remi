// src/locales/de.ts
export const de = {
  repeat: {
    label: "Wiederholung",
    help:
      "Mach diese Aufgabe zu einer Gewohnheit, an die Remi dich immer zur gewählten Uhrzeit erinnert.",

    options: {
      daily: "Täglich",
      weekly: "Wöchentlich",
      monthly: "Monatlich",
      yearly: "Jährlich",
    },
  },

  shareInvite: {
    share: "Teilen",
    sharedOk: "Fertig. Link kopiert/geteilt.",
    sharedError: "Teilen nicht möglich. Bitte versuche es erneut.",
    message: "{{name}} möchte, dass du dir Folgendes merkst: {{text}}",

    pageTitle: "Zu Remi hinzufügen",
    pageSubtitle: "Speichere diese Erinnerung in deinem Konto.",
    loading: "Wird geladen…",
    invalidLinkTitle: "Ungültiger Link",
    goHome: "Zur Startseite",
    someone: "Jemand",

    due: "Datum",
    acceptCta: "Zu Remi hinzufügen",
    accepting: "Wird hinzugefügt…",
    acceptError: "Hinzufügen nicht möglich. Bitte versuche es erneut.",
    alreadyAccepted: "Dieser Link wurde bereits verwendet.",
    expired: "Dieser Link ist abgelaufen.",
    rejected: "Dieser Link wurde abgelehnt.",
    openRemi: "Remi öffnen",
    missingToken: "Link-Token fehlt.",
    loadError: "Link konnte nicht geladen werden.",
    loginHint:
      "Wenn du nicht angemeldet bist, bitten wir dich, dich einzuloggen oder ein Konto zu erstellen, um es hinzufügen zu können.",
    sentIndicator: "Aufgabe geteilt",
    messageLine1: "{{name}} möchte, dass du dir Folgendes merkst:",
  },

  mentalDump: {
    whyLabel: "Warum:",
    detectedLabel: "Erkannt:",
    detectedManual: "Manuell",
    detectedDash: "—",
    habitDetectedLabel: "Gewohnheit erkannt:",
    detectedDefault: "Standard",
    habitLabel: "Wiederholung",
    habitOn: "An",
    habitOff: "Aus",

    detectedReminder: {
      DAY_BEFORE_AND_DUE:
        "\"{word}\" erkannt → markiert als: am Vortag + am Fälligkeitstag.",
      DAILY_UNTIL_DUE:
        "\"{word}\" erkannt → markiert als: täglich bis zum Fälligkeitsdatum.",
      WEEK_BEFORE_AND_DUE:
        "\"{word}\" erkannt → markiert als: 1 Woche vorher + am Fälligkeitstag.",
    },

    why: {
      verbTask: "\"{word}\" erkannt → als Aufgabe markiert.",
      prefixIdea: "\"{word}\" erkannt → als Idee markiert.",
      projectIdea: "Klingt nach Idee/Projekt → als Idee markiert.",
      defaultTask: "Keinen klaren Hinweis gefunden → als Aufgabe markiert.",
      defaultIdea: "Keinen klaren Hinweis gefunden → als Idee markiert.",
      manualTask: "Du hast es als Aufgabe markiert.",
      manualIdea: "Du hast es als Idee markiert.",
    },

    dateLabel: "Datum",
    timeLabel: "Uhrzeit",
    reminderLabel: "Erinnerung",
    reminderShortLabel: "Hinweis:",
    reminderOff: "Aus",
    reminderDailyUntilDue: "Täglich",
    reminderDayBeforeAndDue: "1 Tag vorher",
    reminderWeekBeforeAndDue: "1 Woche vorher",

    buttonLabel: "Kopf frei machen",

    title: "Intensiver Gedanken-Download",
    description:
      "Nimm dir 2–3 Minuten, um deinen Kopf zu leeren. Schreib alles auf, was du nicht vergessen willst: Aufgaben, Ideen, offene Dinge. Du musst nichts sortieren: Remi macht daraus Erinnerungen für dich.",

    inputLabel:
      "Schreibe kurze Sätze, getrennt durch Zeilenumbrüche oder Kommas.",
    placeholder:
      "Beispiele:\n" +
      "Flurlampe morgen um 10 wechseln\n" +
      "Mama am Sonntag anrufen\n" +
      "Jeden Montag um 14:00 Remi benutzen\n" +
      "Idee: Reise nach Italien im Frühling",

    // Textos del resumen inicial
    summaryNone: "Es wurde noch kein Satz erkannt.",
    summaryPrefix: "Es wurden",
    summarySuffix: "mögliche Erinnerungen in deinem Text erkannt.",

    // Botones estados
    submitSaving: "Speichern...",
    submitToPreview: "Erinnerungen prüfen",
    submitConfirm: "In Remi speichern",

    // Vista previa
    previewTitle: "Prüfe deinen Gedanken-Download",
    previewDescription:
      "Aktiviere oder deaktiviere die Zeilen, die du speichern möchtest, passe die Texte an und bestätige, um Aufgaben und Ideen in Remi zu erstellen.",
    previewNoneSelected: "Es ist kein Element ausgewählt.",
    previewTaskLabel: "Aufgabe",
    previewIdeaLabel: "Idee",
    previewInclude: "Speichern",
    previewBackToEdit: "Zurück zum Bearbeiten des Textes",

    // Hábitos
    habitNone: "Keine Wiederholung",
    habitDaily: "Tägliche Wiederholung",
    habitWeekly: "Wöchentliche Wiederholung",
    habitMonthly: "Monatliche Wiederholung",
    habitYearly: "Jährliche Wiederholung",

    hints: {
      0: "Du schreibst nur – Remi ordnet alles und plant es für dich, damit es dich zur richtigen Zeit erinnert.",
      1: "Füge Text aus WhatsApp, einer Mail oder einer Notiz ein. Remi macht daraus eine Erinnerung.",
      2: "Aufgaben, Ideen, Erledigungen… alles passt rein. Remi ordnet es und erinnert dich, wenn es soweit ist.",
      3: "Du brauchst kein perfektes Format. Schreib so, wie du sprichst.",
      4: "Hat dir jemand etwas Wichtiges gesagt? Kopieren & einfügen. Remi speichert es für dich.",
      5: "Schreibe Daten oder Uhrzeiten (z. B. \"Dienstag 18:00, 17. Januar um 15…\"). Remi erkennt sie.",
      6: "Schreibe \"jeden Tag / jede Woche usw.\", wenn es eine wiederkehrende Gewohnheit ist.",
      7: "Eine Minute hier = ein entspannterer Tag und weniger vergessene Dinge.",
      8: "Kurzer Tipp: Schreib \"Idee\", um Notizen ohne Erinnerungen zu speichern.",
    },
  },

  common: {
    appName: "REMI",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    close: "Schliessen",
    confirm: "Bestätigen",
    loading: "Wird geladen...",
    speak: "Sprechen",
    paste: "Einfügen",
  },

  index: {
    clearMind: "Klarer Kopf",
    reminders: "Erinnerungen",
  },

  nav: {
    today: "Heute",
    inbox: "Posteingang",
    ideas: "Ideen",
    profile: "Profil",
  },

  bottomNav: {
    today: "Heute",
    inbox: "Posteingang",
    status: "Status",
    add: "Neu",
    holdToTalk: "Gedrückt halten",
    listening: "Höre zu…",
    dictationNotSupported: "Diktat nicht unterstützt",
    tasks: "Aufgaben",
    ideas: "Ideen",
  },

  installPrompt: {
    iosTitle: "Installiere Remi auf deinem iPhone – GRATIS",
    iosStep1BeforeShare: "1. Tippe auf die Taste",
    iosShareLabel: "Teilen",
    iosStep1AfterShare: ".",
    iosStep2BeforeAction: "2. Wähle",
    iosAddToHome: "Zum Home-Bildschirm",
    iosStep2AfterAction: "und bestätige.",
    defaultTitle: "Remi installieren",
    defaultDescription: "Füge Remi zu deinen Apps hinzu — GRATIS!",
    buttonInstall: "Installieren",
    close: "Schliessen",
  },

  status: {
    back: "Zurück",
    headerTitle: "Remi-Status",
    headerSubtitle:
      "Heute haben wir geholfen, deinen Kopf ein wenig leichter zu machen.",

    helperLabel: "Dein externes Gedächtnis",
    helperFallback:
      "Ich bin hier, um deine Aufgaben, Ideen und Erinnerungen zu speichern, damit dein Kopf nicht alles tragen muss.",

    mindClearLabel: "Klarer Kopf",
    mindClearDescription:
      "Alles, was du in Remi speicherst, ist eine Sache weniger, die dein Kopf tragen muss.",
    relaxMindButton: "Geist entspannen",
    relaxSound: "Ton",
    relaxSoundOff: "Ton aus",
    relaxPops: "Pops",
    relaxModeTitle: "Bubble Pop Zen",
    relaxModeCalm: "Ruhe",
    relaxModeEnergy: "Energie",
    relaxDoneTitle: "Reset geschafft",
    relaxDoneSubtitle: "Lass Spannung mit einfachen Taps los. Ohne nachzudenken.",
    relaxHoldToInhale: "Halten zum Einatmen",
    relaxReleaseToExhale: "Loslassen zum Ausatmen",
    relaxAverage: "Durchschnitt",
    relaxInhaleShort: "Ein",
    relaxExhaleShort: "Aus",
    relaxCycles: "Zyklen",
    relaxCapture: "Erfassen",
    relaxViewCanvas: "Leinwand ansehen",
    relaxTapToReturn: "Tippen zum Zurückkehren",
    relaxModalTitle: "Atme tief ein",
    relaxModalSubtitle: "Folge dem Rhythmus für 30 Sekunden.",
    relaxInhale: "Langsam einatmen",
    relaxExhale: "Langsam ausatmen",
    relaxDone: "Gut gemacht",
    relaxCountdownHint: "Bleib hier, bis der Timer endet",
    relaxRepeat: "Wiederholen",
    relaxBetter: "Mir geht es besser",

    todaySectionTitle: "Was du geschafft hast",
    todaySectionSubtitle: "Zusammenfassung, wie wir deinen Kopf entlasten.",
    todayTasksLabel: "Heute erledigt",
    todayTasksDescription:
      "{{todayDone}}/{{todayTotal}} heute fällige Aufgaben erledigt.",

    streakSectionTitle: "Unsere Serie",
    streakValue: "{{streakDays}} Tage",
    streakDescription:
      "Seit {{streakDays}} Tagen muss dein Kopf sich nicht mehr alles allein merken.",

    memoryDelegatedTitle: "Delegiertes Gedächtnis",
    memoryDelegatedValue: "{{tasks}} Aufgaben · {{ideas}} Ideen",
    memoryDelegatedDescription:
      "Gerade kümmert sich Remi um {{tasks}} Aufgaben und {{ideas}} Ideen.",

    weekSectionTitle: "Unsere Woche",
    weekSectionSubtitle:
      "Jeder Tag mit Remi bedeutet ein bisschen weniger Last im Kopf.",
    weekActiveLabel: "Aktive Tage diese Woche",
    mentalLoadTitle: "Balance der mentalen Last",
    mentalLoadSubtitle: "Erfasst vs gel\u00F6st in den letzten 7 Tagen",
    mentalCapturedTooltip: "Erfasst: {{count}}",
    mentalResolvedTooltip: "Gel\u00F6st: {{count}}",
    memoryCaptured: "Erfasst",
    memoryResolved: "Gel\u00F6st",
    memoryDistributionTitle: "Ged\u00E4chtnisverteilung",
    memoryDistributionSubtitle: "Welche Art von Last delegierst du an Remi",
    memoryTasksLabel: "Erinnerungen",
    hourMapTitle: "Stundenkarte",
    hourMapSubtitle: "Wann du mehr mentale Last erfasst (letzte 30 Tage)",
    pieTitle: "Allgemeiner Status",
    pieSubtitle: "Erfasst, Ideen, geschlossen und uberfallig",
    pieCaptured: "Erfasst",
    pieIdeas: "Ideen",
    pieClosed: "Geschlossen",
    pieOverdue: "Uberfallig",
    usersTitle: "Immer mehr Menschen entlasten ihren Kopf",
    usersSubtitle: "Gesamtzahl der Remi-Nutzer",
    usersUnavailable: "Nicht verfugbar",

    loading: "Dein Remi-Überblick wird aktualisiert…",

    // Moods
    moodTitleCelebrate: "Unglaubliches Team!",
    moodTitleHappy: "Heute läuft's richtig gut",
    moodTitleCalm: "Alles unter Kontrolle",
    moodTitleWaiting: "Ich bin bereit",
    moodTitleConcerned: "Schritt für Schritt",
    moodTitleDefault: "Wir schaffen das zusammen",

    moodSubtitleCelebrate:
      "In letzter Zeit entlasten wir deinen Kopf richtig gut. Wir haben heute {{cleared}} Aufgaben ausgelagert und Remi hat insgesamt {{totalItems}} Dinge gespeichert – Aufgaben und Ideen zusammen.",
    moodSubtitleHappy:
      "Heute haben wir deinen Kopf spürbar entlastet: {{todayTotal}} Aufgaben organisiert und {{todayDone}} davon sind bereits erledigt.",
    moodSubtitleCalm:
      "Wir kommen ruhig voran. Es sind {{todayTotal}} Aufgaben für heute gespeichert, und Remi merkt sie sich für dich.",
    moodSubtitleWaiting:
      "Heute ist dein Kopf leicht – aber wir können noch etwas in Remi abladen, damit du es nicht selbst im Kopf behalten musst.",
    moodSubtitleConcerned:
      "Es sieht nach einem langen Tag aus. Wir können mit einer kleinen Aufgabe starten und deinem Kopf noch etwas Luft geben.",
    moodSubtitleDefault:
      "Alles, was du in Remi speicherst, ist eine Sache weniger, die dein Kopf tragen muss.",
  },

  capture: {
    modalPlaceholder: "Schreib hier alles aus deinem Kopf…",

    chips: {
      backHint: "Zurück zu Shortcuts",
      title: "Smarte Shortcuts",
      title2: "Datum / Wiederholung",
      title3: "Uhrzeit",
      title4: "Erinnerung",
      back: "Shortcuts",
    },

    chip: {
      buyWord: "Kaufen",
      callWord: "Anrufen",
      payWord: "Bezahlen",
      birthdayWord: "Geburtstag",
      apptWord: "Termin",
      ideaWord: "Idee:",

      buy: "Kaufen",
      call: "Anrufen",
      pay: "Bezahlen",
      birthday: "Geburtstag",
      appt: "Termin",
      idea: "Idee",

      schedule: {
        el: "am",
        cada: "jeden",
        antesDel: "vor dem",
        hoy: "heute",
        manana: "morgen",

        on: "am",
        every: "jeden",
        before: "vor",
        today: "heute",
        tomorrow: "morgen",
        am: "um",
        jeden: "jeden",
        vor: "vor",
        heute: "heute",
        morgen: "morgen",
      },

      time: {
        prefix: "um",
        t0900: "09:00",
        t1800: "18:00",
      },

      reminder: {
        dailyLabel: "Jeden Tag",
        dailyInsert: "jeden Tag erinnern",
        standardLabel: "Standard",
        dayBeforeLabel: "am Vortag",
        noneLabel: "Keine Erinnerungen",

        standardInsert: "erinnern",
        dayBeforeInsert: "am Vortag erinnern",
        noneInsert: "keine Erinnerungen",
      },
    },

    tips: {
      0: "Tipp: Sag oder schreib \"Idee\", um Notizen ohne Erinnerung zu erstellen",
      1: "Tipp: Du kannst Text aus anderen Apps einfügen",
      2: "Tipp: Format ist egal – schreib so, wie du sprichst",
      3: "Tipp: Halte das Mikrofon gedrückt, um zu diktieren",
    },

    paste: {
      title: "Zuletzt Kopiertes einfügen?",
      sub: "Tippe auf EINFÜGEN, um es hier einzusetzen.",
      button: "EINFÜGEN",
      pasting: "Wird eingefügt…",
      toastUnavailable:
        "Einfügen ist hier nicht verfügbar. Gedrückt halten und manuell einfügen.",
      toastEmpty: "Zwischenablage ist leer (oder ich kann sie nicht lesen).",
      toastDenied:
        "Ich kann die Zwischenablage nicht lesen. Gedrückt halten und manuell einfügen.",
    },

    toast: {
      micDenied: "Mikrofonberechtigung verweigert.",
      noSpeech: "Keine Stimme erkannt. Bitte erneut versuchen.",
      dictationError: "Diktierfehler.",
      dictationStartError: "Diktieren konnte nicht gestartet werden.",
      pasteUnavailable: "Ich kann hier nicht einfügen (Zwischenablage nicht verfügbar).",
      clipboardEmpty: "Kein Text in der Zwischenablage.",
      pasteError:
        "Kein Zugriff auf die Zwischenablage. Gedrückt halten und einfügen.",
      writeSomething: "Schreib zuerst etwas.",

      pickDateFirst: "Wähle zuerst ein Datum.",
    },

    textareaPlaceholderIOS:
      "iPhone/iPad: Nutze das Mikrofon der Tastatur zum Diktieren.\n" +
      "Wenn es nicht erscheint: Einstellungen > Allgemein > Tastatur > Diktat aktivieren.\n" +
      "Wenn \"nicht verfügbar\": Einstellungen > Datenschutz & Sicherheit > Mikrofon (Browser aktivieren).",

    repeatOn: "Aktiviert",
    repeatOff: "Deaktiviert",
    remindersDisabledByHabit:
      "Wiederholungen erstellen eigene Erinnerungen basierend auf dem gewählten Datum und der Uhrzeit.",
    timeHour: "Stunden",
    timeMinute: "Minuten",
    dateTimeLabel: "Datum und Uhrzeit",
    dateTimeNoneShort: "Ohne Datum/Uhrzeit",
    timeUnset: "Keine Uhrzeit",
    placeholder: "Tippen zum Schreiben",

    title: "Kopf frei machen",
    subtitle: "Sprich, schreib oder füge Text ein. Remi kümmert sich.",
    examplesTitle: "Beispiele:",
    exampleVoice: "🎤 \"Mama am Sonntag anrufen\"",
    exampleVoiceIOS: "🎤 \"Nutze das Tastatur-Mikro zum Diktieren\"",
    examplePaste: "📋 \"Jeden Dienstag um 18 Uhr treffen\"",
    exampleIdea: "💡 Idee: Italienreise im Frühling",
    holdToTalk: "Gedrückt halten zum Sprechen",
    listening: "Höre zu…",
    iosKeyboardMicHint: "Usa el micrófono del teclado para hablar.",
    speakHold: "Gedrückt halten zum Sprechen",

    textareaPlaceholder: "Beispiele:",

    ideaButton: "Idee",
    taskButton: "Aufgabe",

    dueLabel: "Fälligkeitsdatum",
    dueToday: "Heute",
    dueTomorrow: "Morgen",
    dueWeek: "1 Woche",
    dueNone: "Kein Datum",
    dueHint: "Du kannst Datum und Uhrzeit manuell anpassen.",
    duePlaceholder: "Datum und Uhrzeit wählen",

    remindersLabel: "Erinnerungen",
    remindersNone: "Keine Erinnerungen",
    remindersOnDue: "Nur am Fälligkeitstag",
    remindersDayBeforeAndDue: "Am Vortag und am Fälligkeitstag",
    remindersDailyUntilDue: "Täglich bis zum Fälligkeitsdatum",
    reminderWeekBeforeAndDue: "Eine Woche vorher bis zum Tag",

    back: "Zurück",
    saveTask: "Aufgabe speichern",

    toastTaskSaved: "Aufgabe erfolgreich gespeichert",
    toastTaskError: "Fehler beim Erstellen der Aufgabe",
    toastIdeaSaved: "Idee erfolgreich gespeichert",
    toastIdeaError: "Fehler beim Erstellen der Idee",
  },

  pill: {
    type: {
      label: "Typ",
      task: "Erinnerung",
      idea: "Idee",
    },

    more: "Details",
    less: "Weniger",
    detected: "Erkannt:",
    date: "Datum",
    time: "Uhrzeit",
    reminder: "Erinnerung",
    habit: "Wiederholung",
    reminderNone: "Keine Erinnerung",
    repeatNone: "Keine Wiederholung",

    on: "An",
    off: "Aus",

    remDaily: "Täglich",
    remDayBefore: "1 Tag vorher",
    remWeekBefore: "1 Woche vorher",

    habitDaily: "Täglich",
    habitWeekly: "Wöchentlich",
    habitMonthly: "Monatlich",
    habitYearly: "Jährlich",
  },

  tasks: {
    weekdayLabels: "M|D|M|D|F|S|S",

    editLabel: "Bearbeiten",
    editTitle: "Aufgabe bearbeiten",
    editSubtitle:
      "Ändere den Text, Datum und Uhrzeit, Erinnerungen und die Wiederholung.",

    fieldTitle: "Aufgabe",
    fieldTitlePlaceholder: "Schreibe deine Aufgabe...",

    optionsTitle: "Optionen",

    dueDateLabel: "Datum und Uhrzeit",
    clearDueDate: "Entfernen",

    reminderLabel: "Erinnerungen",
    reminder: {
      none: "Keine Erinnerungen",
      onDue: "Nur am Fälligkeitstag",
      dayBeforeAndDue: "Am Vortag und am Fälligkeitstag",
      dailyUntilDue: "Täglich bis zum Fälligkeitsdatum",
      weekBeforeAndDue: "Täglich (1 Woche vorher)",
    },

    save: "Speichern",
    footerHint: "Du kannst das jederzeit bearbeiten.",
    updateError: "Fehler beim Aktualisieren der Aufgabe",
  },

  auth: {
    titleLogin: "Bei REMI anmelden",
    titleRegister: "Konto bei REMI erstellen",
    subtitleAuth2: "From MIND FULL to MINDFUL",
    email: "E-Mail",
    password: "Passwort",
    login: "Anmelden",
    register: "Registrieren",
    logout: "Abmelden",

    loginTitle: "Willkommen zurück!",
    registerTitle: "Starte deine Reise!",
    loginSubtitle: "Mach jeden Tag weiter Fortschritte mit REMI",
    registerSubtitle: "Erstelle dein Konto und erreiche deine Ziele",
    emailLabel: "E-Mail",
    emailPlaceholder: "du@email.com",
    passwordLabel: "Passwort",
    passwordPlaceholder: "••••••••",
    submitLogin: "Anmelden",
    submitRegister: "Konto erstellen",
    toggleToRegister: "Noch kein Konto? Registrieren",
    toggleToLogin: "Schon ein Konto? Anmelden",

    errorInvalidCredentials:
      "Falsche Zugangsdaten. Prüfe deine E-Mail und dein Passwort.",
    errorUserAlreadyRegistered:
      "Diese E-Mail ist bereits registriert. Bitte melde dich an.",
    errorGeneric: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
    signUpSuccess: "Konto erstellt! Jetzt kannst du deinen Kopf entlasten.",
  },

  today: {
    greetingHello: "Hallo,",
    captureSectionTitle: "Leere deinen Kopf",
    tipsTitle: "Tipps",

    shareRemindersModal: {
      title: "Erinnerungen mit anderen teilen",
      body:
        "Sende eine Erinnerung oder Idee als Link, damit eine andere Person sie mit einem Tipp zu Remi hinzufügen kann.",
      stepsTitle: "So funktioniert's (kurz)",
      step1: "Tippe bei einer Aufgabe/Idee auf das Teilen-Icon.",
      step2: "Sende den Link per WhatsApp, Mail usw.",
      step3: "Die Person tippt auf \"Zu Remi hinzufügen\".",
      examplesTitle: "Beispiele, die super passen",
      examplesBody:
        "• \"Morgen Brot kaufen\" → an meinen Partner\n• \"Arzt am Dienstag um 14:00\" → an meine Mutter\n• \"Ladegerät mitbringen\" → an den Kollegen",
      footer:
        "Das hilft anderen, wichtige Dinge für sie (und für dich) nicht zu vergessen.",
      ok: "Verstanden",
      hideForever: "Nicht mehr anzeigen",
    },

    dueLabel: "Fällig",

    greeting: "Hallo, {{name}}",
    greetingHeader: "Hallo {{name}}!",
    greetingSubheader: "Lass uns deinen Kopf frei machen",
    tasksToday: "Du hast {{count}} Aufgaben",
    prioritize: "Priorisiere das Wichtige",
    done: "Erledigt",
    delete: "Löschen",
    actionEditTitle: "Bearbeiten",

    defaultUserName: "Benutzer",

    tabsToday: "Heute",
    tabsWeek: "Woche",
    tabsNoDate: "Ohne Datum",

    loadingTasks: "Wird geladen…",
    noUrgentTitle: "Alles im Griff",
    noUrgentSubtitle: "Tippe auf +, um deinen Kopf zu entlasten.",

    dueNoDate: "Ohne Datum",

    actionPostpone1dTitle: "Verschieben: +1 Tag zum Fälligkeitsdatum",
    actionRescheduleTitle: "Datum wahlen",
    actionDoneTitle: "Als erledigt markieren",
    postponeDayToast: "Verschoben",

    errorLoadingTasks: "Fehler beim Laden der Aufgaben",

    profileLoggedInAs: "Angemeldet als {{name}}",
    menuProfile: "Profil",
    menuShareApp: "App teilen",
    menuInstallApp: "App installieren",

    shareText:
      "Ich nutze Remi, um Aufgaben und Ideen aus dem Kopf zu bekommen – dadurch fühle ich mich viel klarer und weniger gestresst.\nIch kann's dir echt empfehlen, es hilft sehr. Hier ist der Link 🙂",
    shareCopied: "Link in die Zwischenablage kopiert",

    pushTitle: "Benachrichtigungen aktivieren",
    pushBody: "Damit du zur richtigen Zeit erinnert wirst.",
    pushEnable: "Aktivieren",
    pushEnabling: "Wird aktiviert…",
    pushLater: "Nicht jetzt",
    pushEnabledToast: "Benachrichtigungen aktiviert",
    pushErrorToast: "Push konnte nicht aktiviert werden",

    multideviceHelp: {
      title: "Mehrere Geräte: nichts vergessen – egal wo du bist",
      p1:
        "Remi ist dafür gemacht, dass du Dinge in 5 Sekunden loswerden kannst – von jedem Gerät aus.",
      stepsTitle: "So nutzt du es (kurz)",
      step1:
        "Erfasse überall: Handy, iPad/Tablet oder PC. Schreib, sprich oder füge Text ein.",
      step2:
        "Alles synchronisiert: Was du auf einem Gerät speicherst, erscheint auf den anderen.",
      step3:
        "Benachrichtigungen pro Gerät: Aktiviere sie nur dort, wo du willst (z. B. Handy AN, PC AUS).",
      examplesTitle: "Beispiele, die funktionieren",
      examplesBody:
        "• Handy AN → Erinnerungen unterwegs\n• PC AUS → keine Unterbrechungen bei der Arbeit\n• iPad AN → ruhiger Tagesabschluss",
      footer:
        "Du lädst die mentale Last im Moment ab. Remi erinnert dich, wann und wo es nötig ist.",
      ok: "Verstanden",
      hideForever: "Nicht mehr anzeigen",
    },

    tip: {
      shareReminders: {
        title: "Erinnerungen im Team",
        body: "Teile Erinnerungen oder Ideen.\nAndere fügen sie mit einem Tipp zu Remi hinzu.",
        cta: "So geht's",
      },
      shareApp: {
        title: "Remi teilen",
        body: "Lade jemanden ein, Remi mit einem Tipp zu testen.",
        cta: "Teilen",
      },

      multidevice: {
        title: "Remi immer bei dir",
        body:
          "Mach deinen Kopf frei – egal wo du bist. Alles synchronisiert, und du entscheidest, auf welchem Gerät du Benachrichtigungen willst.",
        cta: "So funktioniert's",
      },

      smartShortcuts: {
        title: "Smarte Shortcuts",
        body: "Füge Wörter mit 1 Tipp hinzu.\nZ. B. Idee / Kaufen / um 18:00.",
        cta: "Jetzt testen",
        prefill: "Kaufen: Milch, Brot, Eier",
      },
      language: {
        title: "Remi in deiner Sprache",
        body: "Ändere die Sprache von Remi jederzeit in deinem Profil.",
        cta: "Sprache ändern",
      },

      install: {
        title: "Remi als App installieren",
        body: "Schneller Zugriff, Benachrichtigungen und alles wie bei einer App.",
        cta: "Installieren",
      },

      push: {
        title: "Lass Remi dich erinnern",
        body:
          "Aktiviere Benachrichtigungen und lass die mentale Last los. Remi tippt dir zur richtigen Zeit auf die Schulter.",
        cta: "Aktivieren",
      },

      iosDict: {
        title: "Sprich mit Remi",
        body:
          "Wenn du das Mikro in der Tastatur nicht siehst, aktiviere es in den Einstellungen und diktiere schneller.",
        cta: "Anleitung",
      },

      noDate: {
        title_one: "Du hast {{count}} Aufgabe ohne Datum",
        title_other: "Du hast {{count}} Aufgaben ohne Datum",
        body: "Sollen wir sie sortieren? In 30s ist deine Liste sauber.",
        cta: "Ohne Datum ansehen",
      },

      shortcuts: {
        title: "Wörter, die Zeit sparen",
        body: "Eine Idee = starte mit \"Idee\".\nEine Aufgabe = starte mit einem Verb.",
        cta: "Beispiele ansehen",
      },

      dayClose: {
        title: "60-Sekunden-Abschluss",
        body: "Was beschäftigt dich für morgen? Lass es raus – fertig.",
        cta: "Abladen",
      },

      paste: {
        title: "Schon mal Text eingefügt?",
        body:
          "Kopiere irgendwas (WhatsApp, Mail, Notizen) und lass Remi es ordnen.",
        cta: "Jetzt einfügen",
      },

      shareToRemi: {
        title: "Speichere Dinge mit \"Teilen\"",
        body:
          "Aus WhatsApp/Mail/Notizen: Teilen → Remi.\nÖffnet sich fertig zum Ordnen.",
        cta: "Ausprobieren",
        toast:
          "Tipp: In einer anderen App auf \"Teilen\" → \"Remi\" tippen, um es direkt zu senden 🙂",
      },

      natural: {
        title: "Schreib so, wie du sprichst",
        body:
          "Z. B. \"Strom morgen um 18 Uhr bezahlen\". Remi kümmert sich – du entspannst.",
        cta: "Beispiel testen",
        prefill: "Strom morgen 18:00 bezahlen",
      },

      week: {
        title: "Schnell planen",
        body:
          "Sieh deine Woche mit einem Blick. Erst das Dringende, der Rest raus aus dem Kopf.",
        cta: "Woche ansehen",
      },

      mental: {
        title: "Mini-Pause",
        body:
          "Atme 4s ein, 6s aus. Dein Kopf muss heute nicht alles schaffen.",
        cta: "Kopf leeren",
      },

      birthday: {
        title: "Geburtstag bald?",
        body:
          "Schreib's in 5 Sekunden auf und Remi erinnert dich, wenn es soweit ist.",
        cta: "Hinzufügen",
        prefill: "Geburtstag von ___ am ___",
      },

      feedback: {
        title: "Remi verbessern",
        body: "Sag uns in 20 Sekunden, was dir hilft und was wir verbessern sollen.",
        cta: "Feedback geben",
      },

      cleanNoDate: {
        title: "✅ Keine Aufgaben ohne Datum",
        body: "Perfekt. Jetzt ist Priorisieren leicht.",
        cta: "Heute ansehen",
      },
    },

    shareToRemiModal: {
      title: "Zu Remi teilen",
      body: "Speichere Text aus jeder App über \"Teilen\".",
      iosTitle: "Auf dem iPhone (iOS)",
      iosStep1: "Öffne WhatsApp/Mail/Notizen.",
      iosStep2: "Tippe auf \"Teilen\".",
      iosStep3: "Wenn du \"Remi\" siehst, tippe darauf – es öffnet sich zum Ordnen.",
      iosStep4:
        "Wenn es nicht erscheint: nutze \"Kopieren\" und füge es in Remi ein (auf iOS hängt das manchmal von System/Version ab).",
      androidTitle: "Auf Android",
      androidStep1: "Öffne WhatsApp/Mail/Notizen.",
      androidStep2: "Markiere den Text und/oder tippe auf \"Teilen\".",
      androidStep3: "Wähle \"Remi\" – es öffnet sich mit dem Text bereit zum Ordnen.",
      androidStep4:
        "Wenn es nicht erscheint: Stelle sicher, dass Remi als App (PWA) installiert ist, und versuche es erneut.",
      ok: "Verstanden",
      hideForever: "Nicht mehr anzeigen",
    },

    shortcutsModal: {
      title: "Beispiele ansehen",
      body: "Tippe ein Beispiel an, um Remi mit diesem Text zu öffnen.",
      ex1: "Idee: Japanreise im Frühling",
      ex2: "Idee: Geschenk für ___",
      ex3: "Versicherung morgen 10:00 anrufen",
      ex4: "Strom morgen 18:00 bezahlen",
      ex5: "Mail an ___ heute senden",
      openEmpty: "Remi öffnen",
      close: "Schliessen",
    },

    iosDict: {
      helpTitle: "Diktat auf dem iPhone aktivieren",
      helpBody:
        "In iOS findest du es meist hier: Einstellungen → Allgemein → Tastatur → Diktat aktivieren.",
      helpStepsTitle: "Schnelle Schritte",
      step1: "Einstellungen öffnen",
      step2: "Allgemein → Tastatur",
      step3: "\"Diktat aktivieren\" einschalten",
      ok: "Verstanden",
      hideForever: "Nicht mehr anzeigen",
    },
  },

  inbox: {
    title: "Posteingang",
    tasksTab: "Erinnerungen",
    ideasTab: "Ideen",
    allTab: "Alles",
    statusDone: "Erledigt",
    statusActive: "Aktiv",
    statusArchived: "Archiviert",
    subtitle: "Alles, was du aus dem Kopf ausgelagert hast, erscheint hier.",
    itemsCount: "{{count}} Elemente",
    loading: "Posteingang wird geladen…",
    emptyTitle: "Posteingang leer",
    emptySubtitle: "Füge neue Aufgaben oder Ideen über die Heute-Seite hinzu.",

    itemTaskPrefix: "Aufgabe · ",
    itemIdeaPrefix: "Idee · ",
    errorLoading: "Fehler beim Laden deines Posteingangs",
    errorUpdating: "Fehler beim Aktualisieren deines Posteingangs",
    sectionToday: "Heute",
    sectionTomorrow: "Morgen",
    sectionWeek: "Woche",
    sectionNoDate: "Ohne Datum",
  },

  ideas: {
    title: "Ideen",
    emptyState: "Notiere hier deine Ideen, um den Kopf frei zu bekommen.",
    subtitle: "Alle Ideen, die du nicht verlieren willst, werden hier gespeichert.",
    loading: "Ideen werden geladen…",
    emptyTitle: "Noch keine Ideen",
    emptySubtitle: "Nutze den + Button auf der Heute-Seite, um Ideen zu speichern.",
    savedAt: "Gespeichert am {{date}}",
    errorLoading: "Fehler beim Laden deiner Ideen",
    updateError: "Die Idee konnte nicht aktualisiert werden.",
    convertError: "Die Idee konnte nicht in eine Erinnerung umgewandelt werden.",

    editLabel: "Idee bearbeiten",
    editTitle: "Mach aus dieser Idee etwas Umsetzbares",
    editSubtitle:
      "Verbessere den Text oder verwandle sie in eine Erinnerung mit Datum.",

    fieldTitle: "Ideentext",
    fieldTitlePlaceholder: "Z. B. neue Schuhe für die Hochzeit kaufen",

    taskOptionsTitle: "Erinnerungsoptionen",
    dueDateLabel: "Fälligkeitsdatum und -uhrzeit (optional)",
    reminderLabel: "Erinnerung",

    reminder: {
      none: "Keine Erinnerung",
      onDue: "Nur am Datum",
      dayBeforeAndDue: "Am Vortag und am Datum",
      dailyUntilDue: "Täglich bis zum Fälligkeitsdatum",
    },

    saveAsIdea: "Als Idee speichern",
    convertToTask: "In Erinnerung umwandeln",
    confirmConvert: "Jetzt in Erinnerung umwandeln",

    footerHint:
      "Eine Idee in eine Erinnerung umzuwandeln dupliziert sie nicht: Die ursprüngliche Idee wird zur Erinnerung.",
  },

  profile: {
    title: "Profil",
    username: "Benutzername",
    email: "E-Mail",
    language: "Sprache",
    notifications: "Benachrichtigungen",
    notificationsOn: "Aktiviert",
    notificationsOff: "Deaktiviert",
    changeAvatar: "Avatar ändern",
    save: "Änderungen speichern",
    shareProfile: "Profil teilen",
    logout: "Abmelden",
    toastSaved: "Profil erfolgreich aktualisiert.",
    toastError: "Profil konnte nicht gespeichert werden.",

    devicePushTitle: "Benachrichtigungen auf diesem Gerät",
    devicePushUnsupportedHint:
      "Dieser Browser unterstützt keine Push-Benachrichtigungen. Versuche Safari auf dem iPhone oder Chrome/Edge auf Android/PC.",
    devicePushChecking: "Wird geprüft…",
    devicePushUnsupportedLine: "Dieses Gerät/dieser Browser unterstützt kein Push.",
    devicePushDeniedLine:
      "Berechtigung auf diesem Gerät verweigert (Browser-Einstellungen).",
    devicePushNeedsPermissionLine:
      "Du hast auf diesem Gerät noch keine Berechtigung erteilt.",
    devicePushNeedsRegisterLine: "Berechtigung OK, aber hier noch nicht aktiviert.",
    devicePushPaused: "Pausiert",
    devicePushPausedLine: "Auf diesem Gerät pausiert",
    devicePushActiveLine: "Aktiv auf diesem Gerät ✅",
    devicePushToggleAria:
      "Benachrichtigungen auf diesem Gerät aktivieren oder pausieren",
    pushDeviceEnabled: "Benachrichtigungen auf diesem Gerät aktiviert",

    back: "Profil",
    memberSince: "Mitglied seit {{date}}",

    sectionUserTitle: "Benutzerinformationen",
    sectionUserDescription: "Bearbeite deine Basisdaten und wie REMI angezeigt wird.",

    usernameLabel: "Benutzername",
    usernamePlaceholder: "Dein Name in REMI",

    emailLabel: "E-Mail",
    emailPlaceholder: "du@email.com",

    passwordLabel: "Neues Passwort",
    passwordPlaceholder: "Leer lassen, wenn du es nicht ändern willst",

    languageLabel: "Sprache",
    languageSpanish: "🇪🇸 Spanisch",
    languageEnglish: "🇬🇧 Englisch",
    languageGerman: "🇩🇪 Deutsch",

    notificationsLabel: "Benachrichtigungen",
    notificationsDescription: "Erinnerungen für wichtige Aufgaben.",

    saving: "Wird gespeichert...",
    saveChanges: "Änderungen speichern",

    sectionAccountTitle: "Kontoaktionen",
    sectionAccountDescription:
      "Teile REMI oder melde dich auf diesem Gerät ab.",

    feedbackButton: "Feedback geben",
    shareButton: "App teilen",
    logoutButton: "Abmelden",

    shareText:
      "I'm using Remi to get tasks and ideas out of my head, and my mind feels so much clearer and less stressed.\nI definitely recommend trying it, it really helps. Here's the link. 🙂",
    shareCopied: "REMI-Link in die Zwischenablage kopiert",

    defaultUserName: "Benutzer",

    avatarTooBig: "Das Bild muss kleiner als 5 MB sein.",
    avatarUploadError: "Bild konnte nicht hochgeladen werden. Bitte versuche es erneut.",
    passwordTooShort: "Das neue Passwort muss mindestens 6 Zeichen haben.",
    authUpdateError: "E-Mail/Passwort konnte nicht aktualisiert werden.",
    updateSuccess: "Profil erfolgreich aktualisiert.",
    updateError: "Änderungen konnten nicht gespeichert werden.",
    logoutError: "Abmelden nicht möglich. Bitte versuche es erneut.",
  },

  feedback: {
    title: "Deine Meinung zu Remi",
    q1: "Hilft dir Remi?",
    q3: "Was gefällt dir am meisten?",
    q2: "Was würdest du verbessern?",
    placeholderLike: "Schreibe, was dir am besten gefällt...",
    placeholder: "Schreibe einen kurzen Vorschlag...",
    send: "Feedback senden",
    later: "Jetzt nicht",
    thanks: "Danke für dein Feedback zu Remi.",
    low: "Gar nicht",
    high: "Sehr",
  },

  notifications: {
    dailyReminderTitle: "Dein Kopf ist voll",
    dailyReminderBody:
      "Schau dir deine Aufgaben für heute in REMI an und entlaste deinen Kopf.",
    dueTodayTitle: "Du hast Aufgaben für heute",
    dueTodayBody: "Öffne REMI, um zu sehen, was ansteht.",
  },

  landing: {
    hero: {
      badge: "Dein externes Gedächtnis",
      shareButtonLabel: "Remi teilen",
      shareText:
        "Ich nutze Remi, um alles zu organisieren, was ich früher im Kopf behalten habe, und ich habe Stress und mentale Last deutlich reduziert. Hier ist der Link:",
      shareCopied: "Remi-Link in die Zwischenablage kopiert.",
      title: {
        part1: "Alles merken ohne",
        highlighted: "mentalen Stress",
      },
      description:
        "Hol Aufgaben, Ideen und Erinnerungen aus deinem Kopf, damit du dich auf das konzentrieren kannst, was wirklich zählt. Remi sorgt dafür, dass du das Richtige zur richtigen Zeit erinnerst.",
      ctaPrimary: "Jetzt starten",
      ctaSecondary: "So funktioniert's",
      userStatsHighlight: "Menschen, die Remi nutzen",
      userStats:
        "sagen, dass sie sich leichter fühlen und deutlich weniger mentale Last haben.",
    },

    features: {
      title: {
        part1: "Gemacht, um",
        highlighted: "deinen Kopf zu entlasten",
      },
      subtitle:
        "Remi kombiniert smarte Erinnerungen, Zeitmanagement und schnelle Erfassung, damit dein Kopf nicht mehr deine To-do-Liste ist.",

      items: {
        reminders: {
          title: "Individuelle Erinnerungen",
          description:
            "Lege fest, wie oft du erinnert werden willst: täglich, wöchentlich, monatlich oder individuell. Remi passt sich deinem Rhythmus an. Nur das Wichtige – zur richtigen Zeit.",
        },
        temporal: {
          title: "Zeitliche Kontrolle",
          description:
            "Bestimme, bis wann du an etwas erinnert werden willst. Keine endlosen Erinnerungen. Dein Zukunfts-Ich wird es dir danken.",
        },
        mentalLoad: {
          title: "Mentale Last im Griff",
          description:
            "Hol alles aus dem Kopf, was dich beschäftigt: grosse oder kleine Aufgaben, Erledigungen, Ideen, Dinge, die du nicht vergessen willst. Remi speichert sie und gibt sie dir zurück, wenn du sie brauchst.",
        },
        quickCapture: {
          title: "Ultra-schnelle Erfassung",
          description:
            "Notiere eine Idee oder Aufgabe in einem Moment – ohne komplizierte Menüs. Öffnen, schreiben, fertig. Den Rest organisiert Remi.",
        },
      },
    },

    mentalLoad: {
      cardTitle: "Dein Kopf heute",
      cardDate: "Heute",
      cardStatus: "Klarerer Kopf",

      example1: "Wichtige Rechnungen notiert",
      example1Freq: "Jeden Monat",
      example2: "Geburtstagsgeschenke geplant",
      example2Freq: "Über das Jahr verteilt",
      example3: "Tagesaufgaben organisiert",
      example3Freq: "Jeden Morgen",
      badge: "Dein externes Gedächtnis",
      headline: "Heute läuft's gut",
      subheadline:
        "Heute haben wir deinen Kopf spürbar entlastet: Du hast 5 Aufgaben organisiert und 3 davon sind schon erledigt.",
      clearMindLabel: "Klarer Kopf",
      clearMindHelper:
        "Alles, was du in Remi speicherst, ist eine Sache weniger, die dein Kopf tragen muss.",

      title: {
        part1: "Dein Kopf ist zum Erfinden da,",
        highlighted: "Remi ist zum Merken da",
      },
      description:
        "Wir nutzen den Kopf als To-do-Liste, Kalender, Haushaltsmanagement und Speicher für offene Dinge. Das erzeugt Stress und das Gefühl ständiger mentaler Last. Remi hilft dir, diese Last einfach und schnell an einen externen, klaren und verlässlichen Ort auszulagern – damit du dich auf das konzentrieren kannst, was wirklich zählt.",
      step1Title: "Hol alles aus dem Kopf",
      step1Description:
        "Jedes Mal, wenn dir etwas einfällt — eine Aufgabe, eine Idee, eine Erledigung — schreibst du es in Remi. Ohne lange nachzudenken: einfach notieren und weitermachen.",

      step2Title: "Lass Remi mit dir ordnen",
      step2Description:
        "Ist es eine Idee, speicherst du sie mit einem Klick und kannst sie später bearbeiten oder in eine Aufgabe umwandeln.\nIst es eine Aufgabe, wählst du Fälligkeit und Erinnerungsmodus – schnell, ohne nochmal dran denken zu müssen.",

      step3Title: "Wieder einen klaren Kopf",
      step3Description:
        "Dein Kopf ist kein Lager mehr, sondern wieder das, was er sein sollte: Raum zum Denken, Erfinden und Dasein – ohne Angst, Wichtiges zu vergessen.",
    },

    cta: {
      badge: "Starte heute mit etwas Kleinem",
      title: {
        part1: "Baue Schritt für Schritt einen",
        highlighted: "leichteren, ruhigeren Kopf",
      },
      description:
        "Du musst nicht dein ganzes Leben ändern. Nur das aus dem Kopf holen, was du früher drin getragen hast. Remi zwingt dich nicht zu einem festen Zeitpunkt – Remi erinnert dich rechtzeitig, damit du entscheidest, wann es dir am besten passt, ohne es zu vergessen.",

      ctaPrimary: "Remi jetzt ausprobieren",
      ctaSecondary: "Erst weiter lesen",

      feature1: "Komplett kostenlos",
      feature2: "Für alle Arten von Menschen und Köpfen gemacht",
      feature3: "Funktioniert für Aufgaben und Ideen gleich gut",
    },

    footer: {
      description:
        "Remi ist dein verlässliches externes Gedächtnis für all die Dinge, die du nicht vergessen willst – aber auch nicht den ganzen Tag im Kopf tragen möchtest.",

      product: "Produkt",
      productLinks: {
        features: "Funktionen",
        pricing: "Preise",
        useCases: "Anwendungsfälle",
        roadmap: "Roadmap",
      },

      company: "Unternehmen",
      companyLinks: {
        about: "Über Remi",
        blog: "Blog",
        careers: "Karriere",
        contact: "Kontakt",
      },

      legal: "Rechtliches",
      legalLinks: {
        privacy: "Datenschutz",
        terms: "Nutzungsbedingungen",
        cookies: "Cookies",
        licenses: "Lizenzen",
      },

      copyright: "© Remi 2025. Alle Rechte vorbehalten.",
    },

    extra: {
      hero: {
        kicker: "Sag Remi, was du nicht vergessen willst.",
        description:
          "Schreib einen Satz. Remi interpretiert den Text und erstellt die Erinnerung: Datum und Uhrzeit, Wiederholung bei Gewohnheiten und den Erinnerungsmodus zur richtigen Zeit.",
        bullets: {
          a: "Einfach schreiben: kein Format, keine Reibung",
          b: "Remi interpretiert: Daten, Zeiten, Erinnerungen und Wiederholung",
          c: "Erinnerungen, damit es nicht von deinem Gedächtnis abhängt",
          d: "Auf all deinen Geräten: PC, Handy, iPad und Tablet",
        },
      },

      trustRow: { a: "Schnell", b: "Einfach", c: "Zum Kopf-Freimachen gebaut" },

      problem: {
        title: "Dein Gehirn ist keine To-do-Liste.",
        text:
          "Ideen, Erledigungen, offene Dinge… wenn du alles im Kopf trägst, zahlst du mit Stress und Vergessen.",
        micro:
          "Remi ist dein Gedanken-Download: einmal aufschreiben und weiter mit deinem Tag.",
      },

      how: {
        title: "So funktioniert's",
        subtitle: "Du schreibst. Remi versteht's. Und erinnert dich.",
        step1Title: "1) Schreib, was du nicht vergessen willst",
        step1Text:
          "Ein Satz, genau so wie er kommt. Ohne Menüs, ohne an Felder zu denken.",
        step2Title: "2) Remi interpretiert es",
        step2Text:
          "Erkennt Datum und Uhrzeit, ob es eine Gewohnheit ist (Wiederholung), und passt die Erinnerung an.",
        step3Title: "3) Zur richtigen Zeit zurück",
        step3Text:
          "Remi zeigt es dir im richtigen Moment, damit du es nicht selbst tragen musst.",
      },

      interpret: {
        title: "Text → automatische Erinnerung",
        text:
          "Du musst nicht tausend Dinge einstellen. Remi versteht natürliche Sprache und macht daraus eine nützliche Erinnerung.",
        chips: ["Datum & Uhrzeit", "Gewohnheit / Wiederholung", "Erinnerungsmodus"],
        exampleLabel: "Beispiele",
        examples: [
          "\"Morgen um 18: Versicherung anrufen\"",
          "\"Jeden Montag: Fitness\"",
          "\"Am 5. Miete bezahlen\"",
        ],
        helperLine: "Schreib einen Satz – fertig",
      },

      shareFeature: {
        badge: "Neu",
        title: "Teile Erinnerungen & Ideen, um mentale Last zu reduzieren",
        text:
          "Hilf anderen, den Kopf zu entlasten: Teile eine Erinnerung oder Idee als Link. So können sie sie hinzufügen und müssen nicht mehr denken \"Das darf ich nicht vergessen…\".",
        points: [
          "Nützlich für Familie, Partner und Teams",
          "Teile Erinnerungen, Erledigungen und Ideen in Sekunden",
          "Perfekt, wenn jemand gestresst oder überlastet ist",
        ],
        exampleLabel: "Beispiel",
        example:
          "\"Zu Remi hinzufügen: 'Morgen 18:00 Versicherung anrufen' → kommt als Link, du fügst es mit einem Tipp hinzu.\"",
        helperLine: "Schnelle Hilfe, ohne Erklärung",
        ctaTry: "Remi ausprobieren",
        tag: "Teilen",
      },

      everywhere: {
        title: "Echt multi-device",
        text:
          "Remi ist da, wo du bist: Arbeit, Zuhause, unterwegs. Gleicher Zugriff, gleiche Erinnerungen.",
        points: [
          "PC zum Erfassen während der Arbeit",
          "Handy / iPad / Tablet für unterwegs",
          "Sofort im Browser nutzen oder als App (PWA) installieren",
        ],
      },

      install: {
        title: "Installiere Remi, um Erinnerungen zu erhalten",
        text:
          "Um Benachrichtigungen zu deinen Erinnerungen zu erhalten, installiere Remi jetzt über deinen Browser (PWA).",
        helper:
          "Nutze es wie eine echte App: leichter, schneller und immer aktuell.",
        badge: "App-Modus",
        bullet1: "Benachrichtigungen für Erinnerungen",
        bullet2: "Icon auf dem Home-Bildschirm",
        bullet3: "Vollbild, App-Gefühl",
        mini1: "Leicht und schnell",
        mini2: "Immer aktuell",
        mini3: "Für schnelles Erfassen gemacht",
        ctaHint:
          "Tippe auf \"Jetzt installieren\" und folge den Schritten für dein Gerät.",
        device: {
          desktop: "PC",
          phone: "Handy",
          tablet: "Tablet",
        },
        pwaCard: {
          subtitle: "Benachrichtigungen & schneller Zugriff",
          appLike: "Wie eine App – nur besser",
        },
      },

      social: {
        title: "Mit echtem Feedback gebaut",
        subtitle:
          "Remi wird kontinuierlich durch Tests und Nutzer-Feedback verbessert.",
        note: "",
        testimonials: [
          {
            quote:
              "\"Danke an meinen Kollegen, der mir Remi empfohlen hat – jedes Mal, wenn ich es nutze, spüre ich weniger mentale Last und vergesse weniger.\"",
            author: "Sarah",
          },
          {
            quote:
              "\"Es ist wie ein persönlicher Gedächtnis-Assistent. Ich liebe es!\"",
            author: "Christian",
          },
          {
            quote:
              "\"Sehr einfach zu benutzen und sehr nützlich – vor allem die Option, Erinnerungen oder Ideen zu teilen.\"",
            author: "Erika",
          },
        ],
      },

      modal: {
        installLabel: "Jetzt installieren",
        title: "Remi installieren",
        description:
          "Installiere Remi über deinen Browser, um Benachrichtigungen zu deinen Erinnerungen zu erhalten und es wie eine App zu nutzen.",
        alreadyInstalled:
          "Remi ist auf diesem Gerät bereits installiert. Deine Erinnerungen können als Benachrichtigungen ankommen.",
        promptText:
          "Installiere es, um Benachrichtigungen zu erhalten und schnellen Zugriff über das Icon zu haben.",
        sectionIOS: "Auf iPhone / iPad (Safari)",
        sectionDesktop: "Auf PC (Chrome/Edge)",
        installRequired:
          "Die Installation ist nötig, um Benachrichtigungen zu deinen Erinnerungen zu erhalten.",
        iosSteps: [
          "Öffne das Teilen-Menü (Teilen-Icon in Safari).",
          "Tippe auf \"Zum Home-Bildschirm\".",
          "Bestätige \"Hinzufügen\".",
        ],
        desktopSteps: [
          "Suche in Chrome/Edge nach dem \"Installieren\"-Icon in der Adressleiste oder im Menü.",
          "Tippe auf \"Installieren\".",
        ],
        close: "Schliessen",
        openInBrowser: "Im Browser öffnen",
        directInstallHint:
          "Wenn dein Browser die Direktinstallation unterstützt, erscheint in diesem Modal ein Installations-Button.",
      },

      iosBanner: {
        title: "Installiere Remi auf deinem iPhone – GRATIS",
        step1: "Tippe auf die Teilen-Taste",
        step2: "Wähle \"Zum Home-Bildschirm\" und bestätige.",
        closeAria: "Schliessen",
      },
    },
  },
} as const;



