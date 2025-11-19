// src/pages/Inbox.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BrainItem,
  BrainItemStatus,
  fetchInboxItems,
  setTaskStatus,
  deleteBrainItem,
} from "@/lib/brainItemsApi";
import { Lightbulb, ListTodo, Check, Trash2, Pencil } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import IdeaEditModal from "@/components/IdeaEditModal";

type Filter = "ALL" | "TASKS" | "IDEAS";

function statusLabel(
  status: BrainItemStatus,
  t: (key: string) => string
): string {
  if (status === "DONE") return t("inbox.statusDone");
  if (status === "ACTIVE") return t("inbox.statusActive");
  return t("inbox.statusArchived");
}

export default function InboxPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [items, setItems] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");

  // estado para el modal de edición de ideas
  const [editingIdea, setEditingIdea] = useState<BrainItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // siempre arriba al entrar / recargar
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

  const filtered = items.filter((item) => {
    if (filter === "TASKS") return item.type === "task";
    if (filter === "IDEAS") return item.type === "idea";
    return true;
  });

  // marcar como hecha o borrar según estado actual
  const handlePrimaryAction = async (item: BrainItem) => {
    try {
      if (item.status !== "DONE") {
        const updated = await setTaskStatus(item.id, "DONE");
        setItems((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
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
    if (item.type !== "idea") return;
    setEditingIdea(item);
    setEditOpen(true);
  };

  return (
    <div className="remi-page min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Cabecera morada */}
      <header className="bg-[#8F31F3] text-white px-4 pt-8 pb-8 rounded-b-3xl shadow-md">
        <h1 className="text-lg font-semibold">{t("inbox.title")}</h1>
        <p className="text-xs text-white/80">{t("inbox.subtitle")}</p>
      </header>

      {/* Contenido scrollable */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-3 bg-white">
        {/* filtros tipo pestañas */}
        <div className="mb-2 flex items-center justify-between">
          <div className="remi-tabs">
            <button
              className={
                "remi-tab " + (filter === "ALL" ? "remi-tab--active" : "")
              }
              onClick={() => setFilter("ALL")}
              type="button"
            >
              {t("inbox.allTab")}
            </button>
            <button
              className={
                "remi-tab " + (filter === "TASKS" ? "remi-tab--active" : "")
              }
              onClick={() => setFilter("TASKS")}
              type="button"
            >
              {t("inbox.tasksTab")}
            </button>
            <button
              className={
                "remi-tab " + (filter === "IDEAS" ? "remi-tab--active" : "")
              }
              onClick={() => setFilter("IDEAS")}
              type="button"
            >
              {t("inbox.ideasTab")}
            </button>
          </div>
          <span className="text-[11px] text-[#b2b6d1]">
            {t("inbox.itemsCount", { count: filtered.length })}
          </span>
        </div>

        <div className="remi-task-list">
          {loading && (
            <div className="remi-task-row">
              <span className="remi-task-sub">{t("inbox.loading")}</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="remi-task-row">
              <div className="remi-task-dot" />
              <div>
                <p className="remi-task-title">{t("inbox.emptyTitle")}</p>
                <p className="remi-task-sub">{t("inbox.emptySubtitle")}</p>
              </div>
            </div>
          )}

          {!loading &&
            filtered.map((item) => {
              const isTask = item.type === "task";
              const isDone = item.status === "DONE";

              const btnBg = isDone
                ? "rgba(248,113,113,0.08)"
                : "rgba(16,185,129,0.08)";
              const btnBorder = isDone
                ? "rgba(248,113,113,0.4)"
                : "rgba(16,185,129,0.4)";
              const btnColor = isDone ? "#DC2626" : "#10B981";

              const hasDue = !!item.due_date;
              const dueStr = hasDue
                ? new Date(item.due_date as string).toLocaleString()
                : t("today.dueNoDate"); // Sin fecha límite

              return (
                <div
                  key={item.id}
                  className="remi-task-row"
                  style={{
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 16,
                    background: "#ffffff",
                    boxShadow: "0 10px 25px rgba(15,23,42,0.04)",
                    marginBottom: 8,
                  }}
                >
                  {/* icono + texto */}
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 2,
                        background: isTask
                          ? "rgba(143,49,243,0.08)"
                          : "rgba(251,191,36,0.15)",
                        color: isTask ? "#8F31F3" : "#F59E0B",
                      }}
                    >
                      {isTask ? (
                        <ListTodo size={18} />
                      ) : (
                        <Lightbulb size={18} />
                      )}
                    </div>

                    <div>
                      <p
                        className="remi-task-title"
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {item.title}
                      </p>

                      {/* Línea secundaria:
                          - Tasks: "Due date: ... / Sin fecha límite"
                          - Ideas: "Idea. no tienen fecha." */}
                      {isTask ? (
                        <p className="remi-task-sub">
                          {t("today.dueLabel")}
                          {dueStr}
                        </p>
                      ) : (
                        <p className="remi-task-sub">
                          {t("inbox.itemIdeaPrefix")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* estado + botones circulares */}
                  <div
                    style={{
                      textAlign: "right",
                      marginLeft: 8,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: isDone
                          ? "#16a34a"
                          : item.status === "ACTIVE"
                          ? "#8b8fa6"
                          : "#b2b6d1",
                      }}
                    >
                      {statusLabel(item.status, t)}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      {/* Botón editar SOLO para ideas */}
                      {item.type === "idea" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(item);
                          }}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "999px",
                            border:
                              "1px solid rgba(148,163,184,0.8)", // gris claro
                            background: "transparent",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <Pencil size={16} color="#6b7280" />
                        </button>
                      )}

                      {/* Botón principal: marcar DONE / borrar */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrimaryAction(item);
                        }}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "999px",
                          border: `1px solid ${btnBorder}`,
                          background: btnBg,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        {isDone ? (
                          <Trash2 size={16} color={btnColor} />
                        ) : (
                          <Check size={16} color={btnColor} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      {/* Modal para editar / convertir una idea */}
      <IdeaEditModal
        open={editOpen}
        idea={editingIdea}
        onClose={() => setEditOpen(false)}
        onUpdated={(updated) => {
          setItems((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i))
          );
        }}
        onConverted={(convertedTask) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === convertedTask.id ? convertedTask : i
            )
          );
        }}
      />
    </div>
  );
}
