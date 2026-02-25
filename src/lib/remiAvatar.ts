import {
  createRemiAvatarConfig,
  normalizeRemiAvatarConfig,
} from "@/avatar-engine/config";
import type { RemiAvatarConfig, RemiAvatarShape } from "@/avatar-engine/types";
import { getAvatarPngById } from "@/lib/avatarPngCatalog";
import {
  normalizeRemiAvatarPartsConfig,
  type RemiAvatarPartsConfig,
} from "@/lib/avatarPartsCatalog";

export type RemiAvatarV1Payload = {
  config: RemiAvatarConfig;
  shape: RemiAvatarShape;
};

export type RemiAvatarV2Payload = {
  avatarId: string;
  avatarSrc: string;
  bgColor: string;
};

export type RemiAvatarV3Payload = {
  parts: RemiAvatarPartsConfig;
};

export type RemiAvatarPayload =
  | { version: "v1"; value: RemiAvatarV1Payload }
  | { version: "v2"; value: RemiAvatarV2Payload }
  | { version: "v3"; value: RemiAvatarV3Payload };

const REMI_AVATAR_V1_PREFIX = "remi-avatar-v1:";
const REMI_AVATAR_V2_PREFIX = "remi-avatar-v2:";
const REMI_AVATAR_V3_PREFIX = "remi-avatar-v3:";

export function createSeededRemiAvatarConfig(seed?: string | null) {
  return createRemiAvatarConfig(seed);
}

export function encodeRemiAvatar(payload: RemiAvatarV1Payload): string {
  const raw = JSON.stringify(payload);
  return `${REMI_AVATAR_V1_PREFIX}${window.btoa(raw)}`;
}

export function encodeRemiAvatarPng(payload: RemiAvatarV2Payload): string {
  const raw = JSON.stringify(payload);
  return `${REMI_AVATAR_V2_PREFIX}${window.btoa(raw)}`;
}

export function encodeRemiAvatarParts(payload: RemiAvatarV3Payload): string {
  const raw = JSON.stringify(payload);
  return `${REMI_AVATAR_V3_PREFIX}${window.btoa(raw)}`;
}

export function decodeRemiAvatar(value?: string | null): RemiAvatarPayload | null {
  if (!value) return null;
  try {
    if (value.startsWith(REMI_AVATAR_V3_PREFIX)) {
      const encoded = value.slice(REMI_AVATAR_V3_PREFIX.length);
      const json = window.atob(encoded);
      const parsed = JSON.parse(json) as Partial<RemiAvatarV3Payload>;
      if (!parsed || typeof parsed !== "object") return null;
      const parts = normalizeRemiAvatarPartsConfig(parsed.parts);
      return {
        version: "v3",
        value: { parts },
      };
    }

    if (value.startsWith(REMI_AVATAR_V2_PREFIX)) {
      const encoded = value.slice(REMI_AVATAR_V2_PREFIX.length);
      const json = window.atob(encoded);
      const parsed = JSON.parse(json) as Partial<RemiAvatarV2Payload>;
      if (!parsed || typeof parsed !== "object") return null;
      if (typeof parsed.avatarId !== "string" || parsed.avatarId.trim() === "") {
        return null;
      }

      const resolvedSrc =
        getAvatarPngById(parsed.avatarId)?.src ||
        (typeof parsed.avatarSrc === "string" ? parsed.avatarSrc : "");
      if (!resolvedSrc) return null;

      const bgColor =
        typeof parsed.bgColor === "string" && parsed.bgColor.trim() !== ""
          ? parsed.bgColor
          : "#FFFFFF";

      return {
        version: "v2",
        value: {
          avatarId: parsed.avatarId,
          avatarSrc: resolvedSrc,
          bgColor,
        },
      };
    }

    if (!value.startsWith(REMI_AVATAR_V1_PREFIX)) return null;
    const encoded = value.slice(REMI_AVATAR_V1_PREFIX.length);
    const json = window.atob(encoded);
    const parsed = JSON.parse(json) as Partial<RemiAvatarV1Payload>;
    if (!parsed || typeof parsed !== "object") return null;

    const shape =
      parsed.shape === "circle" ||
      parsed.shape === "rounded" ||
      parsed.shape === "square"
        ? parsed.shape
        : "circle";
    const config = normalizeRemiAvatarConfig(parsed.config);
    return { version: "v1", value: { shape, config } };
  } catch {
    return null;
  }
}
