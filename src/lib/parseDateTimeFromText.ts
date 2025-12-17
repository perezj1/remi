// src/lib/parseDateTimeFromText.ts
import * as chrono from "chrono-node";

export type RemiLocale = "es" | "en" | "de";

export interface ParsedResult {
  cleanTitle: string;
  dueDateISO: string | null;
  repeatHint: "daily" | "weekly" | "monthly" | "yearly" | null;
  reminderHint?: "DAY_BEFORE_AND_DUE" | "DAILY_UNTIL_DUE" | null;
}

const ALL_LOCALES: RemiLocale[] = ["es", "de", "en"];

// Días semana (con tolerancia a errores comunes)
// Nota ES: (?:l)?unes permite "unes" (typo sin l)
const WEEKDAYS = {
  es: "(?:l)?unes|martes|miercoles|jueves|viernes|sabados?|domingos?",
  en: "monday|tuesday|wednesday|thursday|friday|saturday|sunday",
  de: "montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag",
};

// ----------------- helpers -----------------

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function getChronoParserFor(locale: RemiLocale) {
  const ns = (chrono as any)[locale];
  if (ns?.casual?.parse) return ns.casual;
  if (ns?.parse) return ns;
  return chrono.casual;
}

type Candidate = {
  locale: RemiLocale;
  result: any;
  score: number;
};

function scoreChronoResult(r: any): number {
  if (!r || !r.start) return -1;
  const len = (r.text?.length ?? 0);
  const idx = (typeof r.index === "number" ? r.index : 9999);
  return len * 10 - idx;
}

// Normalizar texto (minúsculas + sin acentos)
function normalize(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceWholeWords(s: string, map: Record<string, string>) {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  if (!keys.length) return s;
  const pattern = new RegExp(`\\b(${keys.map(escapeRegExp).join("|")})\\b`, "g");
  return s.replace(pattern, (m) => map[m] ?? m);
}

/* =========================================================
   1) NORMALIZACIÓN “DICTADO”: palabras -> dígitos (ES/EN/DE)
   - Enfocado a fechas/horas: 0..59, días 1..31, años 2000..2099
   - Se aplica ANTES de chrono.parse()
   ========================================================= */

function normalizeSpokenNumbersAny(raw: string): string {
  // Aplicamos las 3 pasadas porque el usuario puede mezclar idiomas
  // o tener UI en un idioma y dictar en otro.
  let s = raw;
  s = normalizeSpokenEs(s);
  s = normalizeSpokenEn(s);
  s = normalizeSpokenDe(s);
  return s;
}

/* ---------- ES ---------- */

const ES_NUM_0_59: Record<string, string> = {
  cero: "0",
  uno: "1",
  una: "1",
  dos: "2",
  tres: "3",
  cuatro: "4",
  cinco: "5",
  seis: "6",
  siete: "7",
  ocho: "8",
  nueve: "9",
  diez: "10",
  once: "11",
  doce: "12",
  trece: "13",
  catorce: "14",
  quince: "15",
  dieciseis: "16",
  "dieciséis": "16",
  diecisiete: "17",
  dieciocho: "18",
  diecinueve: "19",
  veinte: "20",
  veintiuno: "21",
  veintiun: "21",
  "veintiún": "21",
  veintidos: "22",
  "veintidós": "22",
  veintitres: "23",
  "veintitrés": "23",
  veinticuatro: "24",
  veinticinco: "25",
  veintiseis: "26",
  "veintiséis": "26",
  veintisiete: "27",
  veintiocho: "28",
  veintinueve: "29",
  treinta: "30",
  cuarenta: "40",
  cincuenta: "50",
};

const ES_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "setiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function esWordsToNumber_0_99(phrase: string): number | null {
  const p = normalize(phrase).trim();

  // direct map 0..59 basics + tens words
  if (ES_NUM_0_59[p] != null) return Number(ES_NUM_0_59[p]);

  // 31..39 as "treinta y X"
  let m = p.match(
    /^treinta\s+y\s+(uno|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)$/
  );
  if (m) {
    const ones = m[1];
    const onesNum =
      ones === "uno" || ones === "un" || ones === "una"
        ? 1
        : ones === "dos"
          ? 2
          : ones === "tres"
            ? 3
            : ones === "cuatro"
              ? 4
              : ones === "cinco"
                ? 5
                : ones === "seis"
                  ? 6
                  : ones === "siete"
                    ? 7
                    : ones === "ocho"
                      ? 8
                      : ones === "nueve"
                        ? 9
                        : 0;
    return 30 + onesNum;
  }

  // 60..99: "sesenta y cinco", etc.
  m = p.match(
    /^(sesenta|setenta|ochenta|noventa)(?:\s+y\s+(uno|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?$/
  );
  if (m) {
    const tensWord = m[1];
    const onesWord = m[2];
    const tens =
      tensWord === "sesenta"
        ? 60
        : tensWord === "setenta"
          ? 70
          : tensWord === "ochenta"
            ? 80
            : tensWord === "noventa"
              ? 90
              : 0;

    const ones = !onesWord
      ? 0
      : onesWord === "uno" || onesWord === "un" || onesWord === "una"
        ? 1
        : onesWord === "dos"
          ? 2
          : onesWord === "tres"
            ? 3
            : onesWord === "cuatro"
              ? 4
              : onesWord === "cinco"
                ? 5
                : onesWord === "seis"
                  ? 6
                  : onesWord === "siete"
                    ? 7
                    : onesWord === "ocho"
                      ? 8
                      : onesWord === "nueve"
                        ? 9
                        : 0;

    return tens + ones;
  }

  // "veintiX" 21..29 (ya cubierto si entra como palabra)
  if (p.startsWith("veinti") && ES_NUM_0_59[p] != null)
    return Number(ES_NUM_0_59[p]);

  // tens only
  if (p === "sesenta") return 60;
  if (p === "setenta") return 70;
  if (p === "ochenta") return 80;
  if (p === "noventa") return 90;

  return null;
}

function normalizeSpokenEs(raw: string): string {
  let s = raw;

  // Año: "dos mil veinticinco" => 2025 (2000..2099)
  s = s.replace(/\bdos\s+mil\b/gi, "DOSMIL");
  s = s.replace(
    /\bDOSMIL\s+([a-záéíóúüñ]+(?:\s+y\s+[a-záéíóúüñ]+)?)\b/gi,
    (m, tail) => {
      const n = esWordsToNumber_0_99(tail);
      if (n == null) return m;
      return String(2000 + n);
    }
  );
  s = s.replace(/\bDOSMIL\b/g, "2000");

  // "primero de <mes>" => "1 de <mes>"
  const monthsGroup = ES_MONTHS.map(escapeRegExp).join("|");
  s = s.replace(
    new RegExp(`\\bprimero\\b(?=\\s+de\\s+(${monthsGroup})\\b)`, "gi"),
    "1"
  );

  // 31..39: "treinta y uno" etc (antes de reemplazos sueltos)
  s = s.replace(/\btreinta\s+y\s+uno\b/gi, "31");
  s = s.replace(/\btreinta\s+y\s+un\b/gi, "31");
  s = s.replace(/\btreinta\s+y\s+una\b/gi, "31");
  s = s.replace(/\btreinta\s+y\s+dos\b/gi, "32");
  s = s.replace(/\btreinta\s+y\s+tres\b/gi, "33");
  s = s.replace(/\btreinta\s+y\s+cuatro\b/gi, "34");
  s = s.replace(/\btreinta\s+y\s+cinco\b/gi, "35");
  s = s.replace(/\btreinta\s+y\s+seis\b/gi, "36");
  s = s.replace(/\btreinta\s+y\s+siete\b/gi, "37");
  s = s.replace(/\btreinta\s+y\s+ocho\b/gi, "38");
  s = s.replace(/\btreinta\s+y\s+nueve\b/gi, "39");

  // 40..59: "cuarenta y cinco" etc (horas/minutos)
  s = s.replace(
    /\b(cuarenta|cincuenta)\s+y\s+(uno|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b/gi,
    (m, tens, ones) => {
      const tensBase = normalize(tens) === "cuarenta" ? 40 : 50;
      const oneN =
        normalize(ones) === "uno" ||
        normalize(ones) === "un" ||
        normalize(ones) === "una"
          ? 1
          : normalize(ones) === "dos"
            ? 2
            : normalize(ones) === "tres"
              ? 3
              : normalize(ones) === "cuatro"
                ? 4
                : normalize(ones) === "cinco"
                  ? 5
                  : normalize(ones) === "seis"
                    ? 6
                    : normalize(ones) === "siete"
                      ? 7
                      : normalize(ones) === "ocho"
                        ? 8
                        : normalize(ones) === "nueve"
                          ? 9
                          : 0;
      return String(tensBase + oneN);
    }
  );

  // Reemplazos 0..59 por palabra completa (incluye 10..29)
  s = replaceWholeWords(s, ES_NUM_0_59);

  return s;
}

/* ---------- EN ---------- */

const EN_NUM_0_59: Record<string, string> = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",
  thirty: "30",
  forty: "40",
  fifty: "50",
};

function enWordsToNumber_0_99(phrase: string): number | null {
  const p = normalize(phrase).replace(/-/g, " ").replace(/\s+/g, " ").trim();

  if (EN_NUM_0_59[p] != null) return Number(EN_NUM_0_59[p]);

  // 21..29 "twenty one"
  let m = p.match(/^twenty\s+(one|two|three|four|five|six|seven|eight|nine)$/);
  if (m) {
    const ones = m[1];
    const onesNum =
      ones === "one"
        ? 1
        : ones === "two"
          ? 2
          : ones === "three"
            ? 3
            : ones === "four"
              ? 4
              : ones === "five"
                ? 5
                : ones === "six"
                  ? 6
                  : ones === "seven"
                    ? 7
                    : ones === "eight"
                      ? 8
                      : ones === "nine"
                        ? 9
                        : 0;
    return 20 + onesNum;
  }

  // 31..39, 41..49, 51..59 etc
  m = p.match(
    /^(thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:\s+(one|two|three|four|five|six|seven|eight|nine))?$/
  );
  if (m) {
    const tensWord = m[1];
    const onesWord = m[2];
    const tens =
      tensWord === "thirty"
        ? 30
        : tensWord === "forty"
          ? 40
          : tensWord === "fifty"
            ? 50
            : tensWord === "sixty"
              ? 60
              : tensWord === "seventy"
                ? 70
                : tensWord === "eighty"
                  ? 80
                  : tensWord === "ninety"
                    ? 90
                    : 0;
    const ones = !onesWord
      ? 0
      : onesWord === "one"
        ? 1
        : onesWord === "two"
          ? 2
          : onesWord === "three"
            ? 3
            : onesWord === "four"
              ? 4
              : onesWord === "five"
                ? 5
                : onesWord === "six"
                  ? 6
                  : onesWord === "seven"
                    ? 7
                    : onesWord === "eight"
                      ? 8
                      : onesWord === "nine"
                        ? 9
                        : 0;
    return tens + ones;
  }

  return null;
}

function normalizeSpokenEn(raw: string): string {
  let s = raw;

  // Years: "two thousand twenty five" => 2025
  s = s.replace(/\btwo\s+thousand\b/gi, "TWOTHOUSAND");
  s = s.replace(
    /\bTWOTHOUSAND\s+([a-z-]+(?:\s+[a-z-]+)?)\b/gi,
    (m, tail) => {
      const n = enWordsToNumber_0_99(tail);
      if (n == null) return m;
      return String(2000 + n);
    }
  );
  s = s.replace(/\bTWOTHOUSAND\b/g, "2000");

  // 0..59: "twenty-five"
  s = s.replace(
    /\b(twenty|thirty|forty|fifty)\s*-\s*(one|two|three|four|five|six|seven|eight|nine)\b/gi,
    (m, tens, ones) => {
      const n = enWordsToNumber_0_99(`${tens} ${ones}`);
      return n == null ? m : String(n);
    }
  );

  // 21..29, 31..59 with space
  s = s.replace(
    /\b(twenty|thirty|forty|fifty)\s+(one|two|three|four|five|six|seven|eight|nine)\b/gi,
    (m, tens, ones) => {
      const n = enWordsToNumber_0_99(`${tens} ${ones}`);
      return n == null ? m : String(n);
    }
  );

  // Single-word numbers
  s = replaceWholeWords(s, EN_NUM_0_59);

  return s;
}

/* ---------- DE ---------- */

const DE_NUM_0_59: Record<string, string> = {
  null: "0",
  eins: "1",
  ein: "1",
  eine: "1",
  zwei: "2",
  drei: "3",
  vier: "4",
  "fünf": "5",
  funf: "5",
  sechs: "6",
  sieben: "7",
  acht: "8",
  neun: "9",
  zehn: "10",
  elf: "11",
  "zwölf": "12",
  zwolf: "12",
  dreizehn: "13",
  vierzehn: "14",
  "fünfzehn": "15",
  funfzehn: "15",
  sechzehn: "16",
  siebzehn: "17",
  achtzehn: "18",
  neunzehn: "19",
  zwanzig: "20",
  "dreißig": "30",
  dreissig: "30",
  vierzig: "40",
  "fünfzig": "50",
  funfzig: "50",
};

function deWordsToNumber_0_99(phrase: string): number | null {
  const p = normalize(phrase).replace(/\s+/g, " ").trim();
  const compact = p.replace(/\s+/g, "");

  // Direct hits (0..59 basics + tens words)
  if (DE_NUM_0_59[p] != null) return Number(DE_NUM_0_59[p]);
  if (DE_NUM_0_59[compact] != null) return Number(DE_NUM_0_59[compact]);

  // 21..59: "fünfundzwanzig"
  let m = compact.match(
    /^(ein|eins|zwei|drei|vier|fünf|funf|sechs|sieben|acht|neun)und(zwanzig|dreißig|dreissig|vierzig|fünfzig|funfzig)$/
  );
  if (m) {
    const onesWord = m[1];
    const tensWord = m[2];
    const ones =
      onesWord === "ein" || onesWord === "eins"
        ? 1
        : onesWord === "zwei"
          ? 2
          : onesWord === "drei"
            ? 3
            : onesWord === "vier"
              ? 4
              : onesWord === "fünf" || onesWord === "funf"
                ? 5
                : onesWord === "sechs"
                  ? 6
                  : onesWord === "sieben"
                    ? 7
                    : onesWord === "acht"
                      ? 8
                      : onesWord === "neun"
                        ? 9
                        : 0;

    const tens =
      tensWord === "zwanzig"
        ? 20
        : tensWord === "dreißig" || tensWord === "dreissig"
          ? 30
          : tensWord === "vierzig"
            ? 40
            : tensWord === "fünfzig" || tensWord === "funfzig"
              ? 50
              : 0;

    return tens + ones;
  }

  // 60..99 (para años): "fünfundsechzig"
  m = compact.match(
    /^(ein|eins|zwei|drei|vier|fünf|funf|sechs|sieben|acht|neun)und(sechzig|siebzig|achtzig|neunzig)$/
  );
  if (m) {
    const onesWord = m[1];
    const tensWord = m[2];
    const ones =
      onesWord === "ein" || onesWord === "eins"
        ? 1
        : onesWord === "zwei"
          ? 2
          : onesWord === "drei"
            ? 3
            : onesWord === "vier"
              ? 4
              : onesWord === "fünf" || onesWord === "funf"
                ? 5
                : onesWord === "sechs"
                  ? 6
                  : onesWord === "sieben"
                    ? 7
                    : onesWord === "acht"
                      ? 8
                      : onesWord === "neun"
                        ? 9
                        : 0;

    const tens =
      tensWord === "sechzig"
        ? 60
        : tensWord === "siebzig"
          ? 70
          : tensWord === "achtzig"
            ? 80
            : tensWord === "neunzig"
              ? 90
              : 0;

    return tens + ones;
  }

  // tens only (60..90)
  if (compact === "sechzig") return 60;
  if (compact === "siebzig") return 70;
  if (compact === "achtzig") return 80;
  if (compact === "neunzig") return 90;

  return null;
}

function normalizeSpokenDe(raw: string): string {
  let s = raw;

  // Years: "zweitausend fünfundzwanzig" => 2025
  s = s.replace(/\bzwei\s+tausend\b/gi, "ZWEITAUSEND");
  s = s.replace(/\bzweitausend\b/gi, "ZWEITAUSEND");

  s = s.replace(
    /\bZWEITAUSEND\s+([a-zäöüß]+(?:\s+[a-zäöüß]+)?)\b/gi,
    (m, tail) => {
      const n = deWordsToNumber_0_99(tail);
      if (n == null) return m;
      return String(2000 + n);
    }
  );

  s = s.replace(/\bZWEITAUSEND\b/g, "2000");

  // Reemplazo token a token para compuestos tipo "fünfundzwanzig"
  const parts = s.split(/\s+/g);
  const replaced = parts.map((tok) => {
    const t = tok.replace(/[.,;:!?)]/g, "");
    const n = deWordsToNumber_0_99(t);
    if (n == null) return tok;
    return tok.replace(t, String(n));
  });
  s = replaced.join(" ");

  // Single word numbers
  s = replaceWholeWords(s, DE_NUM_0_59);

  return s;
}

/* =========================================================
   2) HINTS (repeat/reminder)
   ========================================================= */

// Detectar si el texto sugiere un hábito recurrente
function detectRepeatHint(
  raw: string,
  locale: RemiLocale
): ParsedResult["repeatHint"] {
  const text = normalize(raw);

  if (locale === "es") {
    // DAILY
    if (/\b(cada dia|todos los dias|a diario|diariamente|diario)\b/.test(text)) {
      return "daily";
    }

    // WEEKLY
    if (
      /\b(cada semana|semanal|semanalmente)\b/.test(text) ||
      new RegExp(
        `\\b(todos\\s+los\\s+|cada\\s+|los\\s+)(${WEEKDAYS.es})\\b`
      ).test(text)
    ) {
      return "weekly";
    }

    // MONTHLY
    if (
      /\b(cada mes|todos los meses|mensual|mensualmente)\b/.test(text) ||
      /\bprimer[oa]?\s+.+\s+de\s+cada\s+mes\b/.test(text) ||
      /\b(el\s+1\s+de\s+cada\s+mes|el\s+dia\s+1\s+de\s+cada\s+mes|cada\s+dia\s+1)\b/.test(
        text
      )
    ) {
      return "monthly";
    }

    // YEARLY
    if (
      /\b(cada ano|cada año|todos los anos|todos los años|anual|anualmente)\b/.test(
        text
      )
    ) {
      return "yearly";
    }
  }

  if (locale === "en") {
    // DAILY
    if (/\b(every day|each day|daily|everyday|once a day)\b/.test(text)) {
      return "daily";
    }

    // WEEKLY
    if (
      /\b(every week|weekly|once a week)\b/.test(text) ||
      new RegExp(`\\b(each|every)\\s+(${WEEKDAYS.en})\\b`).test(text) ||
      new RegExp(`\\bon\\s+(${WEEKDAYS.en})\\b`).test(text) ||
      new RegExp(`\\bon\\s+(${WEEKDAYS.en})s\\b`).test(text)
    ) {
      return "weekly";
    }

    // MONTHLY
    if (
      /\b(every month|monthly|once a month)\b/.test(text) ||
      /\b(on the (first|1st) of (each|every) month)\b/.test(text) ||
      /\b(on the first .* of every month)\b/.test(text) ||
      /\b(first .* of (each|every) month)\b/.test(text)
    ) {
      return "monthly";
    }

    // YEARLY
    if (/\b(every year|yearly|annually|once a year)\b/.test(text)) {
      return "yearly";
    }
  }

  if (locale === "de") {
    // DAILY
    if (/\b(jeden tag|taglich|täglich|taeglich)\b/.test(text)) {
      return "daily";
    }

    // WEEKLY
    if (
      /\b(jede woche|wochentlich|wöchentlich|woechentlich)\b/.test(text) ||
      new RegExp(`\\b(jeden)\\s+(${WEEKDAYS.de})\\b`).test(text) ||
      new RegExp(`\\b(am)\\s+(${WEEKDAYS.de})\\b`).test(text) ||
      new RegExp(`\\b(immer\\s+)?(${WEEKDAYS.de})s\\b`).test(text)
    ) {
      return "weekly";
    }

    // MONTHLY
    if (
      /\b(jeden monat|monatlich)\b/.test(text) ||
      /\b(am ersten .* des monats|am 1\. jeden monats|jeden 1\.)\b/.test(text) ||
      /\b(jeden ersten .* im monat|am ersten .* jeden monats)\b/.test(text)
    ) {
      return "monthly";
    }

    // YEARLY
    if (
      /\b(jedes jahr|jahrlich|jährlich|jaehrlich|einmal im jahr)\b/.test(text)
    ) {
      return "yearly";
    }
  }

  return null;
}

function detectRepeatHintAny(raw: string): ParsedResult["repeatHint"] {
  for (const l of ALL_LOCALES) {
    const r = detectRepeatHint(raw, l);
    if (r) return r;
  }
  return null;
}

// Detectar sugerencia de modo de recordatorio (día antes / diario hasta fecha)
function detectReminderHint(
  raw: string,
  locale: RemiLocale
): ParsedResult["reminderHint"] {
  const text = normalize(raw);

  // ---- Español ----
if (locale === "es") {
  if (
    /\b(dia antes|dia de antes|el dia antes|el dia de antes|un dia antes|un dia de antes|1 dia antes|1 dia de antes|la vispera|el dia anterior|la noche anterior)\b/.test(
      text
    )
  ) {
    return "DAY_BEFORE_AND_DUE";
  }

  if (
    /\b(todos los dias hasta|cada dia hasta|diariamente hasta|a diario hasta)\b/.test(
      text
    )
  ) {
    return "DAILY_UNTIL_DUE";
  }
}


  if (locale === "en") {
    if (
      /\b(the day before|one day before|1 day before|day before|the previous day|the night before)\b/.test(
        text
      )
    ) {
      return "DAY_BEFORE_AND_DUE";
    }
    if (/\b(every day until|each day until|daily until)\b/.test(text)) {
      return "DAILY_UNTIL_DUE";
    }
  }

  if (locale === "de") {
    if (
      /\b(einen tag davor|am tag davor|1 tag davor|einen tag vorher|am tag vorher|am vortag|am abend davor)\b/.test(
        text
      )
    ) {
      return "DAY_BEFORE_AND_DUE";
    }
    if (
      /\b(jeden tag bis|taglich bis|täglich bis|taeglich bis)\b/.test(text)
    ) {
      return "DAILY_UNTIL_DUE";
    }
  }

  return null;
}


const WEEKDAYS_ES =
  "(?:l)?unes|martes|mi[eé]rcoles|jueves|viernes|s[áa]bado|domingo";
const WEEKDAYS_EN =
  "monday|tuesday|wednesday|thursday|friday|saturday|sunday";
const WEEKDAYS_DE =
  "montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag";

function normalizeRelativeWeeksAny(raw: string): string {
  let s = raw;

  // ---------- ES ----------

// "la próxima semana (el) jueves" / "para la próxima semana, el jueves" -> "próximo jueves"
s = s.replace(
  new RegExp(
    `\\b(para\\s+)?la\\s+pr[oó]xima\\s+semana\\s*,?\\s*(el\\s+)?(${WEEKDAYS_ES})\\b`,
    "gi"
  ),
  (_m, _para, _el, wd) => `próximo ${wd}`
);

// "la semana que viene (el) jueves" / "para la semana que viene, el jueves" -> "próximo jueves"
s = s.replace(
  new RegExp(
    `\\b(para\\s+)?la\\s+semana\\s+que\\s+viene\\s*,?\\s*(el\\s+)?(${WEEKDAYS_ES})\\b`,
    "gi"
  ),
  (_m, _para, _el, wd) => `próximo ${wd}`
);

// "el jueves de la semana que viene" -> "próximo jueves"
s = s.replace(
  new RegExp(
    `\\b(el\\s+)?(${WEEKDAYS_ES})\\s+de\\s+la\\s+semana\\s+que\\s+viene\\b`,
    "gi"
  ),
  (_m, _el, wd) => `próximo ${wd}`
);

// "dentro de 2 semanas (el) martes" -> "martes en 2 semanas"
s = s.replace(
  new RegExp(
    `\\bdentro\\s+de\\s+(\\d+)\\s+semanas?\\s*,?\\s*(el\\s+)?(${WEEKDAYS_ES})\\b`,
    "gi"
  ),
  (_m, n, _el, wd) => `${wd} en ${n} semanas`
);

// "(el) martes dentro de 2 semanas" -> "martes en 2 semanas"
s = s.replace(
  new RegExp(
    `\\b(el\\s+)?(${WEEKDAYS_ES})\\s+dentro\\s+de\\s+(\\d+)\\s+semanas?\\b`,
    "gi"
  ),
  (_m, _el, wd, n) => `${wd} en ${n} semanas`
);

// "el mes que viene (en) marzo" -> "próximo marzo"
s = s.replace(
  /\b(el\s+)?mes\s+que\s+viene\s+(en\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/gi,
  (_m, _el, _en, month) => `próximo ${month}`
);

// "el año que viene (en) marzo" -> "marzo del próximo año"
s = s.replace(
  /\b(el\s+)?a[nñ]o\s+que\s+viene\s+(en\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/gi,
  (_m, _el, _en, month) => `${month} del próximo año`
);

// también: "en marzo del año que viene" -> "marzo del próximo año"
s = s.replace(
  /\b(en\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+del\s+a[nñ]o\s+que\s+viene\b/gi,
  (_m, _en, month) => `${month} del próximo año`
);


  // ---------- EN ----------

// "next month in March" (raro pero pasa en dictado) -> "next March"
s = s.replace(
  /\bnext\s+month\s*,?\s*(in\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
  (_m, _in, month) => `next ${month}`
);

// "next year in March" -> "March next year"
s = s.replace(
  /\bnext\s+year\s*,?\s*(in\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
  (_m, _in, month) => `${month} next year`
);

// "in March next year" -> "March next year" (más estable)
s = s.replace(
  /\bin\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+next\s+year\b/gi,
  (_m, month) => `${month} next year`
);

// "next week thursday" / "next week, on thursday" -> "next thursday"
s = s.replace(
  new RegExp(`\\bnext\\s+week\\s*,?\\s*(on\\s+)?(${WEEKDAYS_EN})\\b`, "gi"),
  (_m, _on, wd) => `next ${wd}`
);

// "thursday next week" -> "next thursday"
s = s.replace(
  new RegExp(`\\b(${WEEKDAYS_EN})\\s+next\\s+week\\b`, "gi"),
  (_m, wd) => `next ${wd}`
);

// "in 2 weeks on tuesday" / "in 2 weeks, tuesday" -> "tuesday in 2 weeks"
s = s.replace(
  new RegExp(`\\bin\\s+(\\d+)\\s+weeks?\\s*,?\\s*(on\\s+)?(${WEEKDAYS_EN})\\b`, "gi"),
  (_m, n, _on, wd) => `${wd} in ${n} weeks`
);

// "tuesday in 2 weeks" already ok, but also: "tuesday, in 2 weeks"
s = s.replace(
  new RegExp(`\\b(${WEEKDAYS_EN})\\s*,?\\s*in\\s+(\\d+)\\s+weeks?\\b`, "gi"),
  (_m, wd, n) => `${wd} in ${n} weeks`
);


  // ---------- DE ----------

// "nächsten Monat im März" -> "nächsten März"
s = s.replace(
  /\bn[aä]chsten\s+monat\s*,?\s*(im\s+)?(januar|februar|m[aä]rz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\b/gi,
  (_m, _im, month) => `nächsten ${month}`
);

// "nächstes Jahr im März" -> "März nächstes Jahr"
s = s.replace(
  /\bn[aä]chstes\s+jahr\s*,?\s*(im\s+)?(januar|februar|m[aä]rz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\b/gi,
  (_m, _im, month) => `${month} nächstes Jahr`
);

// "im März nächstes Jahr" -> "März nächstes Jahr"
s = s.replace(
  /\bim\s+(januar|februar|m[aä]rz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+n[aä]chstes\s+jahr\b/gi,
  (_m, month) => `${month} nächstes Jahr`
);

// "nächste Woche Donnerstag" / "nächste Woche, am Donnerstag" -> "nächsten Donnerstag"
s = s.replace(
  new RegExp(`\\bn[aä]chste\\s+woche\\s*,?\\s*(am\\s+)?(${WEEKDAYS_DE})\\b`, "gi"),
  (_m, _am, wd) => `nächsten ${wd}`
);

// "in der nächsten Woche am Donnerstag" -> "nächsten Donnerstag"
s = s.replace(
  new RegExp(`\\bin\\s+der\\s+n[aä]chsten\\s+woche\\s*,?\\s*(am\\s+)?(${WEEKDAYS_DE})\\b`, "gi"),
  (_m, _am, wd) => `nächsten ${wd}`
);

// "am Donnerstag nächste Woche" -> "nächsten Donnerstag"
s = s.replace(
  new RegExp(`\\b(am\\s+)?(${WEEKDAYS_DE})\\s+n[aä]chste\\s+woche\\b`, "gi"),
  (_m, _am, wd) => `nächsten ${wd}`
);

// "in 2 Wochen am Dienstag" / "in 2 Wochen, Dienstag" -> "Dienstag in 2 Wochen"
s = s.replace(
  new RegExp(`\\bin\\s+(\\d+)\\s+wochen?\\s*,?\\s*(am\\s+)?(${WEEKDAYS_DE})\\b`, "gi"),
  (_m, n, _am, wd) => `${wd} in ${n} Wochen`
);

// "am Dienstag in 2 Wochen" (también lo dejamos normalizado)
s = s.replace(
  new RegExp(`\\b(am\\s+)?(${WEEKDAYS_DE})\\s+in\\s+(\\d+)\\s+wochen?\\b`, "gi"),
  (_m, _am, wd, n) => `${wd} in ${n} Wochen`
);


  return s;
}


function detectReminderHintAny(raw: string): ParsedResult["reminderHint"] {
  for (const l of ALL_LOCALES) {
    const r = detectReminderHint(raw, l);
    if (r) return r;
  }
  return null;
}

/**
 * Parsear texto libre y extraer fecha/hora + sugerencia de hábito y recordatorio.
 * Interpreta ES/DE/EN independientemente del idioma de la app.
 */
export function parseDateTimeFromText(
  raw: string,
  locale: RemiLocale,
  reference: Date = new Date()
): ParsedResult {
  const text = raw.trim();
  if (!text) {
    return {
      cleanTitle: text,
      dueDateISO: null,
      repeatHint: null,
      reminderHint: null,
    };
  }

  // ✅ Normalización antes de chrono
  const normalizedText = normalizeRelativeWeeksAny(
  normalizeSpokenNumbersAny(text)
);


  // 1) Intentamos en el orden: locale actual primero, luego el resto
  const tryOrder = unique<RemiLocale>([locale, ...ALL_LOCALES]);

  const candidates: Candidate[] = [];

  for (const l of tryOrder) {
    const parser = getChronoParserFor(l);
    const results = parser.parse(normalizedText, reference);

    if (results && results.length > 0) {
      const r0 = results[0];
      candidates.push({
        locale: l,
        result: r0,
        score: scoreChronoResult(r0),
      });
    }
  }

  // 1.1) Fallback global
  const fallback = chrono.casual.parse(normalizedText, reference);
  if (fallback && fallback.length > 0) {
    const r0 = fallback[0];
    candidates.push({
      locale: locale,
      result: r0,
      score: scoreChronoResult(r0) - 5,
    });
  }

  // 2) Si no hay nada, devolvemos solo hints multi-idioma
  if (candidates.length === 0) {
    return {
      cleanTitle: normalizedText.trim(),
      dueDateISO: null,
      repeatHint: detectRepeatHintAny(normalizedText),
      reminderHint: detectReminderHintAny(normalizedText),
    };
  }

  // 3) Elegir mejor candidato
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0].result;

  // 4) Construir fecha/hora base
  const date = best.start.date(); // hora local

  // 4.1) Fallback manual para horas tipo:
  // "a las 14:00" / "a las 14" / "at 14" / "um 14" / "um 14 uhr"
  const timeRegex =
    /(?:\b(?:a las|a la|at|um)\b)\s*(\d{1,2})(?:[:\.](\d{2}))?(?:\s*(?:uhr))?/i;
  const timeMatch = timeRegex.exec(normalizedText);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    if (
      Number.isFinite(hour) &&
      Number.isFinite(minute) &&
      hour >= 0 &&
      hour < 24 &&
      minute >= 0 &&
      minute < 60
    ) {
      date.setHours(hour, minute, 0, 0);
    }
  }

  const dueDateISO = date.toISOString();

  // 5) Limpiar título: quitar fragmento de fecha/hora detectado
  const before = normalizedText.slice(0, best.index);
  const after = normalizedText.slice(best.index + best.text.length);
  let cleanTitle = (before + " " + after).replace(/\s+/g, " ").trim();

  // 6) Quitar verbos típicos de "recordar" (multilingüe)
  cleanTitle = cleanTitle
    .replace(
      /\b(remind(?: me)?|remember|recordarme|recuerdame|recuérdame|recordar|erinnere mich|erinner mich)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanTitle) cleanTitle = normalizedText.trim();

  // 7) Hints multi-idioma (independiente de la UI)
  const repeatHint = detectRepeatHintAny(normalizedText);
  const reminderHint = detectReminderHintAny(normalizedText);

  return { cleanTitle, dueDateISO, repeatHint, reminderHint };
}
