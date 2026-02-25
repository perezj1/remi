import { decodeRemiAvatar } from "@/lib/remiAvatar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import AvatarEngine from "@/avatar-engine/Avatar";
import AvatarPartsRenderer from "@/components/AvatarPartsRenderer";

type RemiAvatarProps = {
  avatarUrl?: string | null;
  fallback: ReactNode;
  alt?: string;
  className?: string;
};

export default function RemiAvatar({
  avatarUrl,
  fallback,
  alt = "",
  className,
}: RemiAvatarProps) {
  const remiAvatar = decodeRemiAvatar(avatarUrl);

  if (remiAvatar?.version === "v1") {
    return (
      <AvatarEngine
        className={cn("h-full w-full", className)}
        shape={remiAvatar.value.shape}
        config={remiAvatar.value.config}
      />
    );
  }

  if (remiAvatar?.version === "v2") {
    return (
      <div
        className={cn("h-full w-full", className)}
        style={{ backgroundColor: remiAvatar.value.bgColor }}
      >
        <img
          src={remiAvatar.value.avatarSrc}
          alt={alt}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (remiAvatar?.version === "v3") {
    return (
      <AvatarPartsRenderer
        parts={remiAvatar.value.parts}
        className={className}
      />
    );
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return <>{fallback}</>;
}
