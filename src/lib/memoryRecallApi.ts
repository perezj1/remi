import {
  fetchActiveIdeas,
  fetchActiveTasks,
  type BrainItem,
} from "@/lib/brainItemsApi";
import {
  fetchSharedListItems,
  fetchSharedLists,
  type SharedList,
  type SharedListItem,
} from "@/lib/sharedListsApi";

type UiLang = "es" | "en" | "de";
type RecallSource = "brain_item" | "list";
const MEMORY_SECTION_SEPARATOR = "__REMI_SECTION_SEPARATOR__";

export type MemoryRecallItem = {
  id: string;
  text: string;
  source: "list_item" | "brain_item";
  done: boolean;
  brainType?: BrainItem["type"];
};

export type MemoryRecallAnswer = {
  ok: boolean;
  answer: string;
  source: RecallSource | null;
  matchedLabel: string | null;
  confidence: number;
  introText?: string | null;
  listItems?: MemoryRecallItem[];
  relatedItems?: MemoryRecallItem[];
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

type QueryIntent = "location" | "action" | "list" | "next_reminder" | "generic";

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

const WEAK_QUERY_TOKENS = new Set([
  "tengo",
  "debo",
  "necesito",
  "quiero",
  "have",
  "need",
  "must",
  "should",
  "habe",
  "muss",
  "soll",
]);

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter(
      (token) =>
        token.length >= 2 &&
        !STOPWORDS.has(token) &&
        !WEAK_QUERY_TOKENS.has(token)
    );
}

function buildTokenSet(value: string): Set<string> {
  return new Set(tokenize(value));
}

function tokensRoughlyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4) return false;
  return a.startsWith(b) || b.startsWith(a);
}

function computeOverlapScore(queryTokens: Set<string>, text: string): number {
  if (queryTokens.size === 0) return 0;
  const textTokens = Array.from(buildTokenSet(text));
  let score = 0;

  for (const token of queryTokens) {
    if (textTokens.some((textToken) => tokensRoughlyMatch(token, textToken))) {
      score += token.length >= 5 ? 18 : 10;
    }
  }

  return score;
}

function countOverlapTokens(queryTokens: Set<string>, text: string): number {
  if (queryTokens.size === 0) return 0;
  const textTokens = Array.from(buildTokenSet(text));
  let count = 0;

  for (const token of queryTokens) {
    if (textTokens.some((textToken) => tokensRoughlyMatch(token, textToken))) count += 1;
  }

  return count;
}

function buildMatchedTokenSet(queryTokens: Set<string>, text: string): Set<string> {
  if (queryTokens.size === 0) return new Set<string>();
  const textTokens = Array.from(buildTokenSet(text));
  const matched = new Set<string>();

  for (const token of queryTokens) {
    if (textTokens.some((textToken) => tokensRoughlyMatch(token, textToken))) {
      matched.add(token);
    }
  }

  return matched;
}

function hasMeaningfulSharedTokens(queryTokens: Set<string>, text: string, minCount = 2): boolean {
  return countOverlapTokens(queryTokens, text) >= minCount;
}

const NEXT_REMINDER_PATTERNS = [
  /^(?:que|cual)\s+(?:es\s+)?(?:lo\s+)?(?:proximo|siguiente)(?:\s+que\s+(?:tengo\s+que|debo|deberia)\s+hacer)?$/,
  /^que\s+(?:deberia|debo|tengo\s+que)\s+hacer(?:\s+(?:ahora|despues))?$/,
  /^que\s+me\s+toca(?:\s+ahora)?$/,
  /^what(?:\s+is|'s)?\s+next$/,
  /^what(?:\s+is|'s)?\s+my\s+next\s+(?:task|reminder)$/,
  /^what\s+should\s+i\s+do(?:\s+(?:now|next))?$/,
  /^what\s+do\s+i\s+(?:need|have)\s+to\s+do(?:\s+(?:now|next))?$/,
  /^was\s+ist\s+als\s+nachstes$/,
  /^was\s+kommt\s+als\s+nachstes$/,
  /^was\s+ist\s+meine\s+nachste\s+erinnerung$/,
  /^was\s+soll\s+ich(?:(?:\s+(?:jetzt|nachstes|als\s+nachstes))?\s+(?:machen|tun)|\s+(?:machen|tun)(?:\s+(?:jetzt|nachstes|als\s+nachstes))?)$/,
  /^was\s+muss\s+ich(?:(?:\s+(?:jetzt|nachstes|als\s+nachstes))?\s+(?:machen|tun)|\s+(?:machen|tun)(?:\s+(?:jetzt|nachstes|als\s+nachstes))?)$/,
];

function isNextReminderQuestion(question: string): boolean {
  const normalized = normalizeText(question);
  return NEXT_REMINDER_PATTERNS.some((pattern) => pattern.test(normalized));
}

function detectQueryIntent(question: string): QueryIntent {
  const normalized = normalizeText(question);

  if (isNextReminderQuestion(normalized)) {
    return "next_reminder";
  }

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

function formatPreviewListLines(items: string[], prefix = "• "): string[] {
  const cleaned = items.map((item) => item.trim()).filter(Boolean);
  return cleaned.map((item) => `${prefix}${item}`);
}

function getListItemsForAnswer(items: SharedListItem[]): SharedListItem[] {
  const pending = items.filter((item) => !item.done);
  if (pending.length > 0) return pending;
  return items.filter((item) => item.done);
}

function formatListAnswerIntro(listTitle: string, lang: UiLang, hasPending: boolean): string {
  if (lang === "en") {
    return hasPending
      ? `In the list "${listTitle}" you have:`
      : `In the list "${listTitle}", everything is already done:`;
  }

  if (lang === "de") {
    return hasPending
      ? `In der Liste "${listTitle}" steht:`
      : `In der Liste "${listTitle}" ist schon alles erledigt:`;
  }

  return hasPending
    ? `En la lista "${listTitle}" tienes:`
    : `En la lista "${listTitle}" ya está todo hecho:`;
}

function toMemoryRecallListItems(items: SharedListItem[]): MemoryRecallItem[] {
  return items.map((item) => ({
    id: item.id,
    text: item.text.trim(),
    source: "list_item",
    done: item.done,
  }));
}

function toMemoryRecallBrainItems(items: BrainItem[]): MemoryRecallItem[] {
  return items.map((item) => ({
    id: item.id,
    text: item.title.trim(),
    source: "brain_item",
    done: item.status === "DONE",
    brainType: item.type,
  }));
}

function formatListAnswer(list: SharedList, items: SharedListItem[], lang: UiLang): string {
  const visibleItems = getListItemsForAnswer(items);
  const visibleLines = formatPreviewListLines(visibleItems.map((item) => item.text));
  const hasPending = visibleItems.some((item) => !item.done);

  if (visibleLines.length === 0) {
    if (lang === "en") return `The list "${list.title}" is empty.`;
    if (lang === "de") return `Die Liste "${list.title}" ist leer.`;
    return `La lista "${list.title}" está vacía.`;
  }

  return `${formatListAnswerIntro(list.title, lang, hasPending)}\n\n${visibleLines.join("\n")}`;
}

function formatNoResult(lang: UiLang): string {
  if (lang === "en") return "I couldn't find a clear memory for that. Try using more specific words.";
  if (lang === "de") return "Dafür habe ich keine klare Erinnerung gefunden. Versuch es mit konkreteren Wörtern.";
  return "No encontré un recuerdo claro sobre eso. Prueba con palabras más específicas.";
}

function formatNoScheduledReminder(lang: UiLang): string {
  if (lang === "en") return "I don't see any scheduled reminders right now.";
  if (lang === "de") return "Ich sehe gerade keine terminierten Erinnerungen.";
  return "No veo recordatorios con fecha pendientes ahora mismo.";
}

function getLocaleForLang(lang: UiLang): string {
  if (lang === "en") return "en-US";
  if (lang === "de") return "de-DE";
  return "es-ES";
}

function parseValidDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getReminderMoments(item: BrainItem): Date[] {
  const deduped = new Map<number, Date>();

  for (const raw of [item.next_notification_at ?? null, item.next_reminder_at, item.due_date]) {
    const parsed = parseValidDate(raw);
    if (parsed) deduped.set(parsed.getTime(), parsed);
  }

  return Array.from(deduped.values()).sort((a, b) => a.getTime() - b.getTime());
}

function formatReminderDate(date: Date, lang: UiLang): string {
  return new Intl.DateTimeFormat(getLocaleForLang(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function compareTaskTiebreak(a: BrainItem, b: BrainItem): number {
  const aDue = parseValidDate(a.due_date)?.getTime() ?? Number.POSITIVE_INFINITY;
  const bDue = parseValidDate(b.due_date)?.getTime() ?? Number.POSITIVE_INFINITY;
  if (aDue !== bDue) return aDue - bDue;

  const aCreated = parseValidDate(a.created_at)?.getTime() ?? 0;
  const bCreated = parseValidDate(b.created_at)?.getTime() ?? 0;
  return aCreated - bCreated;
}

function answerNextReminderQuestion(
  items: BrainItem[],
  lang: UiLang,
): MemoryRecallAnswer {
  const now = Date.now();
  const taskCandidates = items
    .filter((item) => item.type === "task" && item.status === "ACTIVE")
    .map((item) => {
      const moments = getReminderMoments(item);
      const upcomingAt = moments.find((moment) => moment.getTime() >= now) ?? null;
      const overdueAt = [...moments].reverse().find((moment) => moment.getTime() < now) ?? null;
      return {
        item,
        upcomingAt,
        overdueAt,
      };
    })
    .filter((entry) => entry.upcomingAt || entry.overdueAt);

  const upcoming = taskCandidates
    .filter((entry) => entry.upcomingAt)
    .sort((a, b) => {
      const delta = (a.upcomingAt as Date).getTime() - (b.upcomingAt as Date).getTime();
      return delta !== 0 ? delta : compareTaskTiebreak(a.item, b.item);
    })[0];

  if (upcoming?.upcomingAt) {
    const when = formatReminderDate(upcoming.upcomingAt, lang);
    return {
      ok: true,
      answer:
        lang === "en"
          ? `Your next reminder is "${upcoming.item.title}" on ${when}.`
          : lang === "de"
            ? `Deine n\u00e4chste Erinnerung ist "${upcoming.item.title}" am ${when}.`
            : `Tu pr\u00f3ximo recordatorio es "${upcoming.item.title}" el ${when}.`,
      source: "brain_item",
      matchedLabel: upcoming.item.title,
      confidence: 120,
    };
  }

  const overdue = taskCandidates
    .filter((entry) => entry.overdueAt)
    .sort((a, b) => {
      const delta = (b.overdueAt as Date).getTime() - (a.overdueAt as Date).getTime();
      return delta !== 0 ? delta : compareTaskTiebreak(a.item, b.item);
    })[0];

  if (!overdue?.overdueAt) {
    return {
      ok: false,
      answer: formatNoScheduledReminder(lang),
      source: null,
      matchedLabel: null,
      confidence: 0,
    };
  }

  const when = formatReminderDate(overdue.overdueAt, lang);
  return {
    ok: true,
    answer:
      lang === "en"
        ? `You don't have upcoming reminders. The closest pending one is "${overdue.item.title}" (${when}).`
        : lang === "de"
          ? `Du hast keine zuk\u00fcnftigen Erinnerungen. Die n\u00e4chste noch offene ist "${overdue.item.title}" (${when}).`
          : `No tienes recordatorios futuros. El pendiente m\u00e1s cercano es "${overdue.item.title}" (${when}).`,
    source: "brain_item",
    matchedLabel: overdue.item.title,
    confidence: 90,
  };
}

function formatMultipleBrainItems(items: BrainItem[], lang: UiLang): string {
  const lines = items
    .map((item) => item.title.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((title) => `- ${title}`);

  if (lines.length === 0) return formatNoResult(lang);
  return lines.join("\n");
}

function pickRelatedBrainItems(
  candidates: BrainRecallCandidate[],
  referenceTokens: Set<string>,
  minScore: number,
  minSharedTokens: number,
): BrainItem[] {
  return candidates
    .filter((candidate) => {
      if (candidate.score < minScore) return false;
      return hasMeaningfulSharedTokens(referenceTokens, candidate.item.title, minSharedTokens);
    })
    .slice(0, 5)
    .map((candidate) => candidate.item);
}

function formatListWithRelatedBrainItems(
  list: SharedList,
  listItems: SharedListItem[],
  relatedItems: BrainItem[],
  lang: UiLang,
): string {
  const listAnswer = formatListAnswer(list, listItems, lang);
  const relatedAnswer = formatMultipleBrainItems(relatedItems, lang);
  if (!relatedItems.length) return listAnswer;
  return `${listAnswer}\n\n${MEMORY_SECTION_SEPARATOR}\n\n${relatedAnswer}`;
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
  const intent = detectQueryIntent(cleanQuestion);

  const [visibleTasks, visibleIdeas] = await Promise.all([
    fetchActiveTasks(userId),
    fetchActiveIdeas(userId),
  ]);
  const visibleBrainItems = [...visibleTasks, ...visibleIdeas];

  if (intent === "next_reminder") {
    return answerNextReminderQuestion(visibleBrainItems, lang);
  }

  const brainCandidates: BrainRecallCandidate[] = visibleBrainItems
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
    const relatedReferenceTokens = buildMatchedTokenSet(queryTokens, best.item.title);
    const effectiveReferenceTokens =
      relatedReferenceTokens.size > 0 ? relatedReferenceTokens : queryTokens;
    const relatedBrainItems = pickRelatedBrainItems(
      brainCandidates,
      effectiveReferenceTokens,
      Math.max(18, best.score - 18),
      effectiveReferenceTokens.size <= 1 ? 1 : 2,
    );

    return {
      ok: true,
      answer:
        relatedBrainItems.length >= 2
          ? formatMultipleBrainItems(relatedBrainItems, lang)
          : best.item.title,
      source: "brain_item",
      matchedLabel: best.item.type === "idea" ? "note" : "reminder",
      confidence: best.score,
      relatedItems: toMemoryRecallBrainItems(
        relatedBrainItems.length >= 1 ? relatedBrainItems : [best.item],
      ),
    };
  }

  const listReferenceTokens = new Set([
    ...queryTokens,
    ...buildTokenSet(best.list.title),
  ]);
  const topBrainScore = brainCandidates[0]?.score ?? 0;
  const relatedBrainItems = pickRelatedBrainItems(
    brainCandidates,
    listReferenceTokens,
    Math.max(18, Math.min(topBrainScore, best.score - 24)),
    listReferenceTokens.size <= 2 ? 1 : 2,
  );
  const visibleListItems = getListItemsForAnswer(best.items);
  const hasPendingListItems = visibleListItems.some((item) => !item.done);

  return {
    ok: true,
    answer: formatListWithRelatedBrainItems(best.list, best.items, relatedBrainItems, lang),
    source: "list",
    matchedLabel: best.list.title,
    confidence: best.score,
    introText: formatListAnswerIntro(best.list.title, lang, hasPendingListItems),
    listItems: toMemoryRecallListItems(visibleListItems),
    relatedItems: toMemoryRecallBrainItems(relatedBrainItems),
  };
}
