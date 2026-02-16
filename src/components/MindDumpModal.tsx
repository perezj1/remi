// src/components/MindDumpModal.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  List,
  X,
  ClipboardPaste,
  Mic,
  Check,
  SlidersHorizontal,
  Sparkles,
  Calendar,
  Clock,
  Bell,
  Repeat,
  Lightbulb,
  // ChevronDown, // ⛔️ (comentado) Solo necesario si reactivas la “píldora” de idioma
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import { useModalUi } from "@/contexts/ModalUiContext";
import type { ReminderMode, RepeatType } from "@/lib/brainItemsApi";

// ✅ Usa tus archivos de idiomas (sin diccionario local en este componente)
import { es as esLocale } from "@/locales/es";
import { en as enLocale } from "@/locales/en";
import { de as deLocale } from "@/locales/de";

const REMI_PURPLE = "#7d59c9";
const REMI_PURPLE_BORDER = "rgba(143,49,243,0.30)";
const REMI_PURPLE_BG = "rgba(143,49,243,0.10)";
const REMI_TEXT = "rgba(15,23,42,0.92)";
const REMI_SUB = "rgba(15,23,42,0.55)";

/*
  ⛔️ (comentado) Persistencia independiente del modal:
  Ya NO se usa, porque:
  - Idioma por defecto = idioma del navegador (lo gestiona I18nProvider)
  - Si el usuario cambia idioma en Profile, se usa el idioma global elegido (I18nContext)
*/
// const MODAL_LANG_STORAGE_KEY = "remi.mindDumpModal.lang";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent || "") ||
    (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1)
  );
}
function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}

type UiLang = "es" | "en" | "de";

const speechLangByUiLang: Record<UiLang, string> = {
  es: "es-ES",
  en: "en-US",
  de: "de-DE",
};

function isUiLang(x: any): x is UiLang {
  return x === "es" || x === "en" || x === "de";
}

/* ✅ Idioma por defecto (fallback) desde navegador */
function detectBrowserUiLang(): UiLang {
  if (typeof navigator === "undefined") return "en";
  const raw = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();

  if (raw.startsWith("es")) return "es";
  if (raw.startsWith("de")) return "de";
  if (raw.startsWith("en")) return "en";
  return "en";
}

/* ───────────────────────────────
   ✅ Normaliza para matching: quita tildes/diacríticos y minúsculas
─────────────────────────────── */
function foldForMatch(input: string): string {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* ───────────────────────────────
   ✅ i18n: lee desde tus archivos /src/locales
   - soporta objetos anidados (key "a.b.c") o planos (key "a.b.c")
─────────────────────────────── */
const LOCALES: Record<UiLang, any> = {
  es: esLocale,
  en: enLocale,
  de: deLocale,
};

function getDeepValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path]; // flat keys
  const parts = path.split(".");
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function interpolateVars(template: string, vars?: Record<string, any>): string {
  if (!vars) return template;
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g"), String(v));
  }
  return out;
}

function tFromLocales(
  lang: UiLang,
  key: string,
  fallback: string,
  vars?: Record<string, any>
): string {
  try {
    const dict = LOCALES[lang] ?? LOCALES.es;
    const raw = getDeepValue(dict, key);
    if (typeof raw === "string" && raw.trim().length > 0) {
      return interpolateVars(raw, vars);
    }
    return interpolateVars(fallback, vars);
  } catch {
    return interpolateVars(fallback, vars);
  }
}

type ItemKind = "task" | "idea";

type Props = {
  open: boolean;
  onClose: () => void;
  embedded?: boolean;

  // compat si todavía lo usas en otro flujo
  onOpenReview?: (text: string) => void;

  // ✅ crear tarea
  onCreateTask: (
    title: string,
    dueDateISO: string | null,
    reminderMode: ReminderMode,
    repeatType: RepeatType
  ) => Promise<void>;

  // ✅ NUEVO (opcional): crear idea
  onCreateIdea?: (title: string, body: string) => Promise<void>;

  initialText?: string;
  initialTextNonce?: number;
};

/* ───────────────────────────────
   ✅ Teclado real: visualViewport
─────────────────────────────── */
function getKeyboardOffsetPx() {
  if (typeof window === "undefined") return 0;
  const vv = window.visualViewport;
  if (!vv) return 0;
  const offset = window.innerHeight - (vv.height + vv.offsetTop);
  return Math.max(0, Math.round(offset));
}

/* ───────────────────────────────
   ✅ Haptics
─────────────────────────────── */
function hapticTick(ms = 20) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      (navigator as any).vibrate?.(ms);
    }
  } catch {
    // ignore
  }
}

/* ───────────────────────────────
   ✅ Normaliza texto entrante/pegado
   - IMPORTANTE: conserva saltos de línea (NO los convierte en espacios)
─────────────────────────────── */
function normalizeIncomingText(raw: string): string {
  const s = String(raw ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // Normaliza espacios dentro de cada línea, pero mantiene \n
  const lines = s.split("\n").map((line) =>
    line
      .replace(/[ \t]+/g, " ")
      .replace(/\u00A0/g, " ")
      .trimEnd()
  );

  // Recorta líneas vacías al inicio/fin
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

  // Colapsa múltiples líneas vacías seguidas a máximo 1
  const out: string[] = [];
  let blank = 0;
  for (const line of lines) {
    if (line.trim() === "") {
      blank += 1;
      if (blank <= 1) out.push("");
    } else {
      blank = 0;
      out.push(line);
    }
  }

  return out.join("\n").trimEnd();
}

type ChipStage = "ROOT" | "SCHEDULE" | "TIME" | "REMINDER";
type RootChipId = "birthday" | "call" | "buy" | "pay" | "appointment" | "idea";

const GAP = " "; // ✅ 1 solo espacio
const BULLET = "• ";

/* ───────────────────────────────
   ✅ Detectores (para “Detectado: …”)
   - matching SIN tildes
─────────────────────────────── */
function detectDateSignal(text: string): string | null {
  const s = foldForMatch(text);

  const kw =
    s.match(
      /\b(hoy|manana|pasado\s+manana|este\s+finde|este\s+fin\s+de\s+semana|today|tomorrow|this\s+weekend|heute|morgen|dieses\s+wochenende)\b/i
    )?.[0] ?? null;
  if (kw) return kw;

  const weekday =
    s.match(
      /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|monday|tuesday|wednesday|thursday|friday|saturday|sunday|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/i
    )?.[0] ?? null;
  if (weekday) return weekday;

  const numeric =
    s.match(
      /\b(\d{1,2}[\/.\-]\d{1,2}([\/.\-]\d{2,4})?|\d{4}[\/.\-]\d{1,2}[\/.\-]\d{1,2})\b/
    )?.[0] ?? null;
  if (numeric) return numeric;

  const monthName =
    s.match(
      /\b(\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre))\b/i
    )?.[0] ??
    s.match(
      /\b((january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2})\b/i
    )?.[0] ??
    s.match(
      /\b(\d{1,2}\.?\s+(januar|februar|marz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember))\b/i
    )?.[0] ??
    null;

  if (monthName) return monthName;

  return null;
}

function detectTimeSignal(text: string): string | null {
  const s = foldForMatch(text);

  const hhmm = s.match(/\b\d{1,2}:\d{2}\b/)?.[0] ?? null;
  if (hhmm) return hhmm;

  const spoken = s.match(/\b(a\s+las|um|at)\s+\d{1,2}(:\d{2})?\b/i)?.[0] ?? null;
  if (spoken) return spoken;

  const h = s.match(/\b\d{1,2}\s*h\b/i)?.[0] ?? null;
  if (h) return h;

  const ampm = s.match(/\b\d{1,2}(:\d{2})?\s*(am|pm)\b/i)?.[0] ?? null;
  if (ampm) return ampm;

  return null;
}

function detectHabitSignal(text: string): string | null {
  const s = foldForMatch(text);

  const daily =
    s.match(
      /\b(cada\s+dia|todos\s+los\s+dias|a\s+diario|daily|every\s+day|taglich|jeden\s+tag)\b/i
    )?.[0] ?? null;
  if (daily) return daily;

  const weekly =
    s.match(
      /\b(cada\s+semana|semanal(mente)?|weekly|every\s+week|wochentlich|jede\s+woche)\b/i
    )?.[0] ?? null;
  if (weekly) return weekly;

  const weeklyByWeekday =
    s.match(
      /\b((todos?\s+los|todas?\s+las|cada)\s+(lunes|martes|miercoles|jueves|viernes|sabado|domingo)|every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|on\s+(mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays)|jeden\s+(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)|am\s+(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag))\b/i
    )?.[0] ?? null;
  if (weeklyByWeekday) return weeklyByWeekday;

  const monthly =
    s.match(
      /\b(cada\s+mes|mensual(mente)?|monthly|every\s+month|monatlich|jeden\s+monat)\b/i
    )?.[0] ?? null;
  if (monthly) return monthly;

  const yearly =
    s.match(
      /\b(cada\s+ano|anual(mente)?|yearly|every\s+year|jahrlich|jedes\s+jahr)\b/i
    )?.[0] ?? null;
  if (yearly) return yearly;

  return null;
}

function detectReminderSignal(text: string): string | null {
  const s = foldForMatch(text);

  const dayBefore =
    s.match(
      /\b(dia\s+de\s+antes|dia\s+antes|un\s+dia\s+antes|1\s*dia\s+antes|day\s+before|the\s+day\s+before|einen\s+tag\s+vorher|am\s+vortag)\b/i
    )?.[0] ?? null;
  if (dayBefore) return dayBefore;

  const weekBefore =
    s.match(
      /\b(una\s+semana\s+antes|1\s+semana\s+antes|week\s+before|one\s+week\s+before|eine\s+woche\s+vorher|eine\s+woche\s+davor)\b/i
    )?.[0] ?? null;
  if (weekBefore) return weekBefore;

  const daily =
    s.match(
      /\b(todos\s+los\s+dias\s+hasta|cada\s+dia\s+hasta|every\s+day\s+until|daily\s+until|jeden\s+tag\s+bis)\b/i
    )?.[0] ?? null;
  if (daily) return daily;

  return null;
}

type HighlightKind = "date" | "time" | "reminder" | "habit";
type HighlightToken = {
  start: number;
  end: number;
  kind: HighlightKind;
};

const HIGHLIGHT_PRIORITY: Record<HighlightKind, number> = {
  reminder: 4,
  time: 3,
  date: 2,
  habit: 1,
};

const HIGHLIGHT_PATTERNS: Array<{ kind: HighlightKind; regex: RegExp }> = [
  {
    kind: "reminder",
    regex:
      /\b(d[ií]a\s+de\s+antes|d[ií]a\s+antes|un\s+d[ií]a\s+antes|1\s*d[ií]a\s+antes|day\s+before|the\s+day\s+before|einen\s+tag\s+vorher|am\s+vortag|una\s+semana\s+antes|1\s+semana\s+antes|week\s+before|one\s+week\s+before|eine\s+woche\s+vorher|eine\s+woche\s+davor|todos\s+los\s+d[ií]as\s+hasta|cada\s+d[ií]a\s+hasta|every\s+day\s+until|daily\s+until|jeden\s+tag\s+bis)\b/gi,
  },
  {
    kind: "time",
    regex: /\b(\d{1,2}:\d{2}|\d{1,2}\s*h|(?:a\s+las|at|um)\s+\d{1,2}(?::\d{2})?|\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/gi,
  },
  {
    kind: "date",
    regex:
      /\b(hoy|mañana|manana|pasado\s+mañana|pasado\s+manana|este\s+finde|este\s+fin\s+de\s+semana|today|tomorrow|this\s+weekend|heute|morgen|dieses\s+wochenende|lunes|martes|mi[eé]rcoles|jueves|viernes|s[áa]bado|domingo|monday|tuesday|wednesday|thursday|friday|saturday|sunday|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)|\d{1,2}[\/.\-]\d{1,2}(?:[\/.\-]\d{2,4})?|\d{4}[\/.\-]\d{1,2}[\/.\-]\d{1,2})\b/gi,
  },
  {
    kind: "habit",
    regex:
      /\b(cada\s+d[ií]a|todos\s+los\s+d[ií]as|a\s+diario|daily|every\s+day|t[aä]glich|jeden\s+tag|cada\s+semana|semanal(?:mente)?|weekly|every\s+week|w[öo]chentlich|jede\s+woche|cada\s+mes|mensual(?:mente)?|monthly|every\s+month|monatlich|jeden\s+monat|cada\s+año|cada\s+ano|anual(?:mente)?|yearly|every\s+year|j[aä]hrlich|jedes\s+jahr)\b/gi,
  },
];

function collectHighlightTokens(text: string): HighlightToken[] {
  if (!text) return [];

  const raw: HighlightToken[] = [];
  for (const { kind, regex } of HIGHLIGHT_PATTERNS) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null = null;
    while ((match = regex.exec(text)) !== null) {
      const value = match[0] ?? "";
      if (!value) {
        regex.lastIndex += 1;
        continue;
      }
      raw.push({
        start: match.index,
        end: match.index + value.length,
        kind,
      });
    }
  }

  raw.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    const pr = HIGHLIGHT_PRIORITY[b.kind] - HIGHLIGHT_PRIORITY[a.kind];
    if (pr !== 0) return pr;
    return b.end - b.start - (a.end - a.start);
  });

  const selected: HighlightToken[] = [];
  for (const token of raw) {
    const overlaps = selected.some(
      (taken) => token.start < taken.end && token.end > taken.start
    );
    if (!overlaps) selected.push(token);
  }

  return selected.sort((a, b) => a.start - b.start);
}

function foldWithMap(input: string): { folded: string; map: number[] } {
  let folded = "";
  const map: number[] = [];

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const normalized = ch
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    for (let j = 0; j < normalized.length; j += 1) {
      folded += normalized[j];
      map.push(i);
    }
  }
  return { folded, map };
}

function collectSignalTokens(
  text: string,
  signals: Array<{ kind: HighlightKind; value: string | null }>
): HighlightToken[] {
  if (!text) return [];
  const { folded, map } = foldWithMap(text);
  const out: HighlightToken[] = [];

  for (const signal of signals) {
    if (!signal.value) continue;
    const needle = foldForMatch(signal.value);
    if (!needle) continue;

    let idx = folded.indexOf(needle);
    while (idx !== -1) {
      const start = map[idx];
      const endFoldIdx = idx + needle.length - 1;
      const endOriginal = map[endFoldIdx];
      if (typeof start === "number" && typeof endOriginal === "number") {
        out.push({
          start,
          end: endOriginal + 1,
          kind: signal.kind,
        });
      }
      idx = folded.indexOf(needle, idx + needle.length);
    }
  }
  return out;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHighlightedHtml(text: string, tokens: HighlightToken[]): string {
  if (!text) return "";
  if (!tokens.length) return escapeHtml(text).replace(/\n/g, "<br>");

  const hlStyle =
    "background:#efe9ff;color:#7d59c9;border:1px solid #c7b5f6;border-radius:999px;padding:0 6px;font-weight:400;box-decoration-break:clone;-webkit-box-decoration-break:clone;";

  let out = "";
  let cursor = 0;
  for (const token of tokens) {
    if (token.start > cursor) {
      out += escapeHtml(text.slice(cursor, token.start));
    }
    const piece = escapeHtml(text.slice(token.start, token.end));
    out += `<span style="${hlStyle}">${piece}</span>`;
    cursor = token.end;
  }
  if (cursor < text.length) out += escapeHtml(text.slice(cursor));
  return out.replace(/\n/g, "<br>");
}

function getSelectionOffsetsInElement(root: HTMLElement): { start: number; end: number } | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;

  const preStart = range.cloneRange();
  preStart.selectNodeContents(root);
  preStart.setEnd(range.startContainer, range.startOffset);
  const start = preStart.toString().length;

  const preEnd = range.cloneRange();
  preEnd.selectNodeContents(root);
  preEnd.setEnd(range.endContainer, range.endOffset);
  const end = preEnd.toString().length;

  return { start, end };
}

function setSelectionOffsetsInElement(root: HTMLElement, start: number, end = start) {
  const safeStart = Math.max(0, start);
  const safeEnd = Math.max(safeStart, end);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let charCount = 0;
  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let startOffset = 0;
  let endOffset = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const len = node.data.length;
    const nextCount = charCount + len;

    if (!startNode && safeStart <= nextCount) {
      startNode = node;
      startOffset = Math.max(0, safeStart - charCount);
    }
    if (!endNode && safeEnd <= nextCount) {
      endNode = node;
      endOffset = Math.max(0, safeEnd - charCount);
      break;
    }
    charCount = nextCount;
  }

  if (!startNode) {
    const last = root.lastChild;
    if (last && last.nodeType === Node.TEXT_NODE) {
      startNode = last as Text;
      startOffset = (last as Text).data.length;
    }
  }
  if (!endNode) {
    endNode = startNode;
    endOffset = startOffset;
  }
  if (!startNode || !endNode) return;

  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  sel.removeAllRanges();
  sel.addRange(range);
}

/* ───────────────────────────────
   ✅ Parsers + mappers (para auto-sync)
─────────────────────────────── */
function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function startOfTodayLocal(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ✅ si NO hay año explícito y la fecha ya pasó este año, usar el próximo año
function bumpToNextYearIfPast(candidate: Date, yearWasExplicit: boolean): Date {
  if (yearWasExplicit) return candidate;
  const today = startOfTodayLocal();
  const c = new Date(candidate);
  c.setHours(0, 0, 0, 0);
  if (c < today) {
    c.setFullYear(c.getFullYear() + 1);
  }
  return c;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${pad2(m)}-${pad2(day)}`;
}

// ✅ Convierte señales de hora a HH:MM si es posible (incluye AM/PM)
function parseTimeToHHMM(signal: string | null): string | null {
  if (!signal) return null;
  const s = foldForMatch(signal);

  // 14:00
  const hhmm = s.match(/\b(\d{1,2}):(\d{2})\b/);
  if (hhmm) {
    const h = Math.min(23, Math.max(0, Number(hhmm[1])));
    const m = Math.min(59, Math.max(0, Number(hhmm[2])));
    return `${pad2(h)}:${pad2(m)}`;
  }

  // 2 pm / 2:30 pm
  const ampm = s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (ampm) {
    let h = Number(ampm[1]);
    const m = ampm[2] ? Number(ampm[2]) : 0;
    const ap = ampm[3];
    if (!Number.isFinite(h) || h < 1 || h > 12) return null;
    let hh = h % 12;
    if (ap === "pm") hh += 12;
    return `${pad2(hh)}:${pad2(Math.min(59, Math.max(0, m)))}`;
  }

  // "a las 14" / "um 14" / "at 2"
  const hOnly = s.match(/\b(\d{1,2})\b/);
  if (hOnly) {
    const h = Number(hOnly[1]);
    if (Number.isFinite(h) && h >= 0 && h <= 23) return `${pad2(h)}:00`;
  }

  // "14h"
  const hH = s.match(/\b(\d{1,2})\s*h\b/);
  if (hH) {
    const h = Number(hH[1]);
    if (Number.isFinite(h) && h >= 0 && h <= 23) return `${pad2(h)}:00`;
  }

  return null;
}

function nextWeekdayFromToday(targetDow: number): Date {
  const today = startOfTodayLocal();
  const dow = today.getDay(); // 0=Sun..6=Sat
  const diff = (targetDow - dow + 7) % 7; // incluye hoy si diff=0
  const out = new Date(today);
  out.setDate(today.getDate() + diff);
  return out;
}

function parseDateToISO(signal: string | null, uiLang: UiLang): string | null {
  if (!signal) return null;
  const raw = signal.trim();
  const s = foldForMatch(raw);

  if (/\b(hoy|today|heute)\b/i.test(s)) {
    return toISODate(startOfTodayLocal());
  }
  if (/\b(manana|tomorrow|morgen)\b/i.test(s)) {
    const d = startOfTodayLocal();
    d.setDate(d.getDate() + 1);
    return toISODate(d);
  }
  if (/\b(pasado\s+manana)\b/i.test(s)) {
    const d = startOfTodayLocal();
    d.setDate(d.getDate() + 2);
    return toISODate(d);
  }
  if (
    /\b(this\s+weekend|este\s+finde|este\s+fin\s+de\s+semana|dieses\s+wochenende)\b/i.test(s)
  ) {
    return toISODate(nextWeekdayFromToday(6));
  }

  const weekdayMap: Record<string, number> = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    domingo: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
    montag: 1,
    dienstag: 2,
    mittwoch: 3,
    donnerstag: 4,
    freitag: 5,
    samstag: 6,
    sonntag: 0,
  };
  const wd = s.match(
    /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|monday|tuesday|wednesday|thursday|friday|saturday|sunday|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/i
  )?.[0];
  if (wd) {
    const key = wd.toLowerCase();
    const dow = weekdayMap[key];
    if (typeof dow === "number") return toISODate(nextWeekdayFromToday(dow));
  }

  const iso = s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const ymd = s.match(/\b(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})\b/);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]);
    const d = Number(ymd[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${pad2(m)}-${pad2(d)}`;
    }
  }

  const num = s.match(/\b(\d{1,2})[\/.\-](\d{1,2})(?:[\/.\-](\d{2,4}))?\b/);
  if (num) {
    const a = Number(num[1]);
    const b = Number(num[2]);

    const yearWasExplicit = !!num[3];
    let y = num[3] ? Number(num[3]) : new Date().getFullYear();
    if (y < 100) y = 2000 + y;

    let d: number, m: number;
    if (uiLang === "en") {
      m = a;
      d = b;
    } else {
      d = a;
      m = b;
    }
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const cand = new Date(y, m - 1, d);
      const fixed = bumpToNextYearIfPast(cand, yearWasExplicit);
      return toISODate(fixed);
    }
  }

  if (uiLang === "es") {
    const m = s.match(
      /\b(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/
    );
    if (m) {
      const d = Number(m[1]);
      const monthName = m[2];
      const monthMap: Record<string, number> = {
        enero: 1,
        febrero: 2,
        marzo: 3,
        abril: 4,
        mayo: 5,
        junio: 6,
        julio: 7,
        agosto: 8,
        septiembre: 9,
        setiembre: 9,
        octubre: 10,
        noviembre: 11,
        diciembre: 12,
      };
      const mo = monthMap[monthName];
      const y = new Date().getFullYear();
      if (mo && d >= 1 && d <= 31) {
        const cand = new Date(y, mo - 1, d);
        const fixed = bumpToNextYearIfPast(cand, false);
        return toISODate(fixed);
      }
    }
  }

  if (uiLang === "en") {
    const m = s.match(
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/
    );
    if (m) {
      const monthName = m[1];
      const d = Number(m[2]);
      const monthMap: Record<string, number> = {
        january: 1,
        february: 2,
        march: 3,
        april: 4,
        may: 5,
        june: 6,
        july: 7,
        august: 8,
        september: 9,
        october: 10,
        november: 11,
        december: 12,
      };
      const mo = monthMap[monthName];
      const y = new Date().getFullYear();
      if (mo && d >= 1 && d <= 31) {
        const cand = new Date(y, mo - 1, d);
        const fixed = bumpToNextYearIfPast(cand, false);
        return toISODate(fixed);
      }
    }
  }

  if (uiLang === "de") {
    const m = s.match(
      /\b(\d{1,2})\.?\s+(januar|februar|marz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\b/
    );
    if (m) {
      const d = Number(m[1]);
      const monthName = m[2];
      const monthMap: Record<string, number> = {
        januar: 1,
        februar: 2,
        marz: 3,
        maerz: 3,
        april: 4,
        mai: 5,
        juni: 6,
        juli: 7,
        august: 8,
        september: 9,
        oktober: 10,
        november: 11,
        dezember: 12,
      };
      const mo = monthMap[monthName];
      const y = new Date().getFullYear();
      if (mo && d >= 1 && d <= 31) {
        const cand = new Date(y, mo - 1, d);
        const fixed = bumpToNextYearIfPast(cand, false);
        return toISODate(fixed);
      }
    }
  }

  return null;
}

function mapReminderSignalToMode(signal: string | null): ReminderMode | null {
  if (!signal) return null;
  const s = foldForMatch(signal);

  if (
    s.includes("dia") ||
    s.includes("day") ||
    s.includes("vortag") ||
    s.includes("tag vorher")
  ) {
    return "DAY_BEFORE_AND_DUE";
  }
  if (s.includes("semana") || s.includes("week") || s.includes("woche")) {
    return "WEEK_BEFORE_AND_DUE";
  }
  if (
    s.includes("every day until") ||
    s.includes("cada dia hasta") ||
    s.includes("jeden tag bis") ||
    s.includes("daily until")
  ) {
    return "DAILY_UNTIL_DUE";
  }
  return null;
}

function mapHabitSignalToRepeat(signal: string | null): RepeatType | null {
  if (!signal) return null;
  const s = foldForMatch(signal);

  if (
    s.includes("cada dia") ||
    s.includes("every day") ||
    s.includes("taglich") ||
    s.includes("jeden tag") ||
    s.includes("a diario")
  )
    return "daily";
  if (
    s.includes("cada semana") ||
    s.includes("every week") ||
    s.includes("wochentlich") ||
    s.includes("jede woche") ||
    s.includes("semanal")
  )
    return "weekly";
  if (
    /\b((todos?\s+los|todas?\s+las|cada)\s+(lunes|martes|miercoles|jueves|viernes|sabado|domingo)|every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|on\s+(mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays)|jeden\s+(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)|am\s+(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag))\b/i.test(
      s
    )
  )
    return "weekly";
  if (
    s.includes("cada mes") ||
    s.includes("every month") ||
    s.includes("monatlich") ||
    s.includes("jeden monat") ||
    s.includes("mensual")
  )
    return "monthly";
  if (
    s.includes("cada ano") ||
    s.includes("every year") ||
    s.includes("jahrlich") ||
    s.includes("jedes jahr") ||
    s.includes("anual")
  )
    return "yearly";

  return null;
}

/* ───────────────────────────────
   ✅ Helpers creación directa
─────────────────────────────── */
function buildISOFromLocalParts(dateYYYYMMDD: string, timeHHMM: string) {
  const [yy, mm, dd] = dateYYYYMMDD.split("-").map((x) => parseInt(x, 10));
  const [hh, mi] = timeHHMM.split(":").map((x) => parseInt(x, 10));
  const dt = new Date(yy, (mm ?? 1) - 1, dd ?? 1, hh ?? 12, mi ?? 0, 0, 0);
  return dt.toISOString();
}

function stripVisualBullets(raw: string): string {
  const normalized = String(raw ?? "").replace(/\r\n/g, "\n");
  return normalized.replace(/^\s*•\s*/gm, "").trim();
}

/**
 * ✅ Título para MindDump:
 * - conserva saltos de línea del "primer bloque"
 * - corta al primer salto en blanco (para que notas debajo no se mezclen en el título)
 */
function titleFromMindDump(raw: string): string {
  const s = stripVisualBullets(raw).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = s.split("\n");

  // Quita líneas vacías SOLO al inicio
  while (lines.length && lines[0].trim() === "") lines.shift();

  // Quita líneas vacías SOLO al final
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

  // Mantén los saltos de línea tal cual (incluyendo dobles saltos)
  return lines.join("\n");
}

// ✅ PillButton (más pequeña)
type PillVariant = "purple" | "amber";

function PillButton({
  active,
  disabled,
  onClick,
  children,
  icon,
  variant = "purple",
  size = "sm",
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  variant?: PillVariant;
  size?: "sm" | "md";
}) {
  const isAmber = variant === "amber";

  const activeStyle: CSSProperties | undefined = !active
    ? undefined
    : isAmber
      ? {
          background: "rgba(251,191,36,0.18)",
          borderColor: "rgba(251,191,36,0.45)",
          color: "#92400E",
        }
      : {
          background: REMI_PURPLE_BG,
          borderColor: REMI_PURPLE_BORDER,
          color: REMI_PURPLE,
        };

  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-2xl font-semibold transition border shadow-sm";
  const sizing = size === "sm" ? "h-8 px-2.5 text-[12px]" : "h-9 px-3 text-[12px]";
  const state = disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md";
  const inactive = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      className={[base, sizing, state, active ? "" : inactive].join(" ")}
      style={activeStyle}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}

/* ───────────────────────────────
   ✅ Píldoras estilo “settings” + menús
─────────────────────────────── */
function uiLangToBCP47(uiLang: UiLang): string {
  return uiLang === "es" ? "es-ES" : uiLang === "de" ? "de-DE" : "en-US";
}
function sameISODate(a: string, b: string) {
  return String(a || "") === String(b || "");
}
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function SettingPill({
  icon,
  text,
  right,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  text: string;
  right?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : -1}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick?.();
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={[
        "relative rounded-2xl border bg-white",
        "px-3 py-2",
        "flex items-center justify-between gap-3",
        disabled ? "opacity-60" : "",
      ].join(" ")}
      style={{
        borderColor: "rgba(15,23,42,0.10)",
      }}
    >
      <div className="min-w-0 flex items-center gap-2">
        <span className="shrink-0">{icon}</span>
        <div className="min-w-0 truncate text-[13px] font-semibold text-slate-800">{text}</div>
      </div>

      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function MenuPanel({
  open,
  anchorRef,
  children,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLDivElement>;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      ref={anchorRef}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "calc(100% + 6px)",
        zIndex: 80,
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.10)",
        borderRadius: 16,
        boxShadow: "0 20px 55px rgba(15,23,42,0.18)",
        overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

function MenuItem({
  active,
  disabled,
  children,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 12px",
        fontSize: 13,
        fontWeight: active ? 900 : 800,
        color: disabled
          ? "rgba(15,23,42,0.35)"
          : active
            ? REMI_PURPLE
            : "rgba(15,23,42,0.78)",
        background: active ? "rgba(125,89,201,0.10)" : "#fff",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function CaretSquare() {
  return (
    <span
      className="h-7 w-7 rounded-xl border flex items-center justify-center"
      style={{ borderColor: "rgba(15,23,42,0.10)", background: "rgba(15,23,42,0.03)" }}
      aria-hidden="true"
    >
      <span style={{ fontSize: 12, fontWeight: 900, color: "rgba(15,23,42,0.55)" }}>▾</span>
    </span>
  );
}

export default function MindDumpModal({
  open,
  onClose,
  embedded = false,
  onOpenReview,
  onCreateTask,
  onCreateIdea,
  initialText,
  initialTextNonce,
}: Props) {
  // ✅ IMPORTANTE: NO pongas `if (!open) return null;` antes de hooks.

  /* ✅ Idioma:
     - Se toma del idioma global (I18nContext). Ese idioma:
       - Por defecto: navegador (I18nProvider)
       - Si usuario cambia idioma en Profile: se refleja aquí automáticamente
     - Fallback robusto: navigator.language
  */
  const appI18n = useI18n() as any;

  const uiLang: UiLang = useMemo(() => {
    const candidate =
      appI18n?.lang ?? appI18n?.uiLang ?? appI18n?.language ?? appI18n?.locale ?? null;
    if (isUiLang(candidate)) return candidate;
    return detectBrowserUiLang();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appI18n?.lang, appI18n?.uiLang, appI18n?.language, appI18n?.locale]);

  const t = (key: string, fallback: string, vars?: any) => tFromLocales(uiLang, key, fallback, vars);

  const [text, setText] = useState(normalizeIncomingText(initialText ?? ""));
  const [interim, setInterim] = useState("");

  const textareaRef = useRef<HTMLDivElement | null>(null);

  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const timeInputRef = useRef<HTMLInputElement | null>(null);

  const openNativePicker = (ref: React.RefObject<HTMLInputElement>) => {
    const el = ref.current;
    if (!el) return;

    // Chrome/Edge (y algunos móviles) soportan showPicker()
    try {
      (el as any).showPicker?.();
      return;
    } catch {
      // fallback
    }

    try {
      el.focus();
      el.click();
    } catch {
      // ignore
    }
  };

  const [kbdOffset, setKbdOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const [talkPressed, setTalkPressed] = useState(false);
  const [rippleTick, setRippleTick] = useState(0);

  const [chipStage, setChipStage] = useState<ChipStage>("ROOT");
  const [activeRootChip, setActiveRootChip] = useState<RootChipId | null>(null);

  const [caretTick, setCaretTick] = useState(0);
  const caretRef = useRef<number>(0);

  const [itemKind, setItemKind] = useState<ItemKind>("task");
  const [typeTouched, setTypeTouched] = useState(false);

  const [pickedDate, setPickedDate] = useState<string>("");
  const [pickedTime, setPickedTime] = useState<string>("");
  const [reminderMode, setReminderMode] = useState<ReminderMode>("NONE");
  const [habitRepeat, setHabitRepeat] = useState<RepeatType>("none");

  const [dateTouched, setDateTouched] = useState(false);
  const [timeTouched, setTimeTouched] = useState(false);
  const [reminderTouched, setReminderTouched] = useState(false);
  const [habitTouched, setHabitTouched] = useState(false);

  // ✅ menús (recordatorio / repetición)
  const [reminderMenuOpen, setReminderMenuOpen] = useState(false);
  const [repeatMenuOpen, setRepeatMenuOpen] = useState(false);
  const reminderMenuRef = useRef<HTMLDivElement>(null);
  const repeatMenuRef = useRef<HTMLDivElement>(null);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);

  const ios = useMemo(() => isIOS(), []);
  const android = useMemo(() => isAndroid(), []);
  const showSettingsPanel = embedded ? settingsPanelOpen : true;

  const withGap = (s: string) => `${String(s ?? "").trim()}${GAP}`;

  const blurTextarea = () => {
    try {
      textareaRef.current?.blur();
    } catch {}
    try {
      (document.activeElement as any)?.blur?.();
    } catch {}
  };

  const ensureNewBulletBlock = (prevText: string) => {
    const out = prevText ?? "";
    const trimmed = out.trim();

    if (!trimmed) return BULLET;
    if (out.endsWith("\n\n")) return out + BULLET;
    if (out.endsWith("\n")) return out + "\n" + BULLET;
    return out + "\n\n" + BULLET;
  };

  const appendFinalDelta = (delta: string) => {
    const clean = (delta || "").trim();
    if (!clean) return;

    setText((prev) => {
      const out = prev ?? "";
      const base = out.trim().length === 0 ? BULLET : out;

      if (
        base.endsWith(BULLET) ||
        base.endsWith("\n" + BULLET) ||
        base.endsWith("\n\n" + BULLET)
      ) {
        return base + clean;
      }

      if (base.endsWith("\n") || base.endsWith(" ")) return base + clean;
      return base + " " + clean;
    });
  };

  const { isSupported, status, error, start, stop } = useSpeechDictation({
    lang: speechLangByUiLang[uiLang] || "en-US",
    continuous: true,
    interimResults: true,
  });

  const listening = status === "listening";
  const showTalkButton = android && isSupported;

  const { setModalOpen } = useModalUi();
  useEffect(() => {
    if (!open || embedded) return;
    setModalOpen(true);
    return () => setModalOpen(false);
  }, [open, embedded, setModalOpen]);

  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (!error) return;
    if (lastErrorRef.current === error) return;
    lastErrorRef.current = error;

    if (error === "not-allowed" || error === "service-not-allowed") {
      toast.error(t("capture.toast.micDenied", "Permiso de micrófono denegado."));
    } else if (error === "no-speech") {
      toast.message(t("capture.toast.noSpeech", "No detecté voz. Prueba de nuevo."));
    } else {
      toast.error(t("capture.toast.dictationError", "Error de dictado."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, uiLang]);

  useEffect(() => {
    if (!listening) {
      setInterim("");
      setTalkPressed(false);
    }
  }, [listening]);

  const startedRef = useRef(false);

  const handleTalkDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!showTalkButton) return;
    e.preventDefault();
    e.stopPropagation();

    hapticTick(20);
    setTalkPressed(true);
    setRippleTick((n) => n + 1);

    blurTextarea();
    setTimeout(blurTextarea, 0);

    try {
      (e.currentTarget as any)?.setPointerCapture?.(e.pointerId);
    } catch {}

    setText((prev) => ensureNewBulletBlock(prev ?? ""));

    if (startedRef.current) return;
    startedRef.current = true;

    start(
      ({ finalText, interimText }) => {
        setInterim(interimText || "");
        if (finalText) appendFinalDelta(finalText);
      },
      speechLangByUiLang[uiLang] || "en-US"
    );
  };

  const handleTalkUp = (e?: ReactPointerEvent<HTMLButtonElement>) => {
    if (!showTalkButton) return;

    if (e) {
      e.preventDefault();
      e.stopPropagation();
      try {
        (e.currentTarget as any)?.releasePointerCapture?.(e.pointerId);
      } catch {}
    }

    startedRef.current = false;
    stop();
    setInterim("");
    setTalkPressed(false);
  };

  const handlePaste = async () => {
    blurTextarea();
    try {
      if (!navigator.clipboard?.readText) {
        toast.error(
          t("capture.toast.pasteUnavailable", "No puedo pegar aquí (portapapeles no disponible).")
        );
        return;
      }
      const clip = await navigator.clipboard.readText();
      const normalizedClip = normalizeIncomingText(clip);
      if (!normalizedClip) {
        toast.message(t("capture.toast.clipboardEmpty", "No hay texto en el portapapeles."));
        return;
      }

      // ✅ conserva saltos de línea; si ya hay texto, pega en nueva línea
      setText((prev) => {
        const p = String(prev ?? "");
        if (!p.trim()) return normalizedClip;
        if (p.endsWith("\n")) return p + normalizedClip;
        return p + "\n" + normalizedClip;
      });
    } catch {
      toast.error(
        t("capture.toast.pasteError", "No pude acceder al portapapeles. Mantén pulsado y pega.")
      );
    }
  };

  const handleSave = async () => {
    startedRef.current = false;
    stop();
    blurTextarea();

    const trimmed = text.trim();
    if (!trimmed) {
      toast.message(t("capture.toast.writeSomething", "Escribe algo primero."));
      return;
    }

    // ✅ FIX: el título conserva saltos de línea (primer bloque)
    const title = titleFromMindDump(trimmed);
    if (!title) {
      toast.message(t("capture.toast.writeSomething", "Escribe algo primero."));
      return;
    }

    const body = stripVisualBullets(trimmed);

    try {
      if (itemKind === "idea") {
        if (onCreateIdea) {
          await onCreateIdea(title, body);
        } else {
          await onCreateTask(title, null, "NONE", "none");
        }
        onClose();
        return;
      }

      const hasDate = !!pickedDate;
      const time = pickedTime || "12:00";
      const dueDateISO = hasDate ? buildISOFromLocalParts(pickedDate, time) : null;

      const finalReminderMode: ReminderMode = dueDateISO ? reminderMode : "NONE";
      const finalRepeatType: RepeatType = habitRepeat;

      await onCreateTask(title, dueDateISO, finalReminderMode, finalRepeatType);
      onClose();
    } catch {
      toast.error(t("capture.toast.saveError", "No se pudo guardar."));
      if (onOpenReview) onOpenReview(trimmed);
    }
  };

  const handleClose = () => {
    startedRef.current = false;
    stop();
    blurTextarea();
    onClose();
  };

  const updateCaret = () => {
    const node = textareaRef.current;
    if (!node) return;
    try {
      const offs = getSelectionOffsetsInElement(node);
      caretRef.current = offs?.start ?? node.innerText.length;
      setCaretTick((n) => n + 1);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof initialTextNonce === "number") {
      setText(normalizeIncomingText(initialText ?? ""));
      setChipStage("ROOT");
      setActiveRootChip(null);
      caretRef.current = 0;
      setCaretTick((n) => n + 1);

      setItemKind("task");
      setTypeTouched(false);

      setPickedDate("");
      setPickedTime("");
      setReminderMode("NONE");
      setHabitRepeat("none");

      setDateTouched(false);
      setTimeTouched(false);
      setReminderTouched(false);
      setHabitTouched(false);

      setReminderMenuOpen(false);
      setRepeatMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTextNonce]);

  useEffect(() => {
    if (!open) {
      startedRef.current = false;
      stop();
      setInterim("");
      setTalkPressed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const update = () => setKbdOffset(getKeyboardOffsetPx());
    update();

    const vv = window.visualViewport;

    let raf = 0;
    const updateRaf = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    if (vv) {
      vv.addEventListener("resize", updateRaf);
      vv.addEventListener("scroll", updateRaf);
    }
    window.addEventListener("resize", updateRaf);

    return () => {
      cancelAnimationFrame(raf);
      if (vv) {
        vv.removeEventListener("resize", updateRaf);
        vv.removeEventListener("scroll", updateRaf);
      }
      window.removeEventListener("resize", updateRaf);
    };
  }, [open]);

  // ✅ cerrar menús al hacer click fuera / al cerrar modal
  useEffect(() => {
    if (!open) return;

    const onDown = (e: any) => {
      const tnode = e?.target as Node | null;
      if (!tnode) return;

      // Si click dentro de algún menú, no cerrar
      if (reminderMenuRef.current && reminderMenuRef.current.contains(tnode)) return;
      if (repeatMenuRef.current && repeatMenuRef.current.contains(tnode)) return;

      setReminderMenuOpen(false);
      setRepeatMenuOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true } as any);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown as any);
    };
  }, [open]);

  /* ───────────────────────────────
     ✅ Smart chips helpers (cursor + línea actual)
  ──────────────────────────────── */

  const insertAtCursor = (snippet: string) => {
    const node = textareaRef.current;
    const s = String(snippet ?? "");
    if (!s) return;

    if (!node) {
      setText((prev) => (prev ? `${prev}${prev.endsWith("\n") ? "" : "\n"}${s}` : s));
      return;
    }

    const offs = getSelectionOffsetsInElement(node);
    const start = offs?.start ?? node.innerText.length;
    const end = offs?.end ?? node.innerText.length;

    setText((prev) => {
      const current = String(prev ?? "");
      const safeStart = Math.min(start, current.length);
      const safeEnd = Math.min(end, current.length);
      const next = current.slice(0, safeStart) + s + current.slice(safeEnd);

      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        try {
          const pos = Math.min(safeStart + s.length, el.innerText.length);
          setSelectionOffsetsInElement(el, pos, pos);
          caretRef.current = pos;
          setCaretTick((n) => n + 1);
          el.focus();
        } catch {
          // ignore
        }
      });

      return next;
    });
  };

  const getCurrentLineInfo = (full: string, caretIndex: number) => {
    const s = String(full ?? "");
    const idx = Math.max(0, Math.min(caretIndex, s.length));
    const lineStart = s.lastIndexOf("\n", idx - 1) + 1;
    const nextNl = s.indexOf("\n", idx);
    const lineEnd = nextNl === -1 ? s.length : nextNl;
    const rawLine = s.slice(lineStart, lineEnd);
    const line = rawLine.replace(/^\s*•\s*/, "").trim();
    return { line, lineStart, lineEnd, rawLine };
  };

  const detection = useMemo(() => {
    const es = {
      root: [
        { id: "buy" as const, re: /^(compr|compra|comprar)\b/i },
        { id: "call" as const, re: /^(llama|llamar|llamad|llam)\b/i },
        { id: "pay" as const, re: /^(paga|pagar|pago)\b/i },
        { id: "birthday" as const, re: /^(cumple|cumpleanos)\b/i },
        { id: "appointment" as const, re: /^(cita|reunion)\b/i },
        { id: "idea" as const, re: /^(idea)\b/i },
      ],
      scheduleTokens: [
        /\bel\b/i,
        /\bcada\b/i,
        /\bantes de\b/i,
        /\bantes del\b/i,
        /\bhoy\b/i,
        /\bmanana\b/i,
        /\besta semana\b/i,
        /\beste\b/i,
        /\bproxim[oa]\b/i,
      ],
      timeTokens: [/\ba las\b/i, /\b\d{1,2}:\d{2}\b/, /\b\d{1,2}\b/],
      reminderTokens: [/\brecordar\b/i, /\brecuerdame\b/i, /\bnotificar\b/i],
    };

    const en = {
      root: [
        { id: "buy" as const, re: /^(buy|purchase)\b/i },
        { id: "call" as const, re: /^(call|ring)\b/i },
        { id: "pay" as const, re: /^(pay)\b/i },
        { id: "birthday" as const, re: /^(birthday)\b/i },
        { id: "appointment" as const, re: /^(meeting|appointment)\b/i },
        { id: "idea" as const, re: /^(idea)\b/i },
      ],
      scheduleTokens: [/\bon\b/i, /\bevery\b/i, /\bbefore\b/i, /\btoday\b/i, /\btomorrow\b/i],
      timeTokens: [/\bat\b/i, /\b\d{1,2}:\d{2}\b/, /\b\d{1,2}\s?(am|pm)\b/i],
      reminderTokens: [/\bremind\b/i, /\bnotify\b/i],
    };

    const de = {
      root: [
        { id: "buy" as const, re: /^(kauf|kaufen)\b/i },
        { id: "call" as const, re: /^(anrufen|ruf)\b/i },
        { id: "pay" as const, re: /^(zahlen|bezahlen)\b/i },
        { id: "birthday" as const, re: /^(geburtstag)\b/i },
        { id: "appointment" as const, re: /^(termin|meeting)\b/i },
        { id: "idea" as const, re: /^(idee)\b/i },
      ],
      scheduleTokens: [/\bam\b/i, /\bjeden\b/i, /\bvor\b/i, /\bheute\b/i, /\bmorgen\b/i],
      timeTokens: [/\bum\b/i, /\b\d{1,2}:\d{2}\b/],
      reminderTokens: [/\berinner\b/i, /\bbenachrichtig\b/i],
    };

    const map: Record<UiLang, typeof es> = { es, en: en as any, de: de as any };
    return map[uiLang] ?? es;
  }, [uiLang]);

  const rootChips = useMemo(() => {
    // ⛔️ Idea desactivada: no mostrar en “Atajos inteligentes”
    // const ideaChip = {
    //   id: "idea" as const,
    //   label: t("capture.chip.idea", "Idea"),
    //   word: t("capture.chip.ideaWord", "Idea:"),
    // };

    const others = [
      {
        id: "buy" as const,
        label: t("capture.chip.buy", "Comprar"),
        word: t("capture.chip.buyWord", "Comprar"),
      },
      {
        id: "call" as const,
        label: t("capture.chip.call", "Llamar"),
        word: t("capture.chip.callWord", "Llamar"),
      },
      {
        id: "pay" as const,
        label: t("capture.chip.pay", "Pagar"),
        word: t("capture.chip.payWord", "Pagar"),
      },
      {
        id: "birthday" as const,
        label: t("capture.chip.birthday", "Cumpleaños"),
        word: t("capture.chip.birthdayWord", "Cumpleaños"),
      },
      {
        id: "appointment" as const,
        label: t("capture.chip.appt", "Cita"),
        word: t("capture.chip.apptWord", "Cita"),
      },
    ] as const;

    // ✅ solo los atajos restantes
    return others;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang]);

  const scheduleChips = useMemo(() => {
    if (uiLang === "en") {
      return [
        {
          id: "on",
          label: t("capture.chip.schedule.on", "on"),
          insert: withGap(t("capture.chip.schedule.on", "on")),
        },
        {
          id: "every",
          label: t("capture.chip.schedule.every", "every"),
          insert: withGap(t("capture.chip.schedule.every", "every")),
        },
        {
          id: "before",
          label: t("capture.chip.schedule.before", "before"),
          insert: withGap(t("capture.chip.schedule.before", "before")),
        },
        {
          id: "today",
          label: t("capture.chip.schedule.today", "today"),
          insert: withGap(t("capture.chip.schedule.today", "today")),
        },
        {
          id: "tomorrow",
          label: t("capture.chip.schedule.tomorrow", "tomorrow"),
          insert: withGap(t("capture.chip.schedule.tomorrow", "tomorrow")),
        },
      ];
    }
    if (uiLang === "de") {
      return [
        {
          id: "am",
          label: t("capture.chip.schedule.am", "am"),
          insert: withGap(t("capture.chip.schedule.am", "am")),
        },
        {
          id: "jeden",
          label: t("capture.chip.schedule.jeden", "jeden"),
          insert: withGap(t("capture.chip.schedule.jeden", "jeden")),
        },
        {
          id: "vor",
          label: t("capture.chip.schedule.vor", "vor"),
          insert: withGap(t("capture.chip.schedule.vor", "vor")),
        },
        {
          id: "heute",
          label: t("capture.chip.schedule.heute", "heute"),
          insert: withGap(t("capture.chip.schedule.heute", "heute")),
        },
        {
          id: "morgen",
          label: t("capture.chip.schedule.morgen", "morgen"),
          insert: withGap(t("capture.chip.schedule.morgen", "morgen")),
        },
      ];
    }
    return [
      { id: "el", label: t("capture.chip.schedule.el", "el"), insert: withGap(t("capture.chip.schedule.el", "el")) },
      { id: "cada", label: t("capture.chip.schedule.cada", "cada"), insert: withGap(t("capture.chip.schedule.cada", "cada")) },
      {
        id: "antesDel",
        label: t("capture.chip.schedule.antesDel", "antes del"),
        insert: withGap(t("capture.chip.schedule.antesDel", "antes del")),
      },
      { id: "hoy", label: t("capture.chip.schedule.hoy", "hoy"), insert: withGap(t("capture.chip.schedule.hoy", "hoy")) },
      {
        id: "manana",
        label: t("capture.chip.schedule.manana", "mañana"),
        insert: withGap(t("capture.chip.schedule.manana", "mañana")),
      },
    ];
  }, [uiLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const timeChips = useMemo(() => {
    const defaultPrefix = uiLang === "en" ? "at" : uiLang === "de" ? "um" : "a las";
    const default0900 = uiLang === "en" ? "9:00" : "09:00";

    return [
      {
        id: "prefix",
        label: t("capture.chip.time.prefix", defaultPrefix),
        insert: withGap(t("capture.chip.time.prefix", defaultPrefix)),
      },
      { id: "9", label: t("capture.chip.time.t0900", default0900), insert: withGap(t("capture.chip.time.t0900", default0900)) },
      { id: "18", label: t("capture.chip.time.t1800", "18:00"), insert: withGap(t("capture.chip.time.t1800", "18:00")) },
    ];
  }, [uiLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const reminderChips = useMemo(() => {
    const fallbackDailyLabel = uiLang === "en" ? "every day" : uiLang === "de" ? "jeden Tag" : "cada día";
    const fallbackDayBeforeLabel = uiLang === "en" ? "day before" : uiLang === "de" ? "Vortag" : "día de antes";

    const fallbackDailyInsert =
      uiLang === "en" ? "standard reminder" : uiLang === "de" ? "Standard-Erinnerung" : "recordatorio estándar";
    const fallbackDayBeforeInsert =
      uiLang === "en" ? "remind the day before" : uiLang === "de" ? "am Vortag erinnern" : "recordar el día de antes";

    return [
      { id: "daily", label: t("capture.chip.reminder.dailyLabel", fallbackDailyLabel), insert: withGap(t("capture.chip.reminder.dailyInsert", fallbackDailyInsert)) },
      {
        id: "dayBefore",
        label: t("capture.chip.reminder.dayBeforeLabel", fallbackDayBeforeLabel),
        insert: withGap(t("capture.chip.reminder.dayBeforeInsert", fallbackDayBeforeInsert)),
      },
    ];
  }, [uiLang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;

    const caret = caretRef.current ?? 0;
    const { line } = getCurrentLineInfo(text, caret);
    const foldedLine = foldForMatch(line);

    const foundRoot = detection.root.find((r) => r.re.test(foldedLine));
    const nextRoot: RootChipId | null = (foundRoot?.id as any) ?? null;

    if (!nextRoot) {
      if (activeRootChip !== null) setActiveRootChip(null);
      if (chipStage !== "ROOT") setChipStage("ROOT");
      return;
    }

    const hasSchedule = detection.scheduleTokens.some((re) => re.test(foldedLine));
    const hasTime = detection.timeTokens.some((re) => re.test(foldedLine));
    const hasReminder = detection.reminderTokens.some((re) => re.test(foldedLine));

    let nextStage: ChipStage = "SCHEDULE";
    if (hasTime || hasReminder) nextStage = "REMINDER";
    else if (hasSchedule) nextStage = "TIME";
    else nextStage = "SCHEDULE";

    if (activeRootChip !== nextRoot) setActiveRootChip(nextRoot);
    if (chipStage !== nextStage) setChipStage(nextStage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, caretTick, open, detection]);

  useEffect(() => {
    if (!open) return;
    if (typeTouched) return;

    const next: ItemKind = activeRootChip === "idea" ? "idea" : "task";
    if (next !== itemKind) {
      setItemKind(next);

      if (next === "idea") {
        setPickedDate("");
        setPickedTime("");
        setReminderMode("NONE");
        setHabitRepeat("none");
        setDateTouched(false);
        setTimeTouched(false);
        setReminderTouched(false);
        setHabitTouched(false);
      }
    }
  }, [open, activeRootChip, typeTouched, itemKind]);

  const handleRootChip = (id: RootChipId) => {
    hapticTick(12);

    const word =
      rootChips.find((c) => c.id === id)?.word ??
      (id === "buy" ? "Comprar" : id === "call" ? "Llamar" : id === "pay" ? "Pagar" : id);

    insertAtCursor(withGap(word));
  };

  const handleScheduleChip = (insert: string) => {
    hapticTick(10);
    const prefix = text.endsWith(" ") || text.endsWith("\n") ? "" : " ";
    insertAtCursor(prefix + insert);
  };

  const handleTimeChip = (insert: string) => {
    hapticTick(10);
    const prefix = text.endsWith(" ") || text.endsWith("\n") ? "" : " ";
    insertAtCursor(prefix + insert);
  };

  const handleReminderChip = (insert: string) => {
    hapticTick(10);
    const prefix = text.endsWith(" ") || text.endsWith("\n") ? "" : " ";
    insertAtCursor(prefix + insert);
  };

  const resetChips = () => {
    hapticTick(10);
    setChipStage("ROOT");
    setActiveRootChip(null);
  };

  const currentLine = useMemo(() => {
    const caret = caretRef.current ?? 0;
    return getCurrentLineInfo(text, caret).line ?? "";
  }, [text, caretTick]);

  // ✅ NUEVO: texto completo para detección global (sin bullets visuales)
  const allTextForSignals = useMemo(() => {
    return stripVisualBullets(String(text ?? ""));
  }, [text]);

  // ✅ CAMBIO CLAVE:
  // - Primero intenta detectar en la línea actual (comportamiento previo)
  // - Si no hay nada, busca en TODO el texto (para que no dependa del caret/pointer)
  const detectedDate = detectDateSignal(currentLine) ?? detectDateSignal(allTextForSignals);
  const detectedTime = detectTimeSignal(currentLine) ?? detectTimeSignal(allTextForSignals);
  const detectedReminder = detectReminderSignal(currentLine) ?? detectReminderSignal(allTextForSignals);
  const detectedHabit = detectHabitSignal(currentLine) ?? detectHabitSignal(allTextForSignals);
  const highlightTokens = useMemo(() => {
    const base = collectHighlightTokens(text);
    const fromSignals = collectSignalTokens(text, [
      { kind: "date", value: detectedDate },
      { kind: "time", value: detectedTime },
      { kind: "reminder", value: detectedReminder },
      { kind: "habit", value: detectedHabit },
    ]);
    const merged = [...base, ...fromSignals];
    if (merged.length === 0) return merged;

    merged.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      const pr = HIGHLIGHT_PRIORITY[b.kind] - HIGHLIGHT_PRIORITY[a.kind];
      if (pr !== 0) return pr;
      return b.end - b.start - (a.end - a.start);
    });

    const selected: HighlightToken[] = [];
    for (const token of merged) {
      const overlaps = selected.some(
        (taken) => token.start < taken.end && token.end > taken.start
      );
      if (!overlaps) selected.push(token);
    }
    return selected.sort((a, b) => a.start - b.start);
  }, [text, detectedDate, detectedTime, detectedReminder, detectedHabit]);
  const highlightedHtml = useMemo(() => buildHighlightedHtml(text, highlightTokens), [text, highlightTokens]);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;

    const currentText = node.innerText.replace(/\r/g, "");
    const selection = getSelectionOffsetsInElement(node);
    const desiredStart = selection?.start ?? Math.min(caretRef.current, text.length);
    const desiredEnd = selection?.end ?? desiredStart;

    if (currentText !== text || node.innerHTML !== highlightedHtml) {
      node.innerHTML = highlightedHtml;
      setSelectionOffsetsInElement(node, desiredStart, desiredEnd);
    }
  }, [text, highlightedHtml]);

  useEffect(() => {
    if (itemKind !== "task") return;

    if (!dateTouched) {
      const iso = parseDateToISO(detectedDate, uiLang);
      if (iso && iso !== pickedDate) setPickedDate(iso);
      if (!iso && pickedDate) setPickedDate("");
    }

    if (!timeTouched) {
      const hhmm = parseTimeToHHMM(detectedTime);
      if (hhmm && hhmm !== pickedTime) setPickedTime(hhmm);
      if (!hhmm && pickedTime) setPickedTime("");
    }

    if (!reminderTouched) {
      const mode = mapReminderSignalToMode(detectedReminder);
      if (mode && mode !== reminderMode) setReminderMode(mode);
      if (!mode && reminderMode !== "NONE") setReminderMode("NONE");
    }

    if (!habitTouched) {
      const rt = mapHabitSignalToRepeat(detectedHabit);
      if (rt && rt !== habitRepeat) setHabitRepeat(rt);
      if (!rt && habitRepeat !== "none") setHabitRepeat("none");
    }
  }, [
    itemKind,
    detectedDate,
    detectedTime,
    detectedReminder,
    detectedHabit,
    uiLang,
    dateTouched,
    timeTouched,
    reminderTouched,
    habitTouched,
    pickedDate,
    pickedTime,
    reminderMode,
    habitRepeat,
  ]);

  const hasSomeDate = itemKind === "task" && !!(pickedDate || detectedDate);

  /* ───────────────────────────────
     Render gating (después de hooks)
  ──────────────────────────────── */
  if (!open) return null;

  const isKeyboardOpen = isFocused && kbdOffset > 80;
  const showInlineSave = !isKeyboardOpen;

  const showTalkActiveRing = listening;
  const showTalkRipple = talkPressed || listening;

  const chipTitle =
    chipStage === "ROOT"
      ? t("capture.chips.title", "Atajos inteligentes")
      : chipStage === "SCHEDULE"
        ? t("capture.chips.title2", "Fecha / hábito")
        : chipStage === "TIME"
          ? t("capture.chips.title3", "Hora")
          : t("capture.chips.title4", "Recordatorio");

  // ✅ labels (píldoras)
  const bcp47 = uiLangToBCP47(uiLang);

  const dateLabel = (() => {
    if (itemKind !== "task") return t("pill.date", "Fecha");
    if (!pickedDate) return t("pill.date", "Fecha");
    if (sameISODate(pickedDate, todayISO())) return t("common.today", "Hoy");
    try {
      const d = new Date(`${pickedDate}T00:00:00`);
      return new Intl.DateTimeFormat(bcp47, { day: "2-digit", month: "short" }).format(d);
    } catch {
      return pickedDate;
    }
  })();

  const timeLabel = (() => {
    if (itemKind !== "task") return t("pill.time", "Hora");
    return pickedTime ? pickedTime : t("pill.time", "Hora");
  })();

  const reminderLabel = (() => {
    if (itemKind !== "task") return t("pill.reminder.none", "Sin recordatorio");
    if (!hasSomeDate || reminderMode === "NONE") return t("pill.reminder.none", "Sin recordatorio");
    if (reminderMode === "DAILY_UNTIL_DUE") return t("pill.remDaily", "Diaria");
    if (reminderMode === "DAY_BEFORE_AND_DUE") return t("pill.remDayBefore", "1 día antes");
    if (reminderMode === "WEEK_BEFORE_AND_DUE") return t("pill.remWeekBefore", "1 semana antes");
    return t("pill.reminder.none", "Sin recordatorio");
  })();

  const repeatLabel = (() => {
    if (itemKind !== "task") return t("pill.repeat.none", "Sin repetición");
    if (habitRepeat === "none") return t("pill.repeat.none", "Sin repetición");
    if (habitRepeat === "daily") return t("pill.habitDaily", "Diaria");
    if (habitRepeat === "weekly") return t("pill.habitWeekly", "Semanal");
    if (habitRepeat === "monthly") return t("pill.habitMonthly", "Mensual");
    if (habitRepeat === "yearly") return t("pill.habitYearly", "Anual");
    return t("pill.repeat.none", "Sin repetición");
  })();

  return (
    <div
      className={embedded ? "relative w-full" : "fixed inset-0 z-[1000]"}
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{`
        @keyframes remiRipple {
          from { transform: scale(0); opacity: .35; }
          to   { transform: scale(2.2); opacity: 0; }
        }
        .remi-ripple {
          position: absolute;
          inset: -10px;
          border-radius: 999px;
          background: rgba(125,89,201,0.22);
          animation: remiRipple .55s ease-out;
          pointer-events: none;
        }
        @keyframes remiRingPulse {
          0%   { transform: scale(0.96); opacity: .25; }
          50%  { transform: scale(1.06); opacity: .45; }
          100% { transform: scale(0.96); opacity: .25; }
        }
        .remi-ring {
          position: absolute;
          inset: -6px;
          border-radius: 999px;
          border: 2px solid rgba(125,89,201,0.35);
          animation: remiRingPulse 1.1s ease-in-out infinite;
          pointer-events: none;
        }
        .remi-chipRow {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .remi-chipRow::-webkit-scrollbar {
          display: none;
          width: 0; height: 0;
        }
        .remi-editor:empty:before {
          content: attr(data-placeholder);
          color: rgba(15,23,42,0.35);
        }
      `}</style>

      {!embedded && <div className="absolute inset-0" style={{ background: "#ffffff" }} />}

      <div
        className={embedded ? "relative flex flex-col w-full" : "absolute inset-0 flex flex-col"}
        style={
          embedded
            ? {
                background: "transparent",
                borderRadius: 0,
                overflow: "visible",
                border: "none",
                boxShadow: "none",
              }
            : undefined
        }
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10"
          style={{
            background: embedded ? "transparent" : "linear-gradient(135deg, #9a86ff 0%, #7d59c9 48%, #665ed1 100%)",
            color: embedded ? "#0f172a" : "#ffffff",
            borderBottomLeftRadius: embedded ? 0 : 24,
            borderBottomRightRadius: embedded ? 0 : 24,
            border: embedded ? "none" : "1px solid rgba(255,255,255,0.18)",
            boxShadow: embedded ? "none" : "0 10px 24px rgba(93,69,179,0.22)",
            backdropFilter: embedded ? "none" : "blur(8px)",
          }}
        >
          {!embedded && <div
            aria-hidden
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "999px",
              background: "rgba(255,255,255,0.14)",
              top: -90,
              left: -60,
              filter: "blur(1px)",
              pointerEvents: "none",
            }}
          />}
          {!embedded && <div
            aria-hidden
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "999px",
              background: "rgba(255,255,255,0.10)",
              top: -110,
              right: -70,
              filter: "blur(1px)",
              pointerEvents: "none",
            }}
          />}
          {!embedded && <div
            className="pb-4 flex items-start justify-between"
            style={{
              paddingTop: "calc(16px + env(safe-area-inset-top))",
              paddingLeft: "calc(20px + env(safe-area-inset-left))",
              paddingRight: "calc(20px + env(safe-area-inset-right))",
            }}
          >
            <div className="min-w-0 pr-3">
              <div className="text-[22px] font-extrabold leading-tight" style={{ color: "#ffffff" }}>
                {t("capture.title", "Vacía tu mente")}
              </div>

              <div className="text-[16px] mt-0.5 font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
                {t("capture.subtitle", "Habla, escribe o pega texto. Remi se encarga.")}
              </div>

              {showTalkButton && listening && (
                <div className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.92)" }}>
                  {t("capture.listening", "Escuchando…")}{" "}
                  {interim ? (
                    <span style={{ color: "rgba(255,255,255,0.70)" }}>{interim}</span>
                  ) : null}
                </div>
              )}
            </div>

            {!embedded && (
              <button
                data-no-focus
                onClick={handleClose}
                aria-label={t("common.close", "Cerrar")}
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  cursor: "pointer",
                }}
              >
                <X className="h-5 w-5" style={{ color: "rgba(255,255,255,0.95)" }} />
              </button>
            )} 
          </div>}

          {/* ✅ Smart chips bar (AUTO) */}
          <div
            style={{
              paddingTop: embedded ? 12 : 0,
              paddingBottom: 14,
              paddingLeft: embedded ? 0 : "calc(20px + env(safe-area-inset-left))",
              paddingRight: embedded ? 0 : "calc(20px + env(safe-area-inset-right))",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: embedded ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.92)" }}>
                {chipTitle}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {chipStage !== "ROOT" && (
                  <button
                    type="button"
                    onClick={resetChips}
                    style={{
                      height: 26,
                      padding: "0 10px",
                      borderRadius: 999,
                      border: embedded ? "1px solid #c7b5f6" : "1px solid rgba(255,255,255,0.28)",
                      background: embedded ? "#f3f4f6" : "rgba(255,255,255,0.10)",
                      color: embedded ? "#111827" : "rgba(255,255,255,0.95)",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                    title={t("capture.chips.backHint", "Volver a atajos")}
                    aria-label={t("capture.chips.backHint", "Volver a atajos")}
                  >
                    <Sparkles size={14} style={{ display: "inline-block", marginRight: 6 }} />
                    {t("capture.chips.back", "Atajos")}
                  </button>
                )}
              </div>
            </div>

            <div
              className="remi-chipRow"
              style={{
                marginTop: 10,
                display: "flex",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                gap: 8,
                paddingBottom: 2,
                alignItems: "center",
              }}
            >
              {chipStage === "ROOT" && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {rootChips.map((c) => (
                    <Chip key={c.id} label={c.label} embedded={embedded} onClick={() => handleRootChip(c.id)} />
                  ))}
                </div>
              )}

              {chipStage === "SCHEDULE" &&
                scheduleChips.map((c) => (
                  <Chip key={c.id} label={c.label} embedded={embedded} onClick={() => handleScheduleChip(c.insert)} />
                ))}

              {chipStage === "TIME" &&
                timeChips.map((c) => (
                  <Chip key={c.id} label={c.label} embedded={embedded} onClick={() => handleTimeChip(c.insert)} />
                ))}

              {chipStage === "REMINDER" &&
                reminderChips.map((c) => (
                  <Chip key={c.id} label={c.label} embedded={embedded} onClick={() => handleReminderChip(c.insert)} />
                ))}

              <Chip label="↵" embedded={embedded} onClick={() => insertAtCursor("\n")} />
            </div>
          </div>
        </div>

        {/* Body (ocupa el espacio restante entre header y barra inferior) */}
        <div
          className={
            embedded
              ? "relative overflow-hidden px-2 pt-0 pb-0"
              : "relative flex-1 overflow-hidden px-5 pt-5 pb-4"
          }
        >
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden"
            onPointerDown={(e) => {
              const target = e.target as HTMLElement | null;
              if (!target) return;

              // Do not steal interactions from actionable controls.
              if (
                target.closest(
                  "button,[data-no-focus],input,select,textarea,[role='button']",
                )
              ) {
                return;
              }

              const node = textareaRef.current;
              if (!node) return;

              // If the tap is outside the contentEditable node but inside the textarea shell,
              // focus editor and place caret at end.
              if (!node.contains(target)) {
                node.focus();
                try {
                  const pos = node.innerText.length;
                  setSelectionOffsetsInElement(node, pos, pos);
                  caretRef.current = pos;
                  setCaretTick((n) => n + 1);
                } catch {}
                return;
              }

              // Ensure the editor gets focus on any touch/click inside it.
              if (document.activeElement !== node) {
                node.focus();
              }
            }}
            style={{
              background: "#fff",
              border: "1px solid rgba(15,23,42,0.15)",
              boxShadow: embedded ? "none" : "0 10px 30px rgba(15,23,42,0.06)",
              minHeight: embedded ? (showSettingsPanel ? 200 : 260) : undefined,
              transition: "min-height 240ms ease",
            }}
          >
            <div
              ref={textareaRef}
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              onInput={(e) => {
                const node = e.currentTarget as HTMLDivElement;
                setText(node.innerText.replace(/\r/g, ""));
                requestAnimationFrame(updateCaret);
              }}
              onKeyUp={() => updateCaret()}
              onClick={() => updateCaret()}
              onMouseUp={() => updateCaret()}
              onFocus={() => {
                setIsFocused(true);
                requestAnimationFrame(updateCaret);
              }}
              onBlur={() => {
                setIsFocused(false);
                const node = textareaRef.current;
                if (!node) return;
                const plain = node.innerText.replace(/\r/g, "").trim();
                if (!plain) {
                  node.innerHTML = "";
                  setText("");
                  caretRef.current = 0;
                  setCaretTick((n) => n + 1);
                }
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData?.getData("text") ?? "";
                const normalized = normalizeIncomingText(pasted);
                if (!normalized) return;

                e.preventDefault();

                const el = e.currentTarget as HTMLDivElement | null;
                const offs = el ? getSelectionOffsetsInElement(el) : null;
                const startRaw = offs?.start;
                const endRaw = offs?.end;

                setText((prev) => {
                  const current = String(prev ?? "");
                  const start =
                    typeof startRaw === "number" ? Math.min(startRaw, current.length) : current.length;
                  const end =
                    typeof endRaw === "number" ? Math.min(endRaw, current.length) : start;

                  const next = current.slice(0, start) + normalized + current.slice(end);

                  requestAnimationFrame(() => {
                    const node = textareaRef.current;
                    if (!node) return;
                    try {
                      const pos = Math.min(start + normalized.length, node.innerText.length);
                      setSelectionOffsetsInElement(node, pos, pos);
                      caretRef.current = pos;
                      setCaretTick((n) => n + 1);
                    } catch {}
                  });

                  return next;
                });
              }}
              className="remi-editor w-full h-full overflow-auto bg-transparent outline-none text-[18px] leading-7"
              style={{
                position: "relative",
                zIndex: 2,
                color: REMI_TEXT,
                caretColor: REMI_TEXT,
                padding: 16,
                paddingBottom: embedded ? 88 : 16,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
              data-placeholder={t("capture.placeholder", "Toca para escribir")}
            />

            {embedded && (
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  pointerEvents: "none",
                  zIndex: showSettingsPanel ? 2 : 6,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSettingsPanelOpen((v) => !v)}
                  aria-label={t("common.settings", "Ajustes")}
                  title={t("common.settings", "Ajustes")}
                  aria-pressed={settingsPanelOpen}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    border: "1px solid #c7b5f6",
                    background: "#f3f4f6",
                    color: "#7d59c9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    pointerEvents: "auto",
                  }}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>

                {showTalkButton ? (
                  <button
                    data-no-focus
                    type="button"
                    onPointerDown={handleTalkDown}
                    onPointerUp={handleTalkUp}
                    onPointerCancel={handleTalkUp}
                    onPointerLeave={handleTalkUp}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 999,
                      border: "1px solid #c7b5f6",
                      background: listening ? "#e9e5f3" : "#f3f4f6",
                      color: REMI_PURPLE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      userSelect: "none",
                      WebkitTouchCallout: "none",
                      WebkitUserSelect: "none",
                      touchAction: "none",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      pointerEvents: "auto",
                    }}
                    aria-pressed={listening}
                    title={t("capture.speakHold", "Mantén pulsado para hablar")}
                    aria-label={t("capture.speakHold", "Mantén pulsado para hablar")}
                  >
                    {showTalkActiveRing && <span className="remi-ring" />}
                    {showTalkRipple && <span key={rippleTick} className="remi-ripple" />}
                    <span style={{ position: "relative", zIndex: 2, display: "flex" }}>
                      <Mic className="h-5 w-5" />
                    </span>
                  </button>
                ) : (
                  <div style={{ width: 46, height: 46 }} />
                )}

                <button
                  data-no-focus
                  type="button"
                  onClick={handleSave}
                  onContextMenu={(e) => e.preventDefault()}
                  aria-label={t("common.save", "Guardar")}
                  title={t("common.save", "Guardar")}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    border: "1px solid rgba(125,89,201,0.35)",
                    background: REMI_PURPLE,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    pointerEvents: "auto",
                  }}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {embedded && ios && (
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              lineHeight: "16px",
              color: REMI_SUB,
              padding: "0 12px",
              marginTop: 6,
              marginBottom: showSettingsPanel ? 6 : 0,
            }}
          >
            {t("capture.iosKeyboardMicHint", "En iPhone: usa el micrófono del teclado para dictar.")}
          </div>
        )}

        {/* Barra inferior (solo modal completo) */}
        {(!embedded || showSettingsPanel) && (
          <div
            className="shrink-0"
            style={{
              paddingBottom: embedded ? 0 : "max(env(safe-area-inset-bottom), 14px)",
              position: "relative",
              zIndex: 20,
            }}
          >
            <div
              className="mx-auto"
              style={{
              width: embedded ? "calc(100% - 16px)" : "calc(100% - 32px)",
              maxWidth: embedded ? undefined : 420,
              pointerEvents: "auto",
              position: "relative",
            }}
          >
            {/* ⛔️ PÍLDORA DE IDIOMA (comentada para que no aparezca)
                - El idioma ahora viene del I18nContext (browser por defecto + Profile override)
                - Si quieres reactivarla en el futuro:
                  1) descomenta ChevronDown arriba
                  2) añade estados langOpen, setLangOpen y el effect de cierre
            */}
            {/* ... (bloque comentado de idioma intacto) ... */}

            {/* pill */}
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(15,23,42,0.15)",
                borderRadius: 16,
                padding: "10px 12px",
                boxShadow: "none",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="mt-1 space-y-2"
                style={{
                  overflow: showSettingsPanel ? "visible" : "hidden",
                  maxHeight: showSettingsPanel ? 520 : 0,
                  opacity: showSettingsPanel ? 1 : 0,
                  transform: showSettingsPanel ? "translateY(0)" : "translateY(-8px)",
                  transition: "max-height 240ms ease, opacity 220ms ease, transform 220ms ease",
                  pointerEvents: showSettingsPanel ? "auto" : "none",
                }}
              >
                {/* ✅ Tipo (task/idea) */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-extrabold text-slate-700">
                      {t("pill.type.label", "Tipo")}
                    </div>

                    <div className="flex items-center gap-2">
                      <PillButton
                        active={itemKind === "task"}
                        size="sm"
                        onClick={() => {
                          setTypeTouched(true);
                          setItemKind("task");
                        }}
                        icon={<List className="h-3.5 w-3.5" />}
                      >
                        {t("pill.type.task", "Tarea")}
                      </PillButton>

                      <PillButton
                        active={itemKind === "idea"}
                        variant="amber"
                        size="sm"
                        onClick={() => {
                          setTypeTouched(true);
                          setItemKind("idea");

                          setPickedDate("");
                          setPickedTime("");
                          setReminderMode("NONE");
                          setHabitRepeat("none");
                          setDateTouched(false);
                          setTimeTouched(false);
                          setReminderTouched(false);
                          setHabitTouched(false);

                          setReminderMenuOpen(false);
                          setRepeatMenuOpen(false);
                        }}
                        icon={<Lightbulb className="h-3.5 w-3.5" />}
                      >
                        {t("pill.type.idea", "Idea")}
                      </PillButton>
            </div>
          </div>
                </div>

                {/* ✅ NUEVO: 2x2 pills (Fecha / Hora / Recordatorio / Repetición) */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Fecha */}
                  <div className="relative">
                    <SettingPill
                      disabled={itemKind !== "task"}
                      icon={<Calendar className="h-4 w-4" style={{ color: REMI_PURPLE }} />}
                      text={dateLabel}
                      right={<CaretSquare />}
                      onClick={() => {
                        if (itemKind !== "task") return;
                        openNativePicker(dateInputRef);
                      }}
                    />

                    <input
                      ref={dateInputRef}
                      type="date"
                      value={pickedDate}
                      disabled={itemKind !== "task"}
                      onChange={(e) => {
                        setDateTouched(true);
                        setTypeTouched(true);
                        setPickedDate(e.target.value);
                      }}
                      className="absolute inset-0 opacity-0"
                      style={{
                        cursor: itemKind !== "task" ? "not-allowed" : "pointer",
                        // opcional, para que el click lo gestione siempre el pill:
                        pointerEvents: "none",
                      }}
                    />
                  </div>

                  {/* Hora */}
                  <div className="relative">
                    <SettingPill
                      disabled={itemKind !== "task"}
                      icon={<Clock className="h-4 w-4" style={{ color: REMI_PURPLE }} />}
                      text={timeLabel}
                      right={<CaretSquare />}
                      onClick={() => {
                        if (itemKind !== "task") return;
                        openNativePicker(timeInputRef);
                      }}
                    />

                    <input
                      ref={timeInputRef}
                      type="time"
                      value={pickedTime}
                      disabled={itemKind !== "task"}
                      onChange={(e) => {
                        setTimeTouched(true);
                        setTypeTouched(true);
                        setPickedTime(e.target.value);
                      }}
                      className="absolute inset-0 opacity-0"
                      style={{
                        cursor: itemKind !== "task" ? "not-allowed" : "pointer",
                        pointerEvents: "none",
                      }}
                    />
                  </div>

                  {/* Recordatorio */}
                  <div className="relative">
                    <SettingPill
                      disabled={itemKind !== "task"}
                      icon={<Bell className="h-4 w-4" style={{ color: REMI_PURPLE }} />}
                      text={reminderLabel}
                      right={<CaretSquare />}
                      onClick={() => {
                        if (itemKind !== "task") return;
                        setRepeatMenuOpen(false);
                        setReminderMenuOpen((v) => !v);
                      }}
                    />

                    <MenuPanel open={reminderMenuOpen} anchorRef={reminderMenuRef}>
                      <MenuItem
                        active={reminderMode === "NONE"}
                        onClick={() => {
                          setReminderTouched(true);
                          setTypeTouched(true);
                          setReminderMode("NONE");
                          setReminderMenuOpen(false);
                        }}
                      >
                        {t("pill.reminder.none", "Sin recordatorio")}
                      </MenuItem>

                      <MenuItem
                        active={reminderMode === "DAILY_UNTIL_DUE"}
                        disabled={!hasSomeDate}
                        onClick={() => {
                          if (!hasSomeDate) {
                            toast.message(t("capture.toast.pickDateFirst", "Elige una fecha primero."));
                            return;
                          }
                          setReminderTouched(true);
                          setTypeTouched(true);
                          setReminderMode("DAILY_UNTIL_DUE");
                          setReminderMenuOpen(false);
                        }}
                      >
                        {t("pill.remDaily", "Diaria")}
                      </MenuItem>

                      <MenuItem
                        active={reminderMode === "DAY_BEFORE_AND_DUE"}
                        disabled={!hasSomeDate}
                        onClick={() => {
                          if (!hasSomeDate) {
                            toast.message(t("capture.toast.pickDateFirst", "Elige una fecha primero."));
                            return;
                          }
                          setReminderTouched(true);
                          setTypeTouched(true);
                          setReminderMode("DAY_BEFORE_AND_DUE");
                          setReminderMenuOpen(false);
                        }}
                      >
                        {t("pill.remDayBefore", "1 día antes")}
                      </MenuItem>

                      <MenuItem
                        active={reminderMode === "WEEK_BEFORE_AND_DUE"}
                        disabled={!hasSomeDate}
                        onClick={() => {
                          if (!hasSomeDate) {
                            toast.message(t("capture.toast.pickDateFirst", "Elige una fecha primero."));
                            return;
                          }
                          setReminderTouched(true);
                          setTypeTouched(true);
                          setReminderMode("WEEK_BEFORE_AND_DUE");
                          setReminderMenuOpen(false);
                        }}
                      >
                        {t("pill.remWeekBefore", "1 semana antes")}
                      </MenuItem>
                    </MenuPanel>
                  </div>

                  {/* Repetición */}
                  <div className="relative">
                    <SettingPill
                      disabled={itemKind !== "task"}
                      icon={<Repeat className="h-4 w-4" style={{ color: REMI_PURPLE }} />}
                      text={repeatLabel}
                      right={<CaretSquare />}
                      onClick={() => {
                        if (itemKind !== "task") return;
                        setReminderMenuOpen(false);
                        setRepeatMenuOpen((v) => !v);
                      }}
                    />

                    <MenuPanel open={repeatMenuOpen} anchorRef={repeatMenuRef}>
                      <MenuItem
                        active={habitRepeat === "none"}
                        onClick={() => {
                          setHabitTouched(true);
                          setTypeTouched(true);
                          setHabitRepeat("none");
                          setRepeatMenuOpen(false);
                        }}
                      >
                        {t("pill.repeat.none", "Sin repetición")}
                      </MenuItem>

                      <MenuItem
                        active={habitRepeat === "daily"}
                        onClick={() => {
                          setHabitTouched(true);
                          setTypeTouched(true);
                          setHabitRepeat("daily");
                          setRepeatMenuOpen(false);
                        }}
                      >
                        {t("pill.habitDaily", "Diaria")}
                      </MenuItem>

                      <MenuItem
                        active={habitRepeat === "weekly"}
                        onClick={() => {
                          setHabitTouched(true);
                          setTypeTouched(true);
                          setHabitRepeat("weekly");
                          setRepeatMenuOpen(false);
                        }}
                      >
                        {t("pill.habitWeekly", "Semanal")}
                      </MenuItem>

                      <MenuItem
                        active={habitRepeat === "monthly"}
                        onClick={() => {
                          setHabitTouched(true);
                          setTypeTouched(true);
                          setHabitRepeat("monthly");
                          setRepeatMenuOpen(false);
                        }}
                      >
                        {t("pill.habitMonthly", "Mensual")}
                      </MenuItem>

                      <MenuItem
                        active={habitRepeat === "yearly"}
                        onClick={() => {
                          setHabitTouched(true);
                          setTypeTouched(true);
                          setHabitRepeat("yearly");
                          setRepeatMenuOpen(false);
                        }}
                      >
                        {t("pill.habitYearly", "Anual")}
                      </MenuItem>
                    </MenuPanel>
                  </div>
                </div>
              </div>

              {/* ✅ Botones debajo */}
              {!embedded && (
                <div
                  className="mt-3"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    alignItems: "center",
                  }}
                >
                {/* Pegar */}
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <button
                    data-no-focus
                    type="button"
                    onClick={handlePaste}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 999,
                      border: `1px solid ${REMI_PURPLE_BORDER}`,
                      background: REMI_PURPLE_BG,
                      color: REMI_PURPLE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      userSelect: "none",
                      WebkitTouchCallout: "none",
                      WebkitUserSelect: "none",
                      cursor: "pointer",
                    }}
                  >
                    <ClipboardPaste className="h-5 w-5" />
                  </button>
                  <div style={{ fontSize: 11, fontWeight: 800, color: REMI_PURPLE }}>
                    {t("common.paste", "Pegar")}
                  </div>
                </div>

                {/* Hablar */}
                <div className="flex flex-col items-center justify-center gap-1.5">
                  {showTalkButton ? (
                    <>
                      <button
                        data-no-focus
                        type="button"
                        onPointerDown={handleTalkDown}
                        onPointerUp={handleTalkUp}
                        onPointerCancel={handleTalkUp}
                        onPointerLeave={handleTalkUp}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 999,
                          border: `1px solid ${REMI_PURPLE_BORDER}`,
                          background: listening ? "rgba(125,89,201,0.18)" : REMI_PURPLE_BG,
                          color: REMI_PURPLE,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          userSelect: "none",
                          WebkitTouchCallout: "none",
                          WebkitUserSelect: "none",
                          touchAction: "none",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        aria-pressed={listening}
                        title={t("capture.speakHold", "Mantén pulsado para hablar")}
                        aria-label={t("capture.speakHold", "Mantén pulsado para hablar")}
                      >
                        {showTalkActiveRing && <span className="remi-ring" />}
                        {showTalkRipple && <span key={rippleTick} className="remi-ripple" />}

                        <span style={{ position: "relative", zIndex: 2, display: "flex" }}>
                          <Mic className="h-5 w-5" />
                        </span>
                      </button>

                      <div style={{ fontSize: 11, fontWeight: 800, color: REMI_PURPLE }}>
                        {t("common.speak", "Hablar")}
                      </div>
                    </>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Guardar (solo si NO hay teclado) */}
                <div className="flex flex-col items-center justify-center gap-1.5">
                  {showInlineSave ? (
                    <>
                      <button
                        data-no-focus
                        type="button"
                        onClick={handleSave}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 999,
                          border: "1px solid rgba(125,89,201,0.35)",
                          background: REMI_PURPLE,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 14px 30px rgba(35,18,90,0.28)",
                          cursor: "pointer",
                        }}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <div style={{ fontSize: 11, fontWeight: 900, color: REMI_PURPLE }}>
                        {t("common.save", "Guardar")}
                      </div>
                    </>
                  ) : (
                    <div />
                  )}
                </div>
                </div>
              )}
            </div>

            <div style={{ height: 6 }} />
          </div>
        </div>
      )}

        {/* FAB Guardar encima del teclado */}
        {false && isFocused && kbdOffset > 80 && (
          <button
            data-no-focus
            type="button"
            onClick={handleSave}
            onContextMenu={(e) => e.preventDefault()}
            aria-label={t("common.save", "Guardar")}
            style={{
              position: "fixed",
              right: 16,
              bottom: `calc(env(safe-area-inset-bottom) + ${Math.max(14, kbdOffset + 14)}px)`,
              width: 56,
              height: 56,
              borderRadius: 999,
              border: "1px solid rgba(125,89,201,0.35)",
              background: REMI_PURPLE,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 18px 45px rgba(35,18,90,0.30)",
              zIndex: 2000,
              cursor: "pointer",
            }}
          >
            <Check className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({
  label,
  onClick,
  embedded = false,
}: {
  label: string;
  onClick: () => void;
  embedded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: "0 0 auto",
        height: 30,
        padding: "0 12px",
        borderRadius: 999,
        border: embedded ? "1px solid #c7b5f6" : "1px solid rgba(255,255,255,0.30)",
        background: embedded ? "#f3f4f6" : "rgba(255,255,255,0.16)",
        color: embedded ? "#7d59c9" : "rgba(255,255,255,0.95)",
        fontSize: 11,
        fontWeight: 500,
        cursor: "pointer",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
      }}
    >
      {label}
    </button>
  );
}

function ChipSeparator() {
  return (
    <div
      aria-hidden="true"
      style={{
        flex: "0 0 auto",
        height: 30,
        display: "inline-flex",
        alignItems: "center",
        padding: "0 6px",
        color: "rgba(255,255,255,0.55)",
        fontSize: 12,
        fontWeight: 900,
        userSelect: "none",
      }}
    >
      |
    </div>
  );
}
