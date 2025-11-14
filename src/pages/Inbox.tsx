// src/pages/Inbox.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BrainItem,
  BrainItemStatus,
  fetchInboxItems,
  setTaskStatus,
} from "@/lib/brainItemsApi";

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

  const handleDone = async (item: BrainItem) => {
    if (item.type !== "task" || item.status === "DONE") return;
    const updated = await setTaskStatus(item.id, "DONE");
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
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
            filtered.map((item) => (
              <div key={item.id} className="remi-task-row">
                {/* punto de color distinto según tipo */}
                <div
                  className="remi-task-dot"
                  style={{
                    borderColor:
                      item.type === "task" ? "#3ad269" : "#ff6fd8",
                    background:
                      item.type === "task" ? "#eafff2" : "#ffe6f7",
                  }}
                />
                <div>
                  <p className="remi-task-title">{item.title}</p>
                  <p className="remi-task-sub">
                    {item.type === "task" ? "Tarea · " : "Idea · "}
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 10,
                      marginBottom: 4,
                      color:
                        item.status === "DONE"
                          ? "#3ad269"
                          : "#8b8fa6",
                    }}
                  >
                    {statusLabel(item.status)}
                  </div>
                  {item.type === "task" && item.status !== "DONE" && (
                    <button
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: 11,
                        color: "#8F31F3",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDone(item)}
                    >
                      Marcar hecha
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
