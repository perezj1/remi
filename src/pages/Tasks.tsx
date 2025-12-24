// src/pages/Tasks.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BrainItem,
  fetchInboxItems,
  setTaskStatus,
  deleteBrainItem,
} from "@/lib/brainItemsApi";
import { List, Check, Trash2, Pencil, ChevronDown, Calendar } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import TaskEditModal from "@/components/TaskEditModal";

type DateGroup = {
  key: string;
  label: string;
  items: BrainItem[];
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

  // Formato tipo: "26 dic, 18:55" (según locale del navegador)
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
  const { t } = useI18n();

  const [items, setItems] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingTask, setEditingTask] = useState<BrainItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // ✅ Retráctil: estado de grupos colapsados
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
    {}
  );

  // siempre arriba al entrar / recargar
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  // cargar todos los ítems de bandeja y luego filtrar tareas
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

  // ✅ Memo para que no cambie por referencia en cada render
  const filtered = useMemo(() => {
    return items.filter((item) => item.type === "task");
  }, [items]);

  // ✅ Memo para que dateGroups sea estable
  const dateGroups: DateGroup[] = useMemo(() => {
    if (filtered.length === 0) return [];

    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowMid = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayGroup: DateGroup = { key: "TODAY", label: t("inbox.sectionToday"), items: [] };
    const tomorrowGroup: DateGroup = {
      key: "TOMORROW",
      label: t("inbox.sectionTomorrow"),
      items: [],
    };
    const noDateGroup: DateGroup = { key: "NO_DATE", label: t("inbox.sectionNoDate"), items: [] };

    const otherDateGroupsMap = new Map<string, { group: DateGroup; dateMs: number }>();

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
            const label = d.toLocaleDateString(undefined, {
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
  }, [filtered, t]);

  // ✅ Firma estable para disparar el effect solo cuando cambien los grupos
  const groupKeysSignature = useMemo(() => {
    return dateGroups.map((g) => g.key).join("|");
  }, [dateGroups]);

  // ✅ Inicializar / limpiar collapsedGroups SOLO cuando cambie la firma de grupos
  useEffect(() => {
    setCollapsedGroups((prev) => {
      let changed = false;
      const next: Record<string, boolean> = { ...prev };

      // añadir keys nuevas (por defecto: expandido => false)
      for (const g of dateGroups) {
        if (next[g.key] === undefined) {
          next[g.key] = false;
          changed = true;
        }
      }

      // eliminar keys que ya no existen
      for (const k of Object.keys(next)) {
        if (!dateGroups.some((g) => g.key === k)) {
          delete next[k];
          changed = true;
        }
      }

      return changed ? next : prev; // ✅ IMPORTANTÍSIMO: si no hay cambios, no re-render
    });
  }, [groupKeysSignature, dateGroups]);

  // marcar como hecha o borrar según estado actual
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
    if (item.type !== "task") return;
    setEditingTask(item);
    setEditOpen(true);
  };

  const filterLabel = t("inbox.tasksTab");

  return (
    <div className="remi-page min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Cabecera morada */}
      <header className="bg-[#7d59c9] text-white px-4 pt-8 pb-8 rounded-b-3xl shadow-md">
        <h1 className="text-lg font-semibold">{t("inbox.title")}</h1>
        <p className="text-xs text-white/80">{t("inbox.subtitle")}</p>
      </header>

      {/* Contenido scrollable */}
      <main className="flex-1 px-4 pb-24 pt-2 bg-[#F6F7FB] remi-scroll">
        {/* Chip con el filtro actual + contador */}
        <div className="mb-2 flex items-center justify-between">
          <div className="remi-tabs">
            <div className="remi-tab remi-tab--active cursor-default select-none">
              {filterLabel}
            </div>
          </div>
          <span className="text-[11px] text-[#b2b6d1]">
            {t("inbox.itemsCount", { count: filtered.length })}
          </span>
        </div>

        <div className="space-y-3">
          {loading && (
            <div className="rounded-2xl bg-white/70 border border-slate-100 px-4 py-3 text-[13px] text-slate-500">
              {t("inbox.loading")}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-4 py-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(143,49,243,0.10)] text-[#7d59c9] flex items-center justify-content-center shrink-0 flex items-center justify-center">
                <List size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-slate-900">
                  {t("inbox.emptyTitle")}
                </p>
                <p className="text-[12px] text-slate-500">{t("inbox.emptySubtitle")}</p>
              </div>
            </div>
          )}

          {!loading &&
            dateGroups.map((group) => {
              const isCollapsed = collapsedGroups[group.key] ?? false;

              return (
                <div key={group.key} className="pt-2">
                  {/* Separador retráctil: chevron + label + línea */}
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
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      {group.label}
                    </p>
                    <div className="flex-1 h-px bg-slate-300/70" />
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-2">
                      {group.items.map((item) => {
                        const isDone = item.status === "DONE";

                        const dueText = item.due_date
                          ? formatDue(item.due_date as string) ??
                            new Date(item.due_date as string).toLocaleString()
                          : t("today.dueNoDate");

                        const primaryBtnClass = isDone
                          ? "bg-red-50 border-red-200 hover:bg-red-100"
                          : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100";

                        const primaryIconColor = isDone ? "#DC2626" : "#10B981";

                        return (
                          <div
                            key={item.id}
                            className="rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-4 py-3 flex items-center gap-3"
                          >
                            {/* icono */}
                            <div className="w-10 h-10 rounded-full bg-[rgba(143,49,243,0.10)] text-[#7d59c9] flex items-center justify-center shrink-0">
                              <List size={18} />
                            </div>

                            {/* texto */}
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-[14px] font-semibold text-slate-900 leading-snug"
                                style={{
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {item.title}
                              </p>

                              <div className="mt-1 flex items-center gap-1 text-[12px] text-slate-500">
                                <Calendar size={14} className="text-slate-400" />
                                <span className="truncate">{dueText}</span>
                              </div>
                            </div>

                            {/* acciones derecha */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(item);
                                }}
                                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 inline-flex items-center justify-center"
                                aria-label="Edit"
                                title="Edit"
                              >
                                <Pencil size={16} color="#94A3B8" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrimaryAction(item);
                                }}
                                className={`w-9 h-9 rounded-full border inline-flex items-center justify-center ${primaryBtnClass}`}
                                aria-label={isDone ? "Delete" : "Done"}
                                title={isDone ? "Delete" : "Done"}
                              >
                                {isDone ? (
                                  <Trash2 size={16} color={primaryIconColor} />
                                ) : (
                                  <Check size={16} color={primaryIconColor} />
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

      {/* Modal para editar una tarea */}
      <TaskEditModal
        open={editOpen}
        task={editingTask}
        onClose={() => setEditOpen(false)}
        onUpdated={(updated) => {
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        }}
      />
    </div>
  );
}
