import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type DictationStatus = "idle" | "listening" | "error" | "unsupported";

export type DictationChunk = {
  /**
   * ✅ IMPORTANTE (fix anti-duplicados):
   * - finalText e interimText son DELTAS (solo lo nuevo desde el último evento),
   *   no el texto completo acumulado.
   * Esto evita que, si tu UI hace "append", se duplique toda la frase en cada tick.
   */
  finalText: string;   // delta final desde el último evento
  interimText: string; // delta interim desde el último evento
};

type Options = {
  /** Idioma por defecto (BCP-47), ej: "es-ES", "en-US", "de-DE" */
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
};

function getLangFamily(bcp47: string) {
  const l = (bcp47 || "").toLowerCase();
  if (l.startsWith("es")) return "es";
  if (l.startsWith("en")) return "en";
  if (l.startsWith("de")) return "de";
  return "other";
}

function normalizeDictationText(raw: string, bcp47: string) {
  const family = getLangFamily(bcp47);
  let s = (raw || "").trim();
  if (!s) return s;

  const original = s;
  const lower = s.toLowerCase();

  if (family === "es") return restoreCase(original, normalizeEs(lower));
  if (family === "en") return restoreCase(original, normalizeEn(lower));
  if (family === "de") return restoreCase(original, normalizeDe(lower));

  return s;
}

/**
 * Intenta mantener el “look” del texto original (mayúsculas iniciales, etc.).
 */
function restoreCase(original: string, normalizedLower: string) {
  const hasUpper = /[A-ZÁÉÍÓÚÜÑÄÖ]/.test(original);
  if (!hasUpper) return normalizedLower;

  const origFirst = original[0];
  const normFirst = normalizedLower[0];
  if (origFirst && origFirst.toUpperCase() === origFirst && normFirst) {
    return normFirst.toUpperCase() + normalizedLower.slice(1);
  }
  return normalizedLower;
}

/* -------------------------
   Helpers comunes
------------------------- */

function replaceWholeWords(s: string, map: Record<string, string>) {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  if (!keys.length) return s;
  const pattern = new RegExp(`\\b(${keys.map(escapeRegExp).join("|")})\\b`, "g");
  return s.replace(pattern, (m) => map[m] ?? m);
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * ✅ Devuelve SOLO el delta entre "prevFull" y "nextFull".
 * - Si nextFull empieza por prevFull → devuelve lo nuevo (tail).
 * - Si no (reset raro del engine) → devuelve nextFull entero.
 */
function deltaFromPrefix(prevFull: string, nextFull: string) {
  const prev = (prevFull || "").trim();
  const next = (nextFull || "").trim();
  if (!next) return "";

  if (!prev) return next;

  // Caso típico: "se" -> "se insertan" (next empieza por prev)
  if (next.startsWith(prev)) {
    const tail = next.slice(prev.length).trimStart();
    return tail;
  }

  // Caso alternativo: a veces el engine cambia y no mantiene prefijo.
  return next;
}

/* -------------------------
   Español
------------------------- */

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
  "dieciséis": "16",
  dieciseis: "16",
  diecisiete: "17",
  dieciocho: "18",
  diecinueve: "19",
  veinte: "20",
  veintiuno: "21",
  "veintiún": "21",
  veintiun: "21",
  "veintidós": "22",
  veintidos: "22",
  "veintitrés": "23",
  veintitres: "23",
  veinticuatro: "24",
  veinticinco: "25",
  "veintiséis": "26",
  veintiseis: "26",
  veintisiete: "27",
  veintiocho: "28",
  veintinueve: "29",
  treinta: "30",
  "treinta y uno": "31",
  "treinta y dos": "32",
  "treinta y tres": "33",
  "treinta y cuatro": "34",
  "treinta y cinco": "35",
  "treinta y seis": "36",
  "treinta y siete": "37",
  "treinta y ocho": "38",
  "treinta y nueve": "39",
  cuarenta: "40",
  "cuarenta y uno": "41",
  "cuarenta y dos": "42",
  "cuarenta y tres": "43",
  "cuarenta y cuatro": "44",
  "cuarenta y cinco": "45",
  "cuarenta y seis": "46",
  "cuarenta y siete": "47",
  "cuarenta y ocho": "48",
  "cuarenta y nueve": "49",
  cincuenta: "50",
  "cincuenta y uno": "51",
  "cincuenta y dos": "52",
  "cincuenta y tres": "53",
  "cincuenta y cuatro": "54",
  "cincuenta y cinco": "55",
  "cincuenta y seis": "56",
  "cincuenta y siete": "57",
  "cincuenta y ocho": "58",
  "cincuenta y nueve": "59",
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

function normalizeEs(s: string) {
  let out = s;

  // años típicos: "dos mil veinticinco" => 2025
  out = out.replace(/\bdos mil\b/g, "2000");
  out = out.replace(
    /\b(dos mil)\s+(veinti(?:uno|ún|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)|treinta(?: y (?:uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?|cuarenta(?: y (?:uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?|cincuenta(?: y (?:uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?|sesenta(?: y (?:uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?|setenta(?: y (?:uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?|ochenta(?: y (?:uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?|noventa(?: y (?:uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?|diez|once|doce|trece|catorce|quince|dieciséis|dieciseis|diecisiete|dieciocho|diecinueve|veinte|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\b/g,
    (_m, _dm, tail) => {
      const n = esWordsToNumber_0_99(tail);
      if (n == null) return _m;
      return String(2000 + n);
    }
  );

  // "primero de enero" => "1 de enero"
  out = out.replace(
    new RegExp(`\\bprimero\\b(?=\\s+de\\s+(${ES_MONTHS.join("|")}))`, "g"),
    "1"
  );

  // números 0..59
  out = out.replace(/\btreinta y uno\b/g, "31");
  out = out.replace(/\btreinta y dos\b/g, "32");
  out = out.replace(/\btreinta y tres\b/g, "33");
  out = out.replace(/\btreinta y cuatro\b/g, "34");
  out = out.replace(/\btreinta y cinco\b/g, "35");
  out = out.replace(/\btreinta y seis\b/g, "36");
  out = out.replace(/\btreinta y siete\b/g, "37");
  out = out.replace(/\btreinta y ocho\b/g, "38");
  out = out.replace(/\btreinta y nueve\b/g, "39");
  out = out.replace(/\bcuarenta y cinco\b/g, "45");
  out = out.replace(/\bcuarenta y\b/g, "40 y");

  out = replaceWholeWords(out, ES_NUM_0_59);

  return out;
}

function esWordsToNumber_0_99(phrase: string): number | null {
  const p = phrase.trim().toLowerCase();

  if (ES_NUM_0_59[p] != null) return Number(ES_NUM_0_59[p]);

  const m = p.match(
    /^(sesenta|setenta|ochenta|noventa)(?:\s+y\s+(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve))?$/
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
    const ones = onesWord ? Number(ES_NUM_0_59[onesWord] ?? "0") : 0;
    return tens + ones;
  }

  if (p.startsWith("veinti")) {
    const n = ES_NUM_0_59[p];
    if (n != null) return Number(n);
  }

  const tensOnly =
    p === "treinta"
      ? 30
      : p === "cuarenta"
        ? 40
        : p === "cincuenta"
          ? 50
          : p === "sesenta"
            ? 60
            : p === "setenta"
              ? 70
              : p === "ochenta"
                ? 80
                : p === "noventa"
                  ? 90
                  : null;

  if (tensOnly != null) return tensOnly;
  return null;
}

/* -------------------------
   English
------------------------- */

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
  "twenty one": "21",
  "twenty-two": "22",
  "twenty two": "22",
  "twenty-three": "23",
  "twenty three": "23",
  "twenty-four": "24",
  "twenty four": "24",
  "twenty-five": "25",
  "twenty five": "25",
  "twenty-six": "26",
  "twenty six": "26",
  "twenty-seven": "27",
  "twenty seven": "27",
  "twenty-eight": "28",
  "twenty eight": "28",
  "twenty-nine": "29",
  "twenty nine": "29",
  thirty: "30",
  "thirty one": "31",
  "thirty-two": "32",
  "thirty two": "32",
  "thirty-three": "33",
  "thirty three": "33",
  "thirty-four": "34",
  "thirty four": "34",
  "thirty-five": "35",
  "thirty five": "35",
  "thirty-six": "36",
  "thirty six": "36",
  "thirty-seven": "37",
  "thirty seven": "37",
  "thirty-eight": "38",
  "thirty eight": "38",
  "thirty-nine": "39",
  "thirty nine": "39",
  forty: "40",
  "forty one": "41",
  "forty-two": "42",
  "forty two": "42",
  "forty-three": "43",
  "forty three": "43",
  "forty-four": "44",
  "forty four": "44",
  "forty-five": "45",
  "forty five": "45",
  "forty-six": "46",
  "forty six": "46",
  "forty-seven": "47",
  "forty seven": "47",
  "forty-eight": "48",
  "forty eight": "48",
  "forty-nine": "49",
  "forty nine": "49",
  fifty: "50",
  "fifty one": "51",
  "fifty-two": "52",
  "fifty two": "52",
  "fifty-three": "53",
  "fifty three": "53",
  "fifty-four": "54",
  "fifty four": "54",
  "fifty-five": "55",
  "fifty five": "55",
  "fifty-six": "56",
  "fifty six": "56",
  "fifty-seven": "57",
  "fifty seven": "57",
  "fifty-eight": "58",
  "fifty eight": "58",
  "fifty-nine": "59",
  "fifty nine": "59",
};

function normalizeEn(s: string) {
  let out = s;

  out = out.replace(/\btwo thousand\b/g, "2000");
  out = out.replace(
    /\b(two thousand)\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|thirty(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|forty(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|fifty(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|sixty(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|seventy(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|eighty(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|ninety(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?)\b/g,
    (_m, _tt, tail) => {
      const n = enWordsToNumber_0_99(tail);
      if (n == null) return _m;
      return String(2000 + n);
    }
  );

  out = replaceWholeWords(out, EN_NUM_0_59);
  return out;
}

function enWordsToNumber_0_99(phrase: string): number | null {
  const p = phrase.trim().toLowerCase().replace(/\s+/g, " ");
  const key = p.replace(/-/g, " ");
  if (EN_NUM_0_59[key] != null) return Number(EN_NUM_0_59[key]);

  const m = key.match(
    /^(sixty|seventy|eighty|ninety)(?:\s+(one|two|three|four|five|six|seven|eight|nine))?$/
  );
  if (m) {
    const tensWord = m[1];
    const onesWord = m[2];
    const tens =
      tensWord === "sixty"
        ? 60
        : tensWord === "seventy"
          ? 70
          : tensWord === "eighty"
            ? 80
            : tensWord === "ninety"
              ? 90
              : 0;
    const ones = onesWord ? Number(EN_NUM_0_59[onesWord] ?? "0") : 0;
    return tens + ones;
  }

  const tensOnly =
    key === "twenty"
      ? 20
      : key === "thirty"
        ? 30
        : key === "forty"
          ? 40
          : key === "fifty"
            ? 50
            : key === "sixty"
              ? 60
              : key === "seventy"
                ? 70
                : key === "eighty"
                  ? 80
                  : key === "ninety"
                    ? 90
                    : null;

  if (tensOnly != null) return tensOnly;
  return null;
}

/* -------------------------
   Deutsch (alemán)
------------------------- */

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
  einundzwanzig: "21",
  zweiundzwanzig: "22",
  dreiundzwanzig: "23",
  vierundzwanzig: "24",
  "fünfundzwanzig": "25",
  funfundzwanzig: "25",
  sechsundzwanzig: "26",
  siebenundzwanzig: "27",
  achtundzwanzig: "28",
  neunundzwanzig: "29",
  "dreißig": "30",
  dreissig: "30",
  "einunddreißig": "31",
  einunddreissig: "31",
  "zweiunddreißig": "32",
  zweiunddreissig: "32",
  "dreiunddreißig": "33",
  dreiunddreissig: "33",
  "vierunddreißig": "34",
  vierunddreissig: "34",
  "fünfunddreißig": "35",
  funfunddreissig: "35",
  "sechsunddreißig": "36",
  sechsunddreissig: "36",
  "siebenunddreißig": "37",
  siebenunddreissig: "37",
  "achtunddreißig": "38",
  achtunddreissig: "38",
  "neununddreißig": "39",
  neununddreissig: "39",
  vierzig: "40",
  einundvierzig: "41",
  zweiundvierzig: "42",
  dreiundvierzig: "43",
  vierundvierzig: "44",
  "fünfundvierzig": "45",
  funfundvierzig: "45",
  sechsundvierzig: "46",
  siebenundvierzig: "47",
  achtundvierzig: "48",
  neunundvierzig: "49",
  "fünfzig": "50",
  funfzig: "50",
  "einundfünfzig": "51",
  einundfunfzig: "51",
  "zweiundfünfzig": "52",
  zweiundfunfzig: "52",
  "dreiundfünfzig": "53",
  dreiundfunfzig: "53",
  "vierundfünfzig": "54",
  vierundfunfzig: "54",
  "fünfundfünfzig": "55",
  funfundfunfzig: "55",
  "sechsundfünfzig": "56",
  sechsundfunfzig: "56",
  "siebenundfünfzig": "57",
  siebenundfunfzig: "57",
  "achtundfünfzig": "58",
  achtundfunfzig: "58",
  "neunundfünfzig": "59",
  neunundfunfzig: "59",
};

function normalizeDe(s: string) {
  let out = s;

  out = out.replace(/\bzweitausend\b/g, "2000");
  out = out.replace(/\bzwei tausend\b/g, "2000");

  out = out.replace(
    /\b(zweitausend|zwei tausend)\s+([a-zäöüß]+(?:\s+[a-zäöüß]+)?)\b/g,
    (_m, _tt, tail) => {
      const n = deWordsToNumber_0_99(tail);
      if (n == null) return _m;
      return String(2000 + n);
    }
  );

  out = replaceWholeWords(out, DE_NUM_0_59);
  return out;
}

function deWordsToNumber_0_99(phrase: string): number | null {
  const p = phrase.trim().toLowerCase().replace(/\s+/g, " ");
  if (DE_NUM_0_59[p] != null) return Number(DE_NUM_0_59[p]);

  const compact = p.replace(/\s+/g, "");

  const m = compact.match(
    /^(ein|eins|zwei|drei|vier|fünf|funf|sechs|sieben|acht|neun)und(sechzig|siebzig|achtzig|neunzig)$/
  );
  if (m) {
    const onesWord = m[1];
    const tensWord = m[2];
    const ones = Number(DE_NUM_0_59[onesWord] ?? "0");
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

  const tensOnly =
    compact === "sechzig"
      ? 60
      : compact === "siebzig"
        ? 70
        : compact === "achtzig"
          ? 80
          : compact === "neunzig"
            ? 90
            : compact === "fünfzig" || compact === "funfzig"
              ? 50
              : null;

  if (tensOnly != null) return tensOnly;
  return null;
}

/* -------------------------
   Hook
------------------------- */

export function useSpeechDictation(opts: Options = {}) {
  const { lang = "es-ES", continuous = true, interimResults = true } = opts;

  const SpeechRecognitionCtor = useMemo(() => {
    const w = window as any;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }, []);

  const recognitionRef = useRef<any>(null);

  const [status, setStatus] = useState<DictationStatus>(
    SpeechRecognitionCtor ? "idle" : "unsupported"
  );
  const [error, setError] = useState<string | null>(null);

  const isSupported = !!SpeechRecognitionCtor;

  // ✅ Guardamos el “full interim” y “full final” de la sesión para calcular deltas
  const lastInterimFullRef = useRef<string>("");
  const lastFinalFullRef = useRef<string>("");

  const ensureRecognition = useCallback(() => {
    if (!SpeechRecognitionCtor) return null;
    if (recognitionRef.current) return recognitionRef.current;

    const rec = new SpeechRecognitionCtor();
    rec.continuous = continuous;
    rec.interimResults = interimResults;

    recognitionRef.current = rec;
    return rec;
  }, [SpeechRecognitionCtor, continuous, interimResults]);

  const start = useCallback(
    (onText: (chunk: DictationChunk) => void, langOverride?: string) => {
      setError(null);

      if (!SpeechRecognitionCtor) {
        setStatus("unsupported");
        return;
      }

      const rec = ensureRecognition();
      if (!rec) return;

      const effectiveLang = langOverride || lang;
      rec.lang = effectiveLang;

      // Reset de sesión (CLAVE)
      lastInterimFullRef.current = "";
      lastFinalFullRef.current = "";

      rec.onstart = () => setStatus("listening");

      rec.onerror = (e: any) => {
        setStatus("error");
        setError(e?.error || "speech_error");
      };

      rec.onend = () => {
        setStatus((s) => (s === "error" ? "error" : "idle"));
        lastInterimFullRef.current = "";
        lastFinalFullRef.current = "";
      };

      rec.onresult = (event: any) => {
        let interimFull = "";
        let finalFull = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const rawTranscript = (res[0]?.transcript || "").trim();
          if (!rawTranscript) continue;

          const transcript = normalizeDictationText(rawTranscript, effectiveLang);

          if (res.isFinal) finalFull += (finalFull ? " " : "") + transcript;
          else interimFull += (interimFull ? " " : "") + transcript;
        }

        // ✅ Convertimos "full" a "delta" para evitar duplicados en UIs que hacen append
        const finalDelta = deltaFromPrefix(lastFinalFullRef.current, finalFull);
        const interimDelta = deltaFromPrefix(lastInterimFullRef.current, interimFull);

        // Actualizamos refs SOLO si hay algo (si no, mantenemos el último prefijo)
        if (finalFull.trim()) lastFinalFullRef.current = finalFull.trim();
        if (interimFull.trim()) lastInterimFullRef.current = interimFull.trim();
        if (!interimFull.trim()) lastInterimFullRef.current = ""; // si no hay interim, reset

        // Emitimos deltas (pueden ser "")
        onText({ finalText: finalDelta, interimText: interimDelta });
      };

      try {
        rec.start();
      } catch {
        // ignore
      }
    },
    [SpeechRecognitionCtor, ensureRecognition, lang]
  );

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        // ignore
      }
    };
  }, []);

  return { isSupported, status, error, start, stop };
}
