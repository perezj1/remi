import { useMemo, useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  loading?: boolean;
  title: string;
  questionScore: string;
  questionImprove: string;
  placeholderImprove: string;
  submitLabel: string;
  laterLabel: string;
  scoreHintLow: string;
  scoreHintHigh: string;
  onClose: () => void;
  onSubmit: (payload: { score: number; improvement: string }) => Promise<void> | void;
};

export default function FeedbackSurveyModal({
  open,
  loading = false,
  title,
  questionScore,
  questionImprove,
  placeholderImprove,
  submitLabel,
  laterLabel,
  scoreHintLow,
  scoreHintHigh,
  onClose,
  onSubmit,
}: Props) {
  const [score, setScore] = useState<number>(0);
  const [improvement, setImprovement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = score >= 1 && !loading && !submitting;
  const isBusy = loading || submitting;
  const scoreButtons = useMemo(() => [1, 2, 3, 4, 5], []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 px-3">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"
            aria-label="Cerrar"
            disabled={isBusy}
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-3">
          <p className="mb-2 text-[12px] font-medium text-slate-700">{questionScore}</p>
          <div className="grid grid-cols-5 gap-1.5">
            {scoreButtons.map((value) => {
              const active = score === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScore(value)}
                  className="h-9 rounded-xl border text-[13px] font-semibold transition"
                  style={{
                    borderColor: active ? "#7d59c9" : "#d1d5db",
                    background: active ? "#f1eff7" : "#ffffff",
                    color: active ? "#7d59c9" : "#475569",
                  }}
                  disabled={isBusy}
                >
                  {value}
                </button>
              );
            })}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>{scoreHintLow}</span>
            <span>{scoreHintHigh}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-[12px] font-medium text-slate-700">{questionImprove}</p>
          <textarea
            value={improvement}
            onChange={(e) => setImprovement(e.target.value.slice(0, 220))}
            placeholder={placeholderImprove}
            className="min-h-[82px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            disabled={isBusy}
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={async () => {
              if (!canSubmit) return;
              setSubmitting(true);
              try {
                await onSubmit({ score, improvement });
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={!canSubmit}
            className="w-full rounded-full bg-[#7d59c9] py-2.5 text-[12px] font-semibold text-white disabled:opacity-60"
          >
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="w-full rounded-full bg-slate-100 py-2.5 text-[12px] font-semibold text-slate-700"
          >
            {laterLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

