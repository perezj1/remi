import type { AvatarFullConfig, NiceAvatarProps } from "react-nice-avatar";

export type RemiAvatarShape = NonNullable<NiceAvatarProps["shape"]>;
export type RemiMouthStyle = NonNullable<AvatarFullConfig["mouthStyle"]> | "pucker" | "nervous";
export type RemiEarringsStyle = "none" | "stud" | "hoop";
export type RemiEarringsColor = "gold" | "silver" | "black";
export type RemiBrowsStyle = "none" | "eyelashesUp";
export type RemiBeardStyle = "none" | "full";
export type RemiAvatarConfig = Omit<Required<AvatarFullConfig>, "mouthStyle"> & {
  mouthStyle: RemiMouthStyle;
  earringsStyle: RemiEarringsStyle;
  earringsColor: RemiEarringsColor;
  browsStyle: RemiBrowsStyle;
  beardStyle: RemiBeardStyle;
  beardColor: string;
};
