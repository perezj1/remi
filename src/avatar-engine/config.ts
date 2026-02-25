import { genConfig } from "react-nice-avatar";
import type { RemiAvatarConfig } from "@/avatar-engine/types";

export function createRemiAvatarConfig(seed?: string | null): RemiAvatarConfig {
  const base = {
    ...genConfig(seed || undefined),
    hairColorRandom: true,
  };
  return {
    ...base,
    earSize: "small",
    mouthStyle: base.mouthStyle,
    earringsStyle: "none",
    earringsColor: "gold",
    browsStyle: "none",
    beardStyle: "none",
    beardColor: base.hairColor,
  };
}

export function normalizeRemiAvatarConfig(
  input?: Partial<RemiAvatarConfig>,
): RemiAvatarConfig {
  const base = {
    ...genConfig(),
    ...input,
    hairColorRandom: true,
  };
  const rawBeardStyle = (input as { beardStyle?: string } | undefined)?.beardStyle;
  const normalizedBeardStyle =
    rawBeardStyle === "full" || rawBeardStyle === "group185v2" ? "full" : "none";

  return {
    ...base,
    earSize: "small",
    mouthStyle:
      input?.mouthStyle === "pucker" || input?.mouthStyle === "nervous"
        ? input.mouthStyle
        : base.mouthStyle,
    earringsStyle:
      input?.earringsStyle === "stud" || input?.earringsStyle === "hoop"
        ? input.earringsStyle
        : "none",
    earringsColor:
      input?.earringsColor === "silver" || input?.earringsColor === "black"
        ? input.earringsColor
        : "gold",
    browsStyle: input?.browsStyle === "eyelashesUp" ? input.browsStyle : "none",
    beardStyle: normalizedBeardStyle,
    beardColor:
      typeof input?.beardColor === "string" && input.beardColor.trim() !== ""
        ? input.beardColor
        : base.hairColor,
  };
}
