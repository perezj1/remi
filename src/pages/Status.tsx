// src/pages/Status.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  CheckCircle2,
  CalendarDays,
  Info,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchRemiStatusSummary,
  type RemiStatusSummary,
} from "@/lib/brainItemsApi";
import { useI18n } from "@/contexts/I18nContext";

type RemiMood = "celebrate" | "happy" | "calm" | "waiting" | "concerned";
type TranslateFn = (key: string, vars?: Record<string, any>) => string;

function getRemiMood(summary: RemiStatusSummary): RemiMood {
  const { todayTotal, todayDone, streakDays } = summary;

  const completionRate =
    todayTotal > 0 ? todayDone / Math.max(todayTotal, 1) : 0;

  if (todayTotal === 0 && todayDone === 0) {
    if (streakDays >= 7) return "calm";
    return "waiting";
  }

  if (streakDays >= 7 && completionRate >= 0.7) {
    return "celebrate";
  }

  if (completionRate >= 0.8) {
    return "happy";
  }

  if (completionRate >= 0.3) {
    return "calm";
  }

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
      return t("status.moodSubtitleCelebrate", {
        cleared,
        totalItems,
      });
    case "happy":
      return t("status.moodSubtitleHappy", {
        todayTotal,
        todayDone,
      });
    case "calm":
      return t("status.moodSubtitleCalm", {
        todayTotal,
      });
    case "waiting":
      return t("status.moodSubtitleWaiting");
    case "concerned":
      return t("status.moodSubtitleConcerned");
    default:
      return t("status.moodSubtitleDefault");
  }
}

function RemiAvatar({ mood }: { mood: RemiMood }) {
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
        const data = await fetchRemiStatusSummary(user.id);
        setSummary(data);
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
  const totalTasksStored = summary?.totalTasksStored ?? 0;
  const totalIdeasStored = summary?.totalIdeasStored ?? 0;
  const totalItemsStored =
    summary?.totalItemsStored ?? totalTasksStored + totalIdeasStored;
  const streakDays = summary?.streakDays ?? 0;

  const mindClearPercent = Math.min(
    100,
    totalItemsStored > 0
      ? 30 + Math.round(Math.log10(totalItemsStored + 1) * 35)
      : 10
  );

  return (
    <div className="remi-page min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Header morado */}
      <header className="bg-[#8F31F3] text-white px-4 pt-8 pb-8 rounded-b-3xl shadow-md flex items-center gap-3">
        

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">
            {t("status.headerTitle")}
          </h1>
          <p className="text-xs text-white/80">
            {t("status.headerSubtitle")}
          </p>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-2 bg-white">
        {/* Tarjeta principal */}
        <section className="mt-2 rounded-3xl bg-white p-5 shadow-xl shadow-black/10">
          <RemiAvatar mood={mood} />

          <div className="mt-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-violet-500">
              {t("status.helperLabel")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {getMoodTitle(mood, t)}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {summary
                ? getMoodSubtitle(mood, summary, t)
                : t("status.helperFallback")}
            </p>
          </div>

          {/* Mente despejada */}
          <div className="mt-4 rounded-2xl bg-violet-50 px-4 py-3">
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
        </section>

        {/* Lo que hemos conseguido hoy */}
        <section className="mt-4 rounded-3xl bg-white p-5 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {t("status.todaySectionTitle")}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {t("status.todaySectionSubtitle")}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Tareas de hoy */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
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
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <Flame className="h-4 w-4 text-orange-600" />
                </div>
                <div>
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

            {/* Memoria delegada: tareas + ideas */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                  <CalendarDays className="h-4 w-4 text-violet-700" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    {t("status.memoryDelegatedTitle")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {t("status.memoryDelegatedValue", {
                      tasks: totalTasksStored,
                      ideas: totalIdeasStored,
                    })}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {t("status.memoryDelegatedDescription", {
                  tasks: totalTasksStored,
                  ideas: totalIdeasStored,
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Nuestra semana */}
        <section className="mt-4 rounded-3xl bg-white p-5 shadow-md shadow-black/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
              <Info className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {t("status.weekSectionTitle")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("status.weekSectionSubtitle")}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs font-medium text-slate-600">
              {t("status.weekActiveLabel")}
            </p>

            <div className="flex items-center justify-center gap-3 mt-1">
              <p className="text-lg font-semibold text-slate-900">
                {weekActiveDays} / 7
              </p>
              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, index) => {
                  const filled = index < weekActiveDays;
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
