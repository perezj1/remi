import { useMemo, useState } from "react";
import AvatarPartsRenderer from "@/components/AvatarPartsRenderer";
import {
  AVATAR_PARTS,
  AVATAR_BG_COLOR_PRESETS,
  AVATAR_COLOR_PRESETS,
  ORIGINAL_COLOR_VALUE,
  getGlobalAvatarTransform,
  getGlobalPartTransform,
  updateGlobalAvatarTransform,
  updateGlobalPartTransform,
  type RemiAvatarGlobalTransform,
  type RemiAvatarPartTransform,
  type AvatarPartKey,
  type RemiAvatarPartsConfig,
} from "@/lib/avatarPartsCatalog";

type Props = {
  value: RemiAvatarPartsConfig;
  title: string;
  onChange: (next: RemiAvatarPartsConfig) => void;
};

const PART_LABELS: Record<AvatarPartKey, string> = {
  face: "Skin",
  hair: "Hair",
  eyes: "Eyes",
  smile: "Smile",
  beard: "Beard",
  glasses: "Glasses",
  hat: "Hat",
  nose: "Nose",
  special: "Special",
};

const PART_KEYS: AvatarPartKey[] = [
  "face",
  "hair",
  "hat",
  "eyes",
  "nose",
  "smile",
  "beard",
  "glasses",
  "special",
];

export default function AvatarPartsEditor({
  value,
  title,
  onChange,
}: Props) {
  const showGlobalAdjustEditor = false;
  const showPartTransformEditor = false;
  const [activePart, setActivePart] = useState<AvatarPartKey>("face");
  const [showGlobalTransformEditor, setShowGlobalTransformEditor] = useState(false);
  const [globalAvatarTransform, setGlobalAvatarTransform] =
    useState<RemiAvatarGlobalTransform>(() => getGlobalAvatarTransform());
  const [partTransform, setPartTransform] = useState<RemiAvatarPartTransform>(
    () => getGlobalPartTransform("face"),
  );
  const activeOptions = useMemo(() => AVATAR_PARTS[activePart], [activePart]);
  const activeLabel = PART_LABELS[activePart];

  const handleSelectPart = (partKey: AvatarPartKey) => {
    setActivePart(partKey);
    setPartTransform(getGlobalPartTransform(partKey));
  };

  const handleTransformChange = (
    field: keyof RemiAvatarPartTransform,
    raw: string,
  ) => {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    const next = updateGlobalPartTransform(activePart, { [field]: parsed });
    setPartTransform(next);
  };

  const handleGlobalTransformChange = (
    field: keyof RemiAvatarGlobalTransform,
    raw: string,
  ) => {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    const next = updateGlobalAvatarTransform({ [field]: parsed });
    setGlobalAvatarTransform(next);
  };

  const showColorEditor =
    activePart === "hair" || activePart === "beard" || activePart === "glasses";

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      <p className="text-xs font-semibold text-slate-700">{title}</p>

      <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-[#d1d5db] shadow-[0_10px_22px_rgba(15,23,42,0.12)] sm:h-28 sm:w-28">
        <AvatarPartsRenderer parts={value} />
      </div>

      <div className="rounded-xl border border-[#e2d8fb] bg-[#f7f3ff] p-2">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Fondo
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {AVATAR_BG_COLOR_PRESETS.map((color) => {
            const selected = value.bgColor === color;
            return (
              <button
                key={`bg-${color}`}
                type="button"
                onClick={() => onChange({ ...value, bgColor: color })}
                className="h-8 w-8 shrink-0 rounded-full border-2 transition"
                style={{
                  backgroundColor: color,
                  borderColor: selected ? "#7d59c9" : "#e2d8fb",
                  boxShadow: selected ? "0 0 0 2px #f3edff" : "none",
                }}
                aria-label={`Fondo ${color}`}
                title={color}
              />
            );
          })}
        </div>
      </div>

      {showGlobalAdjustEditor && (
        <div>
          <button
            type="button"
            onClick={() => setShowGlobalTransformEditor((prev) => !prev)}
            className="rounded-full border border-[#d7cafa] bg-white px-4 py-2 text-[12px] font-semibold text-[#6d4cb6]"
          >
            {showGlobalTransformEditor
              ? "Ocultar ajuste global"
              : "Ajustar avatar completo"}
          </button>
        </div>
      )}

      {showGlobalAdjustEditor && showGlobalTransformEditor && (
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#d9d0f9] bg-[#f6f2ff] p-2">
          <label className="text-[10px] font-semibold text-slate-600">
            Scale
            <input
              type="number"
              step="0.01"
              min="0.6"
              max="2"
              value={globalAvatarTransform.scale}
              onChange={(e) => handleGlobalTransformChange("scale", e.target.value)}
              className="mt-1 w-full rounded-md border border-[#d7cafa] bg-white px-2 py-1 text-[11px] text-slate-700"
            />
          </label>
          <label className="text-[10px] font-semibold text-slate-600">
            Move X
            <input
              type="number"
              step="0.1"
              min="-40"
              max="40"
              value={globalAvatarTransform.offsetX}
              onChange={(e) => handleGlobalTransformChange("offsetX", e.target.value)}
              className="mt-1 w-full rounded-md border border-[#d7cafa] bg-white px-2 py-1 text-[11px] text-slate-700"
            />
          </label>
          <label className="text-[10px] font-semibold text-slate-600">
            Move Y
            <input
              type="number"
              step="0.1"
              min="-40"
              max="40"
              value={globalAvatarTransform.offsetY}
              onChange={(e) => handleGlobalTransformChange("offsetY", e.target.value)}
              className="mt-1 w-full rounded-md border border-[#d7cafa] bg-white px-2 py-1 text-[11px] text-slate-700"
            />
          </label>
        </div>
      )}

      <div className="min-w-0 space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          Categorias
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PART_KEYS.map((partKey) => {
            const selected = activePart === partKey;
            return (
              <button
                key={partKey}
                type="button"
                onClick={() => handleSelectPart(partKey)}
                className="shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold leading-none transition"
                style={{
                  borderColor: selected ? "#7d59c9" : "#dbe2ea",
                  backgroundColor: selected ? "#f3edff" : "#ffffff",
                  color: selected ? "#6d4cb6" : "#475569",
                  boxShadow: selected ? "0 1px 0 rgba(125,89,201,0.25)" : "none",
                }}
              >
                {PART_LABELS[partKey]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {activeLabel}
        </p>

        {showColorEditor && (
          <div className="mb-2 rounded-xl border border-[#e2d8fb] bg-[#f7f3ff] p-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Color
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(() => {
                const colorField =
                  activePart === "hair"
                    ? "hairColor"
                    : activePart === "beard"
                      ? "beardColor"
                      : "glassesColor";
                const selected = value[colorField] === ORIGINAL_COLOR_VALUE;
                return (
                  <button
                    key={`${activePart}-original`}
                    type="button"
                    onClick={() => onChange({ ...value, [colorField]: ORIGINAL_COLOR_VALUE })}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-semibold transition"
                    style={{
                      borderColor: selected ? "#7d59c9" : "#e2d8fb",
                      color: selected ? "#6d4cb6" : "#475569",
                      backgroundColor: "#ffffff",
                      boxShadow: selected ? "0 0 0 2px #f3edff" : "none",
                    }}
                    aria-label="Color original"
                    title="Original"
                  >
                    O
                  </button>
                );
              })()}
              {AVATAR_COLOR_PRESETS.map((color) => {
                const colorField =
                  activePart === "hair"
                    ? "hairColor"
                    : activePart === "beard"
                      ? "beardColor"
                      : "glassesColor";
                const selected = value[colorField] === color;
                return (
                  <button
                    key={`${activePart}-${color}`}
                    type="button"
                    onClick={() => onChange({ ...value, [colorField]: color })}
                    className="h-8 w-8 shrink-0 rounded-full border-2 transition"
                    style={{
                      backgroundColor: color,
                      borderColor: selected ? "#7d59c9" : "#e2d8fb",
                      boxShadow: selected ? "0 0 0 2px #f3edff" : "none",
                    }}
                    aria-label={`Color ${color}`}
                    title={color}
                  />
                );
              })}
            </div>
          </div>
        )}

        {showPartTransformEditor && (
          <div className="mb-2 grid grid-cols-2 gap-2 rounded-xl border border-[#e2d8fb] bg-[#f7f3ff] p-2">
            <label className="text-[10px] font-semibold text-slate-600">
              Scale X
              <input
                type="number"
                step="0.01"
                min="0.6"
                max="2"
                value={partTransform.scaleX}
                onChange={(e) => handleTransformChange("scaleX", e.target.value)}
                className="mt-1 w-full rounded-md border border-[#d7cafa] bg-white px-2 py-1 text-[11px] text-slate-700"
              />
            </label>
            <label className="text-[10px] font-semibold text-slate-600">
              Scale Y
              <input
                type="number"
                step="0.01"
                min="0.6"
                max="2"
                value={partTransform.scaleY}
                onChange={(e) => handleTransformChange("scaleY", e.target.value)}
                className="mt-1 w-full rounded-md border border-[#d7cafa] bg-white px-2 py-1 text-[11px] text-slate-700"
              />
            </label>
            <label className="text-[10px] font-semibold text-slate-600">
              Offset X
              <input
                type="number"
                step="0.1"
                min="-40"
                max="40"
                value={partTransform.offsetX}
                onChange={(e) => handleTransformChange("offsetX", e.target.value)}
                className="mt-1 w-full rounded-md border border-[#d7cafa] bg-white px-2 py-1 text-[11px] text-slate-700"
              />
            </label>
            <label className="text-[10px] font-semibold text-slate-600">
              Offset Y
              <input
                type="number"
                step="0.1"
                min="-40"
                max="40"
                value={partTransform.offsetY}
                onChange={(e) => handleTransformChange("offsetY", e.target.value)}
                className="mt-1 w-full rounded-md border border-[#d7cafa] bg-white px-2 py-1 text-[11px] text-slate-700"
              />
            </label>
          </div>
        )}

        <div className="w-full max-w-full overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2">
            {activeOptions.map((option) => {
              const selected = value[activePart] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onChange({ ...value, [activePart]: option.id })}
                  className="w-[132px] shrink-0 overflow-hidden rounded-2xl border bg-white p-2 transition sm:w-[140px]"
                  style={{
                    borderColor: selected ? "#7d59c9" : "#dbe2ea",
                    boxShadow: selected ? "0 0 0 1px #7d59c9 inset" : "none",
                  }}
                  aria-label={`${activeLabel} ${option.label}`}
                  title={option.label}
                >
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-white">
                    {option.src ? (
                      <img
                        src={option.src}
                        alt={option.label}
                        className="h-[66%] w-[66%] object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span
                          aria-hidden
                          className="relative inline-block h-8 w-8 rounded-full border-2 border-slate-300"
                        >
                          <span className="absolute left-1/2 top-1/2 h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] bg-slate-300" />
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="mt-1 block truncate text-[11px] font-medium text-slate-600">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
