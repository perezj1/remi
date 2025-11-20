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

  index: {
  clearMind: "Mente despejada",
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
  status: "status"
},

installPrompt: {
  iosTitle: "Instala Remi en tu iPhone - GRATIS",
  iosStep1BeforeShare: "1. Pulsa el botón",
  iosShareLabel: "Compartir",
  iosStep1AfterShare: ".",
  iosStep2BeforeAction: "2. Elige",
  iosAddToHome: "Añadir a pantalla de inicio",
  iosStep2AfterAction: "y confirma.",
  defaultTitle: "Instala Remi",
  defaultDescription: "Añade Remi a tu lista de aplicaciones — ¡GRATIS!",
  buttonInstall: "Instalar",
  close: "Cerrar",
},


status: {
    back: "Volver",
    headerTitle: "Estado de Remi",
    headerSubtitle: "Hemos ayudado a tu mente a estar un poco más ligera hoy.",

    helperLabel: "Tu memoria externa",
    helperFallback:
      "Estoy aquí para guardar tus tareas, ideas y recordatorios, para que tu mente no tenga que cargar con todo.",

    mindClearLabel: "Mente despejada",
    mindClearDescription:
      "Cada cosa que guardas en Remi es una cosa menos que carga tu mente.",

    todaySectionTitle: "Lo que hemos conseguido",
    todaySectionSubtitle:
      "Resumen de cómo estamos cuidando tu mente.",
    todayTasksLabel: "Tareas de hoy",
    todayTasksDescription:
      "Hoy hemos organizado {{todayTotal}} tareas.",

    streakSectionTitle: "Nuestra racha",
    streakValue: "{{streakDays}} días",
    streakDescription:
      "Llevamos {{streakDays}} días sin que tu mente tenga que recordarlo todo sola.",

    memoryDelegatedTitle: "Memoria delegada",
    memoryDelegatedValue: "{{tasks}} tareas · {{ideas}} ideas",
    memoryDelegatedDescription:
      "Ahora mismo Remi está cuidando de {{tasks}} tareas y {{ideas}} ideas.",

    weekSectionTitle: "Nuestra semana",
    weekSectionSubtitle:
      "Cada día que usas Remi, tu cabeza tiene un poco menos de carga.",
    weekActiveLabel: "Días activos esta semana",

    loading: "Actualizando tu resumen con Remi…",

    // Moods
    moodTitleCelebrate: "¡Equipo increíble!",
    moodTitleHappy: "Hoy vamos genial",
    moodTitleCalm: "Todo bajo control",
    moodTitleWaiting: "Estoy listo",
    moodTitleConcerned: "Vamos poco a poco",
    moodTitleDefault: "Estamos en esto juntos",

    moodSubtitleCelebrate:
      "Estos días estamos cuidando muy bien tu cabeza. Hemos descargado {{cleared}} tareas de hoy y Remi tiene guardadas {{totalItems}} cosas en total entre tareas e ideas.",
    moodSubtitleHappy:
      "Hoy hemos despejado bastante tu mente: tienes {{todayTotal}} tareas organizadas y {{todayDone}} de ellas ya están hechas.",
    moodSubtitleCalm:
      "Vamos avanzando sin prisa. Tenemos {{todayTotal}} tareas guardadas para hoy y Remi se encarga de acordarse por ti.",
    moodSubtitleWaiting:
      "Hoy tu mente está ligera pero podemos descargar alguna cosa más en Remi para que no tengas que recordarla tú.",
    moodSubtitleConcerned:
      "Parece que aún queda día por delante. Podemos empezar con una tarea pequeña y dejar que tu mente respire un poco más.",
    moodSubtitleDefault:
      "Cada cosa que guardas en Remi es una cosa menos que carga tu mente.",
  },


capture: {
  title: "Vaciar la cabeza",
  subtitle: "Escribe lo que tengas en mente y decide si es tarea o idea.",
  textareaPlaceholder: "Ej: Enviar el email, preguntar receta a mamá...",

  ideaButton: "Idea",
  taskButton: "Tarea",

  dueLabel: "Fecha límite",
  dueToday: "Hoy",
  dueTomorrow: "Mañana",
  dueWeek: "1 semana",
  dueNone: "Sin fecha",
  dueHint: "Puedes ajustar la fecha y hora manualmente.",
  duePlaceholder: "Elegir fecha y hora",

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
  tasksToday: "Tienes {{count}} tareas activas",
  prioritize: "Prioricemos solo lo importante.",
  postponeDayToast: "Has añadido un día más a tu tarea.",
  
  tabsNext: "Próximas tareas",
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
  sectionToday: "Hoy",
  sectionTomorrow: "Mañana",
  sectionNoDate: "Sin fecha",
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
  updateError: "No se ha podido actualizar la idea.",
    convertError: "No se ha podido convertir la idea en tarea.",

    editLabel: "Editar idea",
    editTitle: "Convierte esta idea en algo accionable",
    editSubtitle:
      "Mejora el texto o conviértela en una tarea con fecha y recordatorio.",

    fieldTitle: "Texto de la idea",
    fieldTitlePlaceholder: "Ej: comprar zapatos nuevos para la boda",

    taskOptionsTitle: "Opciones de tarea",
    dueDateLabel: "Fecha y hora límite (opcional)",
    reminderLabel: "Recordatorio",

    reminder: {
      none: "Sin recordatorio",
      onDue: "Solo el día de la fecha",
      dayBeforeAndDue: "Un día antes y el día de la fecha",
      dailyUntilDue: "Cada día hasta la fecha límite",
    },

    saveAsIdea: "Guardar como idea",
    convertToTask: "Convertir en tarea",
    confirmConvert: "Convertir en tarea ahora",

    footerHint:
      "Convertir una idea en tarea no la duplica: la idea original pasa a ser una tarea.",
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

  avatarTooBig: "La imagen debe pesar menos de 5 MB.",
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
