// src/locales/de.ts
export const de = {
  common: {
    appName: "REMI",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    close: "Schließen",
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
  close: "Schließen",
},


status: {
    back: "Zurück",
    headerTitle: "Remis Status",
    headerSubtitle:
      "Heute haben wir deinem Kopf geholfen, sich ein bisschen leichter zu fühlen.",

    helperLabel: "Dein Gedächtnishelfer",
    helperFallback:
      "Ich bin hier, um deine Aufgaben, Ideen und Erinnerungen zu speichern, damit dein Kopf nicht alles tragen muss.",

    mindClearLabel: "Klarer Kopf",
    mindClearDescription:
      "Alles, was du in Remi speicherst, ist eine Sache weniger, die dein Kopf festhalten muss.",

    todaySectionTitle: "Was wir heute geschafft haben",
    todaySectionSubtitle:
      "Eine kurze Übersicht, wie wir in den letzten Stunden auf deinen Kopf aufgepasst haben.",
    todayTasksLabel: "Heutige Aufgaben",
    todayTasksDescription:
      "Heute haben wir {{todayTotal}} Aufgaben organisiert, damit sie nicht nur von deinem Gedächtnis abhängen.",

    streakSectionTitle: "Unsere Serie",
    streakValue: "{{streakDays}} Tage",
    streakDescription:
      "Seit {{streakDays}} Tagen kümmern wir uns gemeinsam um deine Aufgaben, damit dein Kopf sich nicht alles alleine merken muss.",

    memoryDelegatedTitle: "Ausgelagertes Gedächtnis",
    memoryDelegatedValue: "{{tasks}} Aufgaben · {{ideas}} Ideen",
    memoryDelegatedDescription:
      "Im Moment kümmert sich Remi um {{tasks}} Aufgaben und {{ideas}} Ideen für dich. Dein Kopf muss sie nicht alle gleichzeitig behalten.",

    weekSectionTitle: "Unsere Woche",
    weekSectionSubtitle:
      "An jedem Tag, an dem du Remi benutzt, trägt dein Kopf ein kleines bisschen weniger Last.",
    weekActiveLabel: "Aktive Tage diese Woche",

    loading: "Deine Übersicht mit Remi wird aktualisiert…",

    // Moods
    moodTitleCelebrate: "Großartiges Team!",
    moodTitleHappy: "Heute läuft es richtig gut",
    moodTitleCalm: "Alles unter Kontrolle",
    moodTitleWaiting: "Ich bin bereit, wenn du es bist",
    moodTitleConcerned: "Gehen wir Schritt für Schritt",
    moodTitleDefault: "Wir stecken gemeinsam drin",

    moodSubtitleCelebrate:
      "In diesen Tagen kümmern wir uns besonders gut um deinen Kopf. Wir haben {{cleared}} heutige Aufgaben entlastet und Remi hält insgesamt {{totalItems}} Dinge zwischen Aufgaben und Ideen für dich fest.",
    moodSubtitleHappy:
      "Heute haben wir deinen Kopf gut freigeräumt: Du hast {{todayTotal}} organisierte Aufgaben und {{todayDone}} davon sind schon erledigt.",
    moodSubtitleCalm:
      "Wir gehen ohne Eile voran. Für heute sind {{todayTotal}} Aufgaben gespeichert und Remi erinnert sich für dich daran.",
    moodSubtitleWaiting:
      "Heute fühlt sich dein Kopf leicht an. Wenn du möchtest, können wir noch ein paar Dinge in Remi abladen, damit du sie dir nicht selbst merken musst.",
    moodSubtitleConcerned:
      "Es liegt noch ein Stück Tag vor dir. Wir können mit einer kleinen Aufgabe beginnen und deinem Kopf etwas mehr Luft verschaffen.",
    moodSubtitleDefault:
      "Alles, was du in Remi ablegst, ist eine Sache weniger, die dein Kopf tragen muss.",
  },


  capture: {
  title: "Kopf leeren",
  subtitle:
    "Schreibe auf, was dir im Kopf herumgeht, und entscheide, ob es eine Aufgabe oder eine Idee ist.",
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

  greeting: "Hallo, {{name}} 👋",
  tasksToday: "Du hast {{count}} aktive Aufgaben",
  prioritize: "Lass uns nur das Wichtige priorisieren.",

  tabsToday: "Heute",
  tabsWeek: "Woche",
  tabsMonth: "Monat",

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

  shareText:
    "Ich probiere REMI aus, um meine täglichen Aufgaben zu organisieren 🙂",
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

  shareText:
    "Ich benutze REMI, um meine täglichen Aufgaben zu organisieren 🚀",
  shareCopied: "REMI-Link in die Zwischenablage kopiert",

  defaultUserName: "Benutzer",

  avatarTooBig: "Das Bild darf maximal 2 MB groß sein.",
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
} as const;
