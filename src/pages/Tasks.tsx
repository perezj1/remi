// src/pages/Tasks.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import {
  BrainItem,
  fetchInboxItems,
  setTaskStatus,
  deleteBrainItem,
} from "@/lib/brainItemsApi";
import {
  CalendarClock,
  Check,
  Trash2,
  Pencil,
  ChevronDown,
  Calendar,
  Share2,
  StickyNote,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import TaskEditModal from "@/components/TaskEditModal";
import IdeaEditModal from "@/components/IdeaEditModal";
import RemiShareLoader from "@/components/RemiShareLoader";
import {
  createShareInviteCached,
  prefetchShareInvite,
  shareTextOrCopy,
} from "@/lib/shareInvitesApi";

type DateGroup = {
  key: string;
  label: string;
  items: BrainItem[];
};

type SharedItemMeta = {
  shared_count?: number | null;
  received_from_share?: boolean | null;
};

type IdeaBodyFields = {
  body?: string | null;
  content?: string | null;
  text?: string | null;
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDue(due: string, fallbackLocale?: string) {
  const dt = new Date(due);
  if (Number.isNaN(dt.getTime())) return null;

  const fmt = new Intl.DateTimeFormat(fallbackLocale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return fmt.format(dt);
}

export default function TasksPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const uiLocale = useMemo(() => {
    if (lang === "de") return "de-DE";
    if (lang === "en") return "en-US";
    return "es-ES";
  }, [lang]);

  const [items, setItems] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);

  const [editingTask, setEditingTask] = useState<BrainItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<BrainItem | null>(null);
  const [editIdeaOpen, setEditIdeaOpen] = useState(false);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [activeTypeTab, setActiveTypeTab] = useState<"tasks" | "ideas">("tasks");

  // ✅ indicador: solo lo que tú has compartido
  const shouldShowSentIndicator = useCallback((item: BrainItem) => {
    const meta = item as BrainItem & SharedItemMeta;
    const sharedCount = meta.shared_count ?? 0;
    const receivedFromShare = !!meta.received_from_share;
    return !receivedFromShare && Number(sharedCount) > 0;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchInboxItems(user.id);
        setItems(data);
      } catch (err) {
        console.error(err);
        alert(t("inbox.errorLoading"));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, t]);

  const filtered = useMemo(() => {
    return items.filter((item) => item.type === "task");
  }, [items]);

  const dateGroups: DateGroup[] = useMemo(() => {
    if (filtered.length === 0) return [];

    const today = new Date();
    const todayMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const tomorrowMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const todayGroup: DateGroup = {
      key: "TODAY",
      label: t("inbox.sectionToday"),
      items: [],
    };
    const tomorrowGroup: DateGroup = {
      key: "TOMORROW",
      label: t("inbox.sectionTomorrow"),
      items: [],
    };
    const noDateGroup: DateGroup = {
      key: "NO_DATE",
      label: t("inbox.sectionNoDate"),
      items: [],
    };

    const otherDateGroupsMap = new Map<
      string,
      { group: DateGroup; dateMs: number }
    >();

    for (const item of filtered) {
      if (item.due_date) {
        const d = new Date(item.due_date);
        const dMid = new Date(d.getFullYear(), d.getMonth(), d.getDate());

        if (isSameDay(dMid, todayMid)) {
          todayGroup.items.push(item);
        } else if (isSameDay(dMid, tomorrowMid)) {
          tomorrowGroup.items.push(item);
        } else {
          const key = dMid.toISOString().slice(0, 10);
          let stored = otherDateGroupsMap.get(key);
          if (!stored) {
            const label = d.toLocaleDateString(uiLocale, {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            stored = {
              group: { key, label, items: [] },
              dateMs: dMid.getTime(),
            };
            otherDateGroupsMap.set(key, stored);
          }
          stored.group.items.push(item);
        }
      } else {
        noDateGroup.items.push(item);
      }
    }

    const groups: DateGroup[] = [];
    if (todayGroup.items.length > 0) groups.push(todayGroup);
    if (tomorrowGroup.items.length > 0) groups.push(tomorrowGroup);

    const otherDateGroups = Array.from(otherDateGroupsMap.values())
      .sort((a, b) => a.dateMs - b.dateMs)
      .map((x) => x.group);

    groups.push(...otherDateGroups);
    if (noDateGroup.items.length > 0) groups.push(noDateGroup);

    return groups;
  }, [filtered, t, uiLocale]);

  const groupKeysSignature = useMemo(() => {
    return dateGroups.map((g) => g.key).join("|");
  }, [dateGroups]);

  useEffect(() => {
    setCollapsedGroups((prev) => {
      let changed = false;
      const next: Record<string, boolean> = { ...prev };

      for (const g of dateGroups) {
        if (next[g.key] === undefined) {
          next[g.key] = false;
          changed = true;
        }
      }

      for (const k of Object.keys(next)) {
        if (!dateGroups.some((g) => g.key === k)) {
          delete next[k];
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [groupKeysSignature, dateGroups]);

  const handlePrimaryAction = async (item: BrainItem) => {
    try {
      if (item.status !== "DONE") {
        const updated = await setTaskStatus(item.id, "DONE");
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        await deleteBrainItem(item.id);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }
    } catch (err) {
      console.error(err);
      alert(t("inbox.errorUpdating"));
    }
  };

  const openEditModal = (item: BrainItem) => {
    if (item.type === "task") {
      setEditingTask(item);
      setEditOpen(true);
      return;
    }
    if (item.type === "idea") {
      setEditingIdea(item);
      setEditIdeaOpen(true);
    }
  };

  const handleShare = async (item: BrainItem) => {
    if (shareLoading) return;
    try {
      if (!item?.id) return;
      setShareLoading(true);
      const res = await createShareInviteCached(item.id);
      await shareTextOrCopy(res.shareMessage);
      alert(t("shareInvite.sharedOk"));
    } catch (err) {
      console.error(err);
      alert(t("shareInvite.sharedError"));
    } finally {
      setShareLoading(false);
    }
  };

  // ✅ Evita el error TS: tu t() no acepta fallback string como 2º parámetro.
  // Usa estas keys existentes o crea las que quieras en i18n:
  const editLabel = t("common.edit"); // añade si no existe
  const doneLabel = t("today.done"); // añade si no existe
  const deleteLabel = t("today.delete"); // añade si no existe
  const shareLabel = t("shareInvite.share"); // ya existe

  return (
    <div
      className="remi-page text-slate-900"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f1eff7 0%, #fafafe 42%, #fafafe 100%)",
        paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          paddingTop: "calc(14px + env(safe-area-inset-top))",
          paddingBottom: 10,
          paddingLeft: "calc(16px + env(safe-area-inset-left))",
          paddingRight: "calc(16px + env(safe-area-inset-right))",
          minHeight: 100,
          background: "#ffffff",
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        <div className="mx-auto mt-0.5 w-full" style={{ maxWidth: "min(96vw, 1440px)" }}>
          <h1 className="leading-tight font-extrabold text-slate-900" style={{ fontSize: "clamp(19px, 1.3vw, 28px)" }}>
            {t("inbox.title")}
          </h1>
          <p className="mt-0.5 font-semibold text-slate-500" style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}>
            {t("inbox.subtitle")}
          </p>
        </div>
      </div>

      <main
        className="remi-scroll"
        style={{
          padding: "0 16px",
          marginTop: 14,
          marginBottom: 10,
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "min(96vw, 1440px)",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setActiveTypeTab("tasks")}
              className={`rounded-full px-4 py-1.5 font-semibold transition ${
                activeTypeTab === "tasks"
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}
            >
              {t("inbox.tasksTab")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/ideas")}
              className={`rounded-full px-4 py-1.5 font-semibold transition ${
                activeTypeTab === "ideas"
                  ? "bg-amber-50 text-yellow-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}
            >
              {t("inbox.ideasTab")}
            </button>
          </div>
          <span className="text-slate-500" style={{ fontSize: "clamp(12px, 0.82vw, 16px)" }}>
            {t("inbox.itemsCount", { count: filtered.length })}
          </span>
        </div>

        <div className="space-y-3">
          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-500">
              {t("inbox.loading")}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 shadow-[0_10px_22px_rgba(15,23,42,0.06)] px-4 py-4 flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  activeTypeTab === "tasks" ? "bg-violet-100 text-violet-600" : "bg-amber-100 text-amber-600"
                }`}
              >
                {activeTypeTab === "tasks" ? <CalendarClock size={18} /> : <StickyNote size={18} />}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-slate-900">
                  {t("inbox.emptyTitle")}
                </p>
                <p className="text-[12px] text-slate-500">
                  {t("inbox.emptySubtitle")}
                </p>
              </div>
            </div>
          )}

          {!loading &&
            dateGroups.map((group) => {
              const isCollapsed = collapsedGroups[group.key] ?? false;

              return (
                <div key={group.key} className="pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsedGroups((prev) => ({
                        ...prev,
                        [group.key]: !isCollapsed,
                      }))
                    }
                    className="w-full flex items-center gap-2 mb-2 text-left"
                    aria-expanded={!isCollapsed}
                  >
                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90" : "rotate-0"
                      }`}
                    />
                    <p className="font-semibold uppercase tracking-widest text-slate-600" style={{ fontSize: "clamp(12px, 0.82vw, 16px)" }}>
                      {group.label}
                    </p>
                    <div className="flex-1 h-px bg-slate-200" />
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-2">
                      {group.items.map((item) => {
                        const isDone = item.status === "DONE";
                        const isIdeasTab = activeTypeTab === "ideas";
                        const dueText = item.due_date
                          ? formatDue(item.due_date as string, uiLocale) ??
                            new Date(item.due_date as string).toLocaleString()
                          : "";

                        const ideaPayload = item as BrainItem & IdeaBodyFields;
                        const ideaBody =
                          ideaPayload.body ??
                          ideaPayload.content ??
                          ideaPayload.text ??
                          "";
                        const titleText = String(item.title ?? "");
                        const bodyText = String(ideaBody ?? "").trim();
                        const mainText = isIdeasTab
                          ? (bodyText.length > 0 ? bodyText : titleText)
                          : titleText;

                        // ✅ Botones más pequeños
                        const btnBase =
                          "flex-1 h-9 rounded-full border inline-flex items-center justify-center gap-2 text-[12px] font-semibold md:h-10 md:text-[13px] lg:h-11 lg:text-[15px]";

                        const shareBtnClass = `${btnBase} border-slate-200 bg-white hover:bg-slate-50 text-slate-700`;

                        const rightBtnClass = isDone
                          ? `${btnBase} bg-red-50 border-red-200 hover:bg-red-100 text-red-600`
                          : `${btnBase} bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700`;

                        return (
                          <div
                            key={item.id}
                            className={`rounded-3xl bg-white shadow-[0_6px_14px_rgba(15,23,42,0.05)] px-4 py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 ${
                              isIdeasTab ? "border border-[#e7db58]" : "border border-[#7d59c9]"
                            }`}
                          >
                            {/* Header row */}
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative ${
                                  isIdeasTab ? "bg-yellow-100 text-yellow-600" : "bg-violet-100 text-violet-600"
                                }`}
                              >
                                {isIdeasTab ? <StickyNote size={18} /> : <CalendarClock size={18} />}
                                {shouldShowSentIndicator(item) && (
                                  <span
                                    className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                                    aria-label={t("shareInvite.sentIndicator")}
                                    title={t("shareInvite.sentIndicator")}
                                  >
                                    <Share2 size={10} className="text-slate-500" />
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-semibold text-slate-900 leading-snug"
                                  style={{
                                    fontSize: "clamp(16px, 1.1vw, 26px)",
                                  }}
                                >
                                  {activeTypeTab === "tasks" ? t("pill.type.task") : t("pill.type.idea")}
                                </p>
                                <p
                                  className="mt-1 text-slate-700"
                                  style={{
                                    fontSize: "clamp(13px, 0.86vw, 17px)",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    overflowWrap: "anywhere",
                                    maxHeight: 96,
                                    overflow: "hidden",
                                  }}
                                >
                                  {mainText}
                                </p>

                                {isIdeasTab && item.due_date && (
                                  <div className="mt-2 flex items-center gap-1 text-slate-500" style={{ fontSize: "clamp(13px, 0.85vw, 17px)" }}>
                                    <Calendar size={14} className="text-slate-400" />
                                    <span className="truncate">{dueText}</span>
                                  </div>
                                )}
                              </div>

                              {/* ✅ Lápiz sin círculo */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(item);
                                }}
                                className={`p-1.5 hover:bg-slate-50 shrink-0 ${isIdeasTab ? "rounded-lg inline-flex items-center justify-center" : "rounded-md"}`}
                                aria-label={editLabel}
                                title={editLabel}
                              >
                                <Pencil size={14} color="#94A3B8" />
                              </button>
                            </div>

                            <div className="mt-2 h-px bg-slate-100" />

                            {/* Footer row */}
                            <div className="mt-3 flex items-center gap-3">
                              <button
                                type="button"
                                onPointerDown={() => prefetchShareInvite(item.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleShare(item);
                                }}
                                className={shareBtnClass}
                                aria-label={shareLabel}
                                title={shareLabel}
                              >
                                <Share2 size={15} color="#94A3B8" />
                                <span>{shareLabel}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handlePrimaryAction(item);
                                }}
                                className={rightBtnClass}
                                aria-label={isDone ? deleteLabel : doneLabel}
                                title={isDone ? deleteLabel : doneLabel}
                              >
                                {isDone ? (
                                  <>
                                    <Trash2 size={15} color="#DC2626" />
                                    <span>{deleteLabel}</span>
                                  </>
                                ) : (
                                  <>
                                    <Check size={15} color="#10B981" />
                                    <span>{doneLabel}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </main>

      <TaskEditModal
        open={editOpen}
        task={editingTask}
        onClose={() => setEditOpen(false)}
        onUpdated={(updated) => {
          setItems((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i)),
          );
        }}
      />
      <IdeaEditModal
        open={editIdeaOpen}
        idea={editingIdea}
        onClose={() => setEditIdeaOpen(false)}
        onUpdated={(updated) => {
          setItems((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i)),
          );
        }}
        onConverted={(convertedTask) => {
          setItems((prev) => {
            const editingIdeaId = editingIdea?.id;
            const withoutOld = prev.filter(
              (i) => i.id !== convertedTask.id && i.id !== editingIdeaId,
            );
            return [convertedTask, ...withoutOld];
          });
          setActiveTypeTab("tasks");
        }}
      />
      <RemiShareLoader
        active={shareLoading}
        label={t("common.preparingLink")}
      />
    </div>
  );
}
