// src/locales/de.ts
export const de = {
 

 repeat: {
   label: "Gewohnheit",
help: "Mach aus dieser Aufgabe eine Gewohnheit, an die Remi dich immer zur gewählten Uhrzeit erinnert.",

 
  options: {
    daily: "Täglich",
    weekly: "Wöchentlich",
    monthly: "Monatlich",
    yearly: "Jährlich",
  },
},
  

shareInvite: {
    share: "Teilen",
    sharedOk: "Fertig. Link wurde geteilt/kopiert.",
    sharedError: "Teilen nicht möglich. Bitte erneut versuchen.",
    message: "{{name}} möchte, dass du dir merkst: {{text}}",

    pageTitle: "Zu Remi hinzufügen",
    pageSubtitle: "Speichere diese Erinnerung in deinem Konto.",
    loading: "Lädt…",
    invalidLinkTitle: "Ungültiger Link",
    goHome: "Zur Startseite",
    someone: "Jemand",
    due: "Fällig",
    acceptCta: "Zu Remi hinzufügen",
    accepting: "Wird hinzugefügt…",
    acceptError: "Konnte nicht hinzugefügt werden. Bitte erneut versuchen.",
    alreadyAccepted: "Dieser Link wurde bereits verwendet.",
    expired: "Dieser Link ist abgelaufen.",
    rejected: "Dieser Link wurde abgelehnt.",
    openRemi: "Remi öffnen",
      missingToken: "Link-Token fehlt.",
  loadError: "Link konnte nicht geladen werden.",
  loginHint: "Wenn du nicht eingeloggt bist, musst du dich anmelden oder ein Konto erstellen, um es hinzuzufügen.",
sentIndicator: "Von dir geteilt",
messageLine1: "{{name}} möchte, dass du dir merkst:"
  },


 // GERMAN
mentalDump: {
  whyLabel: "Warum:",
  detectedLabel: "Erkannt:",
  detectedManual: "Manuell",
  detectedDash: "—",
  habitDetectedLabel: "Erkannte Gewohnheit:",
  detectedDefault: "Standard",
  habitLabel: "Gewohnheit",
  habitOn: "An",
  habitOff: "Aus",

detectedReminder: {
  DAY_BEFORE_AND_DUE: "Ich habe „{word}“ erkannt → ich habe es markiert als: einen Tag vorher + Fälligkeitsdatum.",
  DAILY_UNTIL_DUE: "Ich habe „{word}“ erkannt → ich habe es markiert als: täglich bis zum Fälligkeitsdatum.",
WEEK_BEFORE_AND_DUE: "Ich habe „{word}“ erkannt → gesetzt auf: 1 Woche vorher + Fälligkeitsdatum.",
},

  why: {
    verbTask: "Ich habe „{word}“ erkannt → als Aufgabe markiert.",
    prefixIdea: "Ich habe „{word}“ erkannt → als Idee markiert.",
    projectIdea: "Klingt nach Idee/Projekt → als Idee markiert.",
    defaultTask: "Kein eindeutiger Hinweis → als Aufgabe markiert.",
    defaultIdea: "Kein eindeutiger Hinweis → als Idee markiert.",
    manualTask: "Du hast es als Aufgabe markiert.",
    manualIdea: "Du hast es als Idee markiert.",
  },

  dateLabel: "Datum",
  timeLabel: "Uhrzeit",
  reminderLabel: "Erinnerung",
  reminderShortLabel: "Hinweis:",
  reminderOff: "Aus",
  reminderDailyUntilDue: "Tägliche Benachrichtigung (bis zum Fälligkeitsdatum)",
  reminderDayBeforeAndDue: "Benachrichtigung (Tag davor + Fälligkeitstag)",
reminderWeekBeforeAndDue: "Benachrichtigung (1 Woche vorher + Fälligkeitsdatum)",

  buttonLabel: "Kopf leeren",
  

  title: "Intensiver Gedanken-Download",
  description:
    "Nimm dir 2–3 Minuten, um deinen Kopf zu leeren. Schreib alles auf, was du nicht vergessen willst: Aufgaben, Ideen, offene To-dos. Du musst nichts sortieren: Remi macht daraus Erinnerungen für dich.",

  inputLabel:
    "Schreibe kurze Sätze, getrennt durch Zeilenumbrüche oder Kommata.",
  placeholder:
    "Beispiele:\n" +
    "Glühbirne im Flur morgen um 10 wechseln\n" +
    "Mama am Sonntag anrufen\n" +
    "Jeden Montag um 14:00 Remi benutzen\n" +
    "Idee: Reise nach Italien im Frühling",

  // Zusammenfassung
  summaryNone: "Es wurde noch kein Satz erkannt.",
  summaryPrefix: "Es wurden",
  summarySuffix: "mögliche Erinnerungen in deinem Text erkannt.",

  // Button-States
  submitSaving: "Wird gespeichert...",
  submitToPreview: "Erinnerungen prüfen",
  submitConfirm: "In Remi speichern",

  // Vorschau
  previewTitle: "Prüfe deinen Mental-Download",
  previewDescription:
    "Aktiviere oder deaktiviere die Zeilen, die du speichern möchtest, passe die Texte an und bestätige, um Aufgaben und Ideen in Remi zu erstellen.",
  previewNoneSelected: "Kein Element ausgewählt.",
  previewTaskLabel: "Aufgabe",
  previewIdeaLabel: "Idee",
  previewInclude: "Speichern",
  previewBackToEdit: "Zurück zum Text bearbeiten",

  // Gewohnheiten
  habitNone: "Keine Gewohnheit",
  habitDaily: "Tägliche Gewohnheit",
  habitWeekly: "Wöchentliche Gewohnheit",
  habitMonthly: "Monatliche Gewohnheit",
  habitYearly: "Jährliche Gewohnheit",

  // Rotierende Hinweise
  hints: {
  0: "Schreib einfach. Remi ordnet und plant alles für dich und erinnert dich, wenn es soweit ist.",
  1: "Füge Text aus WhatsApp, einer E-Mail oder einer Notiz ein oder sende ihn. Remi macht daraus eine Erinnerung.",
  2: "Aufgaben, Ideen, Erledigungen… alles passt. Remi ordnet es und erinnert dich, wenn es soweit ist.",
  3: "Du brauchst kein perfektes Format. Schreib einfach, wie du sprichst.",
  4: "Hat dir jemand etwas Wichtiges gesagt? Kopieren & einfügen. Remi speichert es für dich.",
  5: "Schreibe Datum oder Uhrzeit (z. B. „Dienstag 18:00, 17. Januar um 15:00…“). Remi erkennt das.",
  6: "Schreibe „jeden Tag / jede Woche usw.“, wenn es ein wiederkehrender Habit ist.",
  7: "Eine Minute hier = ein entspannterer Tag und weniger Vergessenes.",
  8: "Schneller Tipp: Schreibe „Idee“, um Notizen ohne Erinnerungen zu speichern.",
}

},


common: {
appName: "REMI",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    close: "Schliessen",
    confirm: "Bestätigen",
    loading: "Laden...",
    paste: "Einfügen",
    speak: "Sprechen",
},

  index: {
  clearMind: "Klarer Kopf",
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
  status: "status",
    holdToTalk: "Gedrückt halten",
  listening: "Hört zu…",
  dictationNotSupported: "Diktat nicht unterstützt",
  tasks: "Aufgaben",
    ideas: "Ideen",

},

installPrompt: {
  iosTitle: "Installiere Remi auf deinem iPhone – KOSTENLOS",
  iosStep1BeforeShare: "1. Tippe auf die",
  iosShareLabel: "Teilen",
  iosStep1AfterShare: "Taste.",
  iosStep2BeforeAction: "2. Wähle",
  iosAddToHome: "Zum Home-Bildschirm",
  iosStep2AfterAction: "und bestätige.",
  defaultTitle: "Installiere Remi",
  defaultDescription: "Füge Remi zu deinen Apps hinzu – KOSTENLOS!",
  buttonInstall: "Installieren",
  close: "Schliessen",
},


status: {
  back: "Zurück",
  headerTitle: "Remi-Status",
  headerSubtitle: "Heute haben wir deinem Kopf geholfen, ein bisschen leichter zu werden.",

  helperLabel: "Dein externes Gedächtnis",
  helperFallback:
    "Ich bin hier, um deine Aufgaben, Ideen und Erinnerungen zu speichern, damit dein Kopf nicht alles alleine tragen muss.",

  mindClearLabel: "Klarer Kopf",
  mindClearDescription:
    "Alles, was du in Remi speicherst, ist eine Sache weniger, die deinen Kopf belastet.",

  todaySectionTitle: "Was wir geschafft haben",
  todaySectionSubtitle:
    "Eine Zusammenfassung, wie wir deinen Kopf entlasten.",
  todayTasksLabel: "Heutige Aufgaben",
  todayTasksDescription:
    "Heute haben wir {{todayTotal}} Aufgaben organisiert.",

  streakSectionTitle: "Unsere Serie",
  streakValue: "{{streakDays}} Tage",
  streakDescription:
    "Seit {{streakDays}} Tagen muss sich dein Kopf nicht mehr ganz alleine an alles erinnern.",

  memoryDelegatedTitle: "Ausgelagerte Erinnerung",
  memoryDelegatedValue: "{{tasks}} Aufgaben · {{ideas}} Ideen",
  memoryDelegatedDescription:
    "Im Moment kümmert sich Remi um {{tasks}} Aufgaben und {{ideas}} Ideen für dich.",

  weekSectionTitle: "Unsere Woche",
  weekSectionSubtitle:
    "An jedem Tag, an dem du Remi nutzt, wird die Last in deinem Kopf ein Stück kleiner.",
  weekActiveLabel: "Aktive Tage diese Woche",

  loading: "Deine Zusammenfassung mit Remi wird aktualisiert…",

  // Moods
  moodTitleCelebrate: "Unglaubliches Team!",
  moodTitleHappy: "Heute läuft es richtig gut",
  moodTitleCalm: "Alles unter Kontrolle",
  moodTitleWaiting: "Ich bin bereit",
  moodTitleConcerned: "Schritt für Schritt",
  moodTitleDefault: "Wir schaffen das gemeinsam",

  moodSubtitleCelebrate:
    "In den letzten Tagen kümmern wir uns besonders gut um deinen Kopf. Wir haben {{cleared}} Aufgaben von heute erledigt und Remi bewahrt insgesamt {{totalItems}} Einträge aus Aufgaben und Ideen für dich auf.",
  moodSubtitleHappy:
    "Heute haben wir deinen Kopf schon gut entlastet: {{todayTotal}} Aufgaben sind organisiert und {{todayDone}} davon bereits erledigt.",
  moodSubtitleCalm:
    "Wir kommen ohne Eile voran. Für heute sind {{todayTotal}} Aufgaben gespeichert und Remi übernimmt das Erinnern für dich.",
  moodSubtitleWaiting:
    "Heute ist dein Kopf recht leicht, aber wir können noch ein paar Dinge in Remi auslagern, damit du sie dir nicht merken musst.",
  moodSubtitleConcerned:
    "Es scheint, als läge noch etwas Tag vor dir. Wir können mit einer kleinen Aufgabe beginnen und deinem Kopf ein wenig mehr Luft geben.",
  moodSubtitleDefault:
    "Alles, was du in Remi speicherst, ist eine Sache weniger, die deinen Kopf belastet.",
},



capture: {
// dentro de capture: { ... }
chips: {
  title: "Intelligente Shortcuts",
    title2: "Datum / Gewohnheit",
    title3: "Uhrzeit",
    title4: "Erinnerung",
    back: "Shortcuts",
  backHint: "Zurück zu Shortcuts",
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
    am: "am",
    jeden: "jeden",
    vor: "vor",
    heute: "heute",
    morgen: "morgen",
         on: "am",
        every: "jeden",
        before: "vor",
        today: "heute",
        tomorrow: "morgen",
       
  },

  time: {
    prefix: "um",
    t0900: "09:00",
    t1800: "18:00",
  },

  reminder: {
       dailyLabel: "Jeden Tag",
        dailyInsert: "erinner jeden Tag",
     standardLabel: "Standard",
      dayBeforeLabel: "Vortag",
      noneLabel: "Keine Erinnerungen",

      standardInsert: "erinner",
      dayBeforeInsert: "erinner am Vortag",
      noneInsert: "keine erinnerungen",
    
  },
},


  tips: {
    0: "Tipp: Sage oder schreibe „Idee“, um Notizen ohne Erinnerung zu erstellen",
    1: "Tipp: Du kannst Text aus anderen Apps einfügen",
    2: "Tipp: Mach dir keine Sorgen um das Format – schreibe, wie du sprichst",
    3: "Tipp: Halte das Mikrofon gedrückt, um zu diktieren",
  },

 paste: {
    title: "Zuletzt kopierten Text einfügen?",
    sub: "Tippe auf EINFÜGEN, um es hier einzusetzen.",
    button: "EINFÜGEN",
    pasting: "Wird eingefügt…",
    toastUnavailable: "Einfügen ist hier nicht verfügbar. Lange drücken und manuell einfügen.",
    toastEmpty: "Zwischenablage ist leer (oder ich kann sie nicht lesen).",
    toastDenied: "Ich kann die Zwischenablage nicht lesen. Lange drücken und manuell einfügen.",
  },

toast: {
      micDenied: "Mikrofonzugriff verweigert.",
      noSpeech: "Keine Sprache erkannt. Versuch es erneut.",
      dictationError: "Diktierfehler.",
      dictationStartError: "Diktat konnte nicht gestartet werden.",
      pasteUnavailable: "Einfügen nicht möglich (Zwischenablage nicht verfügbar).",
      clipboardEmpty: "Die Zwischenablage ist leer.",
      pasteError: "Kein Zugriff auf die Zwischenablage. Halte gedrückt und füge ein.",
      writeSomething: "Schreib zuerst etwas.",
    },

 textareaPlaceholderIOS:
    "iPhone/iPad: Nutze das Mikrofon der Tastatur zum Diktieren.\n" +
    "Falls es fehlt: Einstellungen > Allgemein > Tastatur > Diktat aktivieren.\n" +
    "Falls “nicht verfügbar”: Einstellungen > Datenschutz & Sicherheit > Mikrofon (Browser erlauben).",

  repeatOn: "An",
  repeatOff: "Aus",
  remindersDisabledByHabit: "Gewohnheiten erstellen eigene Erinnerungen anhand des ausgewählten Datums und der Uhrzeit.",
  timeHour: "Stunden",
  timeMinute: "Minuten",
  dateTimeLabel: "Datum und Uhrzeit",
  dateTimeNoneShort: "Kein Datum und keine Uhrzeit",
  placeholder: "Hier schreiben…",
  iosKeyboardMicHint: "Auf dem iPhone: Verwende das Mikrofon der Tastatur zum Sprechen.",
speakHold: "Gedrückt halten zum Sprechen",

  title: "Leere deinen Kopf",
  subtitle: "Sprich, schreibe oder füge Text ein. Remi kümmert sich darum.",
  examplesTitle: "Beispiele:",
  exampleVoice: "🎤 „Mama am Sonntag anrufen“",
  exampleVoiceIOS: '🎤 „Nutze das Mikrofon deiner Tastatur zum Diktieren“',
  examplePaste: "📋 „Jeden Dienstag um 18:00 treffen wir uns“",
  exampleIdea: "💡 Idee: Italienreise im Frühling",
  holdToTalk: "Gedrückt halten zum Sprechen",
  listening: "Höre zu…",

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
  remindersDayBeforeAndDue: "Tag davor und Fälligkeitstag",
  remindersDailyUntilDue: "Jeden Tag bis zum Fälligkeitstag",

  back: "Zurück",
  saveTask: "Aufgabe speichern",

  toastTaskSaved: "Aufgabe erfolgreich gespeichert",
  toastTaskError: "Fehler beim Erstellen der Aufgabe",
  toastIdeaSaved: "Idee erfolgreich gespeichert",
  toastIdeaError: "Fehler beim Erstellen der Idee",
},

tasks: {
  weekdayLabels: "Mo|Di|Mi|Do|Fr|Sa|So",

  editLabel: "Bearbeiten",
  editTitle: "Aufgabe bearbeiten",
  editSubtitle: "Ändere Text, Datum & Uhrzeit, Erinnerungen und Wiederholung.",

  fieldTitle: "Aufgabe",
  fieldTitlePlaceholder: "Schreibe deine Aufgabe...",

  optionsTitle: "Optionen",

  dueDateLabel: "Datum & Uhrzeit",
  clearDueDate: "Entfernen",

  reminderLabel: "Erinnerungen",
  reminder: {
    none: "Keine Erinnerungen",
    onDue: "Nur am Fälligkeitstag",
    dayBeforeAndDue: "Am Vortag und am Fälligkeitstag",
    dailyUntilDue: "Jeden Tag bis zum Fälligkeitstag",
  },

  save: "Speichern",
  footerHint: "Du kannst das jederzeit bearbeiten.",
  updateError: "Fehler beim Aktualisieren der Aufgabe",
},



  auth: {
    titleLogin: "Melde dich bei REMI an",
    titleRegister: "Erstelle dein REMI-Konto",
    subtitleAuth2:"From MIND FULL to MINDFUL" ,

    email: "E-Mail",
    password: "Passwort",
    login: "Anmelden",
    register: "Registrieren",
    logout: "Abmelden",
     loginTitle: "Willkommen zurück!",
  registerTitle: "Starte deine Reise!",
  loginSubtitle: "Verbessere dich jeden Tag mit REMI",
  registerSubtitle:
    "Erstelle dein Konto und beginne, deine Ziele zu erreichen",
  emailLabel: "E-Mail",
  emailPlaceholder: "du@email.ch",
  passwordLabel: "Passwort",
  passwordPlaceholder: "••••••••",
  submitLogin: "Anmelden",
  submitRegister: "Konto erstellen",
  toggleToRegister: "Noch kein Konto? Registriere dich",
  toggleToLogin: "Schon ein Konto? Melde dich an",

  errorInvalidCredentials:
    "Falsche Zugangsdaten. Bitte überprüfe E-Mail und Passwort.",
  errorUserAlreadyRegistered:
    "Diese E-Mail ist bereits registriert. Versuche dich anzumelden.",
  errorGeneric: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
  signUpSuccess:
    "Konto erstellt! Lass uns jetzt dein erstes Ziel einrichten.",
  },

  today: {
    dueLabel: "Fälligkeitsdatum",
    greeting: "Hallo, {{name}}",
    tasksToday: "Du hast {{count}} Aufgaben",
    prioritize: "Fokussiere das Wichtige",
    done: "Erledigt",
    delete: "Löschen",
    actionEditTitle: "Bearbeiten",

    defaultUserName: "Nutzer",

    tabsToday: "Heute",
    tabsWeek: "Woche",
    tabsNoDate: "Ohne Datum",

    loadingTasks: "Lädt…",
    noUrgentTitle: "Alles im Griff",
    noUrgentSubtitle: "Gerade ist nichts Dringendes",

    dueNoDate: "Ohne Datum",

    actionPostpone1dTitle: "Verschieben: +1 Tag zur Frist hinzufügen",
    actionDoneTitle: "Als erledigt markieren",
    postponeDayToast: "Verschoben",

    errorLoadingTasks: "Fehler beim Laden der Aufgaben",

    profileLoggedInAs: "Angemeldet als {{name}}",
    menuProfile: "Profil",
    menuShareApp: "App teilen",
    menuInstallApp: "App installieren",

    shareText:
      "Ich nutze Remi, um Aufgaben und Ideen aus dem Kopf zu bekommen – dadurch fühlt sich mein Kopf viel klarer und weniger gestresst an.\nIch empfehle es echt. Hier ist der Link 🙂",
    shareCopied: "Link in die Zwischenablage kopiert",

    pushTitle: "Benachrichtigungen aktivieren",
    pushBody: "Damit du Erinnerungen im richtigen Moment bekommst.",
    pushEnable: "Aktivieren",
    pushEnabling: "Wird aktiviert…",
    pushLater: "Nicht jetzt",
    pushEnabledToast: "Benachrichtigungen aktiviert",
    pushErrorToast: "Benachrichtigungen konnten nicht aktiviert werden",

 multideviceHelp: {
      title: "Mehrere Geräte: nichts vergessen – egal wo du bist",
      p1: "Remi ist dafür gemacht, dass du Dinge in 5 Sekunden loswerden kannst – von jedem Gerät aus.",
      stepsTitle: "So nutzt du es (kurz)",
      step1: "Erfasse es, wo du gerade bist: Handy, iPad/Tablet oder PC. Tippen, sprechen oder Text einfügen.",
      step2: "Alles synchronisiert sich: Was du auf einem Gerät speicherst, erscheint auf den anderen.",
      step3: "Benachrichtigungen pro Gerät: Aktiviere Hinweise nur dort, wo du sie willst (z. B. Handy AN, PC AUS).",
      examplesTitle: "Beispiele, die funktionieren",
      examplesBody:
        "• Handy AN → Erinnerungen unterwegs\n• PC AUS → keine Unterbrechungen beim Arbeiten\n• iPad AN → ruhiger Tagesabschluss",
      footer: "Du gibst die mentale Last im Moment ab. Remi stupst dich an, wenn es soweit ist.",
      ok: "Verstanden",
      hideForever: "Nicht mehr anzeigen",
    },

    tip: {

        multidevice: {
        title: "Remi auf Handy, iPad/Tablet und PC",
        body: "Entlaste deinen Kopf überall. Alles synchronisiert sich, und du entscheidest, auf welchen Geräten du Benachrichtigungen willst.",
        cta: "So funktioniert’s",
      },

       smartShortcuts: {
      title: "Smarte Shortcuts (spart 10 Sek.)",
      body: "Füge Wörter mit 1 Tap hinzu.\nZ.B. Idee / Kaufen / um 18:00.",
      cta: "Jetzt testen",
      prefill: "Kaufen: Milch, Brot, Eier",
    },

      install: {
        title: "Installiere Remi als App",
        body: "Schneller Zugriff, Benachrichtigungen und alle Vorteile einer App.",
        cta: "Installieren",
      },

      push: {
        title: "Lass Remi dich erinnern",
        body: "Aktiviere Benachrichtigungen und lass die mentale Last los. Remi stupst dich an, wenn es Zeit ist.",
        cta: "Aktivieren",
      },

      iosDict: {
        title: "Aktiviere das Mikro am Keyboard",
        body: "Wenn du das Mikro nicht siehst, aktiviere es in den Einstellungen – dann kannst du schneller diktieren.",
        cta: "So geht’s",
      },

      noDate: {
        title_one: "Du hast {{count}} Aufgabe ohne Datum",
        title_other: "Du hast {{count}} Aufgaben ohne Datum",
        body: "Sollen wir sie sortieren? In 30s ist die Liste sauber.",
        cta: "Ohne Datum ansehen",
      },

      shortcuts: {
        title: "Wörter, die Zeit sparen",
        body: "Eine Idee = starte mit ‘Idee’. \nEine Aufgabe = starte mit einem Verb.",
        cta: "Beispiele ansehen",
      },

      dayClose: {
        title: "60-Sekunden-Abschluss",
        body: "Was beschäftigt dich für morgen? Lass es hier – fertig.",
        cta: "Loslassen",
      },

      paste: {
        title: "Schon mal Text eingefügt?",
        body: "Kopiere irgendwas (WhatsApp, Mail, Notizen) und lass Remi es ordnen.",
        cta: "Jetzt einfügen",
      },

      shareToRemi: {
        title: "Speichere Dinge per „Teilen“",
        body: "Aus WhatsApp/Mail/Notizen: Teilen → Remi. \nÖffnet sich direkt zum Sortieren.",
        cta: "Testen",
        toast:
          "Tipp: In einer anderen App „Teilen“ → „Remi“ tippen, um es direkt zu senden 🙂",
      },

      natural: {
        title: "Schreib, wie du sprichst",
        body: "Beispiel: „Stromrechnung morgen um 18:00 bezahlen“. Remi kümmert sich darum – und du kannst entspannen.",
        cta: "Beispiel testen",
        prefill: "Stromrechnung morgen 18:00 zahlen",
      },

      week: {
        title: "Schneller Plan",
        body: "Sieh deine Woche mit einer Geste. Dringendes zuerst – der Rest raus aus dem Kopf.",
        cta: "Woche ansehen",
      },

      mental: {
        title: "Mini-Pause",
        body: "4s einatmen, 6s ausatmen. Dein Kopf muss heute nicht alles tragen.",
        cta: "Kopf leeren",
      },

      birthday: {
        title: "Bald Geburtstag?",
        body: "In 5 Sekunden notiert – und Remi erinnert dich, wenn es so weit ist.",
        cta: "Hinzufügen",
        prefill: "Geburtstag von ___ am ___",
      },

      cleanNoDate: {
        title: "✅ Keine Aufgaben ohne Datum",
        body: "Perfekt. Priorisieren ist jetzt easy.",
        cta: "Heute ansehen",
      },
    },

    // de
shareToRemiModal: {
  title: "An Remi teilen",
  body: "Speichere Text aus jeder App über „Teilen“.",
  iosTitle: "Auf dem iPhone (iOS)",
  iosStep1: "Öffne WhatsApp/Mail/Notizen.",
  iosStep2: "Tippe auf „Teilen“.",
  iosStep3: "Wenn „Remi“ erscheint, tippe darauf – es öffnet sich bereit zum Ordnen.",
  iosStep4:
    "Wenn es nicht erscheint: „Kopieren“ und dann in Remi einfügen (unter iOS hängt es manchmal vom System/der Version ab).",
  androidTitle: "Auf Android",
  androidStep1: "Öffne WhatsApp/Mail/Notizen.",
  androidStep2: "Text markieren und/oder auf „Teilen“ tippen.",
  androidStep3: "Wähle „Remi“ – Remi öffnet sich mit dem Text bereit zum Ordnen.",
  androidStep4:
    "Wenn es nicht erscheint, stelle sicher, dass Remi als App (PWA) installiert ist, und versuche es erneut.",
  ok: "Verstanden",
  hideForever: "Nicht mehr anzeigen",
},


    shortcutsModal: {
      title: "Beispiele ansehen",
      body: "Tippe ein Beispiel an, um Remi mit diesem Text zu öffnen.",
      ex1: "Idee: Japanreise im Frühling",
      ex2: "Idee: Geschenk für ___",
      ex3: "Morgen 10:00 Versicherung anrufen",
      ex4: "Morgen 18:00 Stromrechnung zahlen",
      ex5: "Heute E-Mail an ___ senden",
      openEmpty: "Remi öffnen",
      close: "Schliessen",
    },

    iosDict: {
      helpTitle: "Diktieren am iPhone aktivieren",
      helpBody:
        "Unter iOS ist es meistens hier: Einstellungen → Allgemein → Tastatur → Diktierfunktion aktivieren.",
      helpStepsTitle: "Schnelle Schritte",
      step1: "Einstellungen öffnen",
      step2: "Allgemein → Tastatur",
      step3: "„Diktierfunktion aktivieren“ einschalten",
      ok: "Verstanden",
      hideForever: "Nicht mehr anzeigen",
    },
  },

  inbox: {
    title: "Posteingang",
    tasksTab: "Aufgaben",
    ideasTab: "Ideen",
    allTab: "Alle",
    statusDone: "Erledigt",
    statusActive: "Aktiv",
    statusArchived: "Archiviert",     
  subtitle:
    "Alles, was du aus deinem Kopf geleert hast, erscheint hier.",

  itemsCount: "{{count}} Einträge",
  loading: "Posteingang wird geladen…",
  emptyTitle: "Posteingang leer",
  emptySubtitle:
    "Füge neue Aufgaben oder Ideen über den Heute-Bildschirm hinzu.",

  itemTaskPrefix: "Aufgabe · ",
  itemIdeaPrefix: "Idee · ",
  errorLoading: "Fehler beim Laden deines Posteingangs",
  errorUpdating: "Fehler beim Aktualisieren deines Posteingangs",

   sectionToday: "Heute",
  sectionTomorrow: "Morgen",
  sectionNoDate: "Ohne Datum",
  },

  ideas: {
    title: "Ideen",
    emptyState:
      "Schreibe hier deine Ideen auf, um den Kopf frei zu bekommen.",        
  subtitle:
    "Alle Ideen, die du nicht verlieren willst, werden hier gespeichert.",
  loading: "Ideen werden geladen…",
  emptyTitle: "Noch keine Ideen",
  emptySubtitle:
    "Nutze den + Button auf dem Heute-Bildschirm, um deine Ideen zu speichern.",
  savedAt: "Gespeichert am {{date}}",
  errorLoading: "Fehler beim Laden deiner Ideen",
  updateError: "Die Idee konnte nicht aktualisiert werden.",
    convertError: "Die Idee konnte nicht in eine Aufgabe umgewandelt werden.",

    editLabel: "Idee bearbeiten",
    editTitle: "Mach aus dieser Idee etwas Konkretes",
    editSubtitle:
      "Formuliere den Text besser oder wandle ihn in eine Aufgabe mit Termin und Erinnerung um.",

    fieldTitle: "Ideentext",
    fieldTitlePlaceholder: "z. B. neue Schuhe für die Hochzeit kaufen",

    taskOptionsTitle: "Aufgaben-Optionen",
    dueDateLabel: "Fälligkeitsdatum und Uhrzeit (optional)",
    reminderLabel: "Erinnerung",

    reminder: {
      none: "Keine Erinnerung",
      onDue: "Nur am Fälligkeitstag",
      dayBeforeAndDue: "Einen Tag vorher und am Fälligkeitstag",
      dailyUntilDue: "Jeden Tag bis zum Fälligkeitstag",
    },

    saveAsIdea: "Als Idee speichern",
    convertToTask: "In Aufgabe umwandeln",
    confirmConvert: "Jetzt in Aufgabe umwandeln",

    footerHint:
      "Beim Umwandeln einer Idee in eine Aufgabe wird sie nicht dupliziert: Die ursprüngliche Idee wird zur Aufgabe.",
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
    "Dieser Browser unterstützt keine Push-Benachrichtigungen. Probiere Safari auf dem iPhone oder Chrome/Edge auf Android/PC.",
     devicePushChecking: "Wird geprüft…",
  devicePushUnsupportedLine: "Dieses Gerät/Browser unterstützt keine Push-Benachrichtigungen.",
  devicePushDeniedLine: "Berechtigung auf diesem Gerät verweigert (Browser-Einstellungen).",
  devicePushNeedsPermissionLine: "Du hast auf diesem Gerät noch keine Berechtigung erteilt.",
  devicePushNeedsRegisterLine: "Berechtigung OK, aber hier noch nicht aktiviert.",
  devicePushActiveLine: "Auf diesem Gerät aktiv ✅",
  devicePushToggleAria: "Benachrichtigungen auf diesem Gerät aktivieren oder pausieren",
  pushDeviceEnabled: "Benachrichtigungen auf diesem Gerät aktiviert",

  back: "Profil",
  memberSince: "Mitglied seit {{date}}",

  sectionUserTitle: "Benutzerinformationen",
  sectionUserDescription:
    "Bearbeite deine Basisdaten und wie REMI angezeigt wird.",

  usernameLabel: "Benutzername",
  usernamePlaceholder: "Dein Name in REMI",

  emailLabel: "E-Mail",
  emailPlaceholder: "du@email.ch",

  passwordLabel: "Neues Passwort",
  passwordPlaceholder:
    "Leer lassen, wenn du es nicht ändern möchtest",

  languageLabel: "Sprache",
  languageSpanish: "🇪🇸 Spanisch",
  languageEnglish: "🇬🇧 Englisch",
  languageGerman: "🇩🇪 Deutsch",

  notificationsLabel: "Benachrichtigungen",
  notificationsDescription: "Erinnerungen für wichtige Aufgaben.",

  saving: "Speichern...",
  saveChanges: "Änderungen speichern",

  sectionAccountTitle: "Kontoaktionen",
  sectionAccountDescription:
    "Teile REMI oder melde dich auf diesem Gerät ab.",

  shareButton: "App teilen",
  logoutButton: "Abmelden",

  shareText: "I’m using Remi to get tasks and ideas out of my head, and my mind feels so much clearer and less stressed.\nI definitely recommend trying it, it really helps. Here’s the link. 🙂",
  shareCopied: "REMI-Link in die Zwischenablage kopiert",

  defaultUserName: "Benutzer",

  avatarTooBig: "Das Bild darf maximal 5 MB gross sein.",
  avatarUploadError:
    "Das Bild konnte nicht hochgeladen werden. Bitte versuche es erneut.",
  passwordTooShort:
    "Das neue Passwort muss mindestens 6 Zeichen lang sein.",
  authUpdateError:
    "E-Mail/Passwort konnten nicht aktualisiert werden.",
  updateSuccess: "Profil erfolgreich aktualisiert.",
  updateError: "Änderungen konnten nicht gespeichert werden.",
  logoutError:
    "Abmeldung fehlgeschlagen. Bitte versuche es erneut.",
  },
  notifications: {
    dailyReminderTitle: "Dein Kopf ist voll",
    dailyReminderBody:
      "Sieh dir deine heutigen Aufgaben in REMI an und entlaste deinen Kopf.",
    dueTodayTitle: "Du hast Aufgaben für heute",
    dueTodayBody: "Öffne REMI, um deine offenen Aufgaben zu sehen.",
  },

landing: {
  hero: {
    badge: "Dein externes Gedächtnis",
    shareButtonLabel: "Remi teilen",
    shareText:
      "Ich benutze Remi, um alles zu organisieren, was ich früher im Kopf hatte, und ich habe meinen Stress und meine mentale Belastung deutlich reduziert. Hier ist der Link:",
    shareCopied: "Remi-Link in die Zwischenablage kopiert.",
    title: {
      part1: "Erinnere dich an alles ohne",
      highlighted: "mentalen Stress",
    },
    description:
"Hol dir Aufgaben, Ideen und Erinnerungen aus deinem Kopf, damit du dich auf das wirklich Wichtige konzentrieren kannst. Remi sorgt dafür, dass du dich genau im richtigen Moment an das Wichtige erinnerst.",
    ctaPrimary: "Jetzt starten",
    ctaSecondary: "So funktioniert es",
    userStatsHighlight: "Menschen, die Remi nutzen",
    userStats:
      "sagen, dass sie sich leichter fühlen und deutlich weniger mentale Last spüren.",
  },

  features: {
    title: {
      part1: "Entwickelt, um",
      highlighted: "deinen Kopf zu entlasten",
    },
    subtitle:
      "Remi kombiniert intelligente Erinnerungen, Zeitplanung und schnelle Erfassung, damit dein Kopf aufhört, deine To-do-Liste zu sein.",

    items: {
      reminders: {
        title: "Personalisierte Erinnerungen",
        description:
          "Stelle genau die Häufigkeit ein, die du brauchst: täglich, wöchentlich, monatlich oder individuell. Remi passt sich deinem Rhythmus an. Nur das Wichtige, zum richtigen Zeitpunkt.",
      },
      temporal: {
        title: "Zeitliche Kontrolle",
        description:
          "Lege fest, wie lange du dich an jede Sache erinnern lassen willst. Keine endlosen Erinnerungen mehr. Dein zukünftiges Ich wird es dir danken.",
      },
      mentalLoad: {
        title: "Mentale Last im Griff",
        description:
          "Hol alles aus deinem Kopf heraus, was dich beschäftigt: grosse und kleine Aufgaben, Erledigungen, Ideen, Dinge, die du nicht vergessen willst. Remi speichert sie und bringt sie genau dann zurück, wenn du sie brauchst.",
      },

      quickCapture: {
        title: "Ultraschnelle Erfassung",
        description:
          "Notiere eine Idee oder Aufgabe in einem Moment, ohne komplizierte Menüs. Öffnen, schreiben, fertig. Den Rest organisiert Remi.",
      },
    },
  },

  mentalLoad: {
    cardTitle: "Dein mentaler Zustand heute",
    cardDate: "Heute",
    cardStatus: "Klarerer Kopf",

    example1: "Wichtige Rechnungen notiert",
    example1Freq: "Jeden Monat",
    example2: "Geburtstagsgeschenke geplant",
    example2Freq: "Über das Jahr verteilt",
    example3: "Aufgaben des Tages organisiert",
    example3Freq: "Jeden Morgen",

    badge: "Dein externes Gedächtnis",
    headline: "Heute läuft es richtig gut",
    subheadline:
      "Heute haben wir deinen Kopf ordentlich entlastet: Du hast 5 Aufgaben organisiert und 3 davon sind bereits erledigt.",
    clearMindLabel: "Klarer Kopf",
    clearMindHelper:
      "Jede Sache, die du in Remi speicherst, ist eine Sache weniger, die deinen Kopf belastet.",

    title: {
      part1: "Dein Kopf ist zum Kreieren da,",
      highlighted: "Remi zum Erinnern",
    },
    description:
      "Wir benutzen unseren Kopf als Aufgabenliste, Kalender, Haushaltsorganisation und Speicher für alles Unerledigte. Das erzeugt Stress und ein ständiges Gefühl mentaler Überlastung. Remi hilft dir, diese Last schnell und einfach in einen externen, klaren und vertrauenswürdigen Ort auszulagern, damit du deine Aufmerksamkeit auf das richten kannst, was wirklich zählt.",
    step1Title: "Hol alles aus deinem Kopf",
    step1Description:
      "Immer wenn dir etwas in den Sinn kommt – eine Aufgabe, eine Idee, ein Erledigung –, schreibst du es in Remi. Ohne gross nachzudenken: einfach notieren und weitermachen.",

    step2Title: "Lass Remi mit dir Ordnung schaffen",
    step2Description:
      "Wenn es eine Idee ist, speicherst du sie mit einem Klick und kannst sie später bearbeiten oder in eine Aufgabe verwandeln.\nWenn es eine Aufgabe ist, wählst du ein Fälligkeitsdatum und wie Remi dich daran erinnern soll – schnell und ohne sie noch einmal anfassen zu müssen.",

    step3Title: "Hol dir deinen klaren Kopf zurück",
    step3Description:
      "Dein Kopf hört auf, ein Lagerraum zu sein, und wird wieder das, was er sein sollte: ein Raum zum Denken, Kreieren und Präsenz zeigen – ohne die Angst, etwas Wichtiges zu vergessen.",
  },

  cta: {
    badge: "Starte heute mit etwas Kleinem",
    title: {
      part1: "Baue dir nach und nach einen",
      highlighted: "leichteren, ruhigeren Kopf",
    },
    description:
        "Du musst nicht dein ganzes Leben umkrempeln. Hol einfach das aus deinem Kopf, was du bisher mit dir herumgetragen hast. Remi zwingt dich nicht, etwas zu einem bestimmten Zeitpunkt zu erledigen: Remi erinnert dich nur rechtzeitig daran, damit du selbst entscheiden kannst, wann es für dich am besten passt, ohne es zu vergessen.",

    ctaPrimary: "Remi jetzt ausprobieren",
    ctaSecondary: "Zuerst weiter lesen",

    feature1: "Komplett kostenlos",
    feature2: "Für alle Arten von Menschen und Denkweisen gemacht",
    feature3: "Funktioniert gleichermassen gut für Aufgaben und Ideen",
  },

  footer: {
    description:
      "Remi ist dein vertrauenswürdiges externes Gedächtnis für all die Dinge, die du nicht vergessen willst, aber auch nicht den ganzen Tag im Kopf mit dir herumtragen möchtest.",

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
      careers: "Jobs",
      contact: "Kontakt",
    },

    legal: "Rechtliches",
    legalLinks: {
      privacy: "Datenschutzerklärung",
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
          "Schreib einen Satz. Remi interpretiert den Text und erstellt die Erinnerung: Datum & Uhrzeit, Wiederholung wenn es ein Habit ist, und den Erinnerungsmodus, wenn es zählt.",
        bullets: {
          a: "Einfach schreiben: kein Format, keine Reibung",
          b: "Remi interpretiert: Datum, Uhrzeit, Habits & Wiederholung",
          c: "Erinnerungen fertig – du musst dich nicht darauf verlassen, es zu merken",
          d: "Auf all deinen Geräten: Computer, Handy, iPad & Tablet",
        },
      },

      trustRow: { a: "Schnell", b: "Einfach", c: "Für einen leeren Kopf gemacht" },

      problem: {
        title: "Dein Kopf ist keine To-do-Liste.",
        text:
          "Ideen, Erledigungen, offene Punkte… alles im Kopf zu behalten kostet Stress und führt zu Vergessen.",
        micro: "Remi ist dein mentaler Entlaster: einmal aufschreiben und weiter mit dem Tag.",
      },

      how: {
        title: "So funktioniert’s",
        subtitle: "Du schreibst. Remi versteht. Und erinnert dich.",
        step1Title: "1) Schreib, was du nicht vergessen willst",
        step1Text: "Ein Satz, so wie er rauskommt. Keine Menüs, keine Felder.",
        step2Title: "2) Remi interpretiert es",
        step2Text:
          "Erkennt Datum & Uhrzeit, ob es ein Habit ist (Wiederholung), und setzt die Erinnerung.",
        step3Title: "3) Zur richtigen Zeit wieder da",
        step3Text:
          "Remi bringt es im richtigen Moment zurück, damit du es nicht im Kopf tragen musst.",
      },

      interpret: {
        title: "Text → automatische Erinnerung",
        text:
          "Keine endlose Konfiguration. Remi versteht natürliche Sprache und macht daraus eine nützliche Erinnerung.",
        chips: ["Datum & Uhrzeit", "Habit / Wiederholung", "Erinnerungsmodus"],
        exampleLabel: "Beispiele",
        examples: [
          "„Morgen um 18: Versicherung anrufen“",
          "„Jeden Montag: Fitnessstudio“",
          "„Am 5.: Miete zahlen“",
        ],
        helperLine: "Ein Satz reicht",
      },

      shareFeature: {
        badge: "Neu",
        title: "Reminders & Ideen teilen – mentale Last reduzieren",
        text:
          "Hilf anderen, den Kopf freizubekommen: Teile eine Aufgabe oder Idee als Link. So kann man sie direkt hinzufügen und muss sie nicht im Kopf behalten.",
        points: [
          "Ideal für Familie, Partner und Teams",
          "Erinnerungen, Erledigungen und Ideen in Sekunden teilen",
          "Perfekt, wenn jemand gestresst oder überlastet ist",
        ],
        exampleLabel: "Beispiel",
        example:
          "„Zu Remi hinzufügen: ‚Morgen 18:00 Versicherung anrufen‘ → Link öffnen und mit einem Tap hinzufügen.“",
        helperLine: "Schnell helfen, ohne Aufwand",
        ctaTry: "Remi testen",
        tag: "Teilen",
      },

      everywhere: {
        title: "Echtes Multi-Device",
        text:
          "Remi ist da, wo du bist: Arbeit, Zuhause, unterwegs. Gleicher Zugriff, gleiche Erinnerungen.",
        points: [
          "Computer für schnelle Erfassung bei der Arbeit",
          "Handy / iPad / Tablet für unterwegs",
          "Sofort im Browser nutzen oder als App (PWA) installieren",
        ],
      },

      install: {
        title: "Installiere Remi für Erinnerungen",
        text:
          "Damit du Benachrichtigungen für deine Erinnerungen bekommst, installiere Remi jetzt im Browser (PWA).",
        helper: "Wie eine echte App: leichter, schneller und immer aktuell.",
        badge: "App mode",
        bullet1: "Benachrichtigungen für Erinnerungen",
        bullet2: "Icon auf dem Homescreen",
        bullet3: "Vollbild-App-Gefühl",
        mini1: "Leicht und schnell",
        mini2: "Immer aktuell",
        mini3: "Für schnelle Erfassung gemacht",
        ctaHint: "Tippe auf „Jetzt installieren“ und folge den Schritten für dein Gerät.",
        device: {
          desktop: "Computer",
          phone: "Handy",
          tablet: "Tablet",
        },
        pwaCard: {
          subtitle: "Benachrichtigungen & Schnellzugriff",
          appLike: "Wie eine App – nur besser",
        },
      },

      social: {
        title: "Mit echtem Feedback gebaut",
        subtitle: "Remi wird laufend mit Tests und Nutzer-Feedback verbessert.",
        note: "",
        testimonials: [
          {
            quote:
              "„Danke an meinen Kollegen für die Empfehlung von Remi – jeden Tag, an dem ich es nutze, spüre ich weniger mentale Last und vergesse weniger.“",
            author: "Sarah",
          },
          {
            quote: "„Wie ein persönlicher Gedächtnis-Assistent. Ich liebe es!“",
            author: "Christian",
          },
          {
            quote:
              "„Sehr einfach zu nutzen und sehr hilfreich – besonders die Funktion, Tasks oder Ideen zu teilen.“",
            author: "Erika",
          },
        ],
      },

      modal: {
        installLabel: "Jetzt installieren",
        title: "Remi installieren",
        description:
          "Installiere Remi im Browser, um Benachrichtigungen für Erinnerungen zu erhalten und es wie eine App zu nutzen.",
        alreadyInstalled:
          "Remi ist auf diesem Gerät bereits installiert. Deine Erinnerungen können als Benachrichtigungen erscheinen.",
        promptText:
          "Installiere es, um Benachrichtigungen für Erinnerungen zu erhalten und schnell über das Icon zuzugreifen.",
        sectionIOS: "Auf iPhone / iPad (Safari)",
        sectionDesktop: "Am Computer (Chrome/Edge)",
        installRequired:
          "Die Installation ist nötig, um Benachrichtigungen für Erinnerungen zu erhalten.",
        iosSteps: [
          "Öffne das Teilen-Menü (Share-Icon in Safari).",
          "Tippe auf „Zum Home-Bildschirm“.",
          "Bestätige „Hinzufügen“.",
        ],
        desktopSteps: [
          "In Chrome/Edge findest du das „Installieren“-Icon in der Adressleiste oder im Menü.",
          "Klicke auf „Installieren“.",
        ],
        close: "Schliessen",
        openInBrowser: "Im Browser öffnen",
        directInstallHint:
          "Wenn dein Browser eine Direktinstallation unterstützt, erscheint in diesem Modal ein Install-Button.",
      },

      iosBanner: {
        title: "Installiere Remi auf deinem iPhone – GRATIS",
        step1: "Tippe auf Teilen",
        step2: "Wähle „Zum Home-Bildschirm“ und bestätige.",
        closeAria: "Schliessen",
      },
    },

 

},

} as const;
