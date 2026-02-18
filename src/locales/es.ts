// src/locales/es.ts
export const es = {
  repeat: {
    label: "Repetición",
    help:
      "Convierte esta tarea en un hábito que Remi te recordará siempre a la hora elegida.",

    options: {
      daily: "Diario",
      weekly: "Semanal",
      monthly: "Mensual",
      yearly: "Anual",
    },
  },

  shareInvite: {
    share: "Compartir",
    sharedOk: "Listo. Enlace copiado/compartido.",
    sharedError: "No se pudo compartir. Inténtalo de nuevo.",
    message: "{{name}} quiere que recuerdes: {{text}}",

    pageTitle: "Añadir a Remi",
    pageSubtitle: "Guarda este recordatorio en tu cuenta.",
    loading: "Cargando…",
    invalidLinkTitle: "Enlace no válido",
    goHome: "Volver al inicio",
    someone: "Alguien",

    due: "Fecha",
    acceptCta: "Añadir a Remi",
    accepting: "Añadiendo…",
    acceptError: "No se pudo añadir. Inténtalo de nuevo.",
    alreadyAccepted: "Este enlace ya se ha usado.",
    expired: "Este enlace ha caducado.",
    rejected: "Este enlace fue rechazado.",
    openRemi: "Abrir Remi",
    missingToken: "Falta el token del enlace.",
    loadError: "No se pudo cargar el enlace.",
    loginHint:
      "Si no has iniciado sesión, te pediremos entrar o crear una cuenta para poder añadirlo.",
    sentIndicator: "Tarea compartida",
    messageLine1: "{{name}} quiere que recuerdes:",
  },

  mentalDump: {
    whyLabel: "Por qué:",
    detectedLabel: "Detectado:",
    detectedManual: "Manual",
    detectedDash: "—",
    habitDetectedLabel: "Hábito detectado:",
    detectedDefault: "Por defecto",
    habitLabel: "Repetición",
    habitOn: "On",
    habitOff: "Off",

    detectedReminder: {
      DAY_BEFORE_AND_DUE:
        "Detecté \"{word}\" → lo marqué como: día antes + día límite.",
      DAILY_UNTIL_DUE:
        "Detecté \"{word}\" → lo marqué como: diario hasta la fecha límite.",
      WEEK_BEFORE_AND_DUE:
        "Detecté \"{word}\" → lo marqué como: 1 semana antes + día límite.",
    },

    why: {
      verbTask: "Detecté \"{word}\" → lo marqué como tarea.",
      prefixIdea: "Detecté \"{word}\" → lo marqué como idea.",
      projectIdea: "Suena a idea/proyecto → lo marqué como idea.",
      defaultTask: "No vi una pista clara → lo marqué como tarea.",
      defaultIdea: "No vi una pista clara → lo marqué como idea.",
      manualTask: "Lo marcaste como tarea.",
      manualIdea: "Lo marcaste como idea.",
    },

    dateLabel: "Fecha",
    timeLabel: "Hora",
    reminderLabel: "Recordatorio",
    reminderShortLabel: "Aviso:",
    reminderOff: "Off",
    reminderDailyUntilDue: "Diaria",
    reminderDayBeforeAndDue: "1 día antes",
    reminderWeekBeforeAndDue: "1 semana antes",

    buttonLabel: "Vacía tu mente",

    title: "Descarga mental intensiva",
    description:
      "Dedica 2–3 minutos a vaciar tu cabeza. Escribe todo lo que no quieres olvidar: tareas, ideas, cosas pendientes. No hace falta organizar nada: Remi lo convierte en recordatorios por ti.",

    inputLabel: "Escribe frases sueltas, separadas por saltos de línea o comas.",
    placeholder:
      "Ejemplos:\n" +
      "Cambiar bombilla del pasillo mañana a las 10\n" +
      "Llamar a mamá el domingo\n" +
      "Todos los lunes a las 14:00 usar Remi\n" +
      "Idea viaje a Italia en primavera",

    // Textos del resumen inicial
    summaryNone: "Aún no se ha detectado ninguna frase.",
    summaryPrefix: "Se han detectado",
    summarySuffix: "posibles recordatorios en tu texto.",

    // Botones estados
    submitSaving: "Guardando...",
    submitToPreview: "Revisar recordatorios",
    submitConfirm: "Guardar en Remi",

    // Vista previa
    previewTitle: "Revisa tu descarga mental",
    previewDescription:
      "Activa o desactiva las líneas que quieras guardar, ajusta los textos y confirma para crear tareas e ideas en Remi.",
    previewNoneSelected: "No hay ningún elemento seleccionado.",
    previewTaskLabel: "Tarea",
    previewIdeaLabel: "Idea",
    previewInclude: "Guardar",
    previewBackToEdit: "Volver a editar texto",

    // Hábitos
    habitNone: "Sin Repetición",
    habitDaily: "Repetición diaria",
    habitWeekly: "Repetición semanal",
    habitMonthly: "Repetición mensual",
    habitYearly: "Repetición anual",

    // Pistas rotatorias (hints)
    /*     0: "Tu solo escribe, Remi lo ordena y agenda todo por ti para recordartelo cuando llegue el momento.",
    1: "Piensa en tu casa: cosas por arreglar, limpiar o comprar.",
    2: "Piensa en trabajo o estudios: tareas, mails, entregas que no quieres olvidar.",
    3: "Piensa en tu salud: citas médicas, dentista, revisiones o análisis.",
    4: "Piensa en personas: a quién quieres escribir, llamar o agradecer algo.",
    5: "Piensa en dinero y papeleo: facturas, bancos, suscripciones, documentos.",
    6: "Piensa en ti: hábitos, proyectos, ideas que no quieres que se pierdan.",
    7:"No hace falta escribir perfecto. Usa tu lenguaje normal: \"llamar al dentista el martes por la mañana\".", */
    hints: {
      0: "Tú solo escribe, Remi lo ordena y agenda todo por ti para recordartelo cuando llegue el momento.",
      1: "Pega o envia texto de WhatsApp, un mail o una nota. Remi lo convierte en recordatorio.",
      2: "Tareas, ideas, recados… todo entra. Remi lo ordena y te lo recuerda cuando llega el momento.",
      3: "No necesitas formato perfecto. Escribe como hablas.",
      4: "¿Te dijeron algo importante? Copia y pega. Remi lo guarda por ti.",
      5: "Escribe fechas u horas (ej: \"martes 18:00, 17 de Enero a las 15...\"). Remi las detecta.",
      6: "Escribe \"cada día / cada semana, etc\" si es un hábito repetitivo.",
      7: "Un minuto aquí = un dia mas relajado y menos cosas olvidadas.",
      8: "Consejo rápido: Escribe Idea para guardar notas sin recordatorios.",
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
    speak: "Hablar",
    paste: "Pegar",
  },

  index: {
    clearMind: "Mente despejada",
    reminders: "Recordatorios",
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
    status: "Estado",
    add: "Nuevo",
    holdToTalk: "Mantén pulsado",
    listening: "Escuchando…",
    dictationNotSupported: "Dictado no compatible",
    tasks: "Tareas",
    ideas: "Ideas",
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

    todaySectionTitle: "Lo que has conseguido",
    todaySectionSubtitle: "Resumen de cómo estamos cuidando tu mente.",
    todayTasksLabel: "Completadas hoy",
    todayTasksDescription:
      "{{todayDone}}/{{todayTotal}} tareas con fecha de hoy completadas.",

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
    mentalLoadTitle: "Balance de carga mental",
    mentalLoadSubtitle: "Capturado vs resuelto en los ?ltimos 7 d?as",
    mentalCapturedTooltip: "Capturado: {{count}}",
    mentalResolvedTooltip: "Resuelto: {{count}}",
    memoryCaptured: "Capturado",
    memoryResolved: "Resuelto",
    memoryDistributionTitle: "Distribuci?n de memoria",
    memoryDistributionSubtitle: "Qu? tipo de carga est?s delegando a Remi",
    memoryTasksLabel: "Recordatorios",
    memoryIdeasLabel: "Ideas",
    usersTitle: "Cada vez somos más cuidando nuestra mente",
    usersSubtitle: "Total de usuarios en Remi",
    usersUnavailable: "No disponible",

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
      "Vamos avanzando sin prisa. Tenemos {{todayTotal}} tareas que acaban hoy y Remi se encarga de acordarse por ti.",
    moodSubtitleWaiting:
      "Hoy tu mente está ligera pero podemos descargar alguna cosa más en Remi para que no tengas que recordarla tú.",
    moodSubtitleConcerned:
      "Parece que aún queda día por delante. Podemos empezar con una tarea pequeña y dejar que tu mente respire un poco más.",
    moodSubtitleDefault:
      "Cada cosa que guardas en Remi es una cosa menos que carga tu mente.",
  },

  capture: {
    // ✅ Keys necesarias para cubrir MODAL_I18N
    // Nota: ya existía placeholder con otro texto; aquí lo dejamos como está y añadimos modalPlaceholder
    // si tu modal usa "capture.placeholder" y necesitas el texto exacto, cambia placeholder directamente.
    modalPlaceholder: "Vacía tu mente aquí…",

    chips: {
      backHint: "Volver a atajos",
      title: "Atajos inteligentes",
      title2: "Fecha / Repetición",
      title3: "Hora",
      title4: "Recordatorio",
      back: "Atajos",
    },

    chip: {
      // ROOT: palabra que se inserta en el textarea
      buyWord: "Comprar",
      callWord: "Llamar",
      payWord: "Pagar",
      birthdayWord: "Cumpleaños",
      apptWord: "Cita",
      ideaWord: "Idea:",

      buy: "Comprar",
      call: "Llamar",
      pay: "Pagar",
      birthday: "Cumpleaños",
      appt: "Cita",
      idea: "Idea",

      // SCHEDULE
      schedule: {
        el: "el",
        cada: "cada",
        antesDel: "antes del",
        hoy: "hoy",
        manana: "mañana",

        // extras que ya tenías
        on: "el",
        every: "cada",
        before: "antes",
        today: "hoy",
        tomorrow: "mañana",
        am: "a las",
        jeden: "cada",
        vor: "antes",
        heute: "hoy",
        morgen: "mañana",
      },

      // TIME
      time: {
        prefix: "a las",
        t0900: "09:00",
        t1800: "18:00",
      },

      // REMINDER
      reminder: {
        dailyLabel: "Cada día",
        dailyInsert: "recordar cada día",
        standardLabel: "Standard",
        dayBeforeLabel: "día de antes",
        noneLabel: "Sin recordatorios",

        standardInsert: "recordar",
        dayBeforeInsert: "recordar el día de antes",
        noneInsert: "sin recordatorios",
      },
    },

    tips: {
      0: "Consejo: Di o escribe \"idea\" para crear notas sin recordatorio",
      1: "Consejo: Puedes pegar texto de otras aplicaciones",
      2: "Consejo: No te preocupes por el formato, escribe como hablas",
      3: "Consejo: Mantén pulsado el micrófono para dictar",
    },

    paste: {
      title: "¿Pegar lo último copiado?",
      sub: "Toca PEGAR para insertarlo aquí.",
      button: "PEGAR",
      pasting: "Pegando…",
      toastUnavailable:
        "Pegar no está disponible aquí. Mantén pulsado y pega manualmente.",
      toastEmpty: "El portapapeles está vacío (o no puedo leerlo).",
      toastDenied:
        "No puedo leer el portapapeles. Mantén pulsado y pega manualmente.",
    },

    toast: {
      micDenied: "Permiso de micrófono denegado.",
      noSpeech: "No detecté voz. Prueba de nuevo.",
      dictationError: "Error de dictado.",
      dictationStartError: "No pude iniciar el dictado.",
      pasteUnavailable: "No puedo pegar aquí (portapapeles no disponible).",
      clipboardEmpty: "No hay texto en el portapapeles.",
      pasteError: "No pude acceder al portapapeles. Mantén pulsado y pega.",
      writeSomething: "Escribe algo primero.",

      // ✅ NUEVA (del MODAL_I18N)
      pickDateFirst: "Elige una fecha primero.",
    },

    textareaPlaceholderIOS:
      "iPhone/iPad: usa el micrófono del teclado para dictar.\n" +
      "Si no aparece: Ajustes > General > Teclado > Activar dictado.\n" +
      "Si pone \"no disponible\": Ajustes > Privacidad y seguridad > Micrófono (activa tu navegador).",

    repeatOn: "Activado",
    repeatOff: "Desactivado",
    remindersDisabledByHabit:
      "Las Repeticiones crean recordatorios propios usando la fecha y hora seleccionadas.",
    timeHour: "Hora",
    timeMinute: "Minutos",
    dateTimeLabel: "Fecha y hora",
    dateTimeNoneShort: "Sin fecha ni hora",
    timeUnset: "Sin hora",
    placeholder: "Toca para escribir",

    title: "Vacía tu mente",
    subtitle: "Habla, escribe o pega texto. Remi se encarga.",
    examplesTitle: "Ejemplos:",
    exampleVoice: "🎤 \"Llamar a mamá el domingo\"",
    exampleVoiceIOS: "🎤 \"Usa el microfono del teclado para dictar\"",
    examplePaste: "📋 \"Todos los martes a las 18 quedamos\"",
    exampleIdea: "💡 Idea: viaje a Italia en primavera",
    holdToTalk: "Mantén pulsado para hablar",
    listening: "Escuchando…",
    iosKeyboardMicHint: "Usa el micrófono del teclado para hablar.",
    speakHold: "Mantén pulsado para hablar",

    textareaPlaceholder: "Ejemplos:",

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
    reminderWeekBeforeAndDue: "Una semana antes hasta el día",

    back: "Atrás",
    saveTask: "Guardar tarea",

    toastTaskSaved: "Tarea guardada correctamente",
    toastTaskError: "Error al crear la tarea",
    toastIdeaSaved: "Idea guardada correctamente",
    toastIdeaError: "Error al crear la idea",
  },

  // ✅ NUEVO: bloque "pill" (para cubrir MODAL_I18N)
  pill: {
    type: {
      label: "Tipo",
      task: "Recordatorio",
      idea: "Idea",
    },

    more: "Detalles",
    less: "Ocultar",
    detected: "Detectado:",
    date: "Fecha",
    time: "Hora",
    reminder: "Recordatorio",
    habit: "Repetición",
    reminderNone: "Sin recordatorio",
    repeatNone: "Sin repetición",

    on: "On",
    off: "Off",

    remDaily: "Diaria",
    remDayBefore: "1 día antes",
    remWeekBefore: "1 semana antes",

    habitDaily: "Diaria",
    habitWeekly: "Semanal",
    habitMonthly: "Mensual",
    habitYearly: "Anual",
  },

  tasks: {
    weekdayLabels: "L|M|X|J|V|S|D",

    editLabel: "Editar",
    editTitle: "Editar tarea",
    editSubtitle: "Cambia el texto, la fecha y hora, los recordatorios y la repetición.",

    fieldTitle: "Tarea",
    fieldTitlePlaceholder: "Escribe tu tarea...",

    optionsTitle: "Opciones",

    dueDateLabel: "Fecha y hora",
    clearDueDate: "Quitar",

    reminderLabel: "Recordatorios",
    reminder: {
      none: "Sin recordatorios",
      onDue: "Solo el día límite",
      dayBeforeAndDue: "Día antes y día límite",
      dailyUntilDue: "Cada día hasta la fecha límite",
      weekBeforeAndDue: "Cada día (1 Semana antes)",
    },

    save: "Guardar",
    footerHint: "Puedes editar esto cuando quieras.",
    updateError: "Error al actualizar la tarea",
  },

  auth: {
    titleLogin: "Inicia sesión en REMI",
    titleRegister: "Crea tu cuenta en REMI",
    subtitleAuth2: "From MIND FULL to MINDFUL",
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
    greetingHello: "Hola,",
    captureSectionTitle: "Vacia tu mente",
    tipsTitle: "Consejos",

    shareRemindersModal: {
      title: "Compartir recordatorios con otras personas",
      body:
        "Envía una recordatorio o idea por enlace para que otra persona la añada a su Remi en 1 toque.",
      stepsTitle: "Cómo funciona (rápido)",
      step1: "En un recordatorio/idea toca el icono de Compartir.",
      step2: "Envía el enlace por WhatsApp, Mail, etc.",
      step3: "La persona que lo recibe toca \"Añadir a Remi\".",
      examplesTitle: "Ejemplos que van genial",
      examplesBody:
        "• \"Compra pan mañana\" → se lo envío a mi pareja\n• \"Médico el martes a las 14:00\" → se lo envío a mi madre\n• \"Traer cargador\" → se lo envío al compañero",
      footer: "Esto ayuda a otras personas a recordar cosas importantes para ellos y para tí.",
      ok: "Entendido",
      hideForever: "No volver a mostrar",
    },

    dueLabel: "Fecha Límite",

    // Header / general
    greeting: "Hola, {{name}}",
    greetingHeader: "Hola {{name}}!",
    greetingSubheader: "Vamos a despejar tu mente",
    tasksToday: "Tienes {{count}} tareas",
    prioritize: "Prioriza lo importante",
    done: "Hecho",
    delete: "Eliminar",
    actionEditTitle: "Editar",

    defaultUserName: "Usuario",

    // Tabs
    tabsToday: "Hoy",
    tabsWeek: "Semana",
    tabsNoDate: "Sin fecha",

    // States
    loadingTasks: "Cargando…",
    noUrgentTitle: "Todo bajo control",
    noUrgentSubtitle: "Pulsa + para empezar a despejar tu mente",

    // Dates / labels
    dueNoDate: "Sin fecha",

    // Actions
    actionPostpone1dTitle: "Aplazar: añade 1 día a la fecha límite",
    actionRescheduleTitle: "Elegir fecha",
    actionDoneTitle: "Marcar como completada",
    postponeDayToast: "Aplazado",

    // Errors
    errorLoadingTasks: "Error cargando tareas",

    // Profile menu
    profileLoggedInAs: "Conectado como {{name}}",
    menuProfile: "Perfil",
    menuShareApp: "Compartir app",
    menuInstallApp: "Instalar app",

    // Share
    shareText:
      "Uso Remi para sacar tareas e ideas de mi cabeza, y mi mente se siente mucho más clara y con menos estrés.\nDe verdad te lo recomiendo, ayuda mucho. Aquí tienes el enlace 🙂",
    shareCopied: "Enlace copiado al portapapeles",

    // Push modal + toasts
    pushTitle: "Activa notificaciones",
    pushBody: "Para recordatorios en el momento justo.",
    pushEnable: "Activar",
    pushEnabling: "Activando…",
    pushLater: "Ahora no",
    pushEnabledToast: "Notificaciones activadas",
    pushErrorToast: "No se pudo activar push",

    multideviceHelp: {
      title: "Multidispositivo: no olvides nada, estés donde estés",
      p1:
        "Remi está pensado para que puedas soltar cosas en 5 segundos, desde cualquier dispositivo.",
      stepsTitle: "Cómo usarlo (rápido)",
      step1:
        "Captura en cualquier lugar: móvil, iPad/tablet o PC. Escribe, habla o pega texto.",
      step2:
        "Todo se sincroniza: lo que guardas en un dispositivo aparece en los demás.",
      step3:
        "Notificaciones por dispositivo: activa avisos solo en los que quieras (ej: móvil ON, PC OFF).",
      examplesTitle: "Ejemplos que funcionan",
      examplesBody:
        "• Móvil ON → recordatorios cuando estás fuera\n• PC OFF → cero interrupciones trabajando\n• iPad ON → revisión tranquila al final del día",
      footer:
        "Tú sueltas la carga mental en el momento. Remi se encarga de recordártelo cuando y donde sea necesario.",
      ok: "Entendido",
      hideForever: "No volver mostrar",
    },

    // Tips (deck)
    tip: {
      shareReminders: {
        title: "Recordatorios en equipo",
        body: "Comparte recordatorios o ideas.\n Los demás los añaden a su Remi en 1 toque.",
        cta: "Ver cómo",
      },
      shareApp: {
        title: "Compartir Remi",
        body: "Invita a alguien a probar Remi en un toque.",
        cta: "Compartir",
      },

      multidevice: {
        title: "Remi siempre contigo",
        body:
          "Vacía tu cabeza donde estés. Todo se sincroniza y tú eliges en qué dispositivo quieres notificaciones.",
        cta: "Cómo funciona",
      },

      smartShortcuts: {
        title: "Atajos inteligentes",
        body: "Agrega palabras con 1 toque. \nEj: Idea / Comprar / a las 18:00.",
        cta: "Probar ahora",
        prefill: "Comprar: leche, pan, huevos",
      },

      install: {
        title: "Instala Remi como app",
        body: "Acceso rápido, notificaciones y todas las ventajas de una app.",
        cta: "Instalar",
      },

      push: {
        title: "Que Remi te avise por ti",
        body:
          "Activa notificaciones y suelta la carga mental. Remi te toca el hombro cuando toca.",
        cta: "Activar",
      },

      iosDict: {
        title: "Habla con Remi",
        body:
          "Si no ves el micro en el teclado, actívalo en Ajustes y dicta más rápido.",
        cta: "Ver cómo",
      },

      noDate: {
        title_one: "Tienes {{count}} tarea sin fecha",
        title_other: "Tienes {{count}} tareas sin fecha",
        body: "¿Las ordenamos? En 30s te dejo la lista limpia.",
        cta: "Ver sin fecha",
      },

      shortcuts: {
        title: "Palabras que ahorran tiempo",
        body: "Una idea = empieza con 'Idea'. \nUna tarea = empieza con un verbo.",
        cta: "Ver ejemplos",
      },

      dayClose: {
        title: "Cierre de 60 segundos",
        body: "¿Qué te preocupa para mañana? Suéltalo y listo.",
        cta: "Soltar",
      },

      paste: {
        title: "¿Has probado a pegar texto?",
        body: "Copia cualquier cosa (WhatsApp, Mail, Notas) y deja que Remi lo ordene.",
        cta: "Pegar ahora",
      },

      shareToRemi: {
        title: "Guarda cosas con \"Compartir\"",
        body:
          "Desde WhatsApp/Correo/Notas: Compartir → Remi. \nSe abre listo para ordenar.",
        cta: "Probar",
        toast: "Tip: en otra app pulsa \"Compartir\" → \"Remi\" para mandarlo directo 🙂",
      },

      natural: {
        title: "Escribe como hablas",
        body:
          "Ej: \"Pagar la luz mañana a las 6 de la tarde\". Remi se encarga y tú descansas.",
        cta: "Probar ejemplo",
        prefill: "Pagar la luz mañana 18:00",
      },

      week: {
        title: "Plan rápido",
        body: "Mira tu semana en 1 gesto. Lo urgente primero, lo demás fuera de la cabeza.",
        cta: "Ver semana",
      },

      mental: {
        title: "Mini pausa",
        body: "Respira 4s, suelta 6s. Tu mente no necesita hacerlo todo hoy.",
        cta: "Vaciar mente",
      },

      birthday: {
        title: "¿Cumpleaños cerca?",
        body: "Escríbelo en 5 segundos y Remi te lo recordará cuando toque.",
        cta: "Añadir",
        prefill: "Cumpleaños de ___ el ___",
      },

      feedback: {
        title: "Mejora Remi",
        body: "Cu?ntanos en 20 segundos qu? te est? ayudando y qu? mejorar?as.",
        cta: "Dar opini?n",
      },

      cleanNoDate: {
        title: "✅ Sin tareas sin fecha",
        body: "Perfecto. Ahora es fácil priorizar.",
        cta: "Ver hoy",
      },
    },

    shareToRemiModal: {
      title: "Compartir a Remi",
      body: "Guarda texto desde cualquier app usando \"Compartir\".",
      iosTitle: "En iPhone (iOS)",
      iosStep1: "Abre WhatsApp/Correo/Notas.",
      iosStep2: "Pulsa \"Compartir\".",
      iosStep3: "Si ves \"Remi\", tócalo y se abrirá listo para ordenar.",
      iosStep4:
        "Si no aparece, usa \"Copiar\" y luego pega en Remi (en iOS a veces depende del sistema/versión).",
      androidTitle: "En Android",
      androidStep1: "Abre WhatsApp/Correo/Notas.",
      androidStep2: "Selecciona el texto y/o Pulsa \"Compartir\".",
      androidStep3: "Elige \"Remi\" y se abrirá con el texto listo para ordenar.",
      androidStep4:
        "Si no aparece, asegúrate de tener Remi instalada como app (PWA) y prueba de nuevo.",
      ok: "Entendido",
      hideForever: "No volver mostrar",
    },

    shortcutsModal: {
      title: "Ver ejemplos",
      body: "Toca un ejemplo para abrir Remi con ese texto.",
      ex1: "Idea: Viaje a Japón en primavera",
      ex2: "Idea: Regalo para ___",
      ex3: "Llamar al seguro mañana 10:00",
      ex4: "Pagar la luz mañana 18:00",
      ex5: "Enviar correo a ___ hoy",
      openEmpty: "Abrir Remi",
      close: "Cerrar",
    },

    iosDict: {
      helpTitle: "Activa Dictado en iPhone",
      helpBody:
        "En iOS suele estar en: Ajustes → General → Teclado → Activar Dictado.",
      helpStepsTitle: "Pasos rápidos",
      step1: "Abre Ajustes",
      step2: "General → Teclado",
      step3: "Activa \"Activar Dictado\"",
      ok: "Entendido",
      hideForever: "No volver mostrar",
    },
  },

  inbox: {
    title: "Bandeja de entrada",
    tasksTab: "Recordatorios",
    ideasTab: "Ideas",
    allTab: "Todo",
    statusDone: "Hecha",
    statusActive: "Activa",
    statusArchived: "Archivada",
    subtitle: "Todo lo que has vaciado de tu cabeza aparece aquí.",
    itemsCount: "{{count}} ítems",
    loading: "Cargando bandeja…",
    emptyTitle: "Bandeja vacía",
    emptySubtitle: "Añade nuevas tareas o ideas desde la pantalla de Hoy.",

    itemTaskPrefix: "Tarea · ",
    itemIdeaPrefix: "Idea · ",
    errorLoading: "Error cargando tu bandeja",
    errorUpdating: "Error actualizando tu bandeja",
    sectionToday: "Hoy",
    sectionTomorrow: "Mañana",
    sectionWeek: "Semana",
    sectionNoDate: "Sin fecha",
  },

  ideas: {
    title: "Ideas",
    emptyState: "Apunta aquí tus ideas para despejar la mente.",
    subtitle: "Todas las ideas que no quieres perder están guardadas aquí.",
    loading: "Cargando ideas…",
    emptyTitle: "Sin ideas todavía",
    emptySubtitle: "Usa el botón + en la pantalla de Hoy para guardar tus ideas.",
    savedAt: "Guardada el {{date}}",
    errorLoading: "Error cargando tus ideas",
    updateError: "No se ha podido actualizar la idea.",
    convertError: "No se ha podido convertir la idea en recordatorio.",

    editLabel: "Editar idea",
    editTitle: "Convierte esta idea en algo accionable",
    editSubtitle:
      "Mejora el texto o conviértela en un recordatorio con fecha.",

    fieldTitle: "Texto de la idea",
    fieldTitlePlaceholder: "Ej: comprar zapatos nuevos para la boda",

    taskOptionsTitle: "Opciones de recordatorio",
    dueDateLabel: "Fecha y hora límite (opcional)",
    reminderLabel: "Recordatorio",

    reminder: {
      none: "Sin recordatorio",
      onDue: "Solo el día de la fecha",
      dayBeforeAndDue: "Un día antes y el día de la fecha",
      dailyUntilDue: "Cada día hasta la fecha límite",
    },

    saveAsIdea: "Guardar como idea",
    convertToTask: "Convertir en recordatorio",
    confirmConvert: "Convertir en recordatorio ahora",

    footerHint:
      "Convertir una idea en recordatorio no la duplica: la idea original pasa a ser un recordatorio.",
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

    devicePushTitle: "Notificaciones en este dispositivo",
    devicePushUnsupportedHint:
      "Este navegador no admite notificaciones push. Prueba con Safari en iPhone o Chrome/Edge en Android/PC.",
    devicePushChecking: "Comprobando…",
    devicePushUnsupportedLine: "Este dispositivo/navegador no soporta push.",
    devicePushDeniedLine:
      "Permiso denegado en este dispositivo (Ajustes del navegador).",
    devicePushNeedsPermissionLine:
      "Aún no has concedido permiso en este dispositivo.",
    devicePushNeedsRegisterLine: "Permiso OK, pero falta activar aquí.",
    devicePushPaused: "Pausadas",
    devicePushPausedLine: "Pausado en este dispositivo",
    devicePushActiveLine: "Activo en este dispositivo ✅",
    devicePushToggleAria:
      "Activar o pausar notificaciones en este dispositivo",
    pushDeviceEnabled: "Notificaciones activadas en este dispositivo",

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

    feedbackButton: "Dejar opinión",
    shareButton: "Compartir app",
    logoutButton: "Cerrar sesión",

    shareText:
      "I'm using Remi to get tasks and ideas out of my head, and my mind feels so much clearer and less stressed.\nI definitely recommend trying it, it really helps. Here's the link. 🙂",
    shareCopied: "Enlace de REMI copiado al portapapeles",

    defaultUserName: "Usuario",

    avatarTooBig: "La imagen debe pesar menos de 5 MB.",
    avatarUploadError: "No se pudo subir la imagen. Intenta de nuevo.",
    passwordTooShort: "La nueva contraseña debe tener al menos 6 caracteres.",
    authUpdateError: "No se pudo actualizar email/contraseña.",
    updateSuccess: "Perfil actualizado correctamente.",
    updateError: "No se pudieron guardar los cambios.",
    logoutError: "No se pudo cerrar sesión. Intenta de nuevo.",
  },

  feedback: {
    title: "Tu opinión sobre Remi",
    q1: "¿Te está ayudando Remi?",
    q2: "¿Qué mejorarías?",
    placeholder: "Escribe una sugerencia breve...",
    send: "Enviar opinión",
    later: "Ahora no",
    thanks: "Gracias por tu opinión sobre Remi.",
    low: "Nada",
    high: "Mucho",
  },

  notifications: {
    dailyReminderTitle: "Tu mente está llena",
    dailyReminderBody: "Revisa tus tareas de hoy en REMI y descarga tu cabeza.",
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

    extra: {
      hero: {
        kicker: "Dile a Remi lo que no quieres olvidar.",
        description:
          "Escribe una frase. Remi interpreta el texto y crea el recordatorio: fecha y hora, repetición si es un hábito, y el modo de recordatorio cuando toca.",
        bullets: {
          a: "Solo escribe: cero formato, cero fricción",
          b: "Remi interpreta: fechas, horas, recordatorios y repetición",
          c: "Recordatorios listos para que no dependa de tu memoria",
          d: "En todos tus dispositivos: ordenador, móvil, iPad y tablet",
        },
      },

      trustRow: { a: "Rápida", b: "Simple", c: "Hecha para vaciar la mente" },

      problem: {
        title: "Tu cerebro no es una lista de tareas.",
        text:
          "Ideas, recados, pendientes… cuando lo llevas todo en la cabeza, pagas con estrés y olvidos.",
        micro: "Remi es tu descarga mental: lo escribes una vez y sigues con tu día.",
      },

      how: {
        title: "Cómo funciona",
        subtitle: "Escribes. Remi lo entiende. Y te lo recuerda.",
        step1Title: "1) Escribe lo que no quieres olvidar",
        step1Text: "Una frase, tal cual te sale. Sin menús, sin pensar en campos.",
        step2Title: "2) Remi lo interpreta",
        step2Text:
          "Detecta fecha y hora, si es un hábito (repetición), y ajusta el recordatorio.",
        step3Title: "3) Te lo devuelve cuando toca",
        step3Text:
          "Remi te lo pone delante en el momento adecuado para que no lo cargues tú.",
      },

      interpret: {
        title: "Texto → recordatorio automático",
        text:
          "No necesitas configurar mil cosas. Remi entiende el lenguaje natural y lo convierte en un recordatorio útil.",
        chips: ["Fecha y hora", "Hábito / repetición", "Modo de recordatorio"],
        exampleLabel: "Ejemplos",
        examples: [
          "\"Mañana a las 18: llamar al seguro\"",
          "\"Cada lunes: gimnasio\"",
          "\"El día 5 pagar el alquiler\"",
        ],
        helperLine: "Escribe una frase y listo",
      },

      shareFeature: {
        badge: "Nuevo",
        title: "Comparte tareas e ideas para aliviar la carga mental",
        text:
          "Ayuda a otras personas a liberar su mente: comparte una tarea o una idea como un enlace. Así pueden añadirla y dejar de cargar con \"no se me puede olvidar…\".",
        points: [
          "Útil para familia, pareja y equipos",
          "Comparte recordatorios, recados e ideas en segundos",
          "Perfecto para ayudar cuando alguien está estresado o saturado",
        ],
        exampleLabel: "Ejemplo",
        example:
          "\"Añadir a Remi: 'Mañana 18:00 llamar al seguro' → te llega como link y lo añades en un toque.\"",
        helperLine: "Ayuda rápida, sin explicación",
        ctaTry: "Probar Remi",
        tag: "Compartir",
      },

      everywhere: {
        title: "Multi-dispositivo de verdad",
        text:
          "Remi está disponible donde estás tú: trabajo, casa, calle. Mismo acceso, mismos recordatorios.",
        points: [
          "Ordenador para capturar mientras trabajas",
          "Móvil / iPad / tablet para capturar al vuelo",
          "Úsala al instante en el navegador o instálala como app (PWA)",
        ],
      },

      install: {
        title: "Instala Remi para recibir recordatorios",
        text:
          "Para recibir notificaciones con tus recordatorios, instala Remi ahora desde tu navegador (PWA).",
        helper:
          "Disfrútala como una verdadera app: más ligera, rápida y siempre actualizada.",
        badge: "App mode",
        bullet1: "Notificaciones para recordatorios",
        bullet2: "Icono en la pantalla de inicio",
        bullet3: "Pantalla completa, sensación de app",
        mini1: "Ligera y rápida",
        mini2: "Siempre actualizada",
        mini3: "Hecha para capturar rápido",
        ctaHint:
          "Pulsa \"Instalar ahora\" y sigue los pasos según tu dispositivo.",
        device: {
          desktop: "Ordenador",
          phone: "Móvil",
          tablet: "Tablet",
        },
        pwaCard: {
          subtitle: "Notificaciones y acceso rápido",
          appLike: "Como app, pero mejor",
        },
      },

      social: {
        title: "Construida con feedback real",
        subtitle:
          "Remi se mejora continuamente con pruebas y comentarios de usuarios.",
        note: "",
        testimonials: [
          {
            quote:
              "\"Gracias a mi compañero de trabajo por recomendarme Remi, cada dia que lo uso noto menos carga mental y olvido menos cosas.\"",
            author: "Sarah",
          },
          {
            quote: "\"Es como tener un asistente de memoria personal, Me encanta!.\"",
            author: "Christian",
          },
          {
            quote:
              "\"Muy facil de usar y muy útil. sobre todo la opcion de compartir recordatorios o ideas.\"",
            author: "Erika",
          },
        ],
      },

      modal: {
        installLabel: "Instalar ahora",
        title: "Instalar Remi",
        description:
          "Instala Remi desde tu navegador para recibir notificaciones con tus recordatorios y usarla como una app.",
        alreadyInstalled:
          "Remi ya está instalada en este dispositivo. Tus recordatorios pueden llegar como notificaciones.",
        promptText:
          "Instálala para recibir notificaciones con tus recordatorios y tener acceso rápido desde el icono.",
        sectionIOS: "En iPhone / iPad (Safari)",
        sectionDesktop: "En ordenador (Chrome/Edge)",
        installRequired:
          "La instalación es necesaria para recibir notificaciones con tus recordatorios.",
        iosSteps: [
          "Abre el menú de compartir (icono de compartir en Safari).",
          "Pulsa \"Añadir a pantalla de inicio\".",
          "Confirma \"Añadir\".",
        ],
        desktopSteps: [
          "En Chrome/Edge, busca el icono de \"Instalar\" en la barra de direcciones o en el menú.",
          "Pulsa \"Instalar\".",
        ],
        close: "Cerrar",
        openInBrowser: "Abrir en navegador",
        directInstallHint:
          "Si tu navegador soporta instalación directa, aparecerá un botón de instalación en este modal.",
      },

      iosBanner: {
        title: "Instala Remi en tu iPhone - GRATIS",
        step1: "Pulsa el botón Compartir",
        step2: "Elige «Añadir a pantalla de inicio» y confirma.",
        closeAria: "Cerrar",
      },
    },
  },
} as const;
