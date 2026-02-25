import {
  getPartTransform,
  getGlobalAvatarTransform,
  getAvatarPartOption,
  ORIGINAL_COLOR_VALUE,
  type AvatarPartKey,
  type RemiAvatarPartsConfig,
} from "@/lib/avatarPartsCatalog";
import { cn } from "@/lib/utils";

const RENDER_ORDER: AvatarPartKey[] = [
  "face",
  "special",
  "hair",
  "hat",
  "eyes",
  "nose",
  "smile",
  "beard",
  "glasses",
];

const CANVAS_RATIO_CLASS = "aspect-[530/600]";

type Props = {
  parts: RemiAvatarPartsConfig;
  className?: string;
};

export default function AvatarPartsRenderer({ parts, className }: Props) {
  const avatarTransform = getGlobalAvatarTransform();
  const scaleX = parts.flipX ? -avatarTransform.scale : avatarTransform.scale;
  const groupStyle = {
    transform: `translate(${avatarTransform.offsetX}%, ${avatarTransform.offsetY}%) scale(${scaleX}, ${avatarTransform.scale})`,
    transformOrigin: "center center",
  };

  return (
    <div
      className={cn("relative h-full w-full", className)}
      style={{ backgroundColor: parts.bgColor }}
    >
      <div className={cn("relative mx-auto h-full", CANVAS_RATIO_CLASS)}>
        <div className="absolute inset-[8%]" style={groupStyle}>
          {RENDER_ORDER.map((partKey) => {
            const option = getAvatarPartOption(partKey, parts[partKey]);
            if (!option?.src) return null;
            const partTuning = getPartTransform(partKey, option.id);
            const isColorizablePart =
              partKey === "hair" || partKey === "beard" || partKey === "glasses";
            const partStyle = {
              transform: `translate(${partTuning.offsetX}%, ${partTuning.offsetY}%) scale(${partTuning.scaleX}, ${partTuning.scaleY})`,
              transformOrigin: "center center",
            };

            if (isColorizablePart) {
              const color =
                partKey === "hair"
                  ? parts.hairColor
                  : partKey === "beard"
                    ? parts.beardColor
                    : parts.glassesColor;
              if (color === ORIGINAL_COLOR_VALUE) {
                return (
                  <img
                    key={`${partKey}-${option.id}`}
                    src={option.src}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                    style={partStyle}
                    draggable={false}
                  />
                );
              }
              const maskStyle = {
                ...partStyle,
                backgroundColor: color,
                maskImage: `url(${option.src})`,
                WebkitMaskImage: `url(${option.src})`,
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
              } as const;

              return (
                <div
                  key={`${partKey}-${option.id}`}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={maskStyle}
                />
              );
            }

            return (
              <img
                key={`${partKey}-${option.id}`}
                src={option.src}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                style={partStyle}
                draggable={false}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
