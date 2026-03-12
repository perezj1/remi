import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import type { BrainItem } from "@/lib/brainItemsApi";
import {
  deleteBrainItem,
  fetchInboxItems,
  setTaskStatus,
} from "@/lib/brainItemsApi";
import {
  CalendarClock,
  Check,
  ChevronDown,
  Pencil,
  Search,
  Share2,
  StickyNote,
  Trash2,
} from "lucide-react";

import TaskEditModal from "@/components/TaskEditModal";
import IdeaEditModal from "@/components/IdeaEditModal";
import RemiShareLoader from "@/components/RemiShareLoader";
import {
  createShareInviteCached,
  prefetchShareInvite,
  shareTextOrCopy,
} from "@/lib/shareInvitesApi";

type FilterTab = "tasks" | "notes";

type DateGroup = {
  key: string;
  label: string;
  items: BrainItem[];
  dateMs?: number;
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

function formatDue(due: string, locale: string) {
  const dt = new Date(due);
  if (Number.isNaN(dt.getTime())) return null;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dt);
}

function getIdeaMainText(item: BrainItem) {
  const payload = item as BrainItem & IdeaBodyFields;
  const body = payload.body ?? payload.content ?? payload.text ?? "";
  const cleanBody = String(body ?? "").trim();
  return cleanBody.length > 0 ? cleanBody : String(item.title ?? "");
}

function sortByDateAsc(items: BrainItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
    if (aTime !== bTime) return aTime - bTime;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

function sortByRecent(items: BrainItem[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updated_at || a.created_at).getTime();
    const bTime = new Date(b.updated_at || b.created_at).getTime();
    return bTime - aTime;
  });
}

function buildDateGroups(
  items: BrainItem[],
  locale: string,
  labels: {
    today: string;
    tomorrow: string;
    noDate: string;
  },
) {
  if (items.length === 0) return [];

  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );

  const groupsMap = new Map<string, DateGroup>();
  const noDateItems: BrainItem[] = [];

  for (const item of sortByDateAsc(items)) {
    if (!item.due_date) {
      noDateItems.push(item);
      continue;
    }

    const dueDate = new Date(item.due_date);
    const dateMid = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate(),
    );

    const key = dateMid.toISOString().slice(0, 10);
    let label = labels.today;
    if (!isSameDay(dateMid, todayMid)) {
      label = isSameDay(dateMid, tomorrowMid)
        ? labels.tomorrow
        : dateMid.toLocaleDateString(locale, {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
    }

    const stored = groupsMap.get(key);
    if (stored) {
      stored.items.push(item);
      continue;
    }

    groupsMap.set(key, {
      key,
      label,
      items: [item],
      dateMs: dateMid.getTime(),
    });
  }

  const groups = [...groupsMap.values()].sort((a, b) => {
    return (a.dateMs ?? 0) - (b.dateMs ?? 0);
  });

  if (noDateItems.length > 0) {
    groups.push({
      key: "NO_DATE",
      label: labels.noDate,
      items: noDateItems,
    });
  }

  return groups;
}

export default function TasksPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const safeT = useCallback(
    (key: string, fallback: string, vars?: Record<string, unknown>) => {
      const value = t(key as never, vars as never);
      if (!value || value === key) return fallback;
      return value;
    },
    [t],
  );

  const uiLocale = useMemo(() => {
    if (lang === "de") return "de-DE";
    if (lang === "en") return "en-US";
    return "es-ES";
  }, [lang]);

  const [items, setItems] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [editingTask, setEditingTask] = useState<BrainItem | null>(null);
  const [editingIdea, setEditingIdea] = useState<BrainItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editIdeaOpen, setEditIdeaOpen] = useState(false);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [doneSectionCollapsed, setDoneSectionCollapsed] = useState(true);

  const [activeTab, setActiveTab] = useState<FilterTab>(() => {
    return searchParams.get("tab") === "notes" ? "notes" : "tasks";
  });

  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase());

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    const nextTab = searchParams.get("tab") === "notes" ? "notes" : "tasks";
    setActiveTab((prev) => (prev === nextTab ? prev : nextTab));
  }, [searchParams]);

  const updateTab = useCallback(
    (nextTab: FilterTab) => {
      setActiveTab(nextTab);
      const nextParams = new URLSearchParams(searchParams);
      if (nextTab === "notes") {
        nextParams.set("tab", "notes");
      } else {
        nextParams.delete("tab");
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchInboxItems(user.id);
        setItems(data);
      } catch (error) {
        console.error(error);
        alert(safeT("inbox.errorLoading", "Error cargando recordatorios"));
      } finally {
        setLoading(false);
      }
    })();
  }, [safeT, user]);

  const shouldShowSentIndicator = useCallback((item: BrainItem) => {
    const meta = item as BrainItem & SharedItemMeta;
    const sharedCount = meta.shared_count ?? 0;
    const receivedFromShare = !!meta.received_from_share;
    return !receivedFromShare && Number(sharedCount) > 0;
  }, []);

  const matchesSearch = useCallback(
    (item: BrainItem) => {
      if (!deferredSearch) return true;
      const mainText = item.type === "idea" ? getIdeaMainText(item) : item.title;
      const dueText = item.due_date ? formatDue(item.due_date, uiLocale) ?? "" : "";

      return [mainText, item.title ?? "", dueText]
        .join(" ")
        .toLowerCase()
        .includes(deferredSearch);
    },
    [deferredSearch, uiLocale],
  );

  const tabItems = useMemo(() => {
    return items.filter((item) =>
      activeTab === "tasks" ? item.type === "task" : item.type === "idea",
    );
  }, [activeTab, items]);

  const activeItems = useMemo(() => {
    return tabItems.filter((item) => item.status !== "DONE").filter(matchesSearch);
  }, [matchesSearch, tabItems]);

  const doneItems = useMemo(() => {
    return sortByRecent(
      tabItems.filter((item) => item.status === "DONE").filter(matchesSearch),
    );
  }, [matchesSearch, tabItems]);

  const dateGroups = useMemo(() => {
    return buildDateGroups(activeItems, uiLocale, {
      today: safeT("inbox.sectionToday", "Hoy"),
      tomorrow: safeT("inbox.sectionTomorrow", "Mañana"),
      noDate: safeT("inbox.sectionNoDate", "Sin fecha"),
    });
  }, [activeItems, safeT, uiLocale]);

  const groupKeysSignature = useMemo(() => {
    return dateGroups.map((group) => group.key).join("|");
  }, [dateGroups]);

  useEffect(() => {
    setCollapsedGroups((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const group of dateGroups) {
        if (next[group.key] === undefined) {
          next[group.key] = false;
          changed = true;
        }
      }

      for (const key of Object.keys(next)) {
        if (!dateGroups.some((group) => group.key === key)) {
          delete next[key];
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [dateGroups, groupKeysSignature]);

  useEffect(() => {
    if (deferredSearch) {
      setDoneSectionCollapsed(false);
    }
  }, [deferredSearch]);

  const handlePrimaryAction = async (item: BrainItem) => {
    try {
      if (item.status !== "DONE") {
        const updated = await setTaskStatus(item.id, "DONE");
        setItems((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
      } else {
        await deleteBrainItem(item.id);
        setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      }
    } catch (error) {
      console.error(error);
      alert(safeT("inbox.errorUpdating", "Error actualizando recordatorios"));
    }
  };

  const handleShare = async (item: BrainItem) => {
    if (shareLoading || !item.id) return;

    try {
      setShareLoading(true);
      const result = await createShareInviteCached(item.id);
      await shareTextOrCopy(result.shareMessage);
      alert(safeT("shareInvite.sharedOk", "Compartido"));
    } catch (error) {
      console.error(error);
      alert(safeT("shareInvite.sharedError", "No se pudo compartir"));
    } finally {
      setShareLoading(false);
    }
  };

  const openEditModal = (item: BrainItem) => {
    if (item.type === "task") {
      setEditingTask(item);
      setEditOpen(true);
      return;
    }

    setEditingIdea(item);
    setEditIdeaOpen(true);
  };

  const visibleCount = activeItems.length + doneItems.length;
  const pageTitle = activeTab === "notes"
    ? safeT("recordatorios.notesTitle", "Notas")
    : safeT("recordatorios.title", "Recordatorios");
  const pageSubtitle = activeTab === "notes"
    ? safeT(
        "recordatorios.notesSubtitle",
        "Tus notas, claras y ordenadas en un solo sitio.",
      )
    : safeT(
        "recordatorios.subtitle",
        "Tus tareas y notas, claras y ordenadas en un solo sitio.",
      );
  const notesTabLabel = safeT("recordatorios.notesTab", "Notas");
  const searchPlaceholder = activeTab === "tasks"
    ? safeT("recordatorios.searchTasks", "Buscar recordatorio")
    : safeT("recordatorios.searchNotes", "Buscar nota");
  const doneSectionLabel = safeT("recordatorios.doneSection", "Completado");
  const taskTypeLabel = safeT("recordatorios.taskSingular", "Recordatorio");
  const noteTypeLabel = safeT("recordatorios.noteSingular", "Nota");
  const editLabel = safeT("common.edit", "Editar");
  const shareLabel = safeT("shareInvite.share", "Compartir");
  const doneLabel = safeT("today.done", "Hecho");
  const deleteLabel = safeT("today.delete", "Eliminar");

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
          minHeight: 104,
          background: "#ffffff",
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        <div className="mx-auto mt-0.5 w-full" style={{ maxWidth: "min(96vw, 1440px)" }}>
          <h1
            className="leading-tight font-extrabold text-slate-900"
            style={{ fontSize: "clamp(19px, 1.3vw, 28px)" }}
          >
            {pageTitle}
          </h1>
          <p
            className="mt-0.5 font-semibold text-slate-500"
            style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}
          >
            {pageSubtitle}
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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white p-1">
              <button
                type="button"
                onClick={() => updateTab("tasks")}
                className={`rounded-full px-4 py-1.5 font-semibold transition ${
                  activeTab === "tasks"
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}
              >
                {t("inbox.tasksTab")}
              </button>
              <button
                type="button"
                onClick={() => updateTab("notes")}
                className={`rounded-full px-4 py-1.5 font-semibold transition ${
                  activeTab === "notes"
                    ? "bg-amber-50 text-amber-700"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}
              >
                {notesTabLabel}
              </button>
            </div>

            <span
              className="text-slate-500"
              style={{ fontSize: "clamp(12px, 0.82vw, 16px)" }}
            >
              {t("inbox.itemsCount", { count: visibleCount })}
            </span>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                <Search className="h-4 w-4" />
              </div>
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-500">
              {t("inbox.loading")}
            </div>
          ) : null}

          {!loading && visibleCount === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 shadow-[0_10px_22px_rgba(15,23,42,0.06)] px-4 py-4 flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  activeTab === "tasks"
                    ? "bg-violet-100 text-violet-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {activeTab === "tasks" ? (
                  <CalendarClock size={18} />
                ) : (
                  <StickyNote size={18} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-slate-900">
                  {activeTab === "tasks"
                    ? safeT("recordatorios.emptyTasksTitle", "No tienes recordatorios pendientes")
                    : safeT("recordatorios.emptyNotesTitle", "No tienes notas guardadas")}
                </p>
                <p className="text-[12px] text-slate-500">
                  {activeTab === "tasks"
                    ? safeT(
                        "recordatorios.emptyTasksSubtitle",
                        "Usa Nuevo para capturar lo próximo que no quieres olvidar.",
                      )
                    : safeT(
                        "recordatorios.emptyNotesSubtitle",
                        "Usa Nuevo para guardar una nota rápida sin perderla.",
                      )}
                </p>
              </div>
            </div>
          ) : null}

          {!loading &&
            dateGroups.map((group) => {
              const isCollapsed = collapsedGroups[group.key] ?? false;

              return (
                <section key={group.key} className="pt-2">
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
                    <p
                      className="font-semibold uppercase tracking-widest text-slate-600"
                      style={{ fontSize: "clamp(12px, 0.82vw, 16px)" }}
                    >
                      {group.label}
                    </p>
                    <div className="flex-1 h-px bg-slate-200" />
                  </button>

                  {!isCollapsed ? (
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <ReminderCard
                          key={item.id}
                          item={item}
                          isNote={activeTab === "notes"}
                          editLabel={editLabel}
                          shareLabel={shareLabel}
                          doneLabel={doneLabel}
                          deleteLabel={deleteLabel}
                          typeLabel={activeTab === "notes" ? noteTypeLabel : taskTypeLabel}
                          shouldShowSentIndicator={shouldShowSentIndicator(item)}
                          onEdit={() => openEditModal(item)}
                          onShare={() => void handleShare(item)}
                          onPrimaryAction={() => void handlePrimaryAction(item)}
                        />
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}

          {!loading && doneItems.length > 0 ? (
            <section className="pt-3">
              <button
                type="button"
                onClick={() => setDoneSectionCollapsed((prev) => !prev)}
                className="w-full flex items-center gap-2 mb-2 text-left"
                aria-expanded={!doneSectionCollapsed}
              >
                <ChevronDown
                  size={16}
                  className={`text-slate-500 transition-transform duration-200 ${
                    doneSectionCollapsed ? "-rotate-90" : "rotate-0"
                  }`}
                />
                <p
                  className="font-semibold uppercase tracking-widest text-slate-600"
                  style={{ fontSize: "clamp(12px, 0.82vw, 16px)" }}
                >
                  {doneSectionLabel} ({doneItems.length})
                </p>
                <div className="flex-1 h-px bg-slate-200" />
              </button>

              {!doneSectionCollapsed ? (
                <div className="space-y-2">
                  {doneItems.map((item) => (
                    <ReminderCard
                      key={item.id}
                      item={item}
                      isNote={activeTab === "notes"}
                      editLabel={editLabel}
                      shareLabel={shareLabel}
                      doneLabel={doneLabel}
                      deleteLabel={deleteLabel}
                      typeLabel={activeTab === "notes" ? noteTypeLabel : taskTypeLabel}
                      shouldShowSentIndicator={shouldShowSentIndicator(item)}
                      onEdit={() => openEditModal(item)}
                      onShare={() => void handleShare(item)}
                      onPrimaryAction={() => void handlePrimaryAction(item)}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </main>

      <TaskEditModal
        open={editOpen}
        task={editingTask}
        onClose={() => setEditOpen(false)}
        onUpdated={(updated) => {
          setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        }}
      />

      <IdeaEditModal
        open={editIdeaOpen}
        idea={editingIdea}
        onClose={() => setEditIdeaOpen(false)}
        onUpdated={(updated) => {
          setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        }}
        onConverted={(convertedTask) => {
          setItems((prev) =>
            prev.map((item) => (item.id === convertedTask.id ? convertedTask : item)),
          );
          updateTab("tasks");
        }}
      />

      <RemiShareLoader
        active={shareLoading}
        label={safeT("common.preparingLink", "Preparando enlace...")}
      />
    </div>
  );
}

function ReminderCard({
  item,
  isNote,
  editLabel,
  shareLabel,
  doneLabel,
  deleteLabel,
  typeLabel,
  shouldShowSentIndicator,
  onEdit,
  onShare,
  onPrimaryAction,
}: {
  item: BrainItem;
  isNote: boolean;
  editLabel: string;
  shareLabel: string;
  doneLabel: string;
  deleteLabel: string;
  typeLabel: string;
  shouldShowSentIndicator: boolean;
  onEdit: () => void;
  onShare: () => void;
  onPrimaryAction: () => void;
}) {
  const isDone = item.status === "DONE";
  const mainText = isNote ? getIdeaMainText(item) : item.title;

  return (
    <div
      className={`rounded-3xl bg-white shadow-[0_6px_14px_rgba(15,23,42,0.05)] px-4 py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 ${
        isNote ? "border border-[#e7db58]" : "border border-[#7d59c9]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative ${
            isNote ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-600"
          }`}
        >
          {isNote ? <StickyNote size={18} /> : <CalendarClock size={18} />}
          {shouldShowSentIndicator ? (
            <span
              className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
              title={shareLabel}
              aria-label={shareLabel}
            >
              <Share2 size={10} className="text-slate-500" />
            </span>
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-slate-900 leading-snug"
            style={{ fontSize: "clamp(16px, 1.1vw, 26px)" }}
          >
            {typeLabel}
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
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-slate-50 inline-flex items-center justify-center shrink-0"
          aria-label={editLabel}
          title={editLabel}
        >
          <Pencil size={14} className="text-slate-400" />
        </button>
      </div>

      <div className="mt-2 h-px bg-slate-100" />

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onPointerDown={() => prefetchShareInvite(item.id)}
          onClick={onShare}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 h-9 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 md:h-10 md:text-[13px] lg:h-11 lg:text-[14px]"
          aria-label={shareLabel}
          title={shareLabel}
        >
          <Share2 size={15} color="#94A3B8" />
          <span>{shareLabel}</span>
        </button>

        <button
          type="button"
          onClick={onPrimaryAction}
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-3.5 h-9 text-[12px] font-semibold md:h-10 md:text-[13px] lg:h-11 lg:text-[14px] ${
            isDone
              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
          aria-label={isDone ? deleteLabel : doneLabel}
          title={isDone ? deleteLabel : doneLabel}
        >
          {isDone ? (
            <>
              <Trash2 size={15} />
              <span>{deleteLabel}</span>
            </>
          ) : (
            <>
              <Check size={15} />
              <span>{doneLabel}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
