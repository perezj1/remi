// src/locales/es.ts
export const es = {

  repeat: {
   label: "Hábito",
  help: "Convierte esta tarea en un hábito que Remi te recordará siempre a la hora elegida.",
 
  options: {
    daily: "Diario",
    weekly: "Semanal",
    monthly: "Mensual",
    yearly: "Anual",
  },
},



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
  repeatOn: "Activado",
  repeatOff: "Desactivado",
  remindersDisabledByHabit:"Los hábitos crean recordatorios propios usando la fecha y hora seleccionadas.",
  timeHour: "Hora",
  timeMinute: "Minutos",
  dateTimeLabel: "Fecha y hora",
    dateTimeNoneShort: "Sin fecha ni hora",

  title: "Vaciar la cabeza",
subtitle: "Escribe todo lo que tengas en mente para no olvidarlo.",
  textareaPlaceholder: "Ej: Recuerdame comprar regalo de cumpleaños antes del 12 de Diciembre a las 13:00, Ver la serie recomendada por mis amigos...",

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
    subtitleAuth2:"From MIND FULL to MINDFUL" ,
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
  menuInstallApp: "Instalar app",

  greeting: "Hola, {{name}} 👋",
  tasksToday: "Tienes {{count}} tareas activas",
  prioritize: "Prioricemos solo lo importante.",
  postponeDayToast: "Has añadido un día más a tu tarea.",
  
  tabsNext: "Próximas tareas",
  tabsToday: "Hoy",
  tabsWeek: "Semana",
  tabsMonth: "Mes",
  tabsAll: "Todo",
  tabsNoDate: "Sin Fecha",

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

  shareText: "I’m using Remi to get tasks and ideas out of my head, and my mind feels so much clearer and less stressed.\nI definitely recommend trying it, it really helps. Here’s the link. 🙂",
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

  shareText: "I’m using Remi to get tasks and ideas out of my head, and my mind feels so much clearer and less stressed.\nI definitely recommend trying it, it really helps. Here’s the link. 🙂",
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


landing: {
    hero: {
      badge: "Tu memoria externa",
      shareButtonLabel: "Comparte Remi",
      shareText:
        "Estoy usando Remi para organizar todo lo que antes llevaba en la cabeza y he reducido mucho el estrés y la carga mental. Te paso el enlace:",
      shareCopied: "Enlace de Remi copiado al portapapeles.",
      title: {
        part1: "Recuerda todo sin",
        highlighted: "estrés mental",
      },
      description:
        "Saca de tu cabeza tareas, ideas y recordatorios para que puedas concentrarte en lo que realmente importa. Remi se encarga de que recuerdes lo necesario en el momento justo.",
      ctaPrimary: "Empezar ahora",
      ctaSecondary: "Ver cómo funciona",
      userStatsHighlight: "Quienes usan Remi",
      userStats:
        "dicen que se sienten más ligeros y con mucha menos carga mental.",
    },

    features: {
      title: {
        part1: "Diseñado para",
        highlighted: "liberar tu mente",
      },
      subtitle:
        "Remi combina recordatorios inteligentes, gestión temporal y una captura rápida para que tu cabeza deje de ser tu lista de tareas.",

      items: {
        reminders: {
          title: "Recordatorios personalizados",
          description:
            "Establece la frecuencia que necesites: diaria, semanal, mensual o personalizada. Remi se adapta a tu ritmo. Solo lo importante, en el momento adecuado.",
        },
        temporal: {
          title: "Control temporal",
          description:
            "Define hasta cuándo quieres recordar cada cosa. Nada de recordatorios eternos. Tu 'yo' del futuro te lo agradecerá.",
        },
        mentalLoad: {
          title: "Carga mental bajo control",
          description:
            "Saca de la cabeza todo lo que te ronda: tareas grandes o pequeñas, recados, ideas, cosas que no quieres olvidar. Remi las guarda y te las devuelve justo cuando las necesitas.",
             
        },

        quickCapture: {
          title: "Captura ultra rápida",
          description:
            "Anota una idea o tarea en un momento, sin menús complicados. Abrir, escribir y listo. El resto lo organiza Remi.",
        },
      },
    },

    mentalLoad: {
      cardTitle: "Estado de tu mente hoy",
      cardDate: "Hoy",
      cardStatus: "Mente más despejada",

      example1: "Facturas importantes apuntadas",
      example1Freq: "Cada mes",
      example2: "Regalos de cumpleaños planificados",
      example2Freq: "A lo largo del año",
      example3: "Tareas del día organizadas",
      example3Freq: "Cada mañana",
       badge: "Tu memoria externa",
            headline: "Hoy vamos genial",
            subheadline:
              "Hoy hemos despejado bastante tu mente: tienes 5 tareas organizadas y 3 de ellas ya están hechas.",
            clearMindLabel: "Mente despejada",
            clearMindHelper:
              "Cada cosa que guardas en Remi es una cosa menos que carga tu mente.",
        

      title: {
        part1: "Tu mente es para crear,",
        highlighted: "Remi es para recordar",
      },
      description:
"Usamos la mente como lista de tareas, agenda, gestión del hogar y memoria de cosas pendientes. Eso genera estrés y sensación de carga mental constante. Remi te ayuda a vaciar esa carga de forma fácil y rápida en un sitio externo, claro y fiable para que puedas dedicar tu atención a lo que de verdad importa.",
      step1Title: "Sácalo todo de tu cabeza",
      step1Description:
        "Cada vez que algo te venga a la mente —una tarea, una idea, un recado— lo apuntas en Remi. Sin pensarlo mucho, solo escríbelo y sigue con lo que estabas haciendo.",

      step2Title: "Deja que Remi lo ordene contigo",
      step2Description:
        "Si es una idea, la guardas con un clic y luego puedes editarla o convertirla en tarea. \nSi es una tarea, eliges fecha límite y cómo quieres que Remi te la recuerde, rápido y sin tener que volver a tocarla.",

      step3Title: "Vuelve a tener la cabeza despejada",
      step3Description:
        "Tu mente deja de ser almacén y vuelve a ser lo que debería: un espacio para pensar, crear y estar presente, sin miedo a olvidar nada importante.",
    },

    cta: {
      badge: "Empieza con algo pequeño hoy",
      title: {
        part1: "Construye poco a poco una mente más",
        highlighted: "ligera y tranquila",
      },
      description:
        "No hace falta cambiar tu vida entera. Solo sacar de tu cabeza lo que antes cargabas dentro. Remi no te obliga a hacer nada en un momento concreto: Remi te lo recuerda a tiempo para que tú decidas cuándo te viene mejor hacerlo sin que se te olvide.",

      ctaPrimary: "Probar Remi ahora",
      ctaSecondary: "Seguir leyendo primero",

      feature1: "Totalmente gratis",
      feature2: "Diseñado para todo tipo de personas y mentes",
      feature3: "Funciona igual de bien para tareas e ideas",
    },

    footer: {
      description:
        "Remi es tu memoria externa de confianza para todas esas cosas que no quieres olvidar, pero tampoco quieres llevar en la cabeza todo el día.",

      product: "Producto",
      productLinks: {
        features: "Características",
        pricing: "Precios",
        useCases: "Casos de uso",
        roadmap: "Hoja de ruta",
      },

      company: "Compañía",
      companyLinks: {
        about: "Sobre Remi",
        blog: "Blog",
        careers: "Trabaja con nosotros",
        contact: "Contacto",
      },

      legal: "Legal",
      legalLinks: {
        privacy: "Política de privacidad",
        terms: "Términos de uso",
        cookies: "Cookies",
        licenses: "Licencias",
      },

      copyright: "© Remi 2025. Todos los derechos reservados.",
    },

  

  },

  

} as const;