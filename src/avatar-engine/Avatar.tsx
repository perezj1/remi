import NiceAvatar from "react-nice-avatar";
import { cn } from "@/lib/utils";
import type { RemiAvatarConfig, RemiAvatarShape } from "@/avatar-engine/types";
import type { CSSProperties } from "react";
import type { AvatarFullConfig } from "react-nice-avatar";

type Props = {
  config: RemiAvatarConfig;
  shape: RemiAvatarShape;
  className?: string;
};

type BaseMouthStyle = NonNullable<AvatarFullConfig["mouthStyle"]>;

function toBaseMouthStyle(style: RemiAvatarConfig["mouthStyle"]): BaseMouthStyle {
  if (style === "pucker" || style === "nervous") return "smile";
  return style;
}

function PuckerMouthLayer({ faceColor }: { faceColor: string }) {
  const featuresWrapper: CSSProperties = {
    position: "absolute",
    right: "-3%",
    top: "30%",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  };

  const mouthWrapper: CSSProperties = {
    width: "50%",
    height: "19%",
    position: "absolute",
    top: "28%",
    right: "23%",
    pointerEvents: "none",
  };

  return (
    <div style={featuresWrapper} aria-hidden>
      <svg style={mouthWrapper} viewBox="0 0 64 64">
        <ellipse cx="32" cy="31" rx="28" ry="20" fill={faceColor} />
        <path
          d="M26 16.6965C30.1667 14.3631 47 11.3964 47 18.1964C47 26.6964 35.5 26.1965 35.5 26.1965C35.5 26.1965 48.5447 23.0354 46 32.1965C43.5 41.1965 36.5 37.6965 34.5 36.6965"
          stroke="black"
          strokeWidth="4"
          fill="none"
        />
      </svg>
    </div>
  );
}

function NervousMouthLayer({ faceColor }: { faceColor: string }) {
  const featuresWrapper: CSSProperties = {
    position: "absolute",
    right: "-3%",
    top: "30%",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  };

  const mouthWrapper: CSSProperties = {
    width: "50%",
    height: "19%",
    position: "absolute",
    top: "28%",
    right: "23%",
    pointerEvents: "none",
  };

  return (
    <div style={featuresWrapper} aria-hidden>
      <svg style={mouthWrapper} viewBox="0 0 79 64">
        <ellipse cx="39.5" cy="31" rx="34" ry="20" fill={faceColor} />
        <rect x="3.68359" y="17.4707" width="70" height="24" rx="4" transform="rotate(-4 3.68359 17.4707)" fill="black" />
        <path fillRule="evenodd" clipRule="evenodd" d="M67.2566 13.0252L9.93946 17.0332L11.7795 24.0378C12.5121 26.8266 15.1248 28.6999 18.0011 28.4988C15.1248 28.6999 12.7982 30.9186 12.4609 33.7822L11.6136 40.9747L68.9308 36.9667L67.0908 29.9621C66.3582 27.1734 63.7455 25.3 60.8691 25.5012C63.7455 25.3 66.072 23.0813 66.4094 20.2177L67.2566 13.0252Z" fill="white" />
        <path d="M68.5145 11.649C72.0986 10.8796 75.5781 13.4483 75.8359 17.1341L76.8547 31.704C77.1124 35.3898 74.0243 38.4177 70.368 38.1546C63.2841 37.6448 49.7681 36.8746 40.1728 37.5455C30.5776 38.2165 17.3003 40.8603 10.3563 42.351C6.7722 43.1204 3.29275 40.5517 3.03496 36.8659L2.01613 22.296L2.00189 21.9524C1.95224 18.4242 4.96082 15.5905 8.50286 15.8454C15.5868 16.3552 29.1028 17.1254 38.698 16.4545C48.2932 15.7835 61.5705 13.1397 68.5145 11.649Z" stroke="black" strokeWidth="4" fill="none" />
      </svg>
    </div>
  );
}

function EarringsLayer({
  style,
  color,
}: {
  style: RemiAvatarConfig["earringsStyle"];
  color: RemiAvatarConfig["earringsColor"];
}) {
  if (style === "none") return null;

  const wrapper: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  };
  const studAnchor = { x: 25.9, y: 57.6, size: 15 };
  const hoopAnchor = { x: 25.9, y: 57.6, size: 10.8 };
  const tone = color === "black" ? "#000000" : color === "silver" ? "#B8BDC9" : "#F4D150";

  // Left ear anchor to keep the design balanced.
  if (style === "stud") {
    return (
      <svg style={wrapper} viewBox="0 0 100 100" aria-hidden>
        <circle cx={studAnchor.x + 4.8} cy={studAnchor.y + 1.8} r="1.6" fill={tone} />
      </svg>
    );
  }

  return (
    <svg style={wrapper} viewBox="0 0 100 100" aria-hidden>
      <svg
        x={hoopAnchor.x}
        y={hoopAnchor.y}
        width={hoopAnchor.size}
        height={hoopAnchor.size}
        viewBox="0 0 52 52"
      >
        <path d="M26 2C39.2548 2 50 12.7452 50 26C50 39.2548 39.2548 50 26 50C12.7452 50 2 39.2548 2 26C2 19.6087 5.5 14.5 8.5715 9.5L9.5 8" stroke={tone} strokeWidth="4" fill="none" />
      </svg>
    </svg>
  );
}

function BrowsLayer({
  style,
  faceColor,
}: {
  style: RemiAvatarConfig["browsStyle"];
  faceColor: string;
}) {
  if (style === "none") return null;

  const featuresWrapper: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  };

  const browsWrapper: CSSProperties = {
    width: "35%",
    height: "14%",
    position: "absolute",
    top: "39.8%",
    right: "29.7%",
    pointerEvents: "none",
  };

  return (
    <div style={featuresWrapper} aria-hidden>
      <svg style={browsWrapper} viewBox="0 0 151 58">
        <path d="M100 14C106 10 116 10 124 18" stroke={faceColor} strokeWidth="7" strokeLinecap="round" />
        <path d="M27 33C30 28 38 25 49 26" stroke={faceColor} strokeWidth="7" strokeLinecap="round" />
        <path d="M99 13.2143C104.667 10.5476 118 8.11427 126 19.7143" stroke="black" strokeWidth="4" strokeLinecap="round" />
        <path d="M27.5791 38.521C29.6497 32.6104 37.2612 21.3959 51.1418 23.8224" stroke="black" strokeWidth="4" strokeLinecap="round" />
        <path d="M30.0742 32.4578L23.9258 27.0312" stroke="black" strokeWidth="4" strokeLinecap="round" />
        <path d="M122.961 14.157L129.109 8.73047" stroke="black" strokeWidth="4" strokeLinecap="round" />
        <path d="M36.5233 26.8142L32.4766 19.6816" stroke="black" strokeWidth="4" strokeLinecap="round" />
        <path d="M115.512 10.5135L119.559 3.38086" stroke="black" strokeWidth="4" strokeLinecap="round" />
        <path d="M44.5994 23.2005L42.3984 15.3008" stroke="black" strokeWidth="4" strokeLinecap="round" />
        <path d="M106.436 9.89973L108.637 2" stroke="black" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function BeardLayer({
  style,
  color,
}: {
  style: RemiAvatarConfig["beardStyle"];
  color: string;
}) {
  if (style === "none") return null;

  const featuresWrapper: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  };

  const beardWrapper: CSSProperties = {
    width: "67%",
    height: "38%",
    position: "absolute",
    top: "55%",
    right: "9.8%",
    pointerEvents: "none",
  };

  return (
    <div style={featuresWrapper} aria-hidden>
      <svg style={beardWrapper} viewBox="0 0 226 194">
        <path
          d="M198.407 63.1815C206.387 102.608 190.558 163.851 141.946 173.696C113.338 179.489 76.1886 160.905 55.0469 146.291C33.9448 129.808 -32.1801 46.6797 53.4996 45.1247C51.4269 64.8361 75.4652 95.6414 117.046 89.474C152.027 84.2855 155.788 66.9185 147.48 25.9355C149.794 28.6501 194.174 42.2697 198.407 63.1815Z"
          fill={color}
        />
        <path
          d="M11.634 78.0608C3.92779 38.5979 74.1244 21.1719 122.045 11.7617C150.246 6.22379 151.325 6.52043 173.836 18.4522C194.557 35.1055 218.651 98.8873 176.251 69.2901C124.644 18.4522 176.052 26.4534 104.91 35.7913C33.7679 45.1292 56.6183 35.7913 59.7219 98.0461C57.4526 95.3134 13.6096 85.2491 11.634 78.0608Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

export default function AvatarEngine({ config, shape, className }: Props) {
  const isCustomMouth =
    config.mouthStyle === "pucker" || config.mouthStyle === "nervous";
  const baseMouthStyle = toBaseMouthStyle(config.mouthStyle);
  const {
    mouthStyle: _mouthStyle,
    earringsStyle: _earringsStyle,
    earringsColor: _earringsColor,
    browsStyle: _browsStyle,
    beardStyle: _beardStyle,
    beardColor: _beardColor,
    ...baseConfig
  } = config;
  return (
    <div className={cn("relative h-full w-full", className)}>
      <NiceAvatar className="h-full w-full" shape={shape} {...baseConfig} mouthStyle={baseMouthStyle} />
      <BrowsLayer style={config.browsStyle} faceColor={config.faceColor} />
      <BeardLayer style={config.beardStyle} color={config.beardColor} />
      {config.mouthStyle === "pucker" && <PuckerMouthLayer faceColor={config.faceColor} />}
      {config.mouthStyle === "nervous" && <NervousMouthLayer faceColor={config.faceColor} />}
      <EarringsLayer style={config.earringsStyle} color={config.earringsColor} />
    </div>
  );
}
