// src/locales/de.ts
export const de = {
  common: {
    appName: "REMI",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    close: "Schliessen",
    confirm: "Bestätigen",
    loading: "Laden...",
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
  status: "status"
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
  title: "Kopf leeren",
subtitle: "Schreib alles auf, was dir durch den Kopf geht, damit du es nicht vergisst.",
  textareaPlaceholder:
    "Z.B. E-Mail schicken, Rezept bei Mama nachfragen...",

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
     title: "Heute",
  emptyState: "Du hast heute keine Aufgaben.",
  addTask: "Aufgabe hinzufügen",
  streak: "Serie",
  menuInstallApp: "App installieren",

  greeting: "Hallo, {{name}} 👋",
  tasksToday: "Du hast {{count}} aktive Aufgaben",
  prioritize: "Lass uns nur das Wichtige priorisieren.",
  postponeDayToast: "Du hast deiner Aufgabe einen Tag hinzugefügt.",

  tabsToday: "Heute",
  tabsWeek: "Woche",
  tabsMonth: "Monat",
  tabsNext: "Bevorstehende Aufgaben",
  tabsAll: "Alle",
tabsNoDate: "Ohne Datum",

  loadingTasks: "Aufgaben werden geladen…",
  noUrgentTitle: "Heute nichts Dringendes 🎉",
  noUrgentSubtitle:
    "Nutze den + Button, um deine erste Aufgabe hinzuzufügen.",
  dueLabel: "Fällig · ",
  dueNoDate: "Kein Fälligkeitsdatum",
  errorLoadingTasks: "Fehler beim Laden deiner Aufgaben",

  pushTitle: "Aktiviere deine Erinnerungen",
  pushBody:
    "REMI kann dir Benachrichtigungen mit deinen 3 wichtigsten Aufgaben des Tages schicken und dich warnen, wenn eine fast abläuft.",
  pushEnable: "Erinnerungen aktivieren",
  pushEnabling: "Aktiviere...",
  pushLater: "Später",
  pushEnabledToast: "Benachrichtigungen für deine Aufgaben aktiviert ✨",
  pushErrorToast: "Benachrichtigungen konnten nicht aktiviert werden.",

  profileLoggedInAs: "Angemeldet als {{name}}",
  menuProfile: "Profil",
  menuShareApp: "App teilen",
  menuLogout: "Abmelden",

  shareText: "I’m using Remi to get tasks and ideas out of my head, and my mind feels so much clearer and less stressed.\nI definitely recommend trying it, it really helps. Here’s the link. 🙂",
  shareCopied: "Link in die Zwischenablage kopiert",

  defaultUserName: "Benutzer",
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
          "Hol alles aus deinem Kopf heraus, was dich beschäftigt: große und kleine Aufgaben, Erledigungen, Ideen, Dinge, die du nicht vergessen willst. Remi speichert sie und bringt sie genau dann zurück, wenn du sie brauchst.",
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
      "Immer wenn dir etwas in den Sinn kommt – eine Aufgabe, eine Idee, ein Erledigung –, schreibst du es in Remi. Ohne groß nachzudenken: einfach notieren und weitermachen.",

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
    feature3: "Funktioniert gleichermaßen gut für Aufgaben und Ideen",
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
},

} as const;
