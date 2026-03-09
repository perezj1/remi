import { supabase } from "@/integrations/supabase/client";
import type { BrainItem } from "@/lib/brainItemsApi";
import {
  fetchSharedListItems,
  fetchSharedLists,
  type SharedList,
  type SharedListItem,
} from "@/lib/sharedListsApi";

type UiLang = "es" | "en" | "de";
type RecallSource = "brain_item" | "list";

export type MemoryRecallAnswer = {
  ok: boolean;
  answer: string;
  source: RecallSource | null;
  matchedLabel: string | null;
  confidence: number;
};

type BrainRecallCandidate = {
  source: "brain_item";
  item: BrainItem;
  score: number;
};

type ListRecallCandidate = {
  source: "list";
  list: SharedList;
  items: SharedListItem[];
  score: number;
};

type QueryIntent = "location" | "action" | "list" | "generic";

const STOPWORDS = new Set([
  "a", "al", "algo", "and", "ante", "are", "as", "at", "con", "cual", "cuales", "como", "cuál",
  "cuáles", "da", "das", "de", "del", "dem", "den", "der", "des", "die", "dime", "do", "donde",
  "dónde", "el", "ella", "en", "erinnerung", "erinnerungen", "es", "esta", "está", "estas",
  "este", "esto", "for", "gibt", "gib", "hay", "i", "ich", "in", "is", "ist", "la", "las", "le",
  "les", "list", "liste", "lista", "lo", "los", "me", "mi", "mis", "my", "necesito", "note",
  "nota", "notiz", "notizen", "por", "que", "qué", "quiero", "remi", "the", "to", "una", "uno",
  "un", "was", "were", "what", "where", "wie", "wo", "y", "yo",
]);

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token));
}

function buildTokenSet(value: string): Set<string> {
  return new Set(tokenize(value));
}

function computeOverlapScore(queryTokens: Set<string>, text: string): number {
  if (queryTokens.size === 0) return 0;
  const textTokens = buildTokenSet(text);
  let score = 0;

  for (const token of queryTokens) {
    if (textTokens.has(token)) score += token.length >= 5 ? 18 : 10;
  }

  return score;
}

function countOverlapTokens(queryTokens: Set<string>, text: string): number {
  if (queryTokens.size === 0) return 0;
  const textTokens = buildTokenSet(text);
  let count = 0;

  for (const token of queryTokens) {
    if (textTokens.has(token)) count += 1;
  }

  return count;
}

function detectQueryIntent(question: string): QueryIntent {
  const normalized = normalizeText(question);

  if (
    normalized.includes("lista") ||
    normalized.includes("list") ||
    normalized.includes("liste")
  ) {
    return "list";
  }

  if (
    normalized.includes("donde") ||
    normalized.includes("where") ||
    normalized.includes("wo")
  ) {
    return "location";
  }

  if (
    normalized.includes("que tengo que hacer") ||
    normalized.includes("que debo hacer") ||
    normalized.includes("que hago con") ||
    normalized.includes("que hago para") ||
    normalized.includes("que hacer") ||
    normalized.includes("what do i need to do") ||
    normalized.includes("what should i do") ||
    normalized.includes("what do i have to do") ||
    normalized.includes("what do i do with") ||
    normalized.includes("what should i do with") ||
    normalized.includes("was muss ich") ||
    normalized.includes("was soll ich") ||
    normalized.includes("was mache ich mit") ||
    normalized.includes("zu tun")
  ) {
    return "action";
  }

  return "generic";
}

function looksLikeLocationAnswer(text: string): boolean {
  const normalized = normalizeText(text);
  return (
    normalized.includes("esta en") ||
    normalized.includes("estan en") ||
    normalized.includes("is in") ||
    normalized.includes("are in") ||
    normalized.includes("ist in") ||
    normalized.includes("ist im") ||
    normalized.includes("liegt in") ||
    normalized.includes("liegt im") ||
    normalized.includes("liegen in")
  );
}

function looksLikeActionAnswer(text: string): boolean {
  const normalized = normalizeText(text);
  return (
    /^(reparar|llamar|comprar|enviar|hacer|pagar|traer|recoger|buscar|arreglar|sacar|llevar|limpiar|abrir|cerrar|alimentar|dar)\b/.test(normalized) ||
    /^(repair|call|buy|send|do|pay|bring|pick up|fix|take out|take|carry|clean|open|close|feed|give)\b/.test(normalized) ||
    /^(reparieren|anrufen|kaufen|senden|machen|bezahlen|bringen|abholen|rausbringen|mitnehmen|reinigen|offnen|schliessen|futtern|geben)\b/.test(normalized)
  );
}

function computeBrainItemScore(
  question: string,
  item: BrainItem,
  queryTokens: Set<string>,
  intent: QueryIntent,
): number {
  const normalizedQuestion = normalizeText(question);
  const normalizedTitle = normalizeText(item.title);
  const overlapScore = computeOverlapScore(queryTokens, item.title);
  const overlapCount = countOverlapTokens(queryTokens, item.title);
  let score = overlapScore;

  if (normalizedTitle && normalizedQuestion.includes(normalizedTitle)) score += 80;
  if (normalizedTitle.startsWith(normalizedQuestion)) score += 25;
  const isLocationAnswer = looksLikeLocationAnswer(normalizedTitle);
  const isActionAnswer = looksLikeActionAnswer(normalizedTitle);

  if (queryTokens.size > 0 && overlapCount === 0 && !normalizedQuestion.includes(normalizedTitle)) {
    score -= 70;
  }

  if (intent === "location") {
    if (isLocationAnswer) score += 30;
    if (isActionAnswer) score -= 12;
    if (item.type === "task" && !isLocationAnswer) score -= 4;
  }

  if (intent === "action") {
    if (isActionAnswer) score += 30;
    if (isLocationAnswer) score -= 40;
    if (item.type === "task") score += 18;
    if (item.type === "idea" && !isActionAnswer) score -= 18;
    if (!isActionAnswer) score -= 10;
    if (overlapCount > 0) score += 14 * overlapCount;
  }

  if (item.type === "idea") score += 8;
  if (item.status === "ACTIVE") score += 4;

  return score;
}

function computeListScore(
  question: string,
  list: SharedList,
  items: SharedListItem[],
  queryTokens: Set<string>,
  intent: QueryIntent,
): number {
  const normalizedQuestion = normalizeText(question);
  const normalizedTitle = normalizeText(list.title);
  let score = computeOverlapScore(queryTokens, list.title);

  if (normalizedTitle && normalizedQuestion.includes(normalizedTitle)) score += 90;
  if (
    normalizedQuestion.includes("lista") ||
    normalizedQuestion.includes("list") ||
    normalizedQuestion.includes("liste")
  ) {
    score += 18;
  }
  if (
    normalizedQuestion.includes("what is on") ||
    normalizedQuestion.includes("what s on") ||
    normalizedQuestion.includes("que hay en") ||
    normalizedQuestion.includes("que tengo en") ||
    normalizedQuestion.includes("was steht auf") ||
    normalizedQuestion.includes("was ist auf")
  ) {
    score += 12;
  }

  if (intent === "list") score += 10;
  if (intent === "location" || intent === "action") score -= 8;

  for (const item of items) {
    score += Math.min(16, computeOverlapScore(queryTokens, item.text));
  }

  return score;
}

function formatListAnswer(list: SharedList, items: SharedListItem[], lang: UiLang): string {
  const pending = items.filter((item) => !item.done).map((item) => item.text.trim()).filter(Boolean);
  const done = items.filter((item) => item.done).map((item) => item.text.trim()).filter(Boolean);

  if (lang === "en") {
    if (pending.length === 0 && done.length === 0) return `The list "${list.title}" is empty.`;
    if (pending.length === 0) return `In the list "${list.title}", everything is already done: ${done.join(", ")}.`;
    return `In the list "${list.title}" you have: ${pending.join(", ")}.`;
  }

  if (lang === "de") {
    if (pending.length === 0 && done.length === 0) return `Die Liste "${list.title}" ist leer.`;
    if (pending.length === 0) return `In der Liste "${list.title}" ist schon alles erledigt: ${done.join(", ")}.`;
    return `In der Liste "${list.title}" steht: ${pending.join(", ")}.`;
  }

  if (pending.length === 0 && done.length === 0) return `La lista "${list.title}" está vacía.`;
  if (pending.length === 0) return `En la lista "${list.title}" ya está todo hecho: ${done.join(", ")}.`;
  return `En la lista "${list.title}" tienes: ${pending.join(", ")}.`;
}

function formatNoResult(lang: UiLang): string {
  if (lang === "en") return "I couldn't find a clear memory for that. Try using more specific words.";
  if (lang === "de") return "Dafür habe ich keine klare Erinnerung gefunden. Versuch es mit konkreteren Wörtern.";
  return "No encontré un recuerdo claro sobre eso. Prueba con palabras más específicas.";
}

export async function answerMemoryQuestion(
  userId: string,
  question: string,
  lang: UiLang = "es",
): Promise<MemoryRecallAnswer> {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) {
    return {
      ok: false,
      answer: formatNoResult(lang),
      source: null,
      matchedLabel: null,
      confidence: 0,
    };
  }

  const queryTokens = buildTokenSet(cleanQuestion);
  const normalizedQuestion = normalizeText(cleanQuestion);
  const intent = detectQueryIntent(cleanQuestion);

  const { data, error } = await supabase
    .from("brain_items")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "ARCHIVED")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) throw error;

  const brainItems = (data ?? []) as BrainItem[];
  const brainCandidates: BrainRecallCandidate[] = brainItems
    .map((item) => ({
      source: "brain_item" as const,
      item,
      score: computeBrainItemScore(cleanQuestion, item, queryTokens, intent),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  const lists = await fetchSharedLists(userId);
  const likelyListQuestion = intent === "list";

  const listCandidates: ListRecallCandidate[] = [];
  for (const list of lists.slice(0, likelyListQuestion ? 20 : 8)) {
    const listTitleScore = computeOverlapScore(queryTokens, list.title);
    if (!likelyListQuestion && listTitleScore === 0) continue;

    const items = await fetchSharedListItems(list.id);
    const score = computeListScore(cleanQuestion, list, items, queryTokens, intent);
    if (score <= 0) continue;

    listCandidates.push({
      source: "list",
      list,
      items,
      score,
    });
  }

  listCandidates.sort((a, b) => b.score - a.score);

  const topBrain = brainCandidates[0] ?? null;
  const topList = listCandidates[0] ?? null;
  const best = !topList || (topBrain && topBrain.score >= topList.score) ? topBrain : topList;

  if (!best || best.score < 18) {
    return {
      ok: false,
      answer: formatNoResult(lang),
      source: null,
      matchedLabel: null,
      confidence: best?.score ?? 0,
    };
  }

  if (best.source === "brain_item") {
    return {
      ok: true,
      answer: best.item.title,
      source: "brain_item",
      matchedLabel: best.item.type === "idea" ? "note" : "reminder",
      confidence: best.score,
    };
  }

  return {
    ok: true,
    answer: formatListAnswer(best.list, best.items, lang),
    source: "list",
    matchedLabel: best.list.title,
    confidence: best.score,
  };
}
