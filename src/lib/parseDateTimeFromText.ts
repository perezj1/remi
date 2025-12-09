// src/lib/parseDateTimeFromText.ts
import * as chrono from "chrono-node";

// Ajusta esto a tu tipo real de idioma si ya lo tienes definido
export type RemiLocale = "es" | "en" | "de";

export interface ParsedResult {
  cleanTitle: string;
  dueDateISO: string | null;
}

/**
 * Parses a free-text input (any language) and tries to extract a date/time.
 *
 * Examples:
 *  - "remind me on January 13th at 4pm to eat"
 *  - "recordarme el 10 de enero a las 16:00 que coma"
 *  - "erinnere mich am 10. März um 16 Uhr ans Essen"
 */
export function parseDateTimeFromText(
  raw: string,
  locale: RemiLocale,
  reference: Date = new Date()
): ParsedResult {
  const text = raw.trim();
  if (!text) {
    return { cleanTitle: text, dueDateISO: null };
  }

  // 1) Elegir parser según idioma
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

  // 2) Intentar parsear con el parser del idioma
  let results = parser.parse(text, reference);
  if (!results || results.length === 0) {
    // Fallback global
    results = chrono.casual.parse(text, reference);
  }

  if (!results || results.length === 0) {
    // No se reconoció ninguna fecha/hora
    return { cleanTitle: text, dueDateISO: null };
  }

  const best = results[0];

  // 3) Construir Date
  const date = best.start.date(); // hora local
  const dueDateISO = date.toISOString();

  // 4) Limpiar título: quitar el fragmento que coincide con fecha/hora
  const before = text.slice(0, best.index);
  const after = text.slice(best.index + best.text.length);

  let cleanTitle = (before + " " + after).replace(/\s+/g, " ").trim();

  // 5) Quitar verbos típicos de "recordar" en varios idiomas
  cleanTitle = cleanTitle
    .replace(
      /\b(remind(?: me)?|remember|recordarme|recuerdame|recordar|recuérdame|erinnere mich|erinner mich)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  // Seguridad: no dejar título vacío
  if (!cleanTitle) {
    cleanTitle = text;
  }

  return { cleanTitle, dueDateISO };
}
