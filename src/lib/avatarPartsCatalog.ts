export type AvatarPartKey =
  | "face"
  | "hair"
  | "eyes"
  | "smile"
  | "beard"
  | "glasses"
  | "hat"
  | "nose"
  | "special";

export type AvatarPartOption = {
  id: string;
  label: string;
  src: string;
};

export const AVATAR_COLOR_PRESETS = [
  "#3B2A1F",
  "#6B3F2A",
  "#8D5A3B",
  "#B57A4B",
  "#D6A15A",
  "#E8C66A",
  "#2A2F38",
  "#8A8A8A",
  "#D64545",
  "#7D59C9",
] as const;

export const AVATAR_BG_COLOR_PRESETS = [
  "#FFFFFF",
  "#F7F5FF",
  "#EEF4FF",
  "#EAF8F4",
  "#FFF5E8",
  "#FFEFF3",
  "#F3F4F6",
  "#F5F0E8",
] as const;

export const ORIGINAL_COLOR_VALUE = "original";
export const DEFAULT_HAIR_COLOR = "#6B3F2A";
export const DEFAULT_BEARD_COLOR = "#6B3F2A";
export const DEFAULT_GLASSES_COLOR = "#2A2F38";
export const DEFAULT_BG_COLOR = "#FFFFFF";

export type RemiAvatarPartsConfig = Record<AvatarPartKey, string> & {
  hairColor: string;
  beardColor: string;
  glassesColor: string;
  bgColor: string;
  flipX: boolean;
};

export type RemiAvatarPartTransform = {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
};

export type RemiAvatarGlobalTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export const AVATAR_PARTS: Record<AvatarPartKey, AvatarPartOption[]> = {
  face: [
    { id: "none", label: "None", src: "" },
    { id: "face-1", label: "Face 1", src: "/avatar-parts/face-1.svg" },
    { id: "face-2", label: "Face 2", src: "/avatar-parts/face-2.svg" },
    { id: "face-3", label: "Face 3", src: "/avatar-parts/face-3.svg" },
    { id: "face-4", label: "Face 4", src: "/avatar-parts/face-4.svg" },
    { id: "face-5", label: "Face 5", src: "/avatar-parts/face-5.svg" },
    { id: "face-6", label: "Face 6", src: "/avatar-parts/face-6.svg" },
    { id: "face-7", label: "Face 7", src: "/avatar-parts/face-7.svg" },
    { id: "face-8", label: "Face 8", src: "/avatar-parts/face-8.svg" },
  ],
  hair: [
    { id: "none", label: "None", src: "" },
    { id: "hair-short", label: "Short Hair", src: "/avatar-parts/hair-short.svg" },
    { id: "hair-bun", label: "Bun Hair", src: "/avatar-parts/hair-bun.svg" },
    { id: "hair-shaved", label: "Shaved Head", src: "/avatar-parts/hair-shaved.svg" },
    { id: "hair-bangs", label: "Bangs", src: "/avatar-parts/hair-bangs.svg" },
    { id: "hair-bowl-cut", label: "Bowl Cut Hair", src: "/avatar-parts/hair-bowl-cut.svg" },
    { id: "hair-braids", label: "Braids", src: "/avatar-parts/hair-braids.svg" },
    { id: "hair-curly-bob", label: "Curly Bob", src: "/avatar-parts/hair-curly-bob.svg" },
    { id: "hair-curly-short", label: "Curly Short Hair", src: "/avatar-parts/hair-curly-short.svg" },
    { id: "hair-dreads", label: "Dreads", src: "/avatar-parts/hair-dreads.svg" },
    { id: "hair-fro-bun", label: "Fro Bun", src: "/avatar-parts/hair-fro-bun.svg" },
    { id: "hair-half-shaved", label: "Half Shaved Head", src: "/avatar-parts/hair-half-shaved.svg" },
    { id: "hair-mohawk", label: "Mohawk", src: "/avatar-parts/hair-mohawk.svg" },
    { id: "hair-straight", label: "Straight Hair", src: "/avatar-parts/hair-straight.svg" },
    { id: "hair-wavy-bob", label: "Wavy Bob", src: "/avatar-parts/hair-wavy-bob.svg" },
  ],
  eyes: [
    { id: "none", label: "None", src: "" },
    { id: "eyes-normal", label: "Normal Eyes", src: "/avatar-parts/eyes-normal.svg" },
    { id: "eyes-angry", label: "Angry Eyes", src: "/avatar-parts/eyes-angry.svg" },
    { id: "eyes-cheery", label: "Cheery Eyes", src: "/avatar-parts/eyes-cheery.svg" },
    { id: "eyes-confused", label: "Confused Eyes", src: "/avatar-parts/eyes-confused.svg" },
    { id: "eyes-sad", label: "Sad Eyes", src: "/avatar-parts/eyes-sad.svg" },
    { id: "eyes-sleepy", label: "Sleepy Eyes", src: "/avatar-parts/eyes-sleepy.svg" },
    {
      id: "eyes-starstruck",
      label: "Starstruck Eyes",
      src: "/avatar-parts/eyes-starstruck.svg",
    },
    { id: "eyes-winking", label: "Winking Eye", src: "/avatar-parts/eyes-winking.svg" },
  ],
  smile: [
    { id: "none", label: "None", src: "" },
    { id: "smile-teeth", label: "Teeth Smile", src: "/avatar-parts/smile-teeth.svg" },
    { id: "smile-opened", label: "Opened Smile", src: "/avatar-parts/smile-opened.svg" },
    { id: "smile-awkward", label: "Awkward Smile", src: "/avatar-parts/smile-awkward.svg" },
    { id: "smile-braces", label: "Braces", src: "/avatar-parts/smile-braces.svg" },
    { id: "smile-gap", label: "Gap Smile", src: "/avatar-parts/smile-gap.svg" },
    { id: "smile-kawaii", label: "Kawaii", src: "/avatar-parts/smile-kawaii.svg" },
    { id: "smile-open-sad", label: "Open Sad", src: "/avatar-parts/smile-open-sad.svg" },
    {
      id: "smile-unimpressed",
      label: "Unimpressed",
      src: "/avatar-parts/smile-unimpressed.svg",
    },
  ],
  beard: [
    { id: "none", label: "None", src: "" },
    { id: "beard", label: "Beard", src: "/avatar-parts/beard.svg" },
    {
      id: "beard-chin-hair",
      label: "Chin Hair",
      src: "/avatar-parts/beard-chin-hair.svg",
    },
    { id: "beard-fuzz", label: "Fuzz", src: "/avatar-parts/beard-fuzz.svg" },
    {
      id: "beard-mustache",
      label: "Mustache",
      src: "/avatar-parts/beard-mustache.svg",
    },
  ],
  glasses: [
    { id: "none", label: "None", src: "" },
    { id: "glasses", label: "Glasses", src: "/avatar-parts/glasses.svg" },
    {
      id: "glasses-sleep-mask",
      label: "Sleep Mask",
      src: "/avatar-parts/glasses-sleep-mask.svg",
    },
    {
      id: "glasses-sunglasses",
      label: "Sunglasses",
      src: "/avatar-parts/glasses-sunglasses.svg",
    },
  ],
  hat: [
    { id: "none", label: "None", src: "" },
    { id: "hat-cat-ears", label: "Cat Ears", src: "/avatar-parts/hat-cat-ears.svg" },
    {
      id: "hat-sailormoon-crown",
      label: "Sailormoon Crown",
      src: "/avatar-parts/hat-sailormoon-crown.svg",
    },
  ],
  nose: [
    { id: "none", label: "None", src: "" },
    { id: "nose-clown", label: "Clown Nose", src: "/avatar-parts/nose-clown.svg" },
    { id: "nose-curve", label: "Curve", src: "/avatar-parts/nose-curve.svg" },
    { id: "nose-pointed", label: "Pointed", src: "/avatar-parts/nose-pointed.svg" },
    { id: "nose-round", label: "Round", src: "/avatar-parts/nose-round.svg" },
  ],
  special: [
    { id: "none", label: "None", src: "" },
    {
      id: "special-frankenstein",
      label: "Frankenstein",
      src: "/avatar-parts/special-frankenstein.svg",
    },
    { id: "special-pumpkin", label: "Pumpkin", src: "/avatar-parts/special-pumpkin.svg" },
    { id: "special-werewolf", label: "Werewolf", src: "/avatar-parts/special-werewolf.svg" },
    {
      id: "special-queen-of-hearts",
      label: "Queen of Hearts",
      src: "/avatar-parts/special-queen-of-hearts.svg",
    },
    { id: "special-ghost", label: "Ghost", src: "/avatar-parts/special-ghost.svg" },
    { id: "special-skull", label: "Skull", src: "/avatar-parts/special-skull.svg" },
    { id: "special-elizabeth", label: "Elizabeth", src: "/avatar-parts/special-elizabeth.svg" },
    { id: "special-cat", label: "Cat", src: "/avatar-parts/special-cat.svg" },
    { id: "special-clown", label: "Clown", src: "/avatar-parts/special-clown.svg" },
    { id: "special-kitsuni", label: "Kitsuni", src: "/avatar-parts/special-kitsuni.svg" },
    { id: "special-vampire", label: "Vampire", src: "/avatar-parts/special-vampire.svg" },
    { id: "special-mummy", label: "Mummy", src: "/avatar-parts/special-mummy.svg" },
  ],
};

export const DEFAULT_REMI_AVATAR_PARTS: RemiAvatarPartsConfig = {
  face: "face-1",
  hair: "hair-short",
  eyes: "eyes-normal",
  smile: "smile-teeth",
  beard: AVATAR_PARTS.beard[0].id,
  glasses: AVATAR_PARTS.glasses[0].id,
  hat: AVATAR_PARTS.hat[0].id,
  nose: AVATAR_PARTS.nose[0].id,
  special: AVATAR_PARTS.special[0].id,
  hairColor: DEFAULT_HAIR_COLOR,
  beardColor: DEFAULT_BEARD_COLOR,
  glassesColor: DEFAULT_GLASSES_COLOR,
  bgColor: DEFAULT_BG_COLOR,
  flipX: false,
};

const DEFAULT_PART_TRANSFORM: RemiAvatarPartTransform = {
  scaleX: 1,
  scaleY: 1,
  offsetX: 0,
  offsetY: 0,
};

export const GLOBAL_PART_TRANSFORMS: Record<AvatarPartKey, RemiAvatarPartTransform> = {
  face: {
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 5,
  },
  hair: {
    scaleX: 1.18,
    scaleY: 1.17,
    offsetX: 0.8,
    offsetY: 3.2,
  },
  eyes: {
    scaleX: 1.2,
    scaleY: 1.15,
    offsetX: 2.7,
    offsetY: 1.7,
  },
  smile: {
    scaleX: 1.1,
    scaleY: 1.1,
    offsetX: 2.9,
    offsetY: 5,
  },
  beard: {
    scaleX: 1.1,
    scaleY: 1,
    offsetX: 2.1,
    offsetY: 10.3,
  },
  glasses: {
    scaleX: 1.25,
    scaleY: 1.14,
    offsetX: -1.5,
    offsetY: 5.6,
  },
  hat: {
    scaleX: 1.2,
    scaleY: 1.51,
    offsetX: -0.3,
    offsetY: 12.1,
  },
  nose: {
    scaleX: 1,
    scaleY: 1,
    offsetX: 2.5,
    offsetY: 2.1,
  },
  special: {
    scaleX: 1.22,
    scaleY: 1.21,
    offsetX: 0,
    offsetY: 4,
  },
};

let globalAvatarTransform: RemiAvatarGlobalTransform = {
  scale: 0.92,
  offsetX: 2.1,
  offsetY: -2.9,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizePartTransform(
  value?: Partial<RemiAvatarPartTransform> | null,
): RemiAvatarPartTransform {
  const v = value ?? {};
  return {
    scaleX: clamp(Number(v.scaleX ?? DEFAULT_PART_TRANSFORM.scaleX), 0.6, 2),
    scaleY: clamp(Number(v.scaleY ?? DEFAULT_PART_TRANSFORM.scaleY), 0.6, 2),
    offsetX: clamp(Number(v.offsetX ?? DEFAULT_PART_TRANSFORM.offsetX), -40, 40),
    offsetY: clamp(Number(v.offsetY ?? DEFAULT_PART_TRANSFORM.offsetY), -40, 40),
  };
}

export function getGlobalPartTransform(part: AvatarPartKey): RemiAvatarPartTransform {
  return { ...GLOBAL_PART_TRANSFORMS[part] };
}

export function updateGlobalPartTransform(
  part: AvatarPartKey,
  patch: Partial<RemiAvatarPartTransform>,
): RemiAvatarPartTransform {
  GLOBAL_PART_TRANSFORMS[part] = normalizePartTransform({
    ...GLOBAL_PART_TRANSFORMS[part],
    ...patch,
  });
  return { ...GLOBAL_PART_TRANSFORMS[part] };
}

export function getPartTransform(
  part: AvatarPartKey,
  _optionId: string,
): RemiAvatarPartTransform {
  return { ...GLOBAL_PART_TRANSFORMS[part] };
}

export function getGlobalAvatarTransform(): RemiAvatarGlobalTransform {
  return { ...globalAvatarTransform };
}

export function updateGlobalAvatarTransform(
  patch: Partial<RemiAvatarGlobalTransform>,
): RemiAvatarGlobalTransform {
  globalAvatarTransform = {
    scale: clamp(Number(patch.scale ?? globalAvatarTransform.scale), 0.6, 2),
    offsetX: clamp(Number(patch.offsetX ?? globalAvatarTransform.offsetX), -40, 40),
    offsetY: clamp(Number(patch.offsetY ?? globalAvatarTransform.offsetY), -40, 40),
  };
  return { ...globalAvatarTransform };
}

export function getAvatarPartOption(part: AvatarPartKey, id: string) {
  return AVATAR_PARTS[part].find((item) => item.id === id) ?? null;
}

function normalizeAvatarColor(color: unknown, fallback: string): string {
  if (typeof color !== "string") return fallback;
  const c = color.trim();
  if (c === ORIGINAL_COLOR_VALUE) return ORIGINAL_COLOR_VALUE;
  if (/^#[0-9A-Fa-f]{6}$/.test(c)) return c;
  return fallback;
}

export function normalizeRemiAvatarPartsConfig(
  value?: Partial<RemiAvatarPartsConfig> | null,
): RemiAvatarPartsConfig {
  const v = value ?? {};
  return {
    face: getAvatarPartOption("face", String(v.face ?? ""))?.id ?? DEFAULT_REMI_AVATAR_PARTS.face,
    hair: getAvatarPartOption("hair", String(v.hair ?? ""))?.id ?? DEFAULT_REMI_AVATAR_PARTS.hair,
    eyes: getAvatarPartOption("eyes", String(v.eyes ?? ""))?.id ?? DEFAULT_REMI_AVATAR_PARTS.eyes,
    smile: getAvatarPartOption("smile", String(v.smile ?? ""))?.id ?? DEFAULT_REMI_AVATAR_PARTS.smile,
    beard: getAvatarPartOption("beard", String(v.beard ?? ""))?.id ?? DEFAULT_REMI_AVATAR_PARTS.beard,
    glasses:
      getAvatarPartOption("glasses", String(v.glasses ?? ""))?.id ??
      DEFAULT_REMI_AVATAR_PARTS.glasses,
    hat: getAvatarPartOption("hat", String(v.hat ?? ""))?.id ?? DEFAULT_REMI_AVATAR_PARTS.hat,
    nose: getAvatarPartOption("nose", String(v.nose ?? ""))?.id ?? DEFAULT_REMI_AVATAR_PARTS.nose,
    special:
      getAvatarPartOption("special", String(v.special ?? ""))?.id ??
      DEFAULT_REMI_AVATAR_PARTS.special,
    hairColor: normalizeAvatarColor(v.hairColor, DEFAULT_HAIR_COLOR),
    beardColor: normalizeAvatarColor(v.beardColor, DEFAULT_BEARD_COLOR),
    glassesColor: normalizeAvatarColor(v.glassesColor, DEFAULT_GLASSES_COLOR),
    bgColor: normalizeAvatarColor(v.bgColor, DEFAULT_BG_COLOR),
    flipX: typeof v.flipX === "boolean" ? v.flipX : DEFAULT_REMI_AVATAR_PARTS.flipX,
  };
}
