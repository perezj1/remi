import { supabase } from "@/integrations/supabase/client";

const FEEDBACK_STATE_KEY = "remi_feedback_state_v1";
const FEEDBACK_PENDING_KEY = "remi_feedback_pending_v1";
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
const FIRST_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type FeedbackState = {
  firstSeenAt: number | null;
  usageCount: number;
  submittedAt: number | null;
  dismissedAt: number | null;
};

export type FeedbackSource = "auto" | "profile_button";

type FeedbackPayload = {
  user_id: string;
  lang: "es" | "en" | "de";
  score: number;
  improvement: string;
  source: FeedbackSource;
  usage_count: number;
  first_seen_at: string | null;
  created_at: string;
};

const DEFAULT_STATE: FeedbackState = {
  firstSeenAt: null,
  usageCount: 0,
  submittedAt: null,
  dismissedAt: null,
};

function readState(): FeedbackState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(FEEDBACK_STATE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<FeedbackState>;
    return {
      firstSeenAt: parsed.firstSeenAt ?? null,
      usageCount: parsed.usageCount ?? 0,
      submittedAt: parsed.submittedAt ?? null,
      dismissedAt: parsed.dismissedAt ?? null,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function writeState(next: FeedbackState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FEEDBACK_STATE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage issues
  }
}

function readPending(): FeedbackPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FEEDBACK_PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FeedbackPayload[]) : [];
  } catch {
    return [];
  }
}

function writePending(items: FeedbackPayload[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FEEDBACK_PENDING_KEY, JSON.stringify(items));
  } catch {
    // ignore storage issues
  }
}

export function initFeedbackTracker() {
  const s = readState();
  if (!s.firstSeenAt) {
    s.firstSeenAt = Date.now();
    writeState(s);
  }
}

export function registerFeedbackUse() {
  const s = readState();
  if (!s.firstSeenAt) s.firstSeenAt = Date.now();
  s.usageCount += 1;
  writeState(s);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("remi-feedback-updated"));
  }
}

export function getFeedbackStateSnapshot() {
  return readState();
}

export function shouldShowAutoFeedbackSurvey(now = Date.now()) {
  const s = readState();
  if (!s.firstSeenAt) return false;
  if (s.submittedAt) return false;

  if (s.dismissedAt && now - s.dismissedAt < DISMISS_COOLDOWN_MS) {
    return false;
  }

  const byUsage = s.usageCount >= 3;
  const byWeek = now - s.firstSeenAt >= FIRST_WEEK_MS;
  return byUsage || byWeek;
}

export function markFeedbackDismissed() {
  const s = readState();
  s.dismissedAt = Date.now();
  writeState(s);
}

export function markFeedbackSubmitted() {
  const s = readState();
  s.submittedAt = Date.now();
  s.dismissedAt = null;
  writeState(s);
}

async function sendOne(payload: FeedbackPayload) {
  const { error } = await supabase.from("remi_feedback").insert(payload as any);
  if (error) throw error;
}

export async function flushPendingFeedback() {
  const pending = readPending();
  if (!pending.length) return;

  const keep: FeedbackPayload[] = [];
  for (const item of pending) {
    try {
      await sendOne(item);
    } catch {
      keep.push(item);
    }
  }
  writePending(keep);
}

export async function submitFeedbackSurvey(params: {
  userId: string;
  lang: "es" | "en" | "de";
  score: number;
  improvement: string;
  source: FeedbackSource;
}) {
  const s = readState();
  const payload: FeedbackPayload = {
    user_id: params.userId,
    lang: params.lang,
    score: params.score,
    improvement: params.improvement.trim(),
    source: params.source,
    usage_count: s.usageCount,
    first_seen_at: s.firstSeenAt ? new Date(s.firstSeenAt).toISOString() : null,
    created_at: new Date().toISOString(),
  };

  try {
    await sendOne(payload);
  } catch {
    const pending = readPending();
    pending.push(payload);
    writePending(pending);
  }
}
