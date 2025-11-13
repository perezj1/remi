import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "es" | "en" | "de";

const DICTIONARY = {
  es: {
    app_name: "REMI",
    home: "Inicio",
    goals: "Objetivos",
    profile: "Perfil",
    growth: "Crecimiento",
    complete: "Completar",
    skip: "Omitir",
    no_tasks_title: "No tienes tareas activas",
    no_tasks_desc: "Selecciona algunas categorías en configuración para comenzar",
    go_settings: "Ir a configuración",
    all_done_title: "¡Todo listo por hoy!",
    all_done_desc: "No hay más tareas por hoy, toma un descanso y mañana continuaremos mejorando o elige un nuevo objetivo que quieras mejorar",
    task_completed: "¡Tarea completada! 🎉",
    task_skipped: "Tarea omitida",
    error_complete: "Error al completar la tarea",
    error_skip: "Error al omitir la tarea",
    error_loading_tasks: "Error al cargar las tareas",
    interact_hint: "Desliza izquierda/derecha para navegar entre tareas",
    my_goals: "Mis Objetivos",
    manage_goals: "Gestiona tus Objetivos",
    manage_goals_desc: "Activa o desactiva los objetivos que quieres trabajar",
    my_progress: "Mi Progreso",
    total_xp: "XP Total",
    max_streak: "Racha Máxima",
    completed_challenges: "Tareas Completadas",
    active_goals: "Objetivos Activos",
    completion_rate: "Tasa de Finalización",
    categories: "Categorías",
    user_info: "Información del usuario",
    username: "Nombre de usuario",
    enter_username: "Ingresa tu nombre de usuario",
    email: "Correo electrónico",
    member_since: "Miembro desde",
    save_changes: "Guardar cambios",
    saving: "Guardando...",
    profile_updated: "Perfil actualizado correctamente",
    error_loading_profile: "Error al cargar el perfil",
    error_updating_profile: "Error al actualizar el perfil",
    account_actions: "Acciones de cuenta",
    logout: "Cerrar sesión",
    overall_progress: "Progreso general",
    progress_by_category: "Progreso por categoría",
    of: "de",
    settings: "Configuración",
    notifications: "Notificaciones",
    notifications_desc: "Gestiona tus preferencias de notificaciones",
    daily_reminders: "Recordatorios diarios",
    daily_reminders_desc: "Recibe 2-3 notificaciones al día para completar tareas",
    notifications_enabled: "Notificaciones activadas",
    notifications_disabled: "Notificaciones desactivadas",
    error_loading_settings: "Error al cargar configuración",
    error_updating_settings: "Error al actualizar configuración",
    active_categories: "Categorías activas",
    active_categories_desc: "Selecciona las categorías que quieres ver",
    language: "Idioma",
    level: "Nivel",
    streak: "Racha",
    hearts: "Corazones",
    days: "días",
    share_app: "Compartir App",
    share_message: "¡Únete a mí en REMI! Una app que te ayuda a alcanzar tus objetivos con gamificación. 🎯",
    rewards_unlocked: "Recompensas desbloqueadas",
    achievements: "Logros"
  },
  en: {
    app_name: "REMI",
    home: "Home",
    goals: "Goals",
    profile: "Profile",
    growth: "Growth",
    complete: "Complete",
    skip: "Skip",
    no_tasks_title: "No active tasks",
    no_tasks_desc: "Select some categories in settings to get started",
    go_settings: "Go to settings",
    all_done_title: "All done for today!",
    all_done_desc: "No more tasks for today, take a break and tomorrow we'll continue improving or choose a new goal you want to work on",
    task_completed: "Task completed! 🎉",
    task_skipped: "Task skipped",
    error_complete: "Error completing task",
    error_skip: "Error skipping task",
    error_loading_tasks: "Error loading tasks",
    interact_hint: "Swipe left/right to navigate between tasks",
    my_goals: "My Goals",
    manage_goals: "Manage Your Goals",
    manage_goals_desc: "Enable or disable the goals you want to work on",
    my_progress: "My Progress",
    total_xp: "Total XP",
    max_streak: "Max Streak",
    completed_challenges: "Completed Tasks",
    active_goals: "Active Goals",
    completion_rate: "Completion Rate",
    categories: "Categories",
    user_info: "User Information",
    username: "Username",
    enter_username: "Enter your username",
    email: "Email",
    member_since: "Member since",
    save_changes: "Save changes",
    saving: "Saving...",
    profile_updated: "Profile updated successfully",
    error_loading_profile: "Error loading profile",
    error_updating_profile: "Error updating profile",
    account_actions: "Account Actions",
    logout: "Logout",
    overall_progress: "Overall Progress",
    progress_by_category: "Progress by category",
    of: "of",
    settings: "Settings",
    notifications: "Notifications",
    notifications_desc: "Manage your notification preferences",
    daily_reminders: "Daily reminders",
    daily_reminders_desc: "Receive 2-3 notifications per day to complete tasks",
    notifications_enabled: "Notifications enabled",
    notifications_disabled: "Notifications disabled",
    error_loading_settings: "Error loading settings",
    error_updating_settings: "Error updating settings",
    active_categories: "Active categories",
    active_categories_desc: "Select the categories you want to see",
    language: "Language",
    level: "Level",
    streak: "Streak",
    hearts: "Hearts",
    days: "days",
    share_app: "Share App",
    share_message: "Join me on REMI! An app that helps you achieve your goals with gamification. 🎯",
    rewards_unlocked: "Rewards unlocked",
    achievements: "Achievements"
  },
  de: {
    app_name: "REMI",
    home: "Startseite",
    goals: "Ziele",
    profile: "Profil",
    growth: "Wachstum",
    complete: "Abschliessen",
    skip: "Überspringen",
    no_tasks_title: "Keine aktiven Aufgaben",
    no_tasks_desc: "Waehle einige Kategorien in den Einstellungen aus, um zu beginnen",
    go_settings: "Zu den Einstellungen",
    all_done_title: "Alles geschafft fuer heute!",
    all_done_desc: "Keine weiteren Aufgaben fuer heute, mach eine Pause und morgen machen wir weiter mit der Verbesserung oder waehle ein neues Ziel, an dem du arbeiten moechtest",
    task_completed: "Aufgabe erledigt! 🎉",
    task_skipped: "Aufgabe uebersprungen",
    error_complete: "Fehler beim Abschliessen der Aufgabe",
    error_skip: "Fehler beim Ueberspringen der Aufgabe",
    interact_hint: "Wische links/rechts, um zwischen Aufgaben zu navigieren",
    my_goals: "Meine Ziele",
    manage_goals: "Verwalte deine Ziele",
    manage_goals_desc: "Aktiviere oder deaktiviere die Ziele, an denen du arbeiten möchtest",
    my_progress: "Mein Fortschritt",
    total_xp: "Gesamt XP",
    max_streak: "Maximale Serie",
    completed_challenges: "Abgeschlossene Aufgaben",
    active_goals: "Aktive Ziele",
    completion_rate: "Abschlussrate",
    categories: "Kategorien",
    user_info: "Benutzerinformationen",
    username: "Benutzername",
    enter_username: "Gib deinen Benutzernamen ein",
    email: "E-Mail",
    member_since: "Mitglied seit",
    save_changes: "Änderungen speichern",
    saving: "Speichern...",
    profile_updated: "Profil erfolgreich aktualisiert",
    error_loading_profile: "Fehler beim Laden des Profils",
    error_updating_profile: "Fehler beim Aktualisieren des Profils",
    account_actions: "Kontoaktionen",
    logout: "Abmelden",
    overall_progress: "Gesamtfortschritt",
    progress_by_category: "Fortschritt nach Kategorie",
    of: "von",
    settings: "Einstellungen",
    notifications: "Benachrichtigungen",
    notifications_desc: "Verwalte deine Benachrichtigungseinstellungen",
    daily_reminders: "Tägliche Erinnerungen",
    daily_reminders_desc: "Erhalte 2-3 Benachrichtigungen pro Tag",
    notifications_enabled: "Benachrichtigungen aktiviert",
    notifications_disabled: "Benachrichtigungen deaktiviert",
    error_loading_settings: "Fehler beim Laden der Einstellungen",
    error_updating_settings: "Fehler beim Aktualisieren der Einstellungen",
    active_categories: "Aktive Kategorien",
    active_categories_desc: "Wähle die Kategorien, die du sehen möchtest",
    language: "Sprache",
    level: "Stufe",
    streak: "Serie",
    hearts: "Herzen",
    days: "Tage",
    share_app: "App teilen",
    share_message: "Begleite mich bei REMI! Eine App, die dir hilft, deine Ziele mit Gamification zu erreichen. 🎯",
    rewards_unlocked: "Belohnungen freigeschaltet",
    achievements: "Erfolge",
    error_loading_tasks: "Fehler beim Laden der Aufgaben"
  }
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  cycle: () => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved) setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };

  const t = useMemo(() => {
    return (key: string) => (DICTIONARY[locale] as Record<string, string>)[key] ?? key;
  }, [locale]);

  const cycle = () => {
    const order: Locale[] = ["es", "en", "de"];
    const idx = order.indexOf(locale);
    setLocale(order[(idx + 1) % order.length]);
  };

  const value = useMemo(() => ({ locale, setLocale, t, cycle }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
