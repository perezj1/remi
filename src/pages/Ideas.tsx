// src/pages/Ideas.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BrainItem, fetchActiveIdeas } from "@/lib/brainItemsApi";
import { useI18n } from "@/contexts/I18nContext";

export default function IdeasPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [ideas, setIdeas] = useState<BrainItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchActiveIdeas(user.id);
        setIdeas(data);
      } catch (err) {
        console.error(err);
        alert(t("ideas.errorLoading"));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, t]);

  return (
    <div className="remi-page">
      <div style={{ padding: "18px 18px 10px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          {t("ideas.title")}
        </h1>
        <p style={{ fontSize: 12, color: "#8b8fa6", marginBottom: 12 }}>
          {t("ideas.subtitle")}
        </p>
      </div>

      <div style={{ padding: "0 18px 18px" }}>
        <div className="remi-task-list">
          {loading && (
            <div className="remi-task-row">
              <span className="remi-task-sub">
                {t("ideas.loading")}
              </span>
            </div>
          )}

          {!loading && ideas.length === 0 && (
            <div className="remi-task-row">
              <div
                className="remi-task-dot"
                style={{
                  borderColor: "#ff6fd8",
                  background: "#ffe6f7",
                }}
              />
              <div>
                <p className="remi-task-title">
                  {t("ideas.emptyTitle")}
                </p>
                <p className="remi-task-sub">
                  {t("ideas.emptySubtitle")}
                </p>
              </div>
            </div>
          )}

          {!loading &&
            ideas.map((idea) => (
              <div key={idea.id} className="remi-task-row">
                <div
                  className="remi-task-dot"
                  style={{
                    borderColor: "#ff6fd8",
                    background: "#ffe6f7",
                  }}
                />
                <div>
                  <p className="remi-task-title">{idea.title}</p>
                  <p className="remi-task-sub">
                    {t("ideas.savedAt", {
                      date: new Date(idea.created_at).toLocaleString(),
                    })}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
