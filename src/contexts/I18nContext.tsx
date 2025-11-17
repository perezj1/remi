// src/contexts/I18nContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  translations,
  type RemiLocale,
  type TranslationTree,
  type TranslationVars,
  detectBrowserLocale,
} from "@/locales";

const LANGUAGE_KEY = "remi_language";

type I18nContextValue = {
  lang: RemiLocale;
  setLang: (lang: RemiLocale) => void;
  t: (key: string, vars?: TranslationVars) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<RemiLocale>(() => {
    // 1) Si estamos en navegador, miramos localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(
          LANGUAGE_KEY
        ) as RemiLocale | null;
        if (stored === "es" || stored === "en" || stored === "de") {
          return stored;
        }
      } catch {
        // ignore
      }
    }
    // 2) Si no hay nada guardado, usamos idioma del navegador
    return detectBrowserLocale();
  });

  const setLang = useCallback((newLang: RemiLocale) => {
    setLangState(newLang);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LANGUAGE_KEY, newLang);
      }
    } catch {
      // ignore
    }
  }, []);

  const getFromTree = useCallback(
    (tree: TranslationTree, path: string): string | undefined => {
      const parts = path.split(".");
      let current: any = tree;

      for (const part of parts) {
        if (current == null) return undefined;
        current = current[part];
      }

      if (typeof current === "string") return current;
      return undefined;
    },
    []
  );

  const t = useCallback(
    (key: string, vars?: TranslationVars): string => {
      const tree = translations[lang];
      let text = getFromTree(tree, key);

      // si falta la traducción, devolvemos la clave (para detectar errores)
      if (!text) {
        console.warn(`Missing translation for key "${key}" in lang "${lang}"`);
        return key;
      }

      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
          text = text!.replace(re, String(v));
        });
      }

      return text!;
    },
    [getFromTree, lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
    }),
    [lang, setLang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return ctx;
}
