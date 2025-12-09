// src/lib/parseDateTimeFromText.ts
import * as chrono from "chrono-node";

export type RemiLocale = "es" | "en" | "de";

export interface ParsedResult {
  cleanTitle: string;
  dueDateISO: string | null;
  repeatHint: "daily" | "weekly" | "monthly" | "yearly" | null;
}

// Detectar si el texto sugiere un hábito recurrente
function detectRepeatHint(
  raw: string,
  locale: RemiLocale
): ParsedResult["repeatHint"] {
  const text = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quitar acentos

  // ---- Español ----
  if (locale === "es") {
    if (
      /\b(cada dia|cada día|todos los dias|todos los días|a diario|diariamente)\b/.test(
        text
      )
    ) {
      return "daily";
    }

    if (
      /\b(cada semana|semanalmente)\b/.test(text) ||
      /\btodos los (lunes|martes|miercoles|miércoles|jueves|viernes|sabados?|sábados?|domingos?)\b/.test(
        text
      )
    ) {
      return "weekly";
    }

    if (
      /\b(cada mes|todos los meses|mensualmente)\b/.test(text) ||
      /\bprimer[oa]? .* de cada mes\b/.test(text)
    ) {
      return "monthly";
    }

    if (
      /\b(cada ano|cada año|todos los anos|todos los años|anualmente)\b/.test(
        text
      )
    ) {
      return "yearly";
    }
  }

  // ---- Inglés ----
  if (locale === "en") {
    if (/\b(every day|daily)\b/.test(text)) {
      return "daily";
    }
    if (
      /\b(every week|weekly)\b/.test(text) ||
      /\bevery (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(
        text
      )
    ) {
      return "weekly";
    }
    if (
      /\b(every month|monthly)\b/.test(text) ||
      /\bon the first .* of every month\b/.test(text)
    ) {
      return "monthly";
    }
    if (/\b(every year|yearly|annually)\b/.test(text)) {
      return "yearly";
    }
  }

  // ---- Alemán ----
  if (locale === "de") {
    if (/\b(jeden tag|taeglich|täglich)\b/.test(text)) {
      return "daily";
    }
    if (
      /\b(jede woche|woechentlich|wöchentlich)\b/.test(text) ||
      /\bjeden (montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/.test(
        text
      )
    ) {
      return "weekly";
    }
    if (
      /\b(jeden monat|monatlich)\b/.test(text) ||
      /\bam ersten .* des monats\b/.test(text)
    ) {
      return "monthly";
    }
    if (/\b(jedes jahr|jaehrlich|jährlich)\b/.test(text)) {
      return "yearly";
    }
  }

  // Si no detectamos patrón claro → sin hábito
  return null;
}

/**
 * Parsear texto libre y extraer fecha/hora + sugerencia de hábito.
 *
 * Ejemplos:
 *  - "recuérdame el 10 de enero a las 16:00 comprar pan"
 *  - "el primer jueves de cada mes a las 14:00 pagar alquiler"
 *  - "antes del 12 de diciembre a las 14:00 enviar informe"
 */
export function parseDateTimeFromText(
  raw: string,
  locale: RemiLocale,
  reference: Date = new Date()
): ParsedResult {
  const text = raw.trim();
  if (!text) {
    return { cleanTitle: text, dueDateISO: null, repeatHint: null };
  }

  // 1) Parser según idioma
  const parser = (() => {
    switch (locale) {
      case "de":
        return (chrono as any).de ?? chrono.casual;
      case "es":
        return (chrono as any).es ?? chrono.casual;
      case "en":
      default:
        return (chrono as any).en ?? chrono.casual;
    }
  })();

  // 2) Intentar parsear fecha/hora
  let results = parser.parse(text, reference);
  if (!results || results.length === 0) {
    // Fallback global
    results = chrono.casual.parse(text, reference);
  }

  if (!results || results.length === 0) {
    // No se reconoció ninguna fecha/hora
    return { cleanTitle: text, dueDateISO: null, repeatHint: null };
  }

  const best = results[0];

  // 3) Construir Date base
  const date = best.start.date(); // hora local

  // 3.1) Fallback manual para horas tipo "a las 14:00" / "a las 14"
  //     (a veces chrono pilla la fecha pero no la hora en español)
  const timeRegex = /(?:\b(?:a las|a la|at|um)\b)\s*(\d{1,2})(?:[:\.](\d{2}))?/i;
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

  // 4) Limpiar título: quitar el fragmento de fecha/hora detectado
  const before = text.slice(0, best.index);
  const after = text.slice(best.index + best.text.length);

  let cleanTitle = (before + " " + after).replace(/\s+/g, " ").trim();

  // 5) Quitar verbos típicos de "recordar" en varios idiomas
  cleanTitle = cleanTitle
    .replace(
      /\b(remind(?: me)?|remember|recordarme|recuerdame|recuérdame|recordar|erinnere mich|erinner mich)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanTitle) {
    cleanTitle = text;
  }

  // 6) Sugerencia de hábito (daily/weekly/monthly/yearly) o null
  const repeatHint = detectRepeatHint(text, locale);

  return { cleanTitle, dueDateISO, repeatHint };
}
