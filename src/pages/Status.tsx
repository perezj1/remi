// src/pages/Status.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Flame,
  LayoutTemplate,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MindRelaxSurface from "@/components/MindRelaxSurface";
import {
  fetchRemiStatusInsights,
  fetchRemiStatusSummary,
  type RemiStatusInsights,
  type RemiStatusSummary,
} from "@/lib/brainItemsApi";
import { computeMindClearPercent } from "@/lib/mindClear";
import { useI18n } from "@/contexts/I18nContext";
import type { TranslationVars } from "@/locales";

type RemiMood = "celebrate" | "happy" | "calm" | "waiting" | "concerned";
type SafeTranslateFn = (
  key: string,
  fallback: string,
  vars?: TranslationVars,
) => string;

function interpolate(
  template: string,
  vars?: TranslationVars,
): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (output, [key, value]) =>
      output.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"), String(value)),
    template,
  );
}

function getMoodFromMindClearPercent(percent: number): RemiMood {
  if (percent >= 85) return "celebrate";
  if (percent >= 65) return "happy";
  if (percent >= 45) return "calm";
  if (percent >= 25) return "waiting";
  return "concerned";
}

function getMoodTitle(mood: RemiMood, t: SafeTranslateFn): string {
  switch (mood) {
    case "celebrate":
      return t("status.moodTitleCelebrate", "Muy en control");
    case "happy":
      return t("status.moodTitleHappy", "Buen ritmo");
    case "calm":
      return t("status.moodTitleCalm", "Todo bajo control");
    case "waiting":
      return t("status.moodTitleWaiting", "Aun hay margen");
    case "concerned":
      return t("status.moodTitleConcerned", "Conviene soltar carga");
    default:
      return t("status.moodTitleDefault", "Estado de tu mente");
  }
}

function getMoodSubtitle(
  mood: RemiMood,
  summary: RemiStatusSummary,
  t: SafeTranslateFn,
): string {
  const { todayTotal, todayDone, totalTasksStored, totalIdeasStored } = summary;
  const cleared = todayTotal;
  const totalItems = totalTasksStored + totalIdeasStored;

  switch (mood) {
    case "celebrate":
      return t("status.moodSubtitleCelebrate", "Hoy has liberado {{cleared}} cosas y Remi ya guarda {{totalItems}} por ti.", {
        cleared,
        totalItems,
      });
    case "happy":
      return t("status.moodSubtitleHappy", "Llevas {{todayDone}} de {{todayTotal}} resueltas hoy. Buen ritmo.", {
        todayDone,
        todayTotal,
      });
    case "calm":
      return t("status.moodSubtitleCalm", "Remi esta guardando {{todayTotal}} cosas de hoy para que no pesen en tu cabeza.", {
        todayTotal,
      });
    case "waiting":
      return t("status.moodSubtitleWaiting", "Tu mente va ligera. Si aparece algo mas, sueltalo aqui y sigue.");
    case "concerned":
      return t("status.moodSubtitleConcerned", "Parece un dia largo. Empieza con una sola cosa y deja que Remi cargue el resto.");
    default:
      return t("status.moodSubtitleDefault", "Cada cosa que guardas en Remi es una cosa menos que carga tu mente.");
  }
}

function getPeakTwoSlotWindow(series: number[]): { start: number; end: number } {
  if (series.length === 0) return { start: 0, end: 0 };
  if (series.length === 1) return { start: 0, end: 0 };

  let bestStart = 0;
  let bestValue = -1;

  for (let index = 0; index < series.length - 1; index += 1) {
    const value = (series[index] ?? 0) + (series[index + 1] ?? 0);
    if (value > bestValue) {
      bestValue = value;
      bestStart = index;
    }
  }

  return { start: bestStart, end: bestStart + 1 };
}

function sumByHour(matrix: number[][]): number[] {
  const output = new Array<number>(24).fill(0);
  for (const row of matrix) {
    for (let hour = 0; hour < 24; hour += 1) {
      output[hour] += row[hour] ?? 0;
    }
  }
  return output;
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
  const size = 152;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, mindClearPercent));
  const progressLength = (circumference * clamped) / 100;

  let emoji = "🧠";
  let bg = "from-slate-100 via-white to-slate-50";

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
    bg = "from-white via-white to-slate-100";
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-32 w-32">
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#7d59c9"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${progressLength} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-[18px] rounded-full bg-white/90" />
        <div
          className={`absolute inset-[24px] flex items-center justify-center rounded-full bg-gradient-to-br ${bg} text-5xl shadow-[0_12px_32px_rgba(15,23,42,0.12)]`}
        >
          {loading ? <Loader2 className="h-8 w-8 animate-spin text-slate-500" /> : emoji}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <div className="rounded-full border border-violet-100 bg-white px-2.5 py-1 text-xs font-extrabold text-violet-700 shadow-sm">
            {clamped}%
          </div>
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
  const [loading, setLoading] = useState(true);
  const [relaxOpen, setRelaxOpen] = useState(false);

  const safeT = useCallback<SafeTranslateFn>(
    (key, fallback, vars) => {
      const value = t(key, vars);
      if (!value || value === key) return interpolate(fallback, vars);
      return value;
    },
    [t],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [summaryData, insightsData] = await Promise.all([
          fetchRemiStatusSummary(user.id),
          fetchRemiStatusInsights(user.id),
        ]);
        setSummary(summaryData);
        setInsights(insightsData);
      } catch (error) {
        console.error("Error fetching Remi status", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user]);

  const todayDone = summary?.todayDone ?? 0;
  const todayTotal = summary?.todayTotal ?? 0;
  const totalItemsStored =
    summary?.totalItemsStored ??
    (summary?.totalTasksStored ?? 0) + (summary?.totalIdeasStored ?? 0);
  const streakDays = summary?.streakDays ?? 0;
  const weekActiveDays = summary?.weekActiveDays ?? 0;
  const weekActivitySlots = summary?.weekActivitySlots ?? null;
  const weekActivePercent = Math.round((weekActiveDays / 7) * 100);

  const capturedSeries = insights?.capturedSeries ?? [0, 0, 0, 0, 0, 0, 0];
  const resolvedSeries = insights?.resolvedSeries ?? [0, 0, 0, 0, 0, 0, 0];
  const capturedByHour = useMemo(
    () => sumByHour(insights?.capturedHeatmap ?? []),
    [insights?.capturedHeatmap],
  );
  const resolvedByHour = useMemo(
    () => sumByHour(insights?.resolvedHeatmap ?? []),
    [insights?.resolvedHeatmap],
  );
  const capturedPeakWindow = useMemo(
    () => getPeakTwoSlotWindow(capturedByHour),
    [capturedByHour],
  );
  const resolvedPeakWindow = useMemo(
    () => getPeakTwoSlotWindow(resolvedByHour),
    [resolvedByHour],
  );
  const capturedPeakRangeLabel = `${formatHour(capturedPeakWindow.start)}-${formatHour(
    (capturedPeakWindow.end + 1) % 24,
  )}`;
  const resolvedPeakRangeLabel = `${formatHour(resolvedPeakWindow.start)}-${formatHour(
    (resolvedPeakWindow.end + 1) % 24,
  )}`;
  const weeklyBalanceMax = Math.max(1, ...capturedSeries, ...resolvedSeries);

  const weekDateLabels = useMemo(() => {
    const locale = lang === "de" ? "de-DE" : lang === "en" ? "en-US" : "es-ES";
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);

    return Array.from({ length: 7 }).map((_, index) => {
      const next = new Date(start);
      next.setDate(start.getDate() + index);
      const label = formatter.format(next).replace(".", "").trim();
      return (label[0] ?? "-").toUpperCase();
    });
  }, [lang]);

  const mindClearPercent = computeMindClearPercent(summary);
  const mood = getMoodFromMindClearPercent(mindClearPercent);

  const statCards = [
    {
      key: "done",
      label: safeT("status.todayTasksLabel", "Hecho hoy"),
      value: `${todayDone}`,
      detail:
        todayTotal > 0
          ? safeT("status.todayProgressFallback", "{{done}} de {{total}} resueltas", {
              done: todayDone,
              total: todayTotal,
            })
          : safeT("status.todayEmptyFallback", "Sin tareas marcadas hoy"),
      icon: <CheckCircle2 className="h-4 w-4" />,
      shell: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    {
      key: "streak",
      label: safeT("status.streakSectionTitle", "Racha"),
      value: `${streakDays}`,
      detail: safeT("status.streakFallback", "{{days}} dias seguidos usando Remi", {
        days: streakDays,
      }),
      icon: <Flame className="h-4 w-4" />,
      shell: "border-amber-100 bg-amber-50 text-amber-700",
    },
    {
      key: "memory",
      label: safeT("status.memoryDelegatedTitle", "Memoria delegada"),
      value: `${totalItemsStored}`,
      detail: safeT("status.memoryFallback", "Tareas y notas que ya no llevas en la cabeza"),
      icon: <LayoutTemplate className="h-4 w-4" />,
      shell: "border-sky-100 bg-sky-50 text-sky-700",
    },
  ];

  return (
    <div
      className="remi-page text-slate-900"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f1eff7 0%, #fafafe 42%, #fafafe 100%)",
        paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
      }}
    >
      <header
        className="relative overflow-hidden border-b border-slate-200 bg-white"
        style={{
          paddingTop: "calc(12px + env(safe-area-inset-top))",
          paddingBottom: 12,
          paddingLeft: "calc(16px + env(safe-area-inset-left))",
          paddingRight: "calc(16px + env(safe-area-inset-right))",
          borderBottomLeftRadius: 22,
          borderBottomRightRadius: 22,
        }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: 980 }}>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate("/");
            }}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {safeT("status.headerTitle", "Estado de Remi")}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {safeT(
              "status.headerSubtitle",
              "Un resumen claro para saber cuanto esta sosteniendo Remi por ti.",
            )}
          </p>
        </div>
      </header>

      <main
        className="mx-auto pb-24"
        style={{
          maxWidth: 980,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 16,
        }}
      >
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
          <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
            <RemiAvatar loading={loading} mindClearPercent={mindClearPercent} />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-violet-700">
                {safeT("status.mindClearLabel", "Claridad mental")}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                {summary
                  ? getMoodTitle(mood, safeT)
                  : safeT("status.moodTitleDefault", "Estado de tu mente")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {summary
                  ? getMoodSubtitle(mood, summary, safeT)
                  : safeT(
                      "status.helperFallback",
                      "Cada cosa que guardas en Remi es una cosa menos que carga tu mente.",
                    )}
              </p>

              <button
                type="button"
                onClick={() => setRelaxOpen(true)}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-[#7d59c9] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              >
                {safeT("status.relaxMindButton", "Relajar mente")}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-3">
          {statCards.map((card) => (
            <article
              key={card.key}
              className={`rounded-[24px] border p-4 ${card.shell}`}
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70">
                {card.icon}
              </div>
              <p className="mt-4 text-4xl font-extrabold leading-none text-slate-900">
                {card.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{card.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-500">
                {safeT("status.weekSectionTitle", "Ritmo semanal")}
              </p>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
                {weekActivePercent}%
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {safeT("status.weekActiveLabel", "Dias con actividad esta semana")}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
              <CalendarDays className="h-4 w-4" />
              {weekActiveDays}/7
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {capturedSeries.map((captured, index) => {
              const resolved = resolvedSeries[index] ?? 0;
              const capturedHeight = Math.max(
                10,
                Math.round((captured / weeklyBalanceMax) * 70),
              );
              const resolvedHeight = Math.max(
                10,
                Math.round((resolved / weeklyBalanceMax) * 70),
              );
              const isActive = weekActivitySlots
                ? weekActivitySlots[index] === true
                : index < weekActiveDays;

              return (
                <div key={`week-bar-${index}`} className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-24 w-full items-end justify-center gap-1 rounded-2xl px-1.5 pb-2 pt-3 ${
                      isActive ? "bg-violet-50" : "bg-slate-50"
                    }`}
                  >
                    <span
                      className="w-2 rounded-full bg-violet-500"
                      style={{ height: `${capturedHeight}px` }}
                    />
                    <span
                      className="w-2 rounded-full bg-emerald-400"
                      style={{ height: `${resolvedHeight}px` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {weekDateLabels[index] ?? "-"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-500">
                {safeT("status.memoryCaptured", "Capturado")}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {capturedSeries.reduce((acc, value) => acc + value, 0)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {safeT(
                  "status.capturedPeakFallback",
                  "Sueles capturar mas entre {{range}}.",
                  { range: capturedPeakRangeLabel },
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-500">
                {safeT("status.memoryResolved", "Resuelto")}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {resolvedSeries.reduce((acc, value) => acc + value, 0)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {safeT(
                  "status.resolvedPeakFallback",
                  "Sueles cerrar mas cosas entre {{range}}.",
                  { range: resolvedPeakRangeLabel },
                )}
              </p>
            </div>
          </div>
        </section>

        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-violet-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{safeT("status.loading", "Cargando...")}</span>
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
          sound: safeT("status.relaxSound", "Sonido"),
          soundOff: safeT("status.relaxSoundOff", "Sin sonido"),
          pops: safeT("status.relaxPops", "Burbujas"),
          modeTitle: safeT("status.relaxModeTitle", "Modo"),
          modeCalm: safeT("status.relaxModeCalm", "Calma"),
          modeEnergy: safeT("status.relaxModeEnergy", "Energia"),
          resetDoneTitle: safeT("status.relaxDoneTitle", "Respira"),
          resetDoneSubtitle: safeT("status.relaxDoneSubtitle", "Tu cabeza ya puede soltar un poco."),
          capture: safeT("status.relaxCapture", "Capturar ahora"),
          viewCanvas: safeT("status.relaxViewCanvas", "Ver lienzo"),
          tapToReturn: safeT("status.relaxTapToReturn", "Toca para volver"),
          close: safeT("common.close", "Cerrar"),
        }}
      />
    </div>
  );
}
