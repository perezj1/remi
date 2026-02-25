export type AvatarPngOption = {
  id: string;
  label: string;
  src: string;
};

const AVATAR_COUNT = 100;

export const AVATAR_PNG_OPTIONS: AvatarPngOption[] = Array.from(
  { length: AVATAR_COUNT },
  (_, index) => {
    const n = index + 1;
    return {
      id: String(n),
      label: `Avatar ${n}`,
      src: `/avatars/${n}.png`,
    };
  },
);

export function getAvatarPngById(id?: string | null) {
  if (!id) return null;
  return AVATAR_PNG_OPTIONS.find((item) => item.id === id) ?? null;
}
