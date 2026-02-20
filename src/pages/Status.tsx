// src/pages/Status.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  CheckCircle2,
  CalendarDays,
  Loader2,
  LayoutTemplate,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MindRelaxSurface from "@/components/MindRelaxSurface";
import {
  fetchRemiStatusSummary,
  fetchRemiStatusInsights,
  type RemiStatusSummary,
  type RemiStatusInsights,
} from "@/lib/brainItemsApi";
import { fetchSharedLists } from "@/lib/sharedListsApi";
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

function getMoodFromMindClearPercent(percent: number): RemiMood {
  if (percent >= 85) return "celebrate";
  if (percent >= 65) return "happy";
  if (percent >= 45) return "calm";
  if (percent >= 25) return "waiting";
  return "concerned";
}

function getPeakTwoSlotWindow(series: number[]): { start: number; end: number } {
  if (series.length === 0) return { start: 0, end: 0 };
  if (series.length === 1) return { start: 0, end: 0 };
  let bestStart = 0;
  let bestValue = -1;
  for (let i = 0; i < series.length - 1; i += 1) {
    const value = (series[i] ?? 0) + (series[i + 1] ?? 0);
    if (value > bestValue) {
      bestValue = value;
      bestStart = i;
    }
  }
  return { start: bestStart, end: bestStart + 1 };
}

function sumByHour(matrix: number[][]): number[] {
  const out = new Array<number>(24).fill(0);
  for (const row of matrix) {
    for (let h = 0; h < 24; h += 1) {
      out[h] += row[h] ?? 0;
    }
  }
  return out;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function RemiAvatar({
  loading,
  mindClearPercent,
}: {
  loading: boolean;
  mindClearPercent: number;
}) {
  const size = 160;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapFraction = 0.2;
  const trackLength = circumference * (1 - gapFraction);
  const gapAngle = 360 * gapFraction;
  const rotation = 90 + gapAngle / 2;
  const clamped = Math.max(0, Math.min(100, mindClearPercent));
  const progressLength = (trackLength * clamped) / 100;
  const gradientId = "mind-clear-gradient-status";

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="relative h-32 w-32">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${size} ${size}`}
          >
            <defs>
              <linearGradient id={gradientId} x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#59a5c9" />
                <stop offset="12.5%" stopColor="#5989c9" />
                <stop offset="25%" stopColor="#596dc9" />
                <stop offset="37.5%" stopColor="#6b63c9" />
                <stop offset="50%" stopColor="#7d59c9" />
                <stop offset="62.5%" stopColor="#9959c9" />
                <stop offset="75%" stopColor="#b559c9" />
                <stop offset="87.5%" stopColor="#bf59b7" />
                <stop offset="100%" stopColor="#c959a5" />
              </linearGradient>
            </defs>
            <g transform={`rotate(${rotation} ${size / 2} ${size / 2})`}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e3e8f2"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${trackLength} ${circumference}`}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${trackLength * 0.15} ${circumference}`}
              />
            </g>
          </svg>
          <div className="absolute inset-[10px] rounded-full bg-slate-50/85" />
          <div className="absolute inset-[16px] rounded-full bg-gradient-to-br from-slate-100 via-white to-slate-50 shadow-xl shadow-black/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-slate-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  let emoji = "😟";
  let bg = "from-rose-100 via-white to-rose-50";

  if (clamped >= 85) {
    emoji = "🥳";
    bg = "from-yellow-100 via-white to-orange-100";
  } else if (clamped >= 65) {
    emoji = "😊";
    bg = "from-emerald-100 via-white to-emerald-50";
  } else if (clamped >= 45) {
    emoji = "😌";
    bg = "from-sky-100 via-white to-sky-50";
  } else if (clamped >= 25) {
    emoji = "🙂";
    bg = "from-white/90 via-white to-white/80";
  } else {
    emoji = "🧠";
    bg = "from-slate-100 via-white to-slate-50";
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-32 w-32">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#59a5c9" />
              <stop offset="12.5%" stopColor="#5989c9" />
              <stop offset="25%" stopColor="#596dc9" />
              <stop offset="37.5%" stopColor="#6b63c9" />
              <stop offset="50%" stopColor="#7d59c9" />
              <stop offset="62.5%" stopColor="#9959c9" />
              <stop offset="75%" stopColor="#b559c9" />
              <stop offset="87.5%" stopColor="#bf59b7" />
              <stop offset="100%" stopColor="#c959a5" />
            </linearGradient>
          </defs>
          <g transform={`rotate(${rotation} ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e3e8f2"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${trackLength} ${circumference}`}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${progressLength} ${circumference}`}
            />
          </g>
        </svg>
        <div className="absolute inset-[10px] rounded-full bg-slate-50/85" />
        <div
          className={`absolute inset-[20px] rounded-full bg-gradient-to-br ${bg} shadow-xl shadow-black/10 flex items-center justify-center text-5xl animate-pulse`}
        >
          {emoji}
        </div>
        <div className="absolute left-1/2 bottom-[4px] -translate-x-1/2 rounded-full bg-white/90 px-2 py-0.5 shadow-sm">
          <span className="text-[10px] font-semibold text-violet-700">{clamped}%</span>
        </div>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const [summary, setSummary] = useState<RemiStatusSummary | null>(null);
  const [insights, setInsights] = useState<RemiStatusInsights | null>(null);
  const [sharedListsCount, setSharedListsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relaxOpen, setRelaxOpen] = useState(false);

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
        const [summaryData, insightsData, listsData] = await Promise.all([
          fetchRemiStatusSummary(user.id),
          fetchRemiStatusInsights(user.id),
          fetchSharedLists(user.id).catch((err) => {
            console.error("Error fetching shared lists for status", err);
            return [];
          }),
        ]);
        setSummary(summaryData);
        setInsights(insightsData);
        setSharedListsCount(listsData.length);
      } catch (error) {
        console.error("Error fetching Remi status summary", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user]);

  const todayTotal = summary?.todayTotal ?? 0;
  const todayDone = summary?.todayDone ?? 0;
  const weekActiveDays = summary?.weekActiveDays ?? 0;
  const weekActivitySlots = summary?.weekActivitySlots ?? null;
  const weekActivePercent = Math.round((weekActiveDays / 7) * 100);
  const totalTasksStored = summary?.totalTasksStored ?? 0;
  const totalIdeasStored = summary?.totalIdeasStored ?? 0;
  const totalItemsStored = summary?.totalItemsStored ?? totalTasksStored + totalIdeasStored;
  const streakDays = summary?.streakDays ?? 0;
  const daysSinceLastActivity = summary?.daysSinceLastActivity ?? null;
  const capturedSeries = insights?.capturedSeries ?? [0, 0, 0, 0, 0, 0, 0];
  const resolvedSeries = insights?.resolvedSeries ?? [0, 0, 0, 0, 0, 0, 0];
  const capturedHeatmap = insights?.capturedHeatmap ?? [];
  const resolvedHeatmap = insights?.resolvedHeatmap ?? [];
  const capturedByHour = useMemo(() => sumByHour(capturedHeatmap), [capturedHeatmap]);
  const resolvedByHour = useMemo(() => sumByHour(resolvedHeatmap), [resolvedHeatmap]);
  const capturedLast30Count = insights?.capturedLast30Count ?? capturedSeries.reduce((acc, cur) => acc + cur, 0);
  const closedWithDueCount = insights?.completedWithDueCount ?? 0;
  const overdueCount = insights?.overdueUnfinishedCount ?? 0;
  const balanceMax = Math.max(1, ...capturedSeries, ...resolvedSeries);
  const pieData = [
    { key: "captured", label: t("status.pieCaptured"), value: capturedLast30Count, color: "#7d59c9" },
    { key: "ideas", label: t("status.pieIdeas"), value: totalIdeasStored, color: "#e8c45a" },
    { key: "lists", label: t("status.pieLists"), value: sharedListsCount, color: "#59a5c9" },
    { key: "closed", label: t("status.pieClosed"), value: closedWithDueCount, color: "#59c9b5" },
    { key: "overdue", label: t("status.pieOverdue"), value: overdueCount, color: "#f19aa9" },
  ];
  const pieTotal = pieData.reduce((acc, item) => acc + item.value, 0);
  const pieGradient = (() => {
    if (pieTotal <= 0) return "conic-gradient(#e2e8f0 0deg 360deg)";
    let cursor = 0;
    const stops: string[] = [];
    for (const item of pieData) {
      const size = (item.value / pieTotal) * 360;
      const end = cursor + size;
      stops.push(`${item.color} ${cursor}deg ${end}deg`);
      cursor = end;
    }
    return `conic-gradient(${stops.join(", ")})`;
  })();
  const weekDateLabels = useMemo(() => {
    const locale = lang === "de" ? "de-DE" : lang === "en" ? "en-US" : "es-ES";
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      const s = fmt.format(d).replace(".", "").trim();
      return (s[0] ?? "-").toUpperCase();
    });
  }, [lang]);
  const capturedPeakWindow = useMemo(() => getPeakTwoSlotWindow(capturedByHour), [capturedByHour]);
  const resolvedPeakWindow = useMemo(() => getPeakTwoSlotWindow(resolvedByHour), [resolvedByHour]);
  const capturedPeakRangeLabel = `${formatHour(capturedPeakWindow.start)}-${formatHour((capturedPeakWindow.end + 1) % 24)}`;
  const resolvedPeakRangeLabel = `${formatHour(resolvedPeakWindow.start)}-${formatHour((resolvedPeakWindow.end + 1) % 24)}`;

  // Mind clear score rewards offloading/completing and decays with inactivity.
  const mindClearPercent = (() => {
    if (!summary) return 10;

    const delegatedItems = totalItemsStored;
    const completedToday = todayDone;
    const streakBonusDays = Math.min(streakDays, 14);
    const weeklyBonusDays = Math.min(weekActiveDays, 7);
    const inactiveDays = Math.max(0, daysSinceLastActivity ?? 0);
    const inactivityPenalty = Math.min(40, inactiveDays * 4);

    const value =
      10 +
      delegatedItems * 4 +
      completedToday * 6 +
      streakBonusDays * 2 +
      weeklyBonusDays -
      inactivityPenalty;

    return Math.max(10, Math.min(100, Math.round(value)));
  })();

  const mood: RemiMood = getMoodFromMindClearPercent(mindClearPercent);

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
          <h1 className="leading-tight font-extrabold text-slate-900" style={{ fontSize: "clamp(19px, 1.3vw, 28px)" }}>
            {t("status.headerTitle")}
          </h1>
          <p className="mt-0.5 font-semibold text-slate-500" style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}>
            {t("status.headerSubtitle")}
          </p>
        </div>
      </div>

      <main
        style={{
          padding: "0 16px",
          marginTop: 14,
          marginBottom: 10,
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "min(96vw, 1440px)",
        }}
        className="pb-24"
      >
        {/* Tarjeta principal (mismo look de card) */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 md:p-5 lg:p-6">
          <div className="text-center">
            <p className="font-semibold uppercase tracking-[0.04em] text-slate-600" style={{ fontSize: "clamp(12px, 0.8vw, 15px)" }}>
              {t("status.mindClearLabel")}
            </p>
          </div>

          <div className="mt-3">
            <RemiAvatar
              loading={loading}
              mindClearPercent={mindClearPercent}
            />
          </div>

          <div className="mt-3 text-center">
            <p className="text-slate-600" style={{ fontSize: "clamp(14px, 0.95vw, 18px)" }}>
              {summary ? getMoodSubtitle(mood, summary, t) : t("status.helperFallback")}
            </p>
          </div>

          {/* Boton: mismo estilo (pill, morado) */}
          <button
            type="button"
            onClick={() => {
              setRelaxOpen(true);
            }}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-[12px] font-semibold text-white shadow-md transition-colors active:opacity-90 disabled:opacity-60"
            style={{ background: "#7d59c9" }}
          >
            {t("status.relaxMindButton")}
          </button>
        </section>
        <section className="mt-8">
          <h3 className="leading-none font-extrabold text-slate-900 px-1" style={{ fontSize: "clamp(15px, 0.9vw, 20px)" }}>
            {t("status.todaySectionTitle")}
          </h3>

          <div className="mt-3 rounded-3xl border border-violet-100 bg-white p-3.5 shadow-[0_12px_28px_rgba(125,89,201,0.10)] md:p-5 lg:p-6">
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-[18px] border p-3.5" style={{ background: "#f2eefe", borderColor: "#cfbeef" }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-violet-800">
                  {t("status.pieTitle")}
                </p>
                <p className="mt-1 text-slate-600" style={{ fontSize: "clamp(12px, 0.8vw, 15px)" }}>
                  {t("status.pieSubtitle")}
                </p>
                <div className="mt-3 flex items-center gap-4 rounded-xl border border-violet-100 bg-white/75 p-3">
                  <div className="relative h-[96px] w-[96px] shrink-0 rounded-full" style={{ background: pieGradient }}>
                    <div className="absolute inset-[16px] rounded-full bg-white/95 flex items-center justify-center">
                      <span className="text-[14px] font-extrabold text-slate-800">{pieTotal}</span>
                    </div>
                  </div>
                  <div className="min-w-0 grow space-y-1.5">
                    {pieData.map((item) => {
                      const percent = pieTotal > 0 ? Math.round((item.value / pieTotal) * 100) : 0;
                      return (
                        <div key={item.key} className="flex items-center justify-between gap-2 text-[12px]">
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-slate-700">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                            <span className="truncate">{item.label}</span>
                          </span>
                          <span className="shrink-0 font-semibold text-slate-900">
                            {item.value} ({percent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[1.05fr_1fr] gap-3">
              <div className="rounded-[24px] border border-emerald-100 bg-[#ecfdf5] p-4 min-h-[170px] flex flex-col md:min-h-[200px] lg:min-h-[230px]">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="mt-3">
                  <p className="mt-1 leading-none font-extrabold text-slate-900" style={{ fontSize: "clamp(36px, 2.2vw, 56px)" }}>
                    {todayDone}
                  </p>
                  <p className="mt-1 text-slate-600" style={{ fontSize: "clamp(13px, 0.85vw, 17px)" }}>
                    {t("status.todayTasksLabel")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-[20px] border border-amber-100 bg-[#fff8e8] p-3.5">
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 inline-flex items-center justify-center shrink-0">
                        <Flame className="h-3.5 w-3.5" />
                      </div>
                      <p className="leading-none font-extrabold text-slate-900" style={{ fontSize: "clamp(28px, 1.7vw, 44px)" }}>
                        {streakDays}
                      </p>
                    </div>
                    <p className="text-slate-600" style={{ fontSize: "clamp(12px, 0.8vw, 16px)" }}>
                      {t("status.streakSectionTitle")}
                    </p>
                  </div>
                </div>

                <div className="rounded-[20px] border border-rose-100 bg-[#fdeff3] p-3.5">
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-500 inline-flex items-center justify-center shrink-0">
                        <LayoutTemplate className="h-3.5 w-3.5" />
                      </div>
                      <p className="leading-none font-extrabold text-slate-900" style={{ fontSize: "clamp(28px, 1.7vw, 44px)" }}>
                        {totalItemsStored}
                      </p>
                    </div>
                    <p className="text-slate-600" style={{ fontSize: "clamp(12px, 0.8vw, 16px)" }}>
                      {t("status.memoryDelegatedTitle")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-[22px] border border-violet-200 bg-gradient-to-r from-[#f1ecff] via-[#e9f0ff] to-[#e2f5f3] px-4 py-3.5 shadow-[0_10px_24px_rgba(125,89,201,0.12)]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-slate-800 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-violet-700/80">
                    {t("status.weekSectionTitle")}
                  </p>
                  <p className="mt-1 leading-none font-extrabold" style={{ fontSize: "clamp(28px, 1.7vw, 44px)" }}>
                    {weekActivePercent}%
                  </p>
                  <p className="mt-1 text-slate-600" style={{ fontSize: "clamp(13px, 0.9vw, 18px)" }}>
                    {t("status.weekActiveLabel")}
                  </p>
                </div>

                <div
                  className="relative h-[82px] w-[82px] rounded-full"
                  style={{
                    background: `conic-gradient(#7d59c9 ${weekActivePercent * 3.6}deg, rgba(125,89,201,0.20) 0deg)`,
                  }}
                >
                  <div className="absolute inset-[8px] rounded-full bg-white/95 border border-violet-200 flex items-center justify-center">
                    <span className="text-[18px] font-extrabold text-violet-700">{weekActiveDays}/7</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5">
                {Array.from({ length: 7 }).map((_, index) => {
                  const filled = weekActivitySlots
                    ? weekActivitySlots[index] === true
                    : index < weekActiveDays;
                  return (
                    <span
                      key={`week-slot-${index}`}
                      className={filled ? "h-2.5 w-5 rounded-full bg-violet-500" : "h-2.5 w-5 rounded-full bg-violet-200"}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <div className="rounded-[18px] border p-3.5" style={{ background: "#596dc912", borderColor: "#596dc955" }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: "#46579f" }}>
                  {t("status.mentalLoadTitle")}
                </p>
                <p className="mt-1 text-slate-600" style={{ fontSize: "clamp(12px, 0.8vw, 15px)" }}>
                  {t("status.mentalLoadSubtitle")}
                </p>
                <div className="mt-2 rounded-xl bg-white/70 p-2.5">
                  <div className="grid grid-cols-7 gap-1.5">
                    {capturedSeries.map((captured, idx) => {
                      const resolved = resolvedSeries[idx] ?? 0;
                      const BAR_MIN_HEIGHT = 6;
                      const BAR_MAX_HEIGHT = 50;
                      const capturedHeight = Math.max(
                        BAR_MIN_HEIGHT,
                        Math.min(BAR_MAX_HEIGHT, Math.round((captured / balanceMax) * BAR_MAX_HEIGHT)),
                      );
                      const resolvedHeight = Math.max(
                        BAR_MIN_HEIGHT,
                        Math.min(BAR_MAX_HEIGHT, Math.round((resolved / balanceMax) * BAR_MAX_HEIGHT)),
                      );
                      return (
                        <div key={`balance-day-${idx}`} className="flex flex-col items-center gap-1">
                          <div className="h-16 w-full rounded-md bg-slate-100/80 px-1 pb-1 pt-1.5 flex items-end justify-center gap-0.5">
                            <span
                              className="w-1.5 rounded-sm"
                              style={{ height: `${capturedHeight}px`, background: "#7d59c9" }}
                              title={t("status.mentalCapturedTooltip", { count: captured })}
                            />
                            <span
                              className="w-1.5 rounded-sm"
                              style={{ height: `${resolvedHeight}px`, background: "#59c9b5" }}
                              title={t("status.mentalResolvedTooltip", { count: resolved })}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500">{weekDateLabels[idx] ?? "-"}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#7d59c9" }} />
                      {t("status.memoryCaptured")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#59c9b5" }} />
                      {t("status.memoryResolved")}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600">
                    <p>Sueles capturar mas entre {capturedPeakRangeLabel}</p>
                    <p>Sueles resolver mas entre {resolvedPeakRangeLabel}</p>
                  </div>
                </div>
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

      <MindRelaxSurface
        open={relaxOpen}
        onClose={() => setRelaxOpen(false)}
        onCapture={() => {
          setRelaxOpen(false);
          navigate("/");
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("remi-open-mental-dump"));
          }, 80);
        }}
        labels={{
          sound: t("status.relaxSound"),
          soundOff: t("status.relaxSoundOff"),
          pops: t("status.relaxPops"),
          modeTitle: t("status.relaxModeTitle"),
          modeCalm: t("status.relaxModeCalm"),
          modeEnergy: t("status.relaxModeEnergy"),
          resetDoneTitle: t("status.relaxDoneTitle"),
          resetDoneSubtitle: t("status.relaxDoneSubtitle"),
          capture: t("status.relaxCapture"),
          viewCanvas: t("status.relaxViewCanvas"),
          tapToReturn: t("status.relaxTapToReturn"),
          close: t("common.close"),
        }}
      />
    </div>
  );
}
