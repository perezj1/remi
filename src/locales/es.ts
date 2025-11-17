// src/locales/es.ts
export const es = {


  common: {
    appName: "REMI",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    confirm: "Confirmar",
    loading: "Cargando...",
  },

  nav: {
    today: "Hoy",
    inbox: "Bandeja",
    ideas: "Ideas",
    profile: "Perfil",
  },

  bottomNav: {
  today: "Hoy",
  inbox: "Bandeja",
},


capture: {
  title: "Vaciar la cabeza",
  subtitle: "Escribe lo que tengas en mente y decide si es tarea o idea.",
  textareaPlaceholder: "Ej: Enviar el email, preguntar receta a mamá...",

  ideaButton: "Es una idea",
  taskButton: "Es una tarea",

  dueLabel: "Fecha límite",
  dueToday: "Hoy",
  dueTomorrow: "Mañana",
  dueWeek: "1 semana",
  dueNone: "Sin fecha",
  dueHint: "Puedes ajustar la fecha y hora manualmente.",

  remindersLabel: "Recordatorios",
  remindersNone: "Sin recordatorios",
  remindersOnDue: "Solo el día límite",
  remindersDayBeforeAndDue: "Día antes y día límite",
  remindersDailyUntilDue: "Cada día hasta la fecha límite",

  back: "Atrás",
  saveTask: "Guardar tarea",

  toastTaskSaved: "Tarea guardada correctamente",
  toastTaskError: "Error al crear la tarea",
  toastIdeaSaved: "Idea guardada correctamente",
  toastIdeaError: "Error al crear la idea",
},


  auth: {
    titleLogin: "Inicia sesión en REMI",
    titleRegister: "Crea tu cuenta en REMI",
    email: "Correo electrónico",
    password: "Contraseña",
    login: "Entrar",
    register: "Registrarse",
    logout: "Cerrar sesión",
     loginTitle: "¡Bienvenido de vuelta!",
  registerTitle: "¡Comienza tu viaje!",
  loginSubtitle: "Continúa mejorando cada día con REMI",
  registerSubtitle: "Crea tu cuenta y comienza a lograr tus objetivos",
  emailLabel: "Email",
  emailPlaceholder: "tu@email.com",
  passwordLabel: "Contraseña",
  passwordPlaceholder: "••••••••",
  submitLogin: "Iniciar sesión",
  submitRegister: "Crear cuenta",
  toggleToRegister: "¿No tienes cuenta? Regístrate",
  toggleToLogin: "¿Ya tienes cuenta? Inicia sesión",

  errorInvalidCredentials:
    "Credenciales incorrectas. Verifica tu email y contraseña.",
  errorUserAlreadyRegistered:
    "Este email ya está registrado. Intenta iniciar sesión.",
  errorGeneric: "Ha ocurrido un error. Intenta de nuevo.",
  signUpSuccess: "¡Cuenta creada! Ahora empieza a liberar tu mente.",
  },

  today: {
  title: "Hoy",
  emptyState: "No tienes tareas para hoy.",
  addTask: "Añadir tarea",
  streak: "Racha",

  greeting: "Hola, {{name}} 👋",
  tasksToday: "Tienes {{count}} tareas hoy",
  prioritize: "Prioricemos solo lo importante.",

  tabsToday: "Hoy",
  tabsWeek: "Semana",
  tabsMonth: "Mes",

  loadingTasks: "Cargando tareas…",
  noUrgentTitle: "Nada urgente por hoy 🎉",
  noUrgentSubtitle: "Usa el botón + para añadir tu primera tarea.",
  dueLabel: "Fecha límite · ",
  dueNoDate: "Sin fecha límite",
  errorLoadingTasks: "Error cargando tus tareas",

  pushTitle: "Activa tus recordatorios",
  pushBody:
    "REMI puede enviarte notificaciones con tus 3 tareas más importantes del día y avisarte cuando una está a punto de terminar.",
  pushEnable: "Activar recordatorios",
  pushEnabling: "Activando...",
  pushLater: "Más tarde",
  pushEnabledToast: "Notificaciones activadas para tus tareas ✨",
  pushErrorToast: "No se pudieron activar las notificaciones.",

  profileLoggedInAs: "Sesión iniciada como {{name}}",
  menuProfile: "Perfil",
  menuShareApp: "Compartir app",
  menuLogout: "Cerrar sesión",

  shareText: "Estoy probando REMI para organizar mis tareas diarias 🙂",
  shareCopied: "Enlace copiado al portapapeles",

  defaultUserName: "Usuario",
  },

  inbox: {
    title: "Bandeja de entrada",
    tasksTab: "Tareas",
    ideasTab: "Ideas",
    allTab: "Todo",
    statusDone: "Hecha",
    statusActive: "Activa",
    statusArchived: "Archivada",    
  subtitle: "Todo lo que has vaciado de tu cabeza aparece aquí.",
  itemsCount: "{{count}} ítems",
  loading: "Cargando bandeja…",
  emptyTitle: "Bandeja vacía",
  emptySubtitle:
    "Añade nuevas tareas o ideas desde la pantalla de Hoy.",

  itemTaskPrefix: "Tarea · ",
  itemIdeaPrefix: "Idea · ",
  errorLoading: "Error cargando tu bandeja",
  errorUpdating: "Error actualizando tu bandeja",
  },

  ideas: {
    title: "Ideas",
    emptyState: "Apunta aquí tus ideas para despejar la mente.",    
  subtitle: "Todas las ideas que no quieres perder están guardadas aquí.",
  loading: "Cargando ideas…",
  emptyTitle: "Sin ideas todavía",
  emptySubtitle:
    "Usa el botón + en la pantalla de Hoy para guardar tus ideas.",
  savedAt: "Guardada el {{date}}",
  errorLoading: "Error cargando tus ideas",
  },

  profile: {
    title: "Perfil",
    username: "Nombre de usuario",
    email: "Correo",
    language: "Idioma",
    notifications: "Notificaciones",
    notificationsOn: "Activadas",
    notificationsOff: "Desactivadas",
    changeAvatar: "Cambiar avatar",
    save: "Guardar cambios",
    shareProfile: "Compartir perfil",
    logout: "Cerrar sesión",
    toastSaved: "Perfil actualizado correctamente.",
    toastError: "No se pudo guardar el perfil.",
    
  back: "Perfil",
  memberSince: "Miembro desde {{date}}",

  sectionUserTitle: "Información de usuario",
  sectionUserDescription: "Edita tus datos básicos y cómo se muestra REMI.",

  usernameLabel: "Nombre de usuario",
  usernamePlaceholder: "Tu nombre en REMI",

  emailLabel: "Email",
  emailPlaceholder: "tu@email.com",

  passwordLabel: "Nueva contraseña",
  passwordPlaceholder: "Déjalo vacío si no quieres cambiarla",

  languageLabel: "Idioma",
  languageSpanish: "🇪🇸 Español",
  languageEnglish: "🇬🇧 Inglés",
  languageGerman: "🇩🇪 Alemán",

  notificationsLabel: "Notificaciones",
  notificationsDescription: "Recordatorios para tareas importantes.",

  saving: "Guardando...",
  saveChanges: "Guardar cambios",

  sectionAccountTitle: "Acciones de la cuenta",
  sectionAccountDescription:
    "Comparte REMI o cierra sesión en este dispositivo.",

  shareButton: "Compartir app",
  logoutButton: "Cerrar sesión",

  shareText: "Estoy usando REMI para organizar mis tareas diarias 🚀",
  shareCopied: "Enlace de REMI copiado al portapapeles",

  defaultUserName: "Usuario",

  avatarTooBig: "La imagen debe pesar menos de 2 MB.",
  avatarUploadError: "No se pudo subir la imagen. Intenta de nuevo.",
  passwordTooShort:
    "La nueva contraseña debe tener al menos 6 caracteres.",
  authUpdateError: "No se pudo actualizar email/contraseña.",
  updateSuccess: "Perfil actualizado correctamente.",
  updateError: "No se pudieron guardar los cambios.",
  logoutError: "No se pudo cerrar sesión. Intenta de nuevo.",
  },

  notifications: {
    dailyReminderTitle: "Tu mente está llena",
    dailyReminderBody:
      "Revisa tus tareas de hoy en REMI y descarga tu cabeza.",
    dueTodayTitle: "Tienes tareas para hoy",
    dueTodayBody: "Abre REMI para ver lo que tienes pendiente.",
  },
} as const;
