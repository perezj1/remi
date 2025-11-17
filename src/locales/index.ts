// src/locales/index.ts
import { es } from "./es";
import { en } from "./en";
import { de } from "./de";

export type RemiLocale = "es" | "en" | "de";

export const translations = {
  es,
  en,
  de,
} as const;

// cualquier valor dentro de `translations` (es | en | de)
export type TranslationTree = (typeof translations)[RemiLocale];

export type TranslationVars = Record<string, string | number>;

/**
 * Detecta el idioma del navegador/sistema y lo mapea
 * a uno de los idiomas soportados por REMI.
 */
export function detectBrowserLocale(): RemiLocale {
  if (typeof navigator === "undefined") {
    return "es";
  }

  const lang = navigator.language.toLowerCase();

  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("de")) return "de";
  // cualquier otro (en, fr, it, etc.) cae a inglés
  return "en";
}
