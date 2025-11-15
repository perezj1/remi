// src/pages/Inbox.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BrainItem,
  BrainItemStatus,
  fetchInboxItems,
  setTaskStatus,
  deleteBrainItem, // 👈 NUEVO
} from "@/lib/brainItemsApi";
import { Lightbulb, ListTodo, Check, Trash2 } from "lucide-react";

type Filter = "ALL" | "TASKS" | "IDEAS";

function statusLabel(status: BrainItemStatus) {
  if (status === "DONE") return "Hecha";
  if (status === "ACTIVE") return "Activa";
  return "Archivada";
}

export default function InboxPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchInboxItems(user.id);
        setItems(data);
      } catch (err) {
        console.error(err);
        alert("Error cargando tu bandeja");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const filtered = items.filter((item) => {
    if (filter === "TASKS") return item.type === "task";
    if (filter === "IDEAS") return item.type === "idea";
    return true;
  });

  // marcar como hecha o borrar según estado actual
  const handlePrimaryAction = async (item: BrainItem) => {
    try {
      if (item.status !== "DONE") {
        // pasar a DONE
        const updated = await setTaskStatus(item.id, "DONE");
        setItems((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
      } else {
        // ya está DONE → borrar DEFINITIVAMENTE de Supabase y quitar de la lista
        await deleteBrainItem(item.id);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }
    } catch (err) {
      console.error(err);
      alert("Error actualizando tu bandeja");
    }
  };

  return (
    <div className="remi-page">
      <div style={{ padding: "18px 18px 10px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          Bandeja
        </h1>
        <p style={{ fontSize: 12, color: "#8b8fa6", marginBottom: 14 }}>
          Todo lo que has vaciado de tu cabeza aparece aquí.
        </p>

        {/* filtros tipo pestañas */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div className="remi-tabs">
            <button
              className={
                "remi-tab " + (filter === "ALL" ? "remi-tab--active" : "")
              }
              onClick={() => setFilter("ALL")}
            >
              Todo
            </button>
            <button
              className={
                "remi-tab " + (filter === "TASKS" ? "remi-tab--active" : "")
              }
              onClick={() => setFilter("TASKS")}
            >
              Tareas
            </button>
            <button
              className={
                "remi-tab " + (filter === "IDEAS" ? "remi-tab--active" : "")
              }
              onClick={() => setFilter("IDEAS")}
            >
              Ideas
            </button>
          </div>
          <span style={{ fontSize: 11, color: "#b2b6d1" }}>
            {filtered.length} ítems
          </span>
        </div>
      </div>

      <div style={{ padding: "0 18px 18px" }}>
        <div className="remi-task-list">
          {loading && (
            <div className="remi-task-row">
              <span className="remi-task-sub">Cargando bandeja…</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="remi-task-row">
              <div className="remi-task-dot" />
              <div>
                <p className="remi-task-title">Bandeja vacía</p>
                <p className="remi-task-sub">
                  Añade nuevas tareas o ideas desde la pantalla de Hoy.
                </p>
              </div>
            </div>
          )}

          {!loading &&
            filtered.map((item) => {
              const isTask = item.type === "task";
              const isDone = item.status === "DONE";

              const btnBg = isDone
                ? "rgba(248,113,113,0.08)" // rojo suave
                : "rgba(16,185,129,0.08)"; // verde suave
              const btnBorder = isDone
                ? "rgba(248,113,113,0.4)"
                : "rgba(16,185,129,0.4)";
              const btnColor = isDone ? "#DC2626" : "#10B981";

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
                    {/* icono circular a la izquierda */}
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
                      <p className="remi-task-sub">
                        {isTask ? "Tarea · " : "Idea · "}
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* estado + botón circular */}
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
                      {statusLabel(item.status)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePrimaryAction(item)}
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
              );
            })}
        </div>
      </div>
    </div>
  );
}
