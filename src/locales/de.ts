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
  nav: {
    today: "Heute",
    inbox: "Posteingang",
    ideas: "Ideen",
    profile: "Profil",
  },

  bottomNav: {
  today: "Heute",
  inbox: "Posteingang",
},


  capture: {
  title: "Kopf leeren",
  subtitle:
    "Schreibe auf, was dir im Kopf herumgeht, und entscheide, ob es eine Aufgabe oder eine Idee ist.",
  textareaPlaceholder:
    "Z.B. E-Mail schicken, Rezept bei Mama nachfragen...",

  ideaButton: "Es ist eine Idee",
  taskButton: "Es ist eine Aufgabe",

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
  tasksToday: "Du hast heute {{count}} Aufgaben",
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
