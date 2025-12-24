// src/pages/Status.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  CheckCircle2,
  CalendarDays,
  Loader2,
  LayoutTemplate,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchRemiStatusSummary,
  fetchActiveTasks,
  fetchActiveIdeas,
  type RemiStatusSummary,
} from "@/lib/brainItemsApi";
import { useI18n } from "@/contexts/I18nContext";

type RemiMood = "celebrate" | "happy" | "calm" | "waiting" | "concerned";
type TranslateFn = (key: string, vars?: Record<string, any>) => string;

function getRemiMood(summary: RemiStatusSummary): RemiMood {
  const { todayTotal, todayDone, streakDays } = summary;

  const completionRate = todayTotal > 0 ? todayDone / Math.max(todayTotal, 1) : 0;

  if (todayTotal === 0 && todayDone === 0) {
    if (streakDays >= 7) return "calm";
    return "waiting";
  }

  if (streakDays >= 7 && completionRate >= 0.7) return "celebrate";
  if (completionRate >= 0.8) return "happy";
  if (completionRate >= 0.3) return "calm";
  return "concerned";
}

function getMoodTitle(mood: RemiMood, t: TranslateFn): string {
  switch (mood) {
    case "celebrate":
      return t("status.moodTitleCelebrate");
    case "happy":
      return t("status.moodTitleHappy");
    case "calm":
      return t("status.moodTitleCalm");
    case "waiting":
      return t("status.moodTitleWaiting");
    case "concerned":
      return t("status.moodTitleConcerned");
    default:
      return t("status.moodTitleDefault");
  }
}

function getMoodSubtitle(
  mood: RemiMood,
  summary: RemiStatusSummary,
  t: TranslateFn
): string {
  const { todayTotal, todayDone, totalTasksStored, totalIdeasStored } = summary;
  const cleared = todayTotal;
  const totalItems = totalTasksStored + totalIdeasStored;

  switch (mood) {
    case "celebrate":
      return t("status.moodSubtitleCelebrate", { cleared, totalItems });
    case "happy":
      return t("status.moodSubtitleHappy", { todayTotal, todayDone });
    case "calm":
      return t("status.moodSubtitleCalm", { todayTotal });
    case "waiting":
      return t("status.moodSubtitleWaiting");
    case "concerned":
      return t("status.moodSubtitleConcerned");
    default:
      return t("status.moodSubtitleDefault");
  }
}

function RemiAvatar({ mood, loading }: { mood: RemiMood; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 via-white to-slate-50 shadow-xl shadow-black/10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-slate-500 animate-spin" />
        </div>
      </div>
    );
  }

  let emoji = "🙂";
  let bg = "from-white/90 via-white to-white/80";

  if (mood === "celebrate") {
    emoji = "🥳";
    bg = "from-yellow-100 via-white to-orange-100";
  } else if (mood === "happy") {
    emoji = "😊";
    bg = "from-emerald-100 via-white to-emerald-50";
  } else if (mood === "calm") {
    emoji = "😌";
    bg = "from-sky-100 via-white to-sky-50";
  } else if (mood === "waiting") {
    emoji = "🧠";
    bg = "from-slate-100 via-white to-slate-50";
  } else if (mood === "concerned") {
    emoji = "😟";
    bg = "from-rose-100 via-white to-rose-50";
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`h-24 w-24 rounded-full bg-gradient-to-br ${bg} shadow-xl shadow-black/10 flex items-center justify-center text-4xl animate-pulse`}
      >
        {emoji}
      </div>
    </div>
  );
}

export default function StatusPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [summary, setSummary] = useState<RemiStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // contadores de tareas/ideas activas
  const [activeTasksCount, setActiveTasksCount] = useState(0);
  const [activeIdeasCount, setActiveIdeasCount] = useState(0);

  // siempre arriba al entrar
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [summaryData, activeTasks, activeIdeas] = await Promise.all([
          fetchRemiStatusSummary(user.id),
          fetchActiveTasks(user.id),
          fetchActiveIdeas(user.id),
        ]);

        setSummary(summaryData);
        setActiveTasksCount(activeTasks.length);
        setActiveIdeasCount(activeIdeas.length);
      } catch (error) {
        console.error("Error fetching Remi status summary", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user]);

  const mood: RemiMood = summary ? getRemiMood(summary) : "calm";

  const todayTotal = summary?.todayTotal ?? 0;
  const todayDone = summary?.todayDone ?? 0;
  const weekActiveDays = summary?.weekActiveDays ?? 0;
  const weekActivitySlots = summary?.weekActivitySlots ?? null;
  const totalTasksStored = summary?.totalTasksStored ?? 0;
  const totalIdeasStored = summary?.totalIdeasStored ?? 0;
  const totalItemsStored = summary?.totalItemsStored ?? totalTasksStored + totalIdeasStored;
  const streakDays = summary?.streakDays ?? 0;
  const daysSinceLastActivity = summary?.daysSinceLastActivity ?? null;

  // mente despejada con días sin usar Remi
  const mindClearPercent = (() => {
    if (!summary) return 10;

    const items = totalItemsStored;

    const baseClear = (() => {
      if (items <= 0) return 10;
      if (items === 1) return 18;
      if (items === 2) return 26;
      if (items === 3) return 32;
      if (items === 4) return 38;
      if (items === 5) return 43;

      return Math.min(100, 30 + Math.round(Math.log10(items + 1) * 35));
    })();

    let multiplier: number;

    const daysSince = daysSinceLastActivity;
    if (daysSince == null) {
      multiplier = 0.5;
    } else if (daysSince <= 0) {
      multiplier = 1;
    } else if (daysSince === 1) {
      multiplier = 0.8;
    } else if (daysSince === 2) {
      multiplier = 0.7;
    } else if (daysSince === 3) {
      multiplier = 0.6;
    } else {
      multiplier = 0.5;
    }

    const value = Math.round(baseClear * multiplier);
    return Math.max(10, Math.min(100, value));
  })();

  return (
    <div className="remi-page min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Header morado */}
      <header className="bg-[#7d59c9] text-white px-4 pt-8 pb-8 rounded-b-3xl shadow-md">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{t("status.headerTitle")}</h1>
          <p className="text-xs text-white/80">{t("status.headerSubtitle")}</p>
        </div>
      </header>

      {/* Contenido con el MISMO estilo base que Tasks/Ideas */}
      <main className="flex-1 px-4 pb-24 pt-2 bg-[#F6F7FB] remi-scroll">
        {/* Tarjeta principal (mismo look de card) */}
        <section className="mt-2 rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-5 py-5">
          <RemiAvatar mood={mood} loading={loading} />

          <div className="mt-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-violet-500">
              {t("status.helperLabel")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {getMoodTitle(mood, t)}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {summary ? getMoodSubtitle(mood, summary, t) : t("status.helperFallback")}
            </p>
          </div>

          {/* Mente despejada: pill suave dentro de la card */}
          <div className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 border border-violet-100/60">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span>{t("status.mindClearLabel")}</span>
              <span>{mindClearPercent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${mindClearPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {t("status.mindClearDescription")}
            </p>
          </div>

          {/* Botón: mismo estilo (pill, morado) */}
          <button
            type="button"
            onClick={() => {
              navigate("/");
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent("remi-open-mental-dump"));
              }, 80);
            }}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors active:opacity-90 disabled:opacity-60"
            style={{ background: "#7d59c9" }}
          >
            {t("mentalDump.title")}
          </button>
        </section>

        {/* Hoy: usamos “cards” como Tasks/Ideas, pero en grid */}
        <section className="mt-4 rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-5 py-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t("status.todaySectionTitle")}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {t("status.todaySectionSubtitle")}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Tareas de hoy */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_10px_25px_rgba(15,23,42,0.05)] px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    {t("status.todayTasksLabel")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {todayDone} / {todayTotal}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {t("status.todayTasksDescription", { todayTotal })}
              </p>
            </div>

            {/* Racha */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_10px_25px_rgba(15,23,42,0.05)] px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 shrink-0">
                  <Flame className="h-4 w-4 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    {t("status.streakSectionTitle")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {t("status.streakValue", { streakDays })}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {t("status.streakDescription", { streakDays })}
              </p>
            </div>

            {/* Memoria delegada */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_10px_25px_rgba(15,23,42,0.05)] px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 shrink-0">
                  <LayoutTemplate className="h-4 w-4 text-violet-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    {t("status.memoryDelegatedTitle")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {t("status.memoryDelegatedValue", {
                      tasks: activeTasksCount,
                      ideas: activeIdeasCount,
                    })}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {t("status.memoryDelegatedDescription", {
                  tasks: activeTasksCount,
                  ideas: activeIdeasCount,
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Semana: card estilo Tasks/Ideas */}
        <section className="mt-4 rounded-2xl bg-white border border-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.06)] px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <CalendarDays className="h-4 w-4 text-slate-500" />
            </div>

            <div className="flex-1 min-w-0">
             <h3 className="text-sm font-semibold text-slate-900">
                {t("status.weekSectionTitle")}
              </h3>

              <p className="mt-2 text-[11px] text-slate-500">
                {t("status.weekSectionSubtitle")}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-slate-600">
              {t("status.weekActiveLabel")}
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-slate-900">{weekActiveDays} / 7</p>

              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, index) => {
                  const filled = weekActivitySlots
                    ? weekActivitySlots[index] === true
                    : index < weekActiveDays;

                  return (
                    <div
                      key={index}
                      className={`h-8 w-4 rounded-full border border-violet-100 ${
                        filled ? "bg-violet-500" : "bg-violet-100/60"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-violet-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("status.loading")}</span>
          </div>
        )}
      </main>
    </div>
  );
}
