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
  // chrono.es / chrono.de / chrono.en suelen existir.
  // A veces existe además .casual.
  const ns = (chrono as any)[locale];

  // Preferimos ns.casual si existe, si no ns, si no chrono.casual.
  if (ns?.casual?.parse) return ns.casual;
  if (ns?.parse) return ns;

  return chrono.casual;
}

type Candidate = {
  locale: RemiLocale;
  result: any; // ParsedResult de chrono (no el nuestro)
  score: number;
};

function scoreChronoResult(r: any): number {
  if (!r || !r.start) return -1;

  const len = (r.text?.length ?? 0);
  const idx = (typeof r.index === "number" ? r.index : 9999);

  // score alto = buen match
  return len * 10 - idx;
}

// Normalizar texto (minúsculas + sin acentos)
function normalize(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Detectar si el texto sugiere un hábito recurrente
function detectRepeatHint(
  raw: string,
  locale: RemiLocale
): ParsedResult["repeatHint"] {
  const text = normalize(raw);

  // ---- Español ----
  if (locale === "es") {
    // DAILY
    if (/\b(cada dia|todos los dias|a diario|diariamente|diario)\b/.test(text)) {
      return "daily";
    }

    // WEEKLY (mejorado): "cada lunes", "los lunes", "todos los lunes", "cada unes"
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
    if (/\b(cada ano|cada año|todos los anos|todos los años|anual|anualmente)\b/.test(text)) {
      return "yearly";
    }
  }

  // ---- Inglés ----
  if (locale === "en") {
    // DAILY
    if (/\b(every day|each day|daily|everyday|once a day)\b/.test(text)) {
      return "daily";
    }

    // WEEKLY (mejorado): "each monday", "every monday", "on monday", "on mondays"
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

  // ---- Alemán ----
  if (locale === "de") {
    // DAILY
    if (/\b(jeden tag|taglich|täglich|taeglich)\b/.test(text)) {
      return "daily";
    }

    // WEEKLY (mejorado): "jeden Montag", "am Montag", "montags", "immer montags"
    if (
      /\b(jede woche|wochentlich|wöchentlich|woechentlich)\b/.test(text) ||
      new RegExp(`\\b(jeden)\\s+(${WEEKDAYS.de})\\b`).test(text) ||
      new RegExp(`\\b(am)\\s+(${WEEKDAYS.de})\\b`).test(text) ||
      new RegExp(`\\b(immer\\s+)?(${WEEKDAYS.de})s\\b`).test(text) // montags, dienstags...
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
    if (/\b(jedes jahr|jahrlich|jährlich|jaehrlich|einmal im jahr)\b/.test(text)) {
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
      /\b(dia antes|el dia antes|un dia antes|1 dia antes|la vispera|el dia anterior|la noche anterior)\b/.test(
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

  // ---- Inglés ----
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

  // ---- Alemán ----
  if (locale === "de") {
    if (
      /\b(einen tag davor|am tag davor|1 tag davor|einen tag vorher|am tag vorher|am vortag|am abend davor)\b/.test(
        text
      )
    ) {
      return "DAY_BEFORE_AND_DUE";
    }

    if (/\b(jeden tag bis|taglich bis|täglich bis|taeglich bis)\b/.test(text)) {
      return "DAILY_UNTIL_DUE";
    }
  }

  return null;
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

  // 1) Intentamos en el orden: locale actual primero, luego el resto
  const tryOrder = unique<RemiLocale>([locale, ...ALL_LOCALES]);

  const candidates: Candidate[] = [];

  for (const l of tryOrder) {
    const parser = getChronoParserFor(l);
    const results = parser.parse(text, reference);

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
  const fallback = chrono.casual.parse(text, reference);
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
      cleanTitle: text,
      dueDateISO: null,
      repeatHint: detectRepeatHintAny(text),
      reminderHint: detectReminderHintAny(text),
    };
  }

  // 3) Elegir mejor candidato
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0].result;

  // 4) Construir fecha/hora base
  const date = best.start.date(); // hora local

  // 4.1) Fallback manual para horas tipo:
  // "a las 14:00" / "a las 14" / "at 14" / "um 14"
  const timeRegex =
    /(?:\b(?:a las|a la|at|um)\b)\s*(\d{1,2})(?:[:\.](\d{2}))?/i;
  const timeMatch = timeRegex.exec(text);
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
  const before = text.slice(0, best.index);
  const after = text.slice(best.index + best.text.length);
  let cleanTitle = (before + " " + after).replace(/\s+/g, " ").trim();

  // 6) Quitar verbos típicos de "recordar" (multilingüe)
  cleanTitle = cleanTitle
    .replace(
      /\b(remind(?: me)?|remember|recordarme|recuerdame|recuérdame|recordar|erinnere mich|erinner mich)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanTitle) cleanTitle = text;

  // 7) Hints multi-idioma (independiente de la UI)
  const repeatHint = detectRepeatHintAny(text);
  const reminderHint = detectReminderHintAny(text);

  return { cleanTitle, dueDateISO, repeatHint, reminderHint };
}
