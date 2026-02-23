type EmojiRule = {
  emoji: string;
  keywords: string[];
};

const EMOJI_RULES: EmojiRule[] = [
  {
    emoji: "🛒", // shopping cart
    keywords: [
      "shopping",
      "shop",
      "shops",
      "shoplist",
      "shopping list",
      "buy",
      "buys",
      "buying",
      "purchase",
      "purchases",
      "purchasing",
      "grocery",
      "groceries",
      "grocer",
      "supermarket",
      "market",
      "store",
      "stores",
      "mall",
      "compras",
      "compra",
      "comprar",
      "comprando",
      "compro",
      "compramos",
      "lista compra",
      "lista de compra",
      "mercado",
      "supermercado",
      "tienda",
      "tiendas",
      "einkauf",
      "einkaufen",
      "einkaufsliste",
      "kauf",
      "kaufen",
      "kaufe",
      "kaufliste",
    ],
  },
  {
    emoji: "🏷️", // label
    keywords: [
      "sell",
      "selling",
      "seller",
      "sellers",
      "sale",
      "sales",
      "resell",
      "resale",
      "second hand",
      "used",
      "marketplace",
      "vender",
      "vendo",
      "vende",
      "vendes",
      "venta",
      "ventas",
      "revender",
      "reventa",
      "segunda mano",
      "verkauf",
      "verkaufen",
      "verkaufe",
      "verkaufs",
      "wiederverkauf",
      "gebraucht",
      "anzeigen",
      "kleinanzeigen",
    ],
  },
  {
    emoji: "🍔", // burger
    keywords: [
      "food",
      "meal",
      "meals",
      "menu",
      "restaurant",
      "kitchen",
      "recipe",
      "recipes",
      "comida",
      "almuerzo",
      "desayuno",
      "cena",
      "restaurante",
      "cocina",
      "receta",
      "recetas",
      "essen",
      "mahlzeit",
      "kueche",
      "küche",
      "rezept",
      "rezepte",
    ],
  },
  {
    emoji: "🥤", // cup with straw
    keywords: [
      "drink",
      "drinks",
      "drinking",
      "beverage",
      "beverages",
      "water",
      "coffee",
      "tea",
      "juice",
      "beer",
      "wine",
      "beber",
      "bebida",
      "bebidas",
      "tomar",
      "agua",
      "cafe",
      "café",
      "te",
      "té",
      "zumo",
      "jugo",
      "cerveza",
      "vino",
      "trinken",
      "getrank",
      "getranke",
      "getränk",
      "getränke",
      "wasser",
      "kaffee",
      "tee",
      "saft",
      "bier",
      "wein",
    ],
  },
  {
    emoji: "💼", // briefcase
    keywords: [
      "work",
      "office",
      "job",
      "business",
      "meeting",
      "meetings",
      "trabajo",
      "oficina",
      "empresa",
      "reunion",
      "reunión",
      "reuniones",
      "laboral",
      "arbeit",
      "buero",
      "büro",
      "beruf",
      "firma",
      "arbeitstermin",
      "besprechung",
    ],
  },
  {
    emoji: "🤖", // robot
    keywords: [
      "robot",
      "robots",
      "bot",
      "bots",
      "chatbot",
      "chatbots",
      "ai",
      "ia",
      "artificial intelligence",
      "machine learning",
      "automation",
      "automations",
      "llm",
      "gpt",
      "copilot",
      "inteligencia artificial",
      "aprendizaje automatico",
      "aprendizaje automático",
      "robotica",
      "robótica",
      "automatizacion",
      "automatización",
      "automatizar",
      "ki",
      "robotik",
      "kuenstliche intelligenz",
      "künstliche intelligenz",
      "maschinelles lernen",
      "automatisierung",
      "roboter",
    ],
  },
  {
    emoji: "🎓", // studying
    keywords: [
      "study",
      "studying",
      "student",
      "students",
      "exam prep",
      "college",
      "university",
      "estudiar",
      "estudio",
      "estudiante",
      "estudiantes",
      "preparar examen",
      "preparar examenes",
      "preparar exámenes",
      "lernen",
      "studieren",
      "student",
      "studenten",
      "prufungsvorbereitung",
      "klausur",
    ],
  },
  {
    emoji: "📚", // books
    keywords: [
      "study",
      "studies",
      "school",
      "college",
      "university",
      "homework",
      "exam",
      "exams",
      "class",
      "classes",
      "estudio",
      "estudiar",
      "escuela",
      "universidad",
      "tarea",
      "tareas",
      "examen",
      "clase",
      "clases",
      "schule",
      "lernen",
      "studium",
      "hausaufgaben",
      "pruefung",
      "prüfung",
      "kurs",
      "kurse",
    ],
  },
  {
    emoji: "✈️", // airplane
    keywords: [
      "travel",
      "travelling",
      "traveling",
      "trip",
      "trips",
      "vacation",
      "vacations",
      "holiday",
      "holidays",
      "flight",
      "flights",
      "hotel",
      "viaje",
      "viajes",
      "viajar",
      "vacaciones",
      "vacacional",
      "vuelo",
      "vuelos",
      "hoteles",
      "reise",
      "reisen",
      "urlaub",
      "flug",
      "fluege",
      "flüge",
    ],
  },
  {
    emoji: "🏠", // house
    keywords: [
      "home",
      "house",
      "household",
      "hogar",
      "casa",
      "casa tareas",
      "tareas casa",
      "zuhause",
      "heim",
      "haus",
      "haushalt",
    ],
  },
  {
    emoji: "💰", // money bag
    keywords: [
      "finance",
      "finances",
      "money",
      "budget",
      "bill",
      "bills",
      "expense",
      "expenses",
      "tax",
      "taxes",
      "bank",
      "banking",
      "wallet",
      "finanzas",
      "dinero",
      "presupuesto",
      "factura",
      "facturas",
      "gasto",
      "gastos",
      "impuesto",
      "impuestos",
      "banco",
      "finanzen",
      "geld",
      "rechnung",
      "rechnungen",
      "steuer",
      "steuern",
    ],
  },
  {
    emoji: "💊", // pill
    keywords: [
      "health",
      "medical",
      "doctor",
      "medicine",
      "medication",
      "pharmacy",
      "hospital",
      "appointment",
      "salud",
      "medico",
      "médico",
      "medicina",
      "farmacia",
      "cita medica",
      "cita médica",
      "arzt",
      "gesundheit",
      "medizin",
      "apotheke",
      "krankenhaus",
      "arzttermin",
    ],
  },
  {
    emoji: "🏋️", // weight lifter
    keywords: [
      "gym",
      "workout",
      "fitness",
      "training",
      "exercise",
      "run",
      "running",
      "sport",
      "sports",
      "entrenar",
      "entreno",
      "ejercicio",
      "gimnasio",
      "correr",
      "deporte",
      "deportes",
      "laufen",
      "fitnessstudio",
      "workoutplan",
    ],
  },
  {
    emoji: "🚗", // car
    keywords: [
      "car",
      "cars",
      "auto",
      "vehicle",
      "garage",
      "mechanic",
      "fuel",
      "gas",
      "coche",
      "coches",
      "carro",
      "vehiculo",
      "vehículo",
      "taller",
      "gasolina",
      "combustible",
      "itv",
      "wagen",
      "fahrzeug",
      "werkstatt",
      "benzin",
      "öl",
      "oel",
      "tankstelle",
      "tuv",
      "tüv",
    ],
  },
  {
    emoji: "🐾", // paw prints
    keywords: [
      "pet",
      "pets",
      "petcare",
      "petsitter",
      "dog",
      "dogs",
      "doggo",
      "doggy",
      "puppy",
      "puppies",
      "cat",
      "cats",
      "kitty",
      "kitten",
      "kittens",
      "mascota",
      "mascotas",
      "perro",
      "perros",
      "perrito",
      "perrita",
      "gato",
      "gatos",
      "gatito",
      "gatita",
      "veterinario",
      "veterinaria",
      "veterinary",
      "vet",
      "haustier",
      "haustiere",
      "hund",
      "hunde",
      "welpe",
      "katze",
      "katzen",
      "kater",
      "tierarzt",
      "tierarzttermin",
    ],
  },
  {
    emoji: "💍", // ring
    keywords: [
      "wedding",
      "weddings",
      "marriage",
      "marry",
      "bridal",
      "bride",
      "groom",
      "boda",
      "bodas",
      "casamiento",
      "matrimonio",
      "casar",
      "novia",
      "novio",
      "hochzeit",
      "hochzeiten",
      "heirat",
      "heiraten",
      "braut",
      "braeutigam",
      "bräutigam",
    ],
  },
  {
    emoji: "🎉", // party popper
    keywords: [
      "party",
      "parties",
      "celebration",
      "celebrate",
      "event",
      "events",
      "fiesta",
      "fiestas",
      "celebracion",
      "celebración",
      "celebrar",
      "evento",
      "eventos",
      "feier",
      "feiern",
      "veranstaltung",
      "veranstaltungen",
    ],
  },
  {
    emoji: "🎁", // gift
    keywords: [
      "gift",
      "gifts",
      "birthday",
      "cumple",
      "cumpleanos",
      "cumpleaños",
      "regalo",
      "regalos",
      "geschenk",
      "geschenke",
      "geburtstag",
      "geburtstags",
    ],
  },
  {
    emoji: "🧹", // broom
    keywords: [
      "clean",
      "cleaning",
      "chores",
      "tidy",
      "limpieza",
      "limpiar",
      "ordenar",
      "aseo",
      "putzen",
      "haushalt",
      "aufraeumen",
      "aufräumen",
      "ordnung",
    ],
  },
  {
    emoji: "🌱", // seedling
    keywords: [
      "garden",
      "gardening",
      "plant",
      "plants",
      "jardin",
      "jardín",
      "jardineria",
      "jardinería",
      "planta",
      "plantas",
      "huerto",
      "garten",
      "gaertnern",
      "gärtnern",
      "pflanze",
      "pflanzen",
    ],
  },
  {
    emoji: "💡", // light bulb
    keywords: [
      "idea",
      "ideas",
      "brainstorm",
      "note",
      "notes",
      "inspiration",
      "memo",
      "idea list",
      "nota",
      "notas",
      "apunte",
      "apuntes",
      "inspiracion",
      "inspiración",
      "idee",
      "ideen",
      "notiz",
      "notizen",
    ],
  },
];

function normalizeText(raw: string): string {
  return raw
    .toLocaleLowerCase()
    // German transliteration (ä->ae, ö->oe, ü->ue, ß->ss) to match
    // both keyboard variants: "aufräumen" <-> "aufraeumen".
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    // Common extra transliterations used in EU languages.
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe")
    .replace(/ø/g, "o")
    .replace(/ł/g, "l")
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const LATIN_WORD_RE = /^[\p{Script=Latin}0-9]+$/u;
const STEM_SUFFIXES = [
  "amientos",
  "imientos",
  "amiento",
  "imiento",
  "aciones",
  "adores",
  "adoras",
  "acion",
  "adora",
  "ador",
  "mente",
  "idades",
  "idad",
  "ismos",
  "ismo",
  "istas",
  "ista",
  "ancias",
  "ancia",
  "encias",
  "encia",
  "yendo",
  "iendo",
  "ando",
  "ings",
  "ing",
  "ados",
  "adas",
  "idos",
  "idas",
  "es",
  "ed",
  "ar",
  "er",
  "ir",
  "s",
];

function stemLatinWord(word: string): string {
  let value = word;
  for (const suffix of STEM_SUFFIXES) {
    if (value.length <= suffix.length + 2) continue;
    if (!value.endsWith(suffix)) continue;
    value = value.slice(0, -suffix.length);
    break;
  }
  if (value.length > 4 && /[aeiou]$/u.test(value)) {
    value = value.slice(0, -1);
  }
  return value;
}

function tokenMatchesKeyword(token: string, keyword: string): boolean {
  if (!token || !keyword) return false;
  if (token === keyword) return true;

  const tokenIsLatin = LATIN_WORD_RE.test(token);
  const keywordIsLatin = LATIN_WORD_RE.test(keyword);

  if (tokenIsLatin && keywordIsLatin) {
    const tokenStem = stemLatinWord(token);
    const keywordStem = stemLatinWord(keyword);
    const minStemLen = Math.min(tokenStem.length, keywordStem.length);

    if (
      minStemLen >= 3 &&
      (tokenStem === keywordStem ||
        tokenStem.startsWith(keywordStem) ||
        keywordStem.startsWith(tokenStem))
    ) {
      return true;
    }

    const minRawLen = Math.min(token.length, keyword.length);
    if (
      minRawLen >= 3 &&
      (token.startsWith(keyword) || keyword.startsWith(token))
    ) {
      return true;
    }
  }

  return false;
}

function findKeywordPosition(
  normalizedText: string,
  keyword: string,
  tokens: string[],
  tokenStarts: number[],
): number {
  if (!keyword) return -1;

  if (keyword.includes(" ")) {
    return normalizedText.indexOf(keyword);
  }

  for (let i = 0; i < tokens.length; i += 1) {
    if (tokenMatchesKeyword(tokens[i], keyword)) {
      return tokenStarts[i] ?? -1;
    }
  }

  return -1;
}

export function suggestSharedListEmoji(title: string): string | null {
  const normalized = normalizeText(title);
  if (!normalized) return null;

  const tokens = normalized.split(" ");
  const tokenStarts: number[] = [];
  let cursor = 0;
  for (const token of tokens) {
    tokenStarts.push(cursor);
    cursor += token.length + 1;
  }

  let winner: { emoji: string; position: number; ruleIndex: number } | null = null;

  for (let ruleIndex = 0; ruleIndex < EMOJI_RULES.length; ruleIndex += 1) {
    const rule = EMOJI_RULES[ruleIndex];
    for (const rawKeyword of rule.keywords) {
      const keyword = normalizeText(rawKeyword);
      if (!keyword) continue;
      const position = findKeywordPosition(normalized, keyword, tokens, tokenStarts);
      if (position < 0) continue;

      if (
        !winner ||
        position < winner.position ||
        (position === winner.position && ruleIndex < winner.ruleIndex)
      ) {
        winner = { emoji: rule.emoji, position, ruleIndex };
      }
    }
  }

  return winner ? winner.emoji : null;
}

